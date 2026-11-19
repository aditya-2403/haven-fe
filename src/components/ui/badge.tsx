import React from 'react';
import { cn } from '../../lib/utils';
import { VisitStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: VisitStatus | string;
  className?: string;
}

export function Badge({ children, variant, status, className }: BadgeProps) {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'APPROVED':
      case 'CHECKED_IN':
      case 'ACTIVE':
        computedVariant = 'success';
        break;
      case 'PENDING_APPROVAL':
        computedVariant = 'warning';
        break;
      case 'REJECTED':
      case 'CANCELLED':
      case 'SUSPENDED':
      case 'INACTIVE':
        computedVariant = 'danger';
        break;
      case 'CHECKED_OUT':
      case 'EXPIRED':
        computedVariant = 'neutral';
        break;
      default:
        computedVariant = 'info';
    }
  }

  const variants = {
    default: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    success: 'bg-emerald-50/80 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50/80 text-amber-800 border-amber-300',
    danger: 'bg-rose-50/80 text-rose-800 border-rose-300',
    info: 'bg-sky-50/80 text-sky-800 border-sky-300',
    neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono font-medium border uppercase tracking-wider select-none',
        variants[computedVariant],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-none bg-current opacity-70" />
      {children}
    </span>
  );
}
