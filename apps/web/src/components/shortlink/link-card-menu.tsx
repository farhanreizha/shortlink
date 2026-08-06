import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useEscapeKey } from "../../hooks/use-escape-key"

export function LinkCardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  useEscapeKey(open, () => setOpen(false))

  return (
    <div className="link-card-menu" ref={ref}>
      <button
        className="btn btn--ghost"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Link actions"
        onClick={() => setOpen(!open)}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="link-card-menu__dropdown" role="menu">
          <button
            className="link-card-menu__item"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            className="link-card-menu__item link-card-menu__item--danger"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
