import type { MessageKey } from "../lib/i18n"

export type LegalPrefix = "pp" | "tp"

export const META: Record<
  LegalPrefix,
  { title: MessageKey; updated: MessageKey; intro: MessageKey }
> = {
  pp: { title: "pp.title", updated: "pp.updated", intro: "pp.intro" },
  tp: { title: "tp.title", updated: "tp.updated", intro: "tp.intro" },
}

export const SECTIONS: Record<
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
