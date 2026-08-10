import { useCampaigns } from "../../hooks/use-campaigns"
import { useI18n } from "../../lib/i18n"

export function CampaignSelect({
  value,
  onChange,
  id,
  className,
}: {
  value: number | null
  onChange: (value: number | null) => void
  id?: string
  className?: string
}) {
  const { t } = useI18n()
  const { data: campaigns } = useCampaigns()
  return (
    <select
      id={id}
      className={className}
      aria-label={t("modal.campaign")}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
    >
      <option value="">{t("modal.noCampaign")}</option>
      {campaigns.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
