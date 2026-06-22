import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClose?: () => void
  label: string
}

export function Modal({ children, onClose, label }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Focus trap
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key !== 'Tab') return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first)?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === backdropRef.current) onClose?.() }}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-sm mx-4 bg-bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}
