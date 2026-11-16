import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: ({ type, title, message, duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, title, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  success: (message, title = 'Success') =>
    get().addToast({ type: 'success', title, message }),

  error: (message, title = 'Error') =>
    get().addToast({ type: 'error', title, message, duration: 5000 }),

  warning: (message, title = 'Warning') =>
    get().addToast({ type: 'warning', title, message }),

  info: (message, title = 'Notice') =>
    get().addToast({ type: 'info', title, message }),
}));

// Quick convenience function for outside hooks or inside handlers
export const toast = {
  success: (msg: string, title?: string) => useToastStore.getState().success(msg, title),
  error: (msg: string, title?: string) => useToastStore.getState().error(msg, title),
  warning: (msg: string, title?: string) => useToastStore.getState().warning(msg, title),
  info: (msg: string, title?: string) => useToastStore.getState().info(msg, title),
};

