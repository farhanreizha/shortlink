import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "../../lib/i18n"

export function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  disabled,
  onPage,
}: {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  disabled: boolean
  onPage: (page: number) => void
}) {
  const { t } = useI18n()
  return (
    <div className="cl-pagination">
      <span className="cl-pagination__info">
        {t("cl.showing", { from, to, total })}
      </span>
      <div className="cl-pagination__controls">
        <button
          className="btn btn--ghost"
          type="button"
          aria-label={t("cl.prev")}
          disabled={page === 0 || disabled}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          aria-label={t("cl.next")}
          disabled={page >= pageCount - 1 || disabled}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
