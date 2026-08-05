import type { CSSProperties, ReactNode } from "react"

export function Skeleton({
  className = "",
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div className={`skeleton ${className}`} style={style}>
      {children}
    </div>
  )
}
