// Lightweight email sender for the portal (password-reset links, etc.).
// Configure SMTP via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
// If SMTP isn't configured, it logs instead of throwing (handy for local/demo).

import nodemailer from 'nodemailer'

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<{ sent: boolean }> {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST
  if (!host) {
    console.log(`[email skipped — SMTP not configured] to=${opts.to} subject="${opts.subject}"`)
    return { sent: false }
  }

  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587)
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD
  const smtpFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || smtpUser || 'no-reply@cruzy.com'

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // SSL on 465, STARTTLS otherwise
    auth: smtpUser
      ? { user: smtpUser, pass: smtpPass }
      : undefined,
  })

  await transporter.sendMail({
    from: smtpFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  return { sent: true }
}

// Branded "click to reset your password" email.
export function resetPasswordEmail(firstName: string, resetUrl: string): string {
  const name = firstName ? ` ${firstName}` : ''
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a2b4a;">
    <div style="background: #10559a; color: #fff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">Cruzy</h1>
    </div>
    <div style="background: #ffffff; padding: 32px 28px; border: 1px solid #e6ebf2; border-top: none; border-radius: 0 0 12px 12px;">
      <p style="font-size: 16px; margin: 0 0 16px;">Hi${name},</p>
      <p style="font-size: 15px; line-height: 1.5; color: #46536b; margin: 0 0 24px;">
        We received a request to reset your Cruzy portal password. Click the button
        below to choose a new password. This link expires in 1 hour.
      </p>
      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${resetUrl}" style="display: inline-block; background: #10559a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px;">
          Click to reset password
        </a>
      </div>
      <p style="font-size: 13px; color: #767676; line-height: 1.5; margin: 0;">
        If you didn't request this, you can safely ignore this email — your password
        won't change. Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #10559a; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>`
}
