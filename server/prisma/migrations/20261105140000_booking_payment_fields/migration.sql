ALTER TABLE "Booking" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paidAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Booking_paymentReference_key" ON "Booking"("paymentReference");
