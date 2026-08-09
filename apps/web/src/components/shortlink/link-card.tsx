import type { Shortlink, UpdateShortlink } from "@knot/shared"
import { BarChart3, Check, Copy } from "lucide-react"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"
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
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const shortUrl = `${window.location.origin}/r/${link.slug}`

  function handleCopy() {
    navigator.clipboard
      .writeText(shortUrl)
      .catch(() => toast(t("link.copyFailed"), "error"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="dash-link">
      <div className="dash-link__main">
        <div className="dash-link__top">
          <span className="dash-link__slug">{shortUrl}</span>
          <span className="dash-link__status">{t("common.active")}</span>
        </div>
        <p className="dash-link__url" title={link.url}>
          {link.url}
        </p>
      </div>
      <div className="dash-link__side">
        <span className="dash-link__clicks">
          <BarChart3 size={16} />
          {t("link.clicks", { count: link.visits.toLocaleString() })}
        </span>
        <button className="dash-link__copy" type="button" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t("link.copied") : t("link.copy")}
        </button>
        <LinkCardMenu
          onEdit={() => setShowEdit(true)}
          onDelete={() => setShowConfirm(true)}
        />
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
        title={t("link.deleteTitle")}
        message={t("link.deleteMessage", { slug: link.slug })}
        onConfirm={() => {
          onDelete(link.slug)
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
