import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { en, type MessageKey } from "./i18n/en"

export type { MessageKey } from "./i18n/en"

export type Lang = "en" | "id"

const STORAGE_KEY = "knot.lang"
const DEFAULT_LANG: Lang = "en"

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function getStoredLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === "en" || saved === "id" ? saved : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang?: Lang
}) {
  // ponytail: always render "en" on first pass (matches prerender) to avoid hydration
  // mismatch; swap to stored lang in an effect once the client mounts
  const [lang, setLangState] = useState<Lang>(initialLang ?? DEFAULT_LANG)
  const [dict, setDict] = useState<Record<MessageKey, string>>(en)

  useEffect(() => {
    if (initialLang === undefined) setLangState(getStoredLang())
  }, [initialLang])

  useEffect(() => {
    if (lang !== "id") return
    let cancelled = false
    import("./i18n/id").then((m) => {
      if (!cancelled) setDict(m.id)
    })
    return () => {
      cancelled = true
    }
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // storage unavailable (private mode); language still works per-session
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      let str = dict[key] ?? en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v))
        }
      }
      return str
    },
    [dict],
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
