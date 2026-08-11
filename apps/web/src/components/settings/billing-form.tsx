import { type MessageKey, useI18n } from "../../lib/i18n"

const BILLING_HISTORY: Array<{
  date: string
  planKey: MessageKey
  amountKey: MessageKey
  statusKey: MessageKey
}> = [
  {
    date: "Jul 8, 2026",
    planKey: "bill.proMonthly",
    amountKey: "bill.amount",
    statusKey: "bill.paid",
  },
  {
    date: "Jun 8, 2026",
    planKey: "bill.proMonthly",
    amountKey: "bill.amount",
    statusKey: "bill.paid",
  },
  {
    date: "May 8, 2026",
    planKey: "bill.proMonthly",
    amountKey: "bill.amount",
    statusKey: "bill.paid",
  },
]

export function BillingForm() {
  const { t } = useI18n()
  return (
    <section className="set-card set-card--billing">
      <div className="set-card__header">
        <h2 className="set-card__title">{t("bill.title")}</h2>
        <p className="set-card__desc">{t("bill.desc")}</p>
      </div>

      <div className="set-bill">
        <div className="set-bill__plan">
          <div>
            <div className="set-bill__name">{t("bill.pro")}</div>
            <div className="set-bill__badge">{t("bill.popular")}</div>
          </div>
          <div className="set-bill__price">
            <strong>{t("bill.price")}</strong>
            <span>{t("bill.perMonth")}</span>
          </div>
        </div>
        <div className="set-bill__feature">{t("bill.feature")}</div>
        <div className="set-form__footer">
          <button type="button" className="btn btn--ghost">
            {t("bill.changePlan")}
          </button>
          <button type="button" className="btn btn--primary">
            {t("bill.upgrade")}
          </button>
        </div>
      </div>

      <div className="set-bill__divider" />

      <div className="set-bill__pay">
        <div className="set-bill__label">{t("bill.paymentMethod")}</div>
        <div className="set-bill__card">
          <span className="set-bill__card-brand">VISA</span>
          <span>{t("bill.endingIn")}</span>
          <span className="set-bill__card-exp">{t("bill.expires")}</span>
          <button type="button" className="btn btn--ghost set-bill__card-edit">
            {t("bill.edit")}
          </button>
        </div>
      </div>

      <div className="set-bill__divider" />

      <div>
        <div className="set-bill__label">{t("bill.history")}</div>
        <table className="set-bill__table">
          <thead>
            <tr>
              <th>{t("bill.colDate")}</th>
              <th>{t("bill.colPlan")}</th>
              <th>{t("bill.colAmount")}</th>
              <th>{t("bill.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {BILLING_HISTORY.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{t(row.planKey)}</td>
                <td>{t(row.amountKey)}</td>
                <td>
                  <span className="set-bill__paid">{t(row.statusKey)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
