import { Bell, CreditCard, Gift, Lock, User as UserIcon } from "lucide-react"

export const SETTINGS_NAV = [
  { key: "profile", labelKey: "set.profile", icon: UserIcon },
  { key: "security", labelKey: "set.security", icon: Lock },
  { key: "notifications", labelKey: "set.notifications", icon: Bell },
  { key: "billing", labelKey: "set.billing", icon: CreditCard },
  { key: "referral", labelKey: "set.referral", icon: Gift },
] as const

export type SettingsTab = (typeof SETTINGS_NAV)[number]["key"]
