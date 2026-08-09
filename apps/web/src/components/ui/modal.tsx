import { type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useEscapeKey } from "../../hooks/use-escape-key"

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEscapeKey(open, onClose)

  if (!open) return null

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click dismisses modal
    <div
      className="modal-overlay animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`modal-card animate-scale-in${wide ? " modal-card--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
      >
        <h3 className="modal-title">{title}</h3>
        {children}
      </div>
    </div>,
    document.body,
  )
}
