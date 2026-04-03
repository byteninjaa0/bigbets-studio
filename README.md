# 🎙️ BigBets Studio — Full-Stack Podcast Booking Platform

A production-ready podcast studio booking platform built with **Next.js 14**, **MongoDB**, **NextAuth**, **Razorpay**, and **OTP email verification**.

---

## 📁 Project Structure

```
bigbets-studio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   ← NextAuth handler
│   │   │   ├── otp/
│   │   │   │   ├── send/route.ts             ← Send OTP email
│   │   │   │   └── verify/route.ts           ← Verify OTP + create user
│   │   │   ├── slots/route.ts                ← Fetch available slots
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts                  ← GET / DELETE bookings
│   │   │   │   └── coupon/route.ts           ← Validate coupon
│   │   │   ├── payment/
│   │   │   │   ├── create-order/route.ts     ← Razorpay order
│   │   │   │   └── verify/route.ts           ← Verify + confirm booking
│   │   │   └── admin/route.ts                ← Admin stats + slot management
│   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   ├── signin/page.tsx               ← Sign In (Google + email)
│   │   │   └── register/page.tsx             ← Register with OTP flow
│   │   ├── booking/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                      ← Full booking wizard
│   │   ├── dashboard/page.tsx                ← User dashboard
│   │   ├── admin/page.tsx                    ← Admin panel
│   │   ├── layout.tsx                        ← Root layout
│   │   ├── page.tsx                          ← Landing page
│   │   ├── globals.css                       ← Design system CSS
│   │   └── providers.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   └── home/
│   │       ├── Hero.tsx
│   │       ├── SocialProof.tsx
│   │       ├── Features.tsx
│   │       ├── Packages.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── Testimonials.tsx
│   │       ├── Gallery.tsx
│   │       ├── FAQ.tsx
│   │       └── Contact.tsx
│   ├── lib/
│   │   ├── mongodb.ts                        ← DB connection
│   │   ├── auth.ts                           ← NextAuth config
│   │   ├── email.ts                          ← Nodemailer (OTP + confirmation)
│   │   ├── packages.ts                       ← Package config + slot logic
│   │   └── cart-store.ts                     ← Zustand cart
│   └── models/
│       ├── User.ts
│       ├── Booking.ts
│       ├── Slot.ts
│       ├── OTP.ts
│       └── Coupon.ts
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd bigbets-studio
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Free cluster |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 |
| `EMAIL_USER/PASS` | Gmail → Enable 2FA → App Password |
| `RAZORPAY_KEY_ID/SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Test keys |

### 3. MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user with read/write access
3. Whitelist your IP (or 0.0.0.0/0 for dev)
4. Copy connection string to `MONGODB_URI`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. OAuth consent screen → External
4. Create credentials → OAuth 2.0 Client IDs
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID & Secret to `.env.local`

### 5. Gmail App Password (for OTP emails)

1. Gmail → Settings → Security → 2-Step Verification → ON
2. App passwords → Generate → Copy to `EMAIL_PASS`

### 6. Razorpay Test Setup

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → Sign up
2. Settings → API Keys → Generate test keys
3. Copy to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Additional Config

### Make yourself Admin

After registering, run in MongoDB shell or Compass:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

Or add your email to `ADMIN_EMAILS` in `.env.local`:
```
ADMIN_EMAILS=your@email.com,other@email.com
```

### Create a Test Coupon

In MongoDB Compass / Atlas:
```javascript
db.coupons.insertOne({
  code: "LAUNCH50",
  discountType: "percentage",
  discountValue: 50,
  maxUses: 100,
  usedCount: 0,
  minAmount: 2500,
  expiresAt: new Date("2025-12-31"),
  isActive: true,
  applicablePackages: []
})
```

---

## 📦 Install Missing Dev Dependency

```bash
npm install tailwindcss-animate
```

---

## 🎨 Design System

The app uses a dark, luxury aesthetic with:
- **Fonts**: Playfair Display (headings) + DM Sans (body) + JetBrains Mono (code/OTP)
- **Colors**: Deep black `#0A0A0A` + Amber gold `#F5A623`
- **Effects**: Glassmorphism, radial gradients, subtle noise textures
- **Animations**: Framer Motion page transitions, float animations, shimmer

---

## 💳 Payment Flow

```
User selects package
    ↓
Selects date + slot (real-time availability)
    ↓
Optional coupon code
    ↓
POST /api/payment/create-order → Razorpay order
    ↓
Razorpay checkout opens
    ↓
User pays → Razorpay callback
    ↓
POST /api/payment/verify → signature check
    ↓
Booking saved → Slot blocked → Email sent
    ↓
Success page
```

---

## 📧 OTP Registration Flow

```
User fills form (name, email, password)
    ↓
POST /api/otp/send → generates 6-digit OTP, sends email
    ↓
User enters OTP on screen
    ↓
POST /api/otp/verify → validates OTP + creates user in DB
    ↓
Auto sign-in → Dashboard
```

---

## 🏗️ Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add all env variables in Vercel dashboard
# Settings → Environment Variables
```

**Important Vercel settings:**
- Add `NEXTAUTH_URL=https://yourdomain.com`
- Update Google OAuth redirect URI to production URL
- Enable Razorpay live keys for production

---

## 📊 Business Hours Logic

| Day | Hours |
|-----|-------|
| Mon | 9 AM – 7 PM |
| Tue | 9 AM – 7 PM |
| Wed | 9 AM – 6 PM |
| Thu | 9 AM – 7 PM |
| Fri | 9 AM – 7 PM |
| Sat | 9 AM – 5 PM |
| Sun | **Closed** |

Weekend pricing (+₹500–1000) auto-applies.

---

## 🔐 Security Features

- ✅ OTP expires in 10 minutes
- ✅ Max 5 failed OTP attempts before lockout
- ✅ Max 3 OTP requests per hour per email
- ✅ Razorpay signature verification (HMAC-SHA256)
- ✅ Server-side session validation on all API routes
- ✅ Admin routes protected by email whitelist
- ✅ Slot double-booking prevented with MongoDB upsert

---

## 📱 Features Summary

| Feature | Status |
|---------|--------|
| Landing page with hero, features, packages | ✅ |
| Google OAuth login | ✅ |
| Email + password registration with OTP | ✅ |
| Real-time slot calendar | ✅ |
| Razorpay payment integration | ✅ |
| Email booking confirmation | ✅ |
| User dashboard | ✅ |
| Booking cancellation (24h policy) | ✅ |
| Admin panel with stats | ✅ |
| Coupon/discount system | ✅ |
| Referral code system | ✅ |
| Weekend dynamic pricing | ✅ |
| WhatsApp floating button | ✅ |
| Mobile responsive | ✅ |
| Glassmorphism UI | ✅ |
| Cart state (Zustand) | ✅ |
| Marquee social proof | ✅ |
| FAQ accordion | ✅ |
| Google Maps embed | ✅ |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom design system
- **Animations**: Framer Motion
- **Auth**: NextAuth.js (Google + Credentials)
- **Database**: MongoDB + Mongoose
- **Payments**: Razorpay
- **Email**: Nodemailer (Gmail)
- **State**: Zustand (cart)
- **Calendar**: react-day-picker
- **Notifications**: react-hot-toast

---

Built with ❤️ for BigBets Studio, Ghaziabad.
