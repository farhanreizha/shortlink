import { Edit3, Route, TrendingUp } from "lucide-react"
import { useI18n } from "../../lib/i18n"
import { Modal } from "../ui/modal"

const STEPS = [
  {
    icon: Edit3,
    titleKey: "how.step1.title",
    descKey: "how.step1.desc",
  },
  {
    icon: Route,
    titleKey: "how.step2.title",
    descKey: "how.step2.desc",
  },
  {
    icon: TrendingUp,
    titleKey: "how.step3.title",
    descKey: "how.step3.desc",
  },
] as const

export function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  return (
    <Modal open={open} title={t("how.title")} onClose={onClose}>
      <div className="cl-steps">
        {STEPS.map((step, i) => (
          <div className="cl-steps__item" key={step.titleKey}>
            <div className="cl-steps__badge">
              <step.icon size={18} />
              <span className="cl-steps__num">{i + 1}</span>
            </div>
            <div>
              <h4 className="cl-steps__title">{t(step.titleKey)}</h4>
              <p className="cl-steps__desc">{t(step.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn--primary" type="button" onClick={onClose}>
          {t("how.gotIt")}
        </button>
      </div>
    </Modal>
  )
}
