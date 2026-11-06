ALTER TABLE "Booking" ADD COLUMN "paymentToken" TEXT;
ALTER TABLE "Booking" ADD COLUMN "receiptEmailSentAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "cancellationReason" TEXT;
CREATE UNIQUE INDEX "Booking_paymentToken_key" ON "Booking"("paymentToken");
