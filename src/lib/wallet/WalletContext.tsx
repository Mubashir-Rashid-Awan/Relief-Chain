import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';

export interface PhantomProvider {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  isPhantom?: boolean;
  publicKey?: PublicKey;
}

interface WindowWithSolana extends Window {
  solana?: PhantomProvider;
}

export interface WalletContextValue {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getProvider = useCallback((): PhantomProvider | null => {
    if (typeof window !== 'undefined') {
      const win = window as WindowWithSolana;
      const provider = win.solana;
      if (provider?.isPhantom) return provider;
    }
    return null;
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const provider = getProvider();
    if (!provider) {
      setError('Phantom wallet not found. Please install the Phantom extension.');
      return;
    }
    setConnecting(true);
    try {
      const res = await provider.connect();
      const addr = res.publicKey.toString();
      setAddress(addr);
      setConnected(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (!msg.includes('User rejected')) {
        setError(msg);
      }
    } finally {
      setConnecting(false);
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
      } catch {
        // ignore
      }
    }
    setAddress(null);
    setConnected(false);
  }, [getProvider]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const onConnect = (...args: unknown[]) => {
      const pk = args[0] as { publicKey?: PublicKey };
      if (pk?.publicKey) {
        setAddress(pk.publicKey.toString());
        setConnected(true);
      }
    };
    const onDisconnect = () => {
      setAddress(null);
      setConnected(false);
    };
    const onAccountChanged = (...args: unknown[]) => {
      const pk = args[0] as { publicKey?: PublicKey } | null;
      if (pk?.publicKey) {
        setAddress(pk.publicKey.toString());
      } else {
        setAddress(null);
        setConnected(false);
      }
    };

    provider.on('connect', onConnect);
    provider.on('disconnect', onDisconnect);
    provider.on('accountChanged', onAccountChanged);

    provider.connect({ onlyIfTrusted: true }).catch(() => {
      // user hasn't granted trust yet, that's fine
    });

    return () => {
      if (provider.off) {
        provider.off('connect', onConnect);
        provider.off('disconnect', onDisconnect);
        provider.off('accountChanged', onAccountChanged);
      }
    };
  }, [getProvider]);

  return (
    <WalletContext.Provider
      value={{ connected, connecting, address, connect, disconnect, error, clearError }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
