const BILLING_HISTORY = [
  {
    date: "Jul 8, 2026",
    plan: "Pro Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "Jun 8, 2026",
    plan: "Pro Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "May 8, 2026",
    plan: "Pro Monthly",
    amount: "$29.00",
    status: "Paid",
  },
]

export function BillingForm() {
  return (
    <section className="set-card set-card--billing">
      <div className="set-card__header">
        <h2 className="set-card__title">Billing</h2>
        <p className="set-card__desc">
          Manage your subscription, payment method and invoices.
        </p>
      </div>

      <div className="set-bill">
        <div className="set-bill__plan">
          <div>
            <div className="set-bill__name">Pro</div>
            <div className="set-bill__badge">Popular</div>
          </div>
          <div className="set-bill__price">
            <strong>$29</strong>
            <span>/mo</span>
          </div>
        </div>
        <div className="set-bill__feature">
          Unlimited links, real-time analytics, campaign management and API
          access.
        </div>
        <div className="set-form__footer">
          <button type="button" className="btn btn--ghost">
            Change Plan
          </button>
          <button type="button" className="btn btn--primary">
            Upgrade
          </button>
        </div>
      </div>

      <div className="set-bill__divider" />

      <div className="set-bill__pay">
        <div className="set-bill__label">Payment Method</div>
        <div className="set-bill__card">
          <span className="set-bill__card-brand">VISA</span>
          <span>Ending in 4242</span>
          <span className="set-bill__card-exp">Expires 08/27</span>
          <button type="button" className="btn btn--ghost set-bill__card-edit">
            Edit
          </button>
        </div>
      </div>

      <div className="set-bill__divider" />

      <div>
        <div className="set-bill__label">Billing History</div>
        <table className="set-bill__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {BILLING_HISTORY.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.plan}</td>
                <td>{row.amount}</td>
                <td>
                  <span className="set-bill__paid">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
