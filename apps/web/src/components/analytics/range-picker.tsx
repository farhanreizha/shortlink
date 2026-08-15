import type { AnalyticsQuery } from "@knot/shared"
import { useState } from "react"
import { type DateRange, DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { RANGES } from "../../constants/analytics"
import { useEscapeKey } from "../../hooks/use-escape-key"
import { fmtDate, fmtShort, parseDate } from "../../lib/date"
import { useI18n } from "../../lib/i18n"

export function AnalyticsRangePicker({
  query,
  onChange,
}: {
  query: AnalyticsQuery
  onChange: (q: AnalyticsQuery) => void
}) {
  const { t } = useI18n()
  const [customRange, setCustomRange] = useState<DateRange>()
  const [customOpen, setCustomOpen] = useState(false)

  useEscapeKey(customOpen, () => setCustomOpen(false))

  function selectRange(key: (typeof RANGES)[number]["key"]) {
    if (key === "custom") {
      if (query.range === "custom" && query.start && query.end) {
        setCustomRange({
          from: parseDate(query.start),
          to: parseDate(query.end),
        })
      }
      setCustomOpen(true)
      return
    }
    setCustomOpen(false)
    onChange({ ...query, range: key, start: undefined, end: undefined })
  }

  function applyCustom() {
    if (!customRange?.from || !customRange?.to) return
    setCustomOpen(false)
    onChange({
      ...query,
      range: "custom",
      start: fmtDate(customRange.from),
      end: fmtDate(customRange.to),
    })
  }

  return (
    <div className="an-range-wrap">
      <div className="an-range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`an-range__btn${query.range === r.key || (r.key === "custom" && customOpen) ? " an-range__btn--active" : ""}`}
            onClick={() => selectRange(r.key)}
          >
            {t(r.labelKey)}
          </button>
        ))}
      </div>
      {customOpen && (
        <>
          <button
            type="button"
            className="an-cal-backdrop"
            aria-label={t("an.closePicker")}
            onClick={() => setCustomOpen(false)}
          />
          <div
            className="an-cal-popover"
            role="dialog"
            aria-label={t("an.selectRange")}
          >
            <DayPicker
              mode="range"
              selected={customRange}
              onSelect={setCustomRange}
              disabled={{ after: new Date() }}
            />
            <div className="an-cal-popover__footer">
              <span className="an-cal-popover__summary">
                {customRange?.from && customRange?.to
                  ? `${fmtShort(customRange.from)} – ${fmtShort(customRange.to)}`
                  : t("an.selectDates")}
              </span>
              <div className="an-cal-popover__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setCustomOpen(false)}
                >
                  {t("an.cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!customRange?.from || !customRange?.to}
                  onClick={applyCustom}
                >
                  {t("an.apply")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
