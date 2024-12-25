-- Create enums
CREATE TYPE "race_status" AS ENUM ('live', 'upcoming', 'completed', 'cancelled');
CREATE TYPE "ticket_availability" AS ENUM ('available', 'sold_out', 'low_stock', 'pending');

-- Create circuits tables
CREATE TABLE "circuits" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "latitude" DECIMAL(10, 6),
  "longitude" DECIMAL(10, 6),
  "description" TEXT,
  "track_map_url" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

CREATE TABLE "circuit_info" (
  "id" SERIAL PRIMARY KEY,
  "circuit_id" INTEGER NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "length" TEXT NOT NULL,
  "corners" INTEGER NOT NULL,
  "drs_zones" INTEGER NOT NULL,
  "lap_record_time" TEXT,
  "lap_record_driver" TEXT,
  "lap_record_year" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "circuit_transport" (
  "id" SERIAL PRIMARY KEY,
  "circuit_id" INTEGER NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "frequency" TEXT,
  "price_range" TEXT,
  "booking_url" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "circuit_airports" (
  "id" SERIAL PRIMARY KEY,
  "circuit_id" INTEGER NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "distance" TEXT NOT NULL,
  "transfer_time" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "circuit_attractions" (
  "id" SERIAL PRIMARY KEY,
  "circuit_id" INTEGER NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "distance" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create races tables
CREATE TABLE "races" (
  "id" SERIAL PRIMARY KEY,
  "circuit_id" INTEGER NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "season" INTEGER NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "weekend_start" TIMESTAMP,
  "weekend_end" TIMESTAMP,
  "status" race_status NOT NULL DEFAULT 'upcoming',
  "is_sprint_weekend" BOOLEAN NOT NULL DEFAULT false,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

CREATE TABLE "race_sessions" (
  "id" SERIAL PRIMARY KEY,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "status" TEXT DEFAULT 'scheduled',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "race_weather" (
  "id" SERIAL PRIMARY KEY,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "session_id" INTEGER REFERENCES "race_sessions"("id") ON DELETE SET NULL,
  "air_temperature" DECIMAL(4, 1),
  "track_temperature" DECIMAL(4, 1),
  "humidity" INTEGER,
  "wind_speed" DECIMAL(4, 1),
  "wind_direction" INTEGER,
  "precipitation_chance" INTEGER,
  "conditions" TEXT,
  "recorded_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "race_results" (
  "id" SERIAL PRIMARY KEY,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "winner" TEXT,
  "fastest_lap" TEXT,
  "fastest_lap_time" TEXT,
  "total_laps" INTEGER,
  "podium" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

CREATE TABLE "supporting_series" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "race_supporting_series" (
  "id" SERIAL PRIMARY KEY,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "series_id" INTEGER NOT NULL REFERENCES "supporting_series"("id") ON DELETE CASCADE,
  "round" INTEGER NOT NULL,
  "schedule" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create tickets tables
CREATE TABLE "ticket_features" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT
);

CREATE TABLE "tickets" (
  "id" SERIAL PRIMARY KEY,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "ticket_type" TEXT NOT NULL,
  "availability" ticket_availability NOT NULL,
  "days_included" JSONB NOT NULL,
  "is_child_ticket" BOOLEAN NOT NULL,
  "reseller_url" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

CREATE TABLE "ticket_feature_mappings" (
  "ticket_id" INTEGER NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
  "feature_id" INTEGER NOT NULL REFERENCES "ticket_features"("id") ON DELETE CASCADE,
  PRIMARY KEY ("ticket_id", "feature_id")
);

CREATE TABLE "ticket_pricing" (
  "id" SERIAL PRIMARY KEY,
  "ticket_id" INTEGER NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
  "price" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL,
  "valid_from" TIMESTAMP NOT NULL,
  "valid_to" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

CREATE TABLE "ticket_packages" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "package_tickets" (
  "package_id" INTEGER NOT NULL REFERENCES "ticket_packages"("id") ON DELETE CASCADE,
  "ticket_id" INTEGER NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "discount_percentage" DECIMAL(5, 2),
  PRIMARY KEY ("package_id", "ticket_id")
);

-- Create saved itineraries table
CREATE TABLE "saved_itineraries" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "race_id" INTEGER NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "itinerary" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
); 