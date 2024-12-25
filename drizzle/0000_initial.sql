CREATE TYPE "membership" AS ENUM ('free', 'pro');
CREATE TYPE "trip_visibility" AS ENUM ('private', 'public', 'shared');
CREATE TYPE "ticket_availability" AS ENUM ('available', 'sold_out', 'low_stock', 'pending');

-- Create circuits table
CREATE TABLE IF NOT EXISTS "circuits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "location" text NOT NULL,
  "country" text NOT NULL,
  "latitude" numeric(10,7) NOT NULL,
  "longitude" numeric(10,7) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create races table
CREATE TABLE IF NOT EXISTS "races" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "circuit_id" uuid NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "date" timestamp NOT NULL,
  "season" integer NOT NULL,
  "round" integer NOT NULL,
  "country" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
  "user_id" text PRIMARY KEY NOT NULL,
  "membership" membership NOT NULL DEFAULT 'free',
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS "trips" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "race_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "visibility" trip_visibility NOT NULL DEFAULT 'private',
  "shared_with" text[],
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create ticket features table
CREATE TABLE IF NOT EXISTS "ticket_features" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS "tickets" (
  "id" serial PRIMARY KEY,
  "race_id" integer NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "ticket_type" text NOT NULL,
  "availability" ticket_availability NOT NULL,
  "days_included" jsonb NOT NULL,
  "is_child_ticket" boolean NOT NULL,
  "reseller_url" text NOT NULL,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp DEFAULT NOW(),
  "updated_by" text
);

-- Create ticket feature mappings table
CREATE TABLE IF NOT EXISTS "ticket_feature_mappings" (
  "ticket_id" integer NOT NULL REFERENCES "tickets"("id"),
  "feature_id" integer NOT NULL REFERENCES "ticket_features"("id"),
  PRIMARY KEY ("ticket_id", "feature_id")
);

-- Create ticket pricing table
CREATE TABLE IF NOT EXISTS "ticket_pricing" (
  "id" serial PRIMARY KEY,
  "ticket_id" integer NOT NULL REFERENCES "tickets"("id"),
  "price" decimal(10,2) NOT NULL,
  "currency" text NOT NULL,
  "valid_from" timestamp NOT NULL,
  "valid_to" timestamp,
  "created_at" timestamp DEFAULT NOW(),
  "updated_by" text
);

-- Create ticket packages table
CREATE TABLE IF NOT EXISTS "ticket_packages" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT NOW()
);

-- Create package tickets table
CREATE TABLE IF NOT EXISTS "package_tickets" (
  "package_id" integer NOT NULL REFERENCES "ticket_packages"("id"),
  "ticket_id" integer NOT NULL REFERENCES "tickets"("id"),
  "quantity" integer NOT NULL DEFAULT 1,
  "discount_percentage" decimal(5,2),
  PRIMARY KEY ("package_id", "ticket_id")
);

-- Create saved itineraries table
CREATE TABLE IF NOT EXISTS "saved_itineraries" (
  "id" serial PRIMARY KEY,
  "user_id" text NOT NULL,
  "race_id" text NOT NULL,
  "name" text NOT NULL,
  "activities" jsonb NOT NULL,
  "created_at" timestamp DEFAULT NOW(),
  "date" timestamp,
  "share_token" text
); 