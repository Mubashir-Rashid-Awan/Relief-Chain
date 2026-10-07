import { Connection, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import {
  SOLANA_RPC_URL,
  USDC_DECIMALS,
} from './constants';

export { PublicKey };

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

export async function getTokenBalance(
  connection: Connection,
  walletAddress: string,
  mintAddress: string
): Promise<{ amount: bigint; decimals: number } | null> {
  const mint = new PublicKey(mintAddress);
  const owner = new PublicKey(walletAddress);

  try {
    const ata = getAssociatedTokenAddressSync(mint, owner);
    const account = await connection.getTokenAccountBalance(ata);
    if (!account.value) return null;
    return {
      amount: BigInt(account.value.amount),
      decimals: account.value.decimals,
    };
  } catch {
    return null;
  }
}

export async function getSOLBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  const pk = new PublicKey(walletAddress);
  const lamports = await connection.getBalance(pk);
  return lamports / 1e9;
}

export async function tokenAccountExists(
  connection: Connection,
  walletAddress: string,
  mintAddress: string
): Promise<boolean> {
  const mint = new PublicKey(mintAddress);
  const owner = new PublicKey(walletAddress);
  try {
    const ata = getAssociatedTokenAddressSync(mint, owner);
    const info = await connection.getAccountInfo(ata);
    return info !== null;
  } catch {
    return false;
  }
}

export interface TransferInstructionsResult {
  instructions: ReturnType<typeof createTransferCheckedInstruction>[];
  needsRecipientATA: boolean;
  recipientATA: PublicKey;
  senderATA: PublicKey;
}

export async function buildTransferInstructions(
  connection: Connection,
  senderWallet: string,
  recipientWallet: string,
  mintAddress: string,
  rawAmount: bigint
): Promise<TransferInstructionsResult> {
  const mint = new PublicKey(mintAddress);
  const sender = new PublicKey(senderWallet);
  const recipient = new PublicKey(recipientWallet);

  const senderATA = getAssociatedTokenAddressSync(
    mint,
    sender,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const recipientATA = getAssociatedTokenAddressSync(
    mint,
    recipient,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const instructions: TransferInstructionsResult['instructions'] = [];

  let needsRecipientATA = false;
  const recipientATAInfo = await connection.getAccountInfo(recipientATA);
  if (!recipientATAInfo) {
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        sender,
        recipientATA,
        recipient,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    needsRecipientATA = true;
  }

  instructions.push(
    createTransferCheckedInstruction(
      senderATA,
      mint,
      recipientATA,
      sender,
      rawAmount,
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  return { instructions, needsRecipientATA, recipientATA, senderATA };
}

export function parseTokenAmount(input: string, decimals: number): bigint {
  const trimmed = input.trim();
  if (!trimmed) return BigInt(0);

  const [wholePart, fracPart = ''] = trimmed.split('.');
  const paddedFrac = (fracPart + '0'.repeat(decimals)).slice(0, decimals);

  const whole = wholePart || '0';
  if (!/^\d+$/.test(whole) || (fracPart && !/^\d+$/.test(fracPart))) {
    throw new Error('Invalid amount format');
  }

  return BigInt(whole) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFrac || '0');
}

export function formatTokenAmount(raw: number | bigint, decimals = USDC_DECIMALS): string {
  const rawBig = BigInt(raw);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = rawBig / divisor;
  const frac = rawBig % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}
