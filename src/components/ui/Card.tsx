import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/20',
        className
      )}
    >
      {children}
    </div>
  );
}
