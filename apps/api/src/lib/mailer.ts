import { createTransport, type Transporter } from "nodemailer"
import { env } from "../config.js"

let transport: Transporter | null = null

function getTransport(): Transporter | null {
  if (!env.SMTP_HOST) return null
  transport ??= createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
      : {}),
  })
  return transport
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  const smtp = getTransport()
  if (!smtp) {
    console.log(
      `[mailer] SMTP not configured — password reset link for ${to}: ${resetUrl}`,
    )
    return false
  }
  await smtp.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your Knot password",
    text: `You requested a password reset for your Knot account.\n\nOpen this link to choose a new password (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
  })
  return true
}
