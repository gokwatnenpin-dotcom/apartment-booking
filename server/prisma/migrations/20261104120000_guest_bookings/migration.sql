ALTER TABLE "Booking"
  ADD COLUMN "guestName" TEXT,
  ADD COLUMN "guestEmail" TEXT;

ALTER TABLE "Booking"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Booking"
  DROP CONSTRAINT "Booking_userId_fkey";

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
