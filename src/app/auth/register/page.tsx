import { redirect } from 'next/navigation';

/** Registration uses the same email OTP flow as sign-in (with name). */
export default function RegisterPage() {
  redirect('/auth/signin?register=1');
}
