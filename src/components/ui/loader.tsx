'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'muted' | 'emerald';
  className?: string;
}

const sizeMap = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const strokeMap = {
  xs: 2.5,
  sm: 2.5,
  md: 3,
  lg: 3,
  xl: 3.5,
};

const colorMap = {
  primary: 'text-primary',
  white: 'text-white',
  muted: 'text-muted/60',
  emerald: 'text-emerald-500',
};

export function Spinner({ size = 'md', variant = 'primary', className }: SpinnerProps) {
  const stroke = strokeMap[size];

  return (
    <svg
      className={cn('animate-spin shrink-0', sizeMap[size], colorMap[variant], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={stroke}
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface HavenBrandLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function HavenBrandLoader({
  message = 'Loading Haven...',
  subMessage = 'Securing workspace context',
  fullScreen = false,
}: HavenBrandLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center select-none',
        fullScreen ? 'min-h-screen bg-background' : 'py-16 w-full',
      )}
    >
      {/* Animated Brand Emblem */}
      <div className="relative mb-5 flex items-center justify-center">
        {/* Pulsing glow rings */}
        <div className="absolute w-20 h-20 rounded-2xl bg-primary/10 animate-ping opacity-60" />
        <div className="absolute w-16 h-16 rounded-2xl bg-emerald-500/15 animate-pulse" />

        {/* Orbiting ring */}
        <div className="w-14 h-14 rounded-2xl bg-[#22285B] text-white flex items-center justify-center shadow-lg shadow-[#22285B]/20 relative z-10 border border-white/20">
          <ShieldCheck className="w-7 h-7 text-emerald-400 stroke-[2] animate-pulse" />
        </div>
      </div>

      {/* Brand & Loading Caption */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
          <span>{message}</span>
        </h4>
        {subMessage && (
          <p className="text-xs text-muted font-medium">{subMessage}</p>
        )}
      </div>

      {/* Progress pill bar */}
      <div className="w-36 h-1 bg-gray-100 rounded-full mt-4 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-primary via-emerald-500 to-primary w-1/2 rounded-full absolute animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  colSpan?: number;
}

export function TableSkeleton({ rows = 5, cols = 5, colSpan }: TableSkeletonProps) {
  const actualColSpan = colSpan ?? cols;

  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-border/50 animate-pulse">
          {Array.from({ length: actualColSpan }).map((_, cIdx) => (
            <td key={cIdx} className="py-3.5 px-4">
              <div
                className="h-3.5 bg-gray-200/70 rounded-md"
                style={{
                  width: `${60 + ((rIdx * 17 + cIdx * 23) % 35)}%`,
                  opacity: 0.8 - (cIdx * 0.05),
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border/70 bg-surface p-4 sm:p-6 shadow-xs animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
          </div>
          <div className="h-7 w-20 bg-gray-300 rounded" />
          <div className="h-2.5 w-32 bg-gray-200/80 rounded" />
        </div>
      ))}
    </>
  );
}
