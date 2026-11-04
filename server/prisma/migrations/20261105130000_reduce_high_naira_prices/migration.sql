-- Reduce every nightly apartment price above ₦190,000 by ₦100,000.
UPDATE "Apartment"
SET "pricePerNight" = "pricePerNight" - 100000,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "pricePerNight" > 190000;

-- Keep booking totals aligned with the updated nightly prices.
UPDATE "Booking" AS booking
SET "totalPrice" = apartment."pricePerNight" * GREATEST(
  1,
  CEIL(EXTRACT(EPOCH FROM (booking."checkOut" - booking."checkIn")) / 86400)
)
FROM "Apartment" AS apartment
WHERE booking."apartmentId" = apartment."id";
