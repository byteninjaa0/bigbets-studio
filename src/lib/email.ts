import nodemailer from 'nodemailer';
import { siteConfig } from '@/config/site';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Owner inbox for booking lifecycle alerts; falls back to ADMIN_EMAILS then site email. */
function getOwnerCancellationRecipients(): string[] {
  const primary =
    process.env.ADMIN_BOOKING_EMAIL?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  if (primary.length) return primary;
  const admins = process.env.ADMIN_EMAILS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  if (admins.length) return admins;
  return [siteConfig.email];
}

export type BookingCancellationEmailPayload = {
  userName: string;
  userEmail: string;
  packageName: string;
  dateFormatted: string;
  timeSlot: string;
  bookingRef: string;
  amount: number;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendBookingConfirmation(booking: {
  userName: string;
  userEmail: string;
  packageName: string;
  date: string;
  timeSlot: string;
  amount: number;
  bookingId: string;
}) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; margin: 0; padding: 20px; }
      .container { max-width: 560px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0a0a0a, #111111); padding: 32px; text-align: center; border-bottom: 2px solid #27272a; }
      .logo { font-size: 28px; font-weight: 900; color: #fafafa; letter-spacing: -1px; }
      .confirmed-badge { background: #fafafa; color: #000000; font-size: 11px; letter-spacing: 2px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 12px; }
      .body { padding: 40px 32px; }
      .success-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
      .title { color: #fff; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 8px; }
      .subtitle { color: #888; font-size: 14px; text-align: center; margin-bottom: 32px; }
      .booking-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; }
      .booking-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #222; }
      .booking-row:last-child { border-bottom: none; }
      .row-label { color: #888; font-size: 13px; }
      .row-value { color: #fff; font-size: 13px; font-weight: 600; }
      .amount-row { background: #0a0a0a; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-top: 16px; display: flex; justify-content: space-between; }
      .amount-label { color: #a1a1aa; font-size: 14px; }
      .amount-value { color: #fafafa; font-size: 18px; font-weight: 900; }
      .cta { text-align: center; margin-top: 32px; }
      .cta-btn { background: #fafafa; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; border: 1px solid #e4e4e7; }
      .footer { background: #0a0a0a; padding: 24px 32px; text-align: center; border-top: 1px solid #222; }
      .footer-text { color: #555; font-size: 11px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">BigBets Studio</div>
        <div class="confirmed-badge">✓ BOOKING CONFIRMED</div>
      </div>
      <div class="body">
        <div class="success-icon">🎙️</div>
        <div class="title">You're All Set, ${booking.userName}!</div>
        <div class="subtitle">Your podcast session has been confirmed. See you at the studio!</div>
        
        <div class="booking-card">
          <div class="booking-row">
            <span class="row-label">Booking ID</span>
            <span class="row-value">#${booking.bookingId.slice(-8).toUpperCase()}</span>
          </div>
          <div class="booking-row">
            <span class="row-label">Package</span>
            <span class="row-value">${booking.packageName}</span>
          </div>
          <div class="booking-row">
            <span class="row-label">Date</span>
            <span class="row-value">${booking.date}</span>
          </div>
          <div class="booking-row">
            <span class="row-label">Time</span>
            <span class="row-value">${booking.timeSlot}</span>
          </div>
          <div class="booking-row">
            <span class="row-label">Location</span>
            <span class="row-value">803B Tower2A, Crossing Republik, Ghaziabad</span>
          </div>
        </div>
        
        <div class="amount-row">
          <span class="amount-label">Amount Paid</span>
          <span class="amount-value">₹${booking.amount.toLocaleString('en-IN')}</span>
        </div>
        
        <div class="cta">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-btn">View My Booking</a>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">
          📍 803B Tower2A Panchsheel Wellington, Crossing Republik, Ghaziabad<br>
          📧 ${siteConfig.email}<br><br>
          Need to reschedule? Contact us at least 24 hours before your session.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"${siteConfig.name}" <${siteConfig.email}>`,
    to: booking.userEmail,
    subject: `🎙️ Booking Confirmed – ${booking.date} at ${booking.timeSlot}`,
    html,
  });
}

const cancellationEmailStyles = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; margin: 0; padding: 20px; }
  .container { max-width: 560px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0a0a0a, #111111); padding: 28px; text-align: center; border-bottom: 1px solid #27272a; }
  .logo { font-size: 24px; font-weight: 900; color: #fafafa; letter-spacing: -1px; }
  .badge { background: #27272a; color: #a1a1aa; font-size: 11px; letter-spacing: 2px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 12px; }
  .body { padding: 36px 28px; }
  .title { color: #fff; font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 10px; }
  .subtitle { color: #888; font-size: 14px; text-align: center; margin-bottom: 28px; line-height: 1.5; }
  .booking-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; }
  .booking-row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #222; }
  .booking-row:last-child { border-bottom: none; }
  .row-label { color: #888; font-size: 13px; flex-shrink: 0; }
  .row-value { color: #fff; font-size: 13px; font-weight: 600; text-align: right; }
  .footer { background: #0a0a0a; padding: 22px 28px; text-align: center; border-top: 1px solid #222; }
  .footer-text { color: #555; font-size: 11px; line-height: 1.6; }
`;

async function sendUserBookingCancellationEmail(
  p: BookingCancellationEmailPayload,
  cancelledAtIso: string,
) {
  const u = {
    name: escapeHtml(p.userName),
    email: escapeHtml(p.userEmail),
    pkg: escapeHtml(p.packageName),
    date: escapeHtml(p.dateFormatted),
    time: escapeHtml(p.timeSlot),
    ref: escapeHtml(p.bookingRef),
  };
  const amountStr = `₹${p.amount.toLocaleString('en-IN')}`;
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><style>${cancellationEmailStyles}</style></head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">BigBets Studio</div>
        <div class="badge">BOOKING CANCELLED</div>
      </div>
      <div class="body">
        <div class="title">Your booking has been cancelled</div>
        <div class="subtitle">Hi ${u.name}, we've cancelled your session as requested. If this was a mistake, you can book a new slot anytime.</div>
        <div class="booking-card">
          <div class="booking-row"><span class="row-label">Reference</span><span class="row-value">#${u.ref}</span></div>
          <div class="booking-row"><span class="row-label">Package</span><span class="row-value">${u.pkg}</span></div>
          <div class="booking-row"><span class="row-label">Date</span><span class="row-value">${u.date}</span></div>
          <div class="booking-row"><span class="row-label">Time</span><span class="row-value">${u.time}</span></div>
          <div class="booking-row"><span class="row-label">Amount (record)</span><span class="row-value">${amountStr}</span></div>
          <div class="booking-row"><span class="row-label">Cancelled at</span><span class="row-value">${escapeHtml(cancelledAtIso)}</span></div>
        </div>
        <div class="subtitle" style="margin-top:24px;margin-bottom:0;text-align:left;">
          <strong style="color:#e4e4e7;">Next steps</strong><br/>
          Browse packages on our site and pick a new date, or reply to this thread if you need help.
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">
          📍 803B Tower2A Panchsheel Wellington, Crossing Republik, Ghaziabad<br/>
          📧 ${escapeHtml(siteConfig.email)}
        </div>
      </div>
    </div>
  </body>
  </html>`;

  const plain = [
    `Hi ${p.userName}, your booking has been cancelled.`,
    '',
    `Reference: #${p.bookingRef}`,
    `Package: ${p.packageName}`,
    `Date: ${p.dateFormatted}`,
    `Time: ${p.timeSlot}`,
    `Amount (record): ${amountStr}`,
    `Cancelled at: ${cancelledAtIso}`,
    '',
    'You can book again anytime on our website.',
    '',
    siteConfig.email,
  ].join('\n');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"${siteConfig.name}" <${siteConfig.email}>`,
    to: p.userEmail,
    subject: 'Your Booking Has Been Cancelled',
    text: plain,
    html,
  });
}

async function sendOwnerBookingCancellationEmail(
  p: BookingCancellationEmailPayload,
  cancelledAtIso: string,
  ownerTo: string,
) {
  const u = {
    userEmail: escapeHtml(p.userEmail),
    userName: escapeHtml(p.userName),
    pkg: escapeHtml(p.packageName),
    date: escapeHtml(p.dateFormatted),
    time: escapeHtml(p.timeSlot),
    ref: escapeHtml(p.bookingRef),
    at: escapeHtml(cancelledAtIso),
  };
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><style>${cancellationEmailStyles}</style></head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">BigBets Studio</div>
        <div class="badge">OWNER NOTICE</div>
      </div>
      <div class="body">
        <div class="title">Booking cancelled by user</div>
        <div class="subtitle">A customer cancelled their booking from the dashboard.</div>
        <div class="booking-card">
          <div class="booking-row"><span class="row-label">User email</span><span class="row-value">${u.userEmail}</span></div>
          <div class="booking-row"><span class="row-label">User name</span><span class="row-value">${u.userName}</span></div>
          <div class="booking-row"><span class="row-label">Reference</span><span class="row-value">#${u.ref}</span></div>
          <div class="booking-row"><span class="row-label">Package</span><span class="row-value">${u.pkg}</span></div>
          <div class="booking-row"><span class="row-label">Date</span><span class="row-value">${u.date}</span></div>
          <div class="booking-row"><span class="row-label">Time</span><span class="row-value">${u.time}</span></div>
          <div class="booking-row"><span class="row-label">Cancellation time (UTC)</span><span class="row-value">${u.at}</span></div>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">Automated message — do not reply unless you use this inbox for support.</div>
      </div>
    </div>
  </body>
  </html>`;

  const plain = [
    'Booking cancelled by user',
    '',
    `User email: ${p.userEmail}`,
    `User name: ${p.userName}`,
    `Reference: #${p.bookingRef}`,
    `Package: ${p.packageName}`,
    `Date: ${p.dateFormatted}`,
    `Time: ${p.timeSlot}`,
    `Cancellation timestamp (UTC): ${cancelledAtIso}`,
  ].join('\n');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"${siteConfig.name}" <${siteConfig.email}>`,
    to: ownerTo,
    subject: 'Booking Cancelled by User',
    text: plain,
    html,
  });
}

/**
 * Sends user + owner cancellation notices. Each send is isolated: one failure does not block the other.
 * Call without await from API routes so the HTTP response is not delayed.
 */
export async function sendBookingCancellationEmails(payload: BookingCancellationEmailPayload): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] Skipping cancellation emails: EMAIL_USER or EMAIL_PASS not configured');
    return;
  }

  const cancelledAtIso = new Date().toISOString();
  const cancelledAtDisplay = `${cancelledAtIso} (UTC)`;

  try {
    await sendUserBookingCancellationEmail(payload, cancelledAtDisplay);
  } catch (err) {
    console.error('[email] User cancellation email failed', err);
  }

  const owners = getOwnerCancellationRecipients();
  for (const to of owners) {
    try {
      await sendOwnerBookingCancellationEmail(payload, cancelledAtDisplay, to);
    } catch (err) {
      console.error('[email] Owner cancellation email failed', { to, err });
    }
  }
}

/** Fire-and-forget wrapper; safe to call after DB success. */
export function queueBookingCancellationEmails(payload: BookingCancellationEmailPayload): void {
  void sendBookingCancellationEmails(payload).catch((err) => {
    console.error('[email] Cancellation email batch unexpected error', err);
  });
}
