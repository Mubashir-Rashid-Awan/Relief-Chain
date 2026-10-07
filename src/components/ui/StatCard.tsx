import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, sublabel, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/60">{label}</p>
        {icon && <div className="text-cyan-400">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-white/40">{sublabel}</p>}
    </div>
  );
}
