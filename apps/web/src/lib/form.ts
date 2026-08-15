export function clearFieldError(field: string) {
  return (prev: Record<string, string>) => ({ ...prev, [field]: "" })
}

export async function readErrorMessage(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { message?: string }
    return body.message ?? fallback
  } catch {
    return fallback
  }
}
