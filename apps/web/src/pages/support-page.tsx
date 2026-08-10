import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { type MessageKey, useI18n } from "../lib/i18n"

const FAQ_ITEMS: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
]

export function SupportContent() {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="static-page__inner">
      <h1 className="static-page__title">{t("support.title")}</h1>
      <p className="static-page__desc">{t("support.desc")}</p>
      <section className="static-page__section">
        <h2>{t("faq.title")}</h2>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="faq-item">
              <button
                className="faq-item__q"
                type="button"
                aria-expanded={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {t(item.q)}
                <ChevronDown
                  size={16}
                  className={`faq-item__chevron${openIndex === i ? " faq-item__chevron--open" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="faq-item__a">{t(item.a)}</div>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="static-page__section">
        <h2>{t("support.contactTitle")}</h2>
        <p>{t("support.contactBody", { email: t("support.contactEmail") })}</p>
      </section>
    </div>
  )
}
