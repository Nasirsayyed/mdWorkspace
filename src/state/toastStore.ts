import { create } from 'zustand'
import type { Toast } from '@/types'
import { createId } from '@/utils/id'

interface ToastState {
  toasts: Toast[]
  push: (message: string, type?: Toast['type'], duration?: number) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = 'info', duration = 3200) => {
    const toast: Toast = { id: createId('toast'), message, type, duration }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    if (duration > 0) {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }))
      }, duration)
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error', 5000),
  info: (message: string) => useToastStore.getState().push(message, 'info'),
}
