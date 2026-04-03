export type MockPaymentResult = {
  success: boolean;
  paymentId?: string;
  message?: string;
};

export type SimulatePaymentOptions = {
  /** Dev-only: server rejects payment after the same delay as a real attempt. */
  simulateFailure?: boolean;
};

/**
 * Calls POST /api/mock-payment (network delay + server-side outcome).
 * For purely client-side delays/tests, use {@link simulatePaymentLocal}.
 */
export async function simulatePayment(options?: SimulatePaymentOptions): Promise<MockPaymentResult> {
  const res = await fetch('/api/mock-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ simulateFailure: options?.simulateFailure ?? false }),
  });

  const data = (await res.json()) as {
    success?: boolean;
    paymentId?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    return {
      success: false,
      message: typeof data.message === 'string' ? data.message : 'Payment request failed.',
    };
  }

  return {
    success: Boolean(data.success),
    paymentId: typeof data.paymentId === 'string' ? data.paymentId : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
  };
}

const LOCAL_MS_MIN = 2000;
const LOCAL_MS_MAX = 3000;

function localDelay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Client-only simulation (no server round-trip). Optional 90% success when `randomFailure` is true.
 */
export async function simulatePaymentLocal(options?: {
  randomFailure?: boolean;
  failureProbability?: number;
}): Promise<MockPaymentResult> {
  const ms = LOCAL_MS_MIN + Math.floor(Math.random() * (LOCAL_MS_MAX - LOCAL_MS_MIN + 1));
  await localDelay(ms);

  const p = options?.failureProbability ?? 0.1;
  if (options?.randomFailure && Math.random() < p) {
    return { success: false, message: 'Payment could not be completed.' };
  }

  const paymentId = `mock_local_${crypto.randomUUID()}`;
  return { success: true, paymentId, message: 'OK' };
}
