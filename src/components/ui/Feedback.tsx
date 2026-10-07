import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 20, className, label }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 size={size} className="animate-spin text-cyan-400" />
      {label && <span className="text-sm text-white/60">{label}</span>}
    </span>
  );
}

interface FullPageSpinnerProps {
  label?: string;
}

export function FullPageSpinner({ label }: FullPageSpinnerProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size={32} label={label} />
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
      {icon && <div className="mb-4 text-white/30">{icon}</div>}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({ title = 'Something went wrong', message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center">
      <h3 className="text-lg font-semibold text-red-300">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-red-200/60">{message}</p>
    </div>
  );
}
