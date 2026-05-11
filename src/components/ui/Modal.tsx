import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open:     boolean
  onClose:  () => void
  title:    string
  children: ReactNode
  width?:   string
}

export function Modal({ open, onClose, title, children, width = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-1/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${width} bg-bg-surface border border-border rounded-xl shadow-lg animate-slide-up`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-base font-normal text-text-1">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon text-text-2 hover:text-text-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}