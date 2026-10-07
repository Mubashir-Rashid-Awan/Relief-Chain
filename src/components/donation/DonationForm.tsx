import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Transaction,
  PublicKey,
} from '@solana/web3.js';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  Coins,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useWallet } from '@/lib/wallet/WalletContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  USDC_MINT_ADDRESS,
  USDC_DECIMALS,
  getExplorerUrl,
  SOLANA_NETWORK,
} from '@/lib/solana/constants';
import {
  getConnection,
  getTokenBalance,
  buildTransferInstructions,
  parseTokenAmount,
  formatTokenAmount,
} from '@/lib/solana/token';
import { shortenAddress, isPublicKey } from '@/lib/solana/constants';
import type { CampaignWithStats } from '@/types';

type DonationState =
  | 'idle'
  | 'checking'
  | 'building'
  | 'signing'
  | 'submitting'
  | 'verifying'
  | 'success'
  | 'error';

interface DonationFormProps {
  campaign: CampaignWithStats;
  onDonationVerified: () => void;
}

export function DonationForm({ campaign, onDonationVerified }: DonationFormProps) {
  const { connected, address, connect } = useWallet();
  const [amount, setAmount] = useState('');
  const [state, setState] = useState<DonationState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleDonate = async () => {
    setErrorMsg('');

    if (!connected || !address) {
      setShowWalletModal(true);
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount || parseFloat(trimmedAmount) <= 0) {
      setErrorMsg('Please enter a valid donation amount');
      return;
    }

    if (!USDC_MINT_ADDRESS) {
      setErrorMsg(
        'Token mint address is not configured. Set VITE_USDC_MINT_ADDRESS in your environment.'
      );
      return;
    }

    if (!isPublicKey(campaign.recipient_wallet)) {
      setErrorMsg('Campaign recipient wallet is invalid');
      return;
    }

    if (address === campaign.recipient_wallet) {
      setErrorMsg('You cannot donate to your own campaign');
      return;
    }

    setState('checking');
    try {
      const conn = getConnection();

      let rawAmount: bigint;
      try {
        rawAmount = parseTokenAmount(trimmedAmount, USDC_DECIMALS);
      } catch {
        setErrorMsg('Invalid amount format');
        setState('error');
        return;
      }

      if (rawAmount <= 0n) {
        setErrorMsg('Donation amount must be greater than zero');
        setState('error');
        return;
      }

      const balance = await getTokenBalance(conn, address, USDC_MINT_ADDRESS);
      if (!balance) {
        setErrorMsg(
          'No token balance found. Make sure you have test tokens in your wallet on Devnet.'
        );
        setState('error');
        return;
      }
      if (balance.amount < rawAmount) {
        setErrorMsg(
          `Insufficient balance. You have ${formatTokenAmount(balance.amount, USDC_DECIMALS)} but tried to send ${formatTokenAmount(rawAmount, USDC_DECIMALS)}.`
        );
        setState('error');
        return;
      }

      setState('building');
      const { instructions } = await buildTransferInstructions(
        conn,
        address,
        campaign.recipient_wallet,
        USDC_MINT_ADDRESS,
        rawAmount
      );

      const tx = new Transaction().add(...instructions);
      tx.feePayer = new PublicKey(address);

      setState('signing');
      const { blockhash } = await conn.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;

      const win = window as unknown as {
        solana?: {
          signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }>;
        };
      };
      const provider = win.solana;
      if (!provider?.signAndSendTransaction) {
        setErrorMsg('Wallet does not support transaction signing');
        setState('error');
        return;
      }

      setState('submitting');
      const { signature } = await provider.signAndSendTransaction(tx);
      setTxSignature(signature);

      await conn.confirmTransaction(signature, 'confirmed');

      setState('verifying');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            campaignId: campaign.id,
            signature,
            donorWallet: address,
            expectedAmount: rawAmount.toString(),
            tokenMint: USDC_MINT_ADDRESS,
            recipientWallet: campaign.recipient_wallet,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.verified) {
        setErrorMsg(result.error || 'Transaction could not be verified on Solana.');
        setState('error');
        return;
      }

      setState('success');
      setAmount('');
      onDonationVerified();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Donation failed';
      if (msg.includes('User rejected') || msg.includes('rejected')) {
        setErrorMsg('Transaction was rejected in your wallet.');
      } else if (msg.includes('block height')) {
        setErrorMsg('Transaction expired. Please try again.');
      } else {
        setErrorMsg(msg);
      }
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setTxSignature('');
  };

  const isPending =
    state === 'checking' ||
    state === 'building' ||
    state === 'signing' ||
    state === 'submitting' ||
    state === 'verifying';

  const pendingLabel: Record<string, string> = {
    checking: 'Checking balance...',
    building: 'Building transaction...',
    signing: 'Waiting for wallet approval...',
    submitting: 'Transaction submitted. Verifying on Solana...',
    verifying: 'Verifying transaction on Solana RPC...',
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Donate with Solana</h3>
        </div>

        {!USDC_MINT_ADDRESS && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              Token mint not configured. Set <code>VITE_USDC_MINT_ADDRESS</code> in your
              environment to enable donations.
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">
              Donation Amount (Devnet Test Token)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (state === 'error') reset();
                }}
                disabled={isPending || state === 'success'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/40">
                USDC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs text-white/50">
            <ShieldCheck size={14} className="shrink-0 text-cyan-400" />
            <span>
              Your donation is a real SPL token transfer on Solana {SOLANA_NETWORK}. It will
              be verified on-chain before being recorded.
            </span>
          </div>

          {connected && address && (
            <div className="text-xs text-white/50">
              Connected: <span className="font-mono text-cyan-300">{shortenAddress(address)}</span>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-300">
              <Loader2 size={16} className="animate-spin" />
              <span>{pendingLabel[state]}</span>
            </div>
          )}

          {state === 'error' && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{errorMsg}</p>
                <button
                  onClick={reset}
                  className="mt-2 text-xs underline hover:text-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 size={18} />
                Donation verified on-chain
              </div>
              <p className="text-xs text-emerald-200/70">
                Your donation has been verified on Solana and recorded in the transparency
                dashboard.
              </p>
              {txSignature && (
                <a
                  href={getExplorerUrl(txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:underline"
                >
                  View on Solana Explorer <ExternalLink size={12} />
                </a>
              )}
              <button
                onClick={reset}
                className="block text-xs text-emerald-300/60 hover:text-emerald-300"
              >
                Make another donation
              </button>
            </div>
          )}

          {!isPending && state !== 'success' && (
            <Button onClick={handleDonate} size="lg" className="w-full">
              <Wallet size={18} />
              {connected ? 'Donate with Solana' : 'Connect Wallet to Donate'}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="Connect Your Solana Wallet"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            You need to connect a Phantom-compatible Solana wallet to make a donation. We
            never ask for your seed phrase or private keys.
          </p>
          <Button
            onClick={async () => {
              await connect();
              setShowWalletModal(false);
            }}
            className="w-full"
          >
            Connect Wallet
          </Button>
          <Link
            to="/how-it-works"
            className="block text-center text-xs text-cyan-400 hover:underline"
          >
            Learn how it works
          </Link>
        </div>
      </Modal>
    </>
  );
}
