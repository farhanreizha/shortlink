import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { createPortal } from "react-dom"

interface Toast {
  id: number
  message: string
  type: "success" | "error"
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* ponytail: portal rendered only after mount so the fresh-mount
          toast-container div is absent during hydration (it has no server
          counterpart and throws #418 while isHydrating is still true) */}
      {mounted &&
        createPortal(
          <div className="toast-container" role="alert" aria-live="polite">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`toast toast--${t.type} animate-slide-up`}
              >
                {t.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
