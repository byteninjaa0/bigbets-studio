export type PaymentMode = 'demo' | 'live';

/**
 * Controls checkout copy across the app. Baked at build time (NEXT_PUBLIC_*).
 * - `demo` — mock / demo gateway (current default when unset).
 * - `live` — real payment gateway; use when Razorpay (or similar) is wired.
 */
export function getPaymentMode(): PaymentMode {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_MODE?.toLowerCase().trim();
  if (raw === 'live') return 'live';
  return 'demo';
}

export function isPaymentDemoMode(): boolean {
  return getPaymentMode() === 'demo';
}

/** Small print under “Proceed to payment” on the booking page. */
export function paymentCheckoutFooterText(): string {
  return isPaymentDemoMode()
    ? 'Demo checkout with a short delay.'
    : 'Secure checkout. Payment is processed when you complete your purchase.';
}

/** Notice inside the payment modal; omitted in live mode. */
export function paymentModalNoticeText(): string | null {
  if (!isPaymentDemoMode()) return null;
  return 'This is a demo payment. No real transaction will occur.';
}

/** FAQ: installments / UPI / how checkout works. */
export function paymentFaqInstallmentsAnswer(): string {
  return isPaymentDemoMode()
    ? 'Checkout uses a secure demo payment flow (no real charge). Full confirmation is required at the time of booking. When live payments are on, UPI and cards will be available at checkout.'
    : 'Checkout is secure and handled by our payment partner. You can use UPI, cards, and other supported methods. Full payment is required to confirm your booking. Installments are not offered on the site—contact us if you need to discuss options.';
}

/** How It Works — step 3 (payment) description. */
export function paymentHowItWorksPayStepDescription(): string {
  return isPaymentDemoMode()
    ? 'Complete checkout in a demo flow—no card required. Your slot is confirmed right after.'
    : 'Pay securely online with UPI, card, or other supported methods. Your booking is confirmed after successful payment.';
}
