import { type MessageKey, useI18n } from "../lib/i18n"

type LegalPrefix = "pp" | "tp"

const META: Record<
  LegalPrefix,
  { title: MessageKey; updated: MessageKey; intro: MessageKey }
> = {
  pp: { title: "pp.title", updated: "pp.updated", intro: "pp.intro" },
  tp: { title: "tp.title", updated: "tp.updated", intro: "tp.intro" },
}

const SECTIONS: Record<
  LegalPrefix,
  Array<readonly [MessageKey, MessageKey]>
> = {
  pp: [
    ["pp.collect.title", "pp.collect.body"],
    ["pp.use.title", "pp.use.body"],
    ["pp.cookies.title", "pp.cookies.body"],
    ["pp.share.title", "pp.share.body"],
    ["pp.security.title", "pp.security.body"],
    ["pp.rights.title", "pp.rights.body"],
    ["pp.contact.title", "pp.contact.body"],
  ],
  tp: [
    ["tp.service.title", "tp.service.body"],
    ["tp.accounts.title", "tp.accounts.body"],
    ["tp.acceptable.title", "tp.acceptable.body"],
    ["tp.links.title", "tp.links.body"],
    ["tp.termination.title", "tp.termination.body"],
    ["tp.disclaimer.title", "tp.disclaimer.body"],
    ["tp.changes.title", "tp.changes.body"],
    ["tp.contact.title", "tp.contact.body"],
  ],
}

export function LegalContent({ prefix }: { prefix: LegalPrefix }) {
  const { t } = useI18n()
  const meta = META[prefix]
  return (
    <div className="static-page__inner">
      <h1 className="static-page__title">{t(meta.title)}</h1>
      <p className="static-page__desc">
        {t(meta.updated)} · {t(meta.intro)}
      </p>
      {SECTIONS[prefix].map(([title, body]) => (
        <section key={title} className="static-page__section">
          <h2>{t(title)}</h2>
          <p>{t(body, { email: t("support.contactEmail") })}</p>
        </section>
      ))}
    </div>
  )
}
