import { CountUp } from "../ui/count-up"
import { Reveal } from "../ui/reveal"

export function StatCard({
  label,
  value,
  valueClass = "",
  title,
  delay = 0,
}: {
  label: string
  value: number
  valueClass?: string
  title?: string
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="an-stat">
        <span className="an-stat__label">{label}</span>
        <span
          className={`an-stat__value${valueClass ? ` ${valueClass}` : ""}`}
          title={title}
        >
          <CountUp value={value} />
        </span>
      </div>
    </Reveal>
  )
}
