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
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

const strokeMap = {
  xs: 2.5,
  sm: 2.5,
  md: 3,
  lg: 3,
  xl: 3.5,
};

const colorMap = {
  primary: 'text-foreground',
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
  subMessage = 'Connecting telemetry',
  fullScreen = false,
}: HavenBrandLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center select-none cursor-grid-pattern',
        fullScreen ? 'min-h-screen bg-background' : 'py-16 w-full',
      )}
    >
      {/* Precision Emblem */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center shadow-none border border-zinc-700">
          <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
        </div>
      </div>

      {/* Brand & Loading Caption */}
      <div className="space-y-1">
        <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
          {message}
        </h4>
        {subMessage && (
          <p className="text-[11px] font-mono text-muted">{subMessage}</p>
        )}
      </div>

      {/* Progress sharp bar */}
      <div className="w-32 h-0.5 bg-zinc-200 rounded-none mt-3 overflow-hidden relative">
        <div className="h-full bg-black w-1/2 rounded-none absolute animate-[shimmer_1.5s_infinite] -translate-x-full" />
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
            <td key={cIdx} className="py-3 px-4">
              <div
                className="h-3 bg-zinc-200/80 rounded-none"
                style={{
                  width: `${60 + ((rIdx * 17 + cIdx * 23) % 35)}%`,
                  opacity: 0.85 - (cIdx * 0.05),
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
          className="rounded-none border border-border bg-surface p-4 sm:p-5 shadow-none animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-20 bg-zinc-200 rounded-none" />
            <div className="h-3 w-3 bg-zinc-200 rounded-none" />
          </div>
          <div className="h-6 w-16 bg-zinc-300 rounded-none" />
          <div className="h-2 w-28 bg-zinc-200 rounded-none" />
        </div>
      ))}
    </>
  );
}
