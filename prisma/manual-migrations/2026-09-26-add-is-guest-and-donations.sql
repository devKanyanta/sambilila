-- Manual migration: restore `isGuest` on users + `donations` table
--
-- These were dropped from prisma/schema.prisma by an accidental rewrite,
-- while lib/guest.ts, lib/donations.ts and the donate/claim flows still
-- depend on them. The schema has been restored; this brings the database
-- back in line with it.
--
-- The `sambilila` role cannot ALTER `users` (owned by `mapalo`), so run
-- this ON THE DB HOST as the owner, e.g.:
--
--   psql "postgresql://mapalo:<password>@localhost:5432/sambilila_db" \
--     -f prisma/manual-migrations/2026-09-26-add-is-guest-and-donations.sql
--
-- Every statement is guarded (IF NOT EXISTS / exception-safe), so it is
-- safe to run more than once and on any environment missing these pieces.

-- 1. Enum types (skip if they already exist)
DO $$ BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('PAYPAL', 'LENCO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Guest flag on users (requires table owner)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN NOT NULL DEFAULT false;

-- 3. Donations table
CREATE TABLE IF NOT EXISTS "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountUSD" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountLocal" DOUBLE PRECISION,
    "provider" "PaymentProvider" NOT NULL,
    "providerId" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- 4. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "donations_providerId_key" ON "donations"("providerId");
CREATE INDEX IF NOT EXISTS "donations_userId_idx" ON "donations"("userId");
CREATE INDEX IF NOT EXISTS "donations_status_createdAt_idx" ON "donations"("status", "createdAt");

-- 4b. Restore ON DELETE CASCADE on job -> user foreign keys
-- (accidentally changed to RESTRICT during the schema rewrite)
ALTER TABLE "flashcard_jobs" DROP CONSTRAINT IF EXISTS "flashcard_jobs_userId_fkey";
ALTER TABLE "flashcard_jobs" ADD CONSTRAINT "flashcard_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_job" DROP CONSTRAINT IF EXISTS "quiz_job_userId_fkey";
ALTER TABLE "quiz_job" ADD CONSTRAINT "quiz_job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Foreign key (skip if it already exists)
DO $$ BEGIN
  ALTER TABLE "donations"
    ADD CONSTRAINT "donations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
