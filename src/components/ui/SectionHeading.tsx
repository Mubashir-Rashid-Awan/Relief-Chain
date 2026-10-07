import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  children?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  children,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(center && 'text-center', 'max-w-2xl', center && 'mx-auto', className)}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base text-white/60 sm:text-lg">{description}</p>
      )}
      {children}
    </div>
  );
}
