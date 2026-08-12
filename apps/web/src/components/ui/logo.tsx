import { Waypoints } from "lucide-react"
import type { MouseEventHandler } from "react"
import { Link } from "wouter"

export function Logo({
  href = "/",
  size = "md",
  className = "",
  onClick,
}: {
  href?: string
  size?: "md" | "sm"
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <Link
      className={`logo ${size === "sm" ? "logo--sm" : ""} ${className}`.trim()}
      href={href}
      onClick={onClick}
    >
      <span className={`logo__mark logo__mark--${size}`}>
        <Waypoints size={size === "md" ? 18 : 16} />
      </span>
      Knot
    </Link>
  )
}
