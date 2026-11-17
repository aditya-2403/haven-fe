import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const iconVariants = {
    danger: <AlertCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    primary: <HelpCircle className="w-5 h-5 text-primary" />,
  };

  const bgVariants = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    primary: 'bg-primary/5 border-primary/10',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={isLoading ? undefined : onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-4 sm:p-6 shadow-xl z-10 my-4 sm:my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 sm:gap-3.5 mb-4">
            <div
              className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border',
                bgVariants[variant],
              )}
            >
              {iconVariants[variant]}
            </div>
            <div className="flex-1 pr-1">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">{title}</h3>
              <p className="text-xs text-muted leading-relaxed mt-1">{message}</p>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-foreground p-1 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isLoading}
              onClick={onConfirm}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

