import { type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass-card max-h-[92vh] w-full max-w-2xl animate-modal-in overflow-y-auto rounded-2xl p-5 shadow-glow-strong sm:max-h-[90vh] sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
          <h3 id="modal-title" className="font-display text-xl font-semibold text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost rounded-lg p-2 transition hover:text-accent"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
