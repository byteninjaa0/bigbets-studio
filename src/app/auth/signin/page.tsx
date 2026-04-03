'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiMessage } from '@/lib/api-message';

function buildContinuePath(searchParams: URLSearchParams) {
  const next = searchParams.get('callbackUrl');
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return `/auth/continue?next=${encodeURIComponent(next)}`;
  }
  return '/auth/continue';
}

type Step = 'email' | 'otp';

function SignInPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const registerMode = params.get('register') === '1';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const startResendCooldown = useCallback((seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (step === 'otp') {
      const t = setTimeout(() => document.getElementById('otp-0')?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const sendOtp = async () => {
    const e = email.trim().toLowerCase();
    if (!e) return toast.error('Enter your email address.');
    if (registerMode && !displayName.trim()) return toast.error('Enter your name.');

    setSending(true);
    try {
      await axios.post('/api/auth/send-otp', { email: e });
      toast.success('OTP sent successfully');
      setStep('otp');
      startResendCooldown(30);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Could not send code.'));
      } else {
        toast.error('Could not send code.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = d;
    setOtp(next);
    if (d && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  const verifyAndSignIn = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter the 6-digit code.');
    const e = email.trim().toLowerCase();

    setVerifying(true);
    try {
      const { data } = await axios.post<{
        success?: boolean;
        loginToken?: string;
        message?: string;
      }>('/api/auth/verify-otp', {
        email: e,
        otp: code,
        ...(registerMode && displayName.trim() ? { name: displayName.trim() } : {}),
      });

      if (!data?.loginToken) {
        toast.error('Invalid or expired OTP');
        return;
      }

      const res = await signIn('email-otp', {
        email: e,
        otpLoginToken: data.loginToken,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Session could not be started. Try again.');
        return;
      }

      toast.success('Signed in');
      router.push(buildContinuePath(params));
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Invalid or expired OTP'));
      } else {
        toast.error('Invalid or expired OTP');
      }
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 16 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-md"
    >
      <Card className="rounded-3xl border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="font-display text-3xl font-black tracking-tight text-white">
            {registerMode ? 'Create account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-base text-white/40">
            {registerMode
              ? 'We’ll email you a one-time code — no password to remember.'
              : 'Sign in with a one-time code sent to your email.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8 pt-0">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {registerMode && (
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                      Full name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(ev) => setDisplayName(ev.target.value)}
                      className="input-dark w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      className="input-dark pl-10 w-full"
                      disabled={sending}
                    />
                  </div>
                </div>
                <Button type="button" onClick={sendOtp} disabled={sending} className="w-full text-base" size="lg">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP</>}
                </Button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <p className="text-sm text-white/50 text-center">
                  Enter the code sent to <span className="text-white/80 font-medium">{email}</span>
                </p>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(ev) => handleOtpChange(i, ev.target.value)}
                      onKeyDown={(ev) => handleOtpKeyDown(i, ev)}
                      className="w-11 h-14 text-center text-xl font-mono font-bold rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      disabled={verifying}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={verifyAndSignIn}
                  disabled={verifying}
                  className="w-full text-base"
                  size="lg"
                >
                  {verifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp(['', '', '', '', '', '']);
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || sending}
                    onClick={sendOtp}
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!registerMode && (
            <p className="text-center text-white/40 text-sm pt-2 border-t border-white/6">
              New here?{' '}
              <Link href="/auth/signin?register=1" className="text-zinc-400 hover:text-zinc-300 font-medium">
                Create an account
              </Link>
            </p>
          )}
          {registerMode && (
            <p className="text-center text-white/40 text-sm pt-2 border-t border-white/6">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-zinc-400 hover:text-zinc-300 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto flex min-h-[320px] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <SignInPageInner />
    </Suspense>
  );
}
