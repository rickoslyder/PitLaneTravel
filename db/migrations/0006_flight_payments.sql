-- Customer payment for flight bookings (SPEC.md Phase D8).
-- Duffel orders are paid from the platform's own balance, so a succeeded Stripe
-- PaymentIntent (offer total + service fee) must back every booking. The unique index
-- on payment_intent_id makes double-spending a single payment impossible at the DB level.
-- Idempotent.

ALTER TABLE "flight_bookings" ADD COLUMN IF NOT EXISTS "payment_intent_id" text;
ALTER TABLE "flight_bookings" ADD COLUMN IF NOT EXISTS "service_fee_amount" text;
ALTER TABLE "flight_bookings" ADD COLUMN IF NOT EXISTS "amount_charged" text;

CREATE UNIQUE INDEX IF NOT EXISTS "flight_bookings_payment_intent_id_idx"
  ON "flight_bookings" ("payment_intent_id")
  WHERE "payment_intent_id" IS NOT NULL;
