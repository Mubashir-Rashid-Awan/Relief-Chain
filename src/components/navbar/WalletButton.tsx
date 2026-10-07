import { useState, useRef, useEffect } from 'react';
import { Wallet, LogOut, Copy, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '@/lib/wallet/WalletContext';
import { shortenAddress } from '@/lib/solana/constants';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function WalletButton() {
  const { connected, connecting, address, connect, disconnect, error, clearError } =
    useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleConnect = async () => {
    clearError();
    await connect();
    setShowConnectModal(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (connected && address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
        >
          <Wallet size={16} />
          <span className="font-mono">{shortenAddress(address)}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0a1628] p-3 shadow-2xl">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              Connected Wallet
            </p>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="truncate font-mono text-xs text-white/70">
                {shortenAddress(address, 6)}
              </span>
              <button
                onClick={copyAddress}
                className="text-white/40 hover:text-white"
                aria-label="Copy address"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setShowConnectModal(true)}
        disabled={connecting}
      >
        <Wallet size={16} />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <Modal
        open={showConnectModal}
        onClose={() => {
          setShowConnectModal(false);
          clearError();
        }}
        title="Connect Your Solana Wallet"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Connect a Phantom-compatible Solana wallet to donate to campaigns. We never
            ask for your seed phrase or private keys.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                  <path d="M12 2L2 19h20L12 2zm0 4l6.5 11h-13L12 6z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Phantom</p>
                <p className="text-xs text-white/50">Solana wallet</p>
              </div>
            </div>
          </div>

          <Button onClick={handleConnect} disabled={connecting} className="w-full">
            {connecting ? 'Connecting...' : 'Connect Phantom'}
          </Button>

          <p className="text-center text-xs text-white/40">
            Don&apos;t have Phantom?{' '}
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Download it here
            </a>
          </p>
        </div>
      </Modal>
    </>
  );
}
