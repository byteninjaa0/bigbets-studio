import nodemailer from 'nodemailer';
import { siteConfig } from '@/config/site';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Minimal login OTP email (plain text + simple HTML). Never log the code.
 */
export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  const text = `Your OTP is ${code}. It expires in 5 minutes.`;
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#0a0a0a;color:#fafafa;font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;">
  <p style="margin:0 0 12px;">Your OTP is <strong style="font-size:20px;letter-spacing:0.15em;">${code}</strong>.</p>
  <p style="margin:0;color:#a1a1aa;font-size:14px;">It expires in 5 minutes.</p>
  <p style="margin:24px 0 0;font-size:12px;color:#52525b;">${siteConfig.name} · ${siteConfig.email}</p>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"${siteConfig.name}" <${siteConfig.email}>`,
    to,
    subject: 'Your Login Code',
    text,
    html,
  });
}
