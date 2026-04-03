-- Run this in Supabase → SQL Editor (not the pooler).
-- Fixes: "column otpHash does not exist" and adds EmailLoginToken for email OTP login.
--
-- Your original migration used "Otp"."otp" (plain text). The app now stores bcrypt hashes in "otpHash".
-- Existing OTP rows are deleted because old plain codes cannot be converted to hashes.

-- ---------------------------------------------------------------------------
-- 1) One-time session tokens (after OTP verify → NextAuth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "EmailLoginToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLoginToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmailLoginToken_email_idx" ON "EmailLoginToken"("email");

-- ---------------------------------------------------------------------------
-- 2) Otp: replace plain "otp" column with "otpHash"
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Otp'
  ) THEN
    RAISE NOTICE 'Table "Otp" does not exist — apply prisma/migrations first or create schema.';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Otp' AND column_name = 'otp'
  ) THEN
    ALTER TABLE "Otp" ADD COLUMN IF NOT EXISTS "otpHash" TEXT;
    DELETE FROM "Otp";
    ALTER TABLE "Otp" DROP COLUMN "otp";
    ALTER TABLE "Otp" ALTER COLUMN "otpHash" SET NOT NULL;
    RAISE NOTICE 'Migrated "Otp": dropped "otp", "otpHash" is now required.';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Otp' AND column_name = 'otpHash'
  ) THEN
    RAISE NOTICE '"Otp"."otpHash" already present — nothing to do for Otp.';
  ELSE
    RAISE NOTICE 'Unexpected "Otp" shape — check columns manually.';
  END IF;
END $$;
