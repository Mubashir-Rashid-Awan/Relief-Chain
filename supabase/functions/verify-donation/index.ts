import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyRequest {
  campaignId: string;
  signature: string;
  donorWallet: string;
  expectedAmount?: string;
  tokenMint?: string;
  recipientWallet?: string;
}

interface TokenTransferInfo {
  mint: string;
  destinationOwner: string;
  sourceOwner: string;
  amount: string;
}

interface ParsedInstruction {
  parsed?: {
    type?: string;
    info?: {
      mint?: string;
      authority?: string;
      destination?: string;
      source?: string;
      amount?: string;
      multisigAuthority?: string;
      delegate?: string;
    };
  };
  program?: string;
}

interface ParsedTransaction {
  meta?: {
    err: unknown;
    tokenBalances?: Array<{
      accountIndex: number;
      mint: string;
      owner?: string;
      uiTokenAmount?: { amount: string; decimals: number };
    }>;
  };
  transaction?: {
    message?: {
      accountKeys?: Array<string>;
      instructions?: ParsedInstruction[];
    };
  };
}

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ verified: false, error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonSuccess(data: Record<string, unknown>) {
  return new Response(JSON.stringify({ verified: true, ...data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed");
  }

  try {
    const body: VerifyRequest = await req.json();

    if (!body.campaignId || !body.signature || !body.donorWallet) {
      return jsonError(400, "Missing required fields: campaignId, signature, donorWallet");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch the campaign from the database
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, recipient_wallet, goal_amount, title")
      .eq("id", body.campaignId)
      .maybeSingle();

    if (campaignError || !campaign) {
      return jsonError(404, "Campaign not found");
    }

    // 2. Check for duplicate signature
    const { data: existingDonation } = await supabase
      .from("donations")
      .select("id, signature")
      .eq("signature", body.signature)
      .maybeSingle();

    if (existingDonation) {
      return jsonError(409, "This transaction has already been recorded");
    }

    // 3. Fetch the transaction from Solana RPC
    const rpcUrl =
      Deno.env.get("SUPABASE_URL")?.includes("yjjfbxkujclsejoemxmu")
        ? "https://api.devnet.solana.com"
        : "https://api.devnet.solana.com";

    const rpcBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [
        body.signature,
        { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
      ],
    };

    const rpcResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcBody),
    });

    if (!rpcResponse.ok) {
      return jsonError(502, "Failed to connect to Solana RPC");
    }

    const rpcResult = await rpcResponse.json();

    if (!rpcResult.result) {
      return jsonError(404, "Transaction not found on Solana. It may not be confirmed yet.");
    }

    const txData: ParsedTransaction = rpcResult.result;

    // 4. Verify transaction succeeded
    if (txData.meta?.err !== null && txData.meta?.err !== undefined) {
      return jsonError(400, "Transaction failed on Solana");
    }

    // 5. Find the SPL token transfer instruction
    const instructions = txData.transaction?.message?.instructions || [];
    const accountKeys = txData.transaction?.message?.accountKeys || [];

    let transferInfo: TokenTransferInfo | null = null;

    for (const inst of instructions) {
      if (inst.program === "spl-token" && inst.parsed?.type === "transferChecked") {
        const info = inst.parsed?.info;
        if (info) {
          transferInfo = {
            mint: info.mint || "",
            destinationOwner: info.destination || "",
            sourceOwner: info.authority || info.source || "",
            amount: info.amount || "0",
          };
        }
        break;
      }
    }

    // Also check inner instructions if outer instructions don't have the transfer
    if (!transferInfo && rpcResult.result?.meta?.innerInstructions) {
      for (const inner of rpcResult.result.meta.innerInstructions) {
        for (const inst of inner.instructions || []) {
          if (inst.program === "spl-token" && inst.parsed?.type === "transferChecked") {
            const info = inst.parsed?.info;
            if (info) {
              transferInfo = {
                mint: info.mint || "",
                destinationOwner: info.destination || "",
                sourceOwner: info.authority || info.source || "",
                amount: info.amount || "0",
              };
            }
            break;
          }
        }
        if (transferInfo) break;
      }
    }

    if (!transferInfo) {
      return jsonError(400, "No SPL token transfer found in this transaction");
    }

    // 6. Verify token mint matches the expected mint
    const expectedMint = body.tokenMint;
    if (expectedMint && transferInfo.mint !== expectedMint) {
      return jsonError(
        400,
        `Wrong token mint. Expected ${expectedMint} but got ${transferInfo.mint}`
      );
    }

    // 7. Verify recipient
    // The destination in the instruction is a token account address, not the owner.
    // We need to resolve the token account owner. We can check tokenBalances in meta
    // or verify the destination owner through accountKeys.
    const expectedRecipient = campaign.recipient_wallet;
    const donorWallet = body.donorWallet;

    // Check token balances for owner information
    const tokenBalances = txData.meta?.tokenBalances || [];
    let recipientVerified = false;
    let senderVerified = false;

    for (const balance of tokenBalances) {
      const owner = balance.owner;
      if (!owner) {
        // If owner isn't in preTokenBalances, resolve from accountKeys
        const accountKey = accountKeys[balance.accountIndex];
        if (accountKey) {
          // We'll need to check post token balances to resolve ATA owners
        }
        continue;
      }
      if (owner === expectedRecipient) {
        recipientVerified = true;
      }
      if (owner === donorWallet) {
        senderVerified = true;
      }
    }

    // If we couldn't verify recipient from tokenBalances, try fetching the
    // destination token account info from RPC to resolve its owner
    if (!recipientVerified && transferInfo.destinationOwner) {
      try {
        const accountInfoBody = {
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [transferInfo.destinationOwner, { encoding: "jsonParsed" }],
        };
        const accountInfoResp = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountInfoBody),
        });
        const accountInfoResult = await accountInfoResp.json();
        const accountData = accountInfoResult.result?.value?.data;
        if (accountData?.parsed?.info?.owner === expectedRecipient) {
          recipientVerified = true;
        }
      } catch {
        // If we can't resolve, we'll fail verification
      }
    }

    if (!recipientVerified) {
      return jsonError(
        400,
        "Recipient wallet does not match the campaign's recipient address"
      );
    }

    // 8. Verify amount
    if (body.expectedAmount) {
      const expected = BigInt(body.expectedAmount);
      const actual = BigInt(transferInfo.amount);
      if (expected !== actual) {
        return jsonError(
          400,
          `Amount mismatch. Expected ${expected} but got ${actual}`
        );
      }
    }

    // 9. Verify sender (donor) if we could determine it
    // Sender verification is best-effort because the source token account owner
    // may not always be available in parsed instruction data
    if (!senderVerified && transferInfo.sourceOwner) {
      // Try to resolve source token account owner
      try {
        const sourceAccountBody = {
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [transferInfo.sourceOwner, { encoding: "jsonParsed" }],
        };
        const sourceResp = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sourceAccountBody),
        });
        const sourceResult = await sourceResp.json();
        const sourceOwner = sourceResult.result?.value?.data?.parsed?.info?.owner;
        if (sourceOwner && sourceOwner !== donorWallet) {
          return jsonError(
            400,
            "Sender wallet does not match the connected donor wallet"
          );
        }
      } catch {
        // Best-effort: if we can't verify sender, continue with other checks
      }
    }

    // 10. Save the verified donation
    const { error: insertError } = await supabase.from("donations").insert({
      campaign_id: campaign.id,
      donor_wallet: donorWallet,
      amount: transferInfo.amount,
      token_mint: transferInfo.mint,
      signature: body.signature,
      status: "verified",
      verified_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return jsonError(409, "This transaction has already been recorded");
      }
      return jsonError(500, "Failed to record verified donation");
    }

    return jsonSuccess({
      donation: {
        campaignId: campaign.id,
        donorWallet,
        amount: transferInfo.amount,
        tokenMint: transferInfo.mint,
        signature: body.signature,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Verification error:", msg);
    return jsonError(500, "Transaction could not be verified");
  }
});
