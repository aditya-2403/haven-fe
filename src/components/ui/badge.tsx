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
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[computedVariant],
        className,
      )}
    >
      {children}
    </span>
  );
}

