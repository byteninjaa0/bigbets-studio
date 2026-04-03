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
