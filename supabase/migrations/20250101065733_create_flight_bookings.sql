-- Create booking status enum
CREATE TYPE booking_status AS ENUM (
  'pending',    -- Initial state when booking is started
  'confirmed',  -- Successfully booked with airline
  'failed',     -- Booking attempt failed
  'expired',    -- Offer expired before completion
  'cancelled'   -- Booking was cancelled
);

-- Create flight bookings table
CREATE TABLE IF NOT EXISTS "public"."flight_bookings" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "public"."trips"("id") ON DELETE SET NULL,
  
  -- Duffel specific fields
  "offer_id" text NOT NULL,
  "order_id" text,
  "booking_reference" text,
  
  -- Core booking data
  "status" booking_status NOT NULL DEFAULT 'pending',
  "total_amount" text NOT NULL,
  "total_currency" text NOT NULL,
  
  -- Flight details
  "departure_iata" text NOT NULL,
  "arrival_iata" text NOT NULL,
  "departure_city" text,
  "arrival_city" text,
  "departure_time" timestamptz NOT NULL,
  "arrival_time" timestamptz NOT NULL,
  
  -- Store complete data
  "offer_data" jsonb NOT NULL,
  "passenger_data" jsonb NOT NULL,
  "payment_data" jsonb,
  
  -- Metadata
  "expires_at" timestamptz NOT NULL,
  "added_to_trip" boolean NOT NULL DEFAULT false,
  "last_error_message" text,
  "payment_required" boolean NOT NULL DEFAULT true,
  "payment_required_by" timestamptz,
  
  -- Timestamps
  "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "completed_at" timestamptz
);

-- Create indexes
CREATE INDEX idx_flight_bookings_user_id ON "public"."flight_bookings"("user_id");
CREATE INDEX idx_flight_bookings_trip_id ON "public"."flight_bookings"("trip_id");
CREATE INDEX idx_flight_bookings_status ON "public"."flight_bookings"("status");
CREATE INDEX idx_flight_bookings_departure_time ON "public"."flight_bookings"("departure_time");
CREATE INDEX idx_flight_bookings_arrival_time ON "public"."flight_bookings"("arrival_time");

-- Add updated_at trigger
CREATE TRIGGER update_flight_bookings_updated_at
  BEFORE UPDATE ON "public"."flight_bookings"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 