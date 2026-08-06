import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStoreState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast,
    };
    set((state) => ({
      // Limit to max 4 visible toasts to prevent clutter
      toasts: [...state.toasts.slice(-3), newToast],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

// Global imperative helper functions for convenience
export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'success', title, description, duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'error', title, description, duration }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'warning', title, description, duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'info', title, description, duration }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
};
