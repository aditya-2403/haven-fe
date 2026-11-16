'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, ToastType } from '../../stores/toast.store';
import { cn } from '../../lib/utils';

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, { bg: string; border: string; text: string; iconColor: string }> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-foreground',
    iconColor: 'text-emerald-600',
  },
  error: {
    bg: 'bg-white',
    border: 'border-rose-200',
    text: 'text-foreground',
    iconColor: 'text-rose-600',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    text: 'text-foreground',
    iconColor: 'text-amber-600',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-foreground',
    iconColor: 'text-blue-600',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      <AnimatePresence>
        {toasts.map((item) => {
          const Icon = icons[item.type];
          const style = styles[item.type];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto rounded-xl border p-3.5 shadow-lg flex items-start gap-3 relative overflow-hidden backdrop-blur-md',
                style.bg,
                style.border,
              )}
            >
              <div className={cn('shrink-0 mt-0.5', style.iconColor)}>
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>

              <div className="flex-1 pr-4">
                {item.title && (
                  <h5 className="text-xs font-semibold text-foreground tracking-tight">
                    {item.title}
                  </h5>
                )}
                <p className="text-xs text-muted leading-relaxed mt-0.5">{item.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-muted/70 hover:text-foreground rounded p-1 transition-colors absolute top-2 right-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

