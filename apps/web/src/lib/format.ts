export function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function countryFlag(country: string) {
  if (country === "Unknown" || country.length !== 2) return "🌐"
  const base = 0x1f1e6
  const a = country.charCodeAt(0) - 65
  const b = country.charCodeAt(1) - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return "🌐"
  return String.fromCodePoint(base + a, base + b)
}
