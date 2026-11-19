import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-none tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-[#09090B] text-white hover:bg-[#27272A] border border-[#09090B] shadow-none active:bg-black',
      secondary:
        'bg-[#F4F4F5] text-[#09090B] hover:bg-[#E4E4E7] border border-[#E4E4E7]',
      outline:
        'border border-[#E4E4E7] bg-white text-[#09090B] hover:bg-[#F4F4F5] hover:border-[#D4D4D8]',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-[#DC2626]',
      success:
        'bg-[#16A34A] text-white hover:bg-[#15803D] border border-[#16A34A]',
      ghost:
        'bg-transparent text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-sm px-4 py-2.5 gap-2.5 h-10',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
