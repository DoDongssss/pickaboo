import { create } from 'zustand'
import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id:       string
  type:     ToastType
  title:    string
  message?: string
  duration: number
}

// ─────────────────────────────────────────
// Store
// ─────────────────────────────────────────
interface ToastState {
  toasts: Toast[]
  add:    (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => set(state => ({
    toasts: [
      ...state.toasts,
      { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
    ],
  })),
  remove: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
}))

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────
export function useToast() {
  const { add } = useToastStore()

  return {
    success: (title: string, message?: string, duration = 4000) =>
      add({ type: 'success', title, message, duration }),
    error:   (title: string, message?: string, duration = 5000) =>
      add({ type: 'error',   title, message, duration }),
    warning: (title: string, message?: string, duration = 4000) =>
      add({ type: 'warning', title, message, duration }),
    info:    (title: string, message?: string, duration = 4000) =>
      add({ type: 'info',    title, message, duration }),
  }
}

// ─────────────────────────────────────────
// Single toast item
// ─────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: { bar: 'bg-status-success', icon: 'text-status-success', bg: 'bg-status-successBg', border: 'border-status-success/20' },
  error:   { bar: 'bg-status-error',   icon: 'text-status-error',   bg: 'bg-status-errorBg',   border: 'border-status-error/20'   },
  warning: { bar: 'bg-status-warning', icon: 'text-status-warning', bg: 'bg-status-warningBg', border: 'border-status-warning/20' },
  info:    { bar: 'bg-accent',         icon: 'text-accent',         bg: 'bg-accent-soft',      border: 'border-accent/20'         },
}

const TOAST_ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore()
  const style  = TOAST_STYLES[toast.type]
  const Icon   = TOAST_ICONS[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration])

  return (
    <div className={`
      relative flex items-start gap-3 w-80 rounded-lg border shadow-lg px-4 py-3
      bg-bg-surface overflow-hidden animate-slide-up
      ${style.border}
    `}>
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

      {/* Icon */}
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.icon}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-1">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-text-2 mt-0.5">{toast.message}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => remove(toast.id)}
        className="flex-shrink-0 text-text-3 hover:text-text-1 transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────
// Container — mount once inside App
// ─────────────────────────────────────────
export function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}