import type { Notification, NotificationType } from "@knot/shared"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { type MessageKey, useI18n } from "../../lib/i18n"
import { Modal } from "./modal"

type T = ReturnType<typeof useI18n>["t"]

const NOTIF_LABELS: Record<
  NotificationType,
  { title: MessageKey; desc: MessageKey }
> = {
  welcome: { title: "notif.welcomeTitle", desc: "notif.welcomeDesc" },
  new_feature: { title: "notif.featureTitle", desc: "notif.featureDesc" },
  referral: { title: "notif.referralTitle", desc: "notif.referralDesc" },
}

function timeAgo(iso: string, t: T): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return t("notif.justNow")
  if (mins < 60) return t("notif.minAgo", { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t("notif.hrAgo", { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return t("notif.dayAgo", { n: days })
  return new Date(iso).toLocaleDateString()
}

export function NotificationsDropdown({
  notifications,
}: {
  notifications: Notification[]
}) {
  const { t } = useI18n()
  return (
    <div className="dash-nav__panel" role="menu">
      <div className="dash-nav__panel-header">{t("dash.notifications")}</div>
      <ul className="dash-nav__notif-list">
        {notifications.map((n) => {
          const labels = NOTIF_LABELS[n.type]
          return (
            <li key={n.id} className="dash-nav__notif">
              <div className="dash-nav__notif-title">{t(labels.title)}</div>
              <div className="dash-nav__notif-desc">
                {t(labels.desc, n.data)}
              </div>
              <div className="dash-nav__notif-time">
                {timeAgo(n.createdAt, t)}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HelpDropdown({ onOpenFaq }: { onOpenFaq: () => void }) {
  const { t } = useI18n()
  return (
    <div className="dash-nav__panel dash-nav__panel--help" role="menu">
      <button
        className="dash-nav__dropdown-item"
        type="button"
        role="menuitem"
        onClick={onOpenFaq}
      >
        {t("dash.faq")}
      </button>
    </div>
  )
}

const FAQ_ITEMS: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
]

export function FaqModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Modal open={open} title={t("faq.title")} onClose={onClose} wide>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <div key={item.q} className="faq-item">
            <button
              className="faq-item__q"
              type="button"
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {t(item.q)}
              <ChevronDown
                size={16}
                className={`faq-item__chevron${openIndex === i ? " faq-item__chevron--open" : ""}`}
              />
            </button>
            {openIndex === i && <div className="faq-item__a">{t(item.a)}</div>}
          </div>
        ))}
      </div>
    </Modal>
  )
}
