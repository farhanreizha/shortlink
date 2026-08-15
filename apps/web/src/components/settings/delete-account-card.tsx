import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { readErrorMessage } from "../../lib/form"
import { useI18n } from "../../lib/i18n"
import { ConfirmModal } from "../ui/confirm-modal"
import { FormField } from "../ui/form-field"
import { SettingsCard } from "./settings-card"

export function DeleteAccountCard({ onDeleted }: { onDeleted: () => void }) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleDelete() {
    setDeleting(true)
    setError("")
    const res = await client.api.auth.me.$delete({
      json: { password },
    })
    if (!res.ok) {
      setError(await readErrorMessage(res, t("set.deleteFailed")))
      setDeleting(false)
      return
    }
    toast(t("set.accountDeleted"))
    onDeleted()
  }

  return (
    <>
      <SettingsCard
        modifier="set-card--danger"
        title={t("set.dangerZone")}
        desc={t("set.dangerDesc")}
      >
        <div className="set-form__footer">
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setShow(true)}
          >
            {t("set.deleteAccount")}
          </button>
        </div>
      </SettingsCard>

      <ConfirmModal
        open={show}
        title={t("set.deleteTitle")}
        message={t("set.deleteMessage")}
        confirmLabel={deleting ? t("set.deleting") : t("set.deleteAccount")}
        confirmDisabled={deleting || !password}
        onConfirm={handleDelete}
        onCancel={() => {
          setShow(false)
          setPassword("")
          setError("")
        }}
      >
        <FormField
          label={t("set.deletePassword")}
          htmlFor="del-password"
          error={error}
        >
          <input
            id="del-password"
            className="input"
            type="password"
            placeholder={t("set.deletePasswordHint")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("")
            }}
          />
        </FormField>
      </ConfirmModal>
    </>
  )
}
