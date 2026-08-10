import type { Notification, NotificationType } from "@knot/shared"
import { type MessageKey, useI18n } from "../../lib/i18n"

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
