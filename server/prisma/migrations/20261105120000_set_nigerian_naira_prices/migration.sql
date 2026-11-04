-- Replace the old dollar-sized catalog amounts with representative Nigerian
-- short-let nightly rates, based on bedroom count.
UPDATE "Apartment"
SET "pricePerNight" = CASE
  WHEN "bedrooms" <= 1 THEN 85000
  WHEN "bedrooms" = 2 THEN 145000
  WHEN "bedrooms" = 3 THEN 195000
  WHEN "bedrooms" = 4 THEN 240000
  ELSE 280000
END,
"updatedAt" = CURRENT_TIMESTAMP;

-- Keep existing booking totals consistent with the apartment's new nightly rate.
UPDATE "Booking" AS booking
SET "totalPrice" = apartment."pricePerNight" * GREATEST(
  1,
  CEIL(EXTRACT(EPOCH FROM (booking."checkOut" - booking."checkIn")) / 86400)
)
FROM "Apartment" AS apartment
WHERE booking."apartmentId" = apartment."id";
