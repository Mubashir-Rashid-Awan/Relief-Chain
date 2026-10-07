import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SOLANA_NETWORK } from '@/lib/solana/constants';
import { getConnection } from '@/lib/solana/token';
import { cn } from '@/lib/utils';

type Status = 'connected' | 'disconnected' | 'checking';

export function NetworkStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const conn = getConnection();
        await conn.getLatestBlockhash();
        if (!cancelled) setStatus('connected');
      } catch {
        if (!cancelled) setStatus('disconnected');
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const config = {
    connected: {
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      dot: 'bg-emerald-400',
      label: 'Solana Devnet',
    },
    disconnected: {
      icon: <AlertCircle size={14} className="text-red-400" />,
      dot: 'bg-red-400',
      label: 'RPC Unavailable',
    },
    checking: {
      icon: <Loader2 size={14} className="animate-spin text-amber-400" />,
      dot: 'bg-amber-400',
      label: 'Checking...',
    },
  }[status];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
      title={`Solana ${SOLANA_NETWORK}`}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      <span className="text-xs font-medium text-white/80">{config.label}</span>
    </div>
  );
}
