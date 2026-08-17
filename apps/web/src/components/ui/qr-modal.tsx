import { Download } from "lucide-react"
import { useI18n } from "../../lib/i18n"
import { Modal } from "./modal"
import { ModalActions } from "./modal-actions"

export function QrModal({
  open,
  slug,
  onClose,
}: {
  open: boolean
  slug: string
  onClose: () => void
}) {
  const { t } = useI18n()
  const qrUrl = `/api/qrcode/${slug}?size=300`

  function handleDownload() {
    const a = document.createElement("a")
    a.href = qrUrl
    a.download = `qr-${slug}.png`
    a.click()
  }

  return (
    <Modal open={open} title={t("qr.title")} onClose={onClose}>
      <div className="qr-preview">
        <img src={qrUrl} alt={t("qr.alt", { slug })} width={300} height={300} />
      </div>
      <p className="qr-url">
        {window.location.origin}/r/{slug}
      </p>
      <ModalActions onCancel={onClose}>
        <button
          className="btn btn--primary"
          type="button"
          onClick={handleDownload}
        >
          <Download size={16} />
          {t("qr.download")}
        </button>
      </ModalActions>
    </Modal>
  )
}
