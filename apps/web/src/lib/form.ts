export function clearFieldError(field: string) {
  return (prev: Record<string, string>) => ({ ...prev, [field]: "" })
}
