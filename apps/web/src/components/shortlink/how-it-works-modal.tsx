import { Edit3, Route, TrendingUp } from "lucide-react"
import { Modal } from "../ui/modal"

const STEPS = [
  {
    icon: Edit3,
    title: "Create a Branded URL",
    desc: "Instead of a random string, choose a memorable alias (e.g., knot.co/sale) that reflects your campaign.",
  },
  {
    icon: Route,
    title: "Dynamic Redirection",
    desc: "When clicked, Knot intercepts the request, logs the analytics instantly, and redirects to your long destination URL.",
  },
  {
    icon: TrendingUp,
    title: "Track & Optimize",
    desc: "Monitor click-through rates, geographical data, and referrer information in real-time on your Analytics dashboard.",
  },
]

export function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal open={open} title="How Custom Links Work" onClose={onClose}>
      <div className="cl-steps">
        {STEPS.map((step, i) => (
          <div className="cl-steps__item" key={step.title}>
            <div className="cl-steps__badge">
              <step.icon size={18} />
              <span className="cl-steps__num">{i + 1}</span>
            </div>
            <div>
              <h4 className="cl-steps__title">{step.title}</h4>
              <p className="cl-steps__desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn--primary" type="button" onClick={onClose}>
          Got it
        </button>
      </div>
    </Modal>
  )
}
