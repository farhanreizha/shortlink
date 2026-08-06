import type { Shortlink, UpdateShortlink } from "@knot/shared"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { ConfirmModal } from "../ui/confirm-modal"
import { EditModal } from "./edit-modal"
import { LinkCardMenu } from "./link-card-menu"

export function LinkCard({
  link,
  onDelete,
  onUpdate,
}: {
  link: Shortlink
  onDelete: (slug: string) => void
  onUpdate: (slug: string, data: UpdateShortlink) => Promise<void>
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const shortUrl = `${window.location.origin}/r/${link.slug}`

  function handleCopy() {
    navigator.clipboard
      .writeText(shortUrl)
      .catch(() => toast("Failed to copy", "error"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="link-card">
      <div className="link-card__row">
        <div className="link-card__slug">
          <span className="chip chip--primary">{link.slug}</span>
          <span
            className="chip chip--violet"
            style={{ marginLeft: "var(--space-2)" }}
          >
            {link.visits} visit{link.visits === 1 ? "" : "s"}
          </span>
        </div>
        <div className="link-card__short-url">{shortUrl}</div>
        <LinkCardMenu
          onEdit={() => setShowEdit(true)}
          onDelete={() => setShowConfirm(true)}
        />
      </div>
      <div className="link-card__row">
        <div className="link-card__original" title={link.url}>
          {link.url}
        </div>
        <div className="link-card__actions">
          <button
            className={`btn btn--ghost${copied ? " btn--success" : ""}`}
            type="button"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            Visit &rarr;
          </a>
        </div>
      </div>
      <EditModal
        key={`edit-${showEdit}`}
        open={showEdit}
        link={link}
        onSave={onUpdate}
        onClose={() => setShowEdit(false)}
      />
      <ConfirmModal
        open={showConfirm}
        title="Delete shortlink?"
        message={`Are you sure you want to delete "${link.slug}"? This action cannot be undone.`}
        onConfirm={() => {
          onDelete(link.slug)
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
