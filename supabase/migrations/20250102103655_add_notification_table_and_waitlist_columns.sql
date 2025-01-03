DO $$ BEGIN
 CREATE TYPE "public"."race_status" AS ENUM('upcoming', 'in_progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."trip_status" AS ENUM('planning', 'booked', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."waitlist_status" AS ENUM('pending', 'notified', 'purchased', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."supporting_series_status" AS ENUM('scheduled', 'live', 'completed', 'delayed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."location_type" AS ENUM('circuit', 'city_center', 'hotel', 'restaurant', 'attraction', 'transport', 'airport');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."admin_activity_type" AS ENUM('ticket', 'meetup', 'transport', 'attraction', 'series');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."unit_group" AS ENUM('us', 'metric');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'failed', 'expired', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms', 'both');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_type" AS ENUM('ticket_available', 'price_change', 'package_available');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
  "id" serial PRIMARY KEY NOT NULL,
  "race_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "ticket_type" text NOT NULL,
  "availability" text NOT NULL,
  "days_included" jsonb NOT NULL,
  "is_child_ticket" boolean DEFAULT false NOT NULL,
  "reseller_url" text NOT NULL,
  "updated_by" text,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "tickets_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "type" "notification_type" NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "status" "notification_status" DEFAULT 'pending' NOT NULL,
  "metadata" text,
  "scheduled_for" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlist" 
  ADD COLUMN IF NOT EXISTS "notification_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "last_notified_at" timestamp with time zone;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "update_tickets_updated_at"
    BEFORE UPDATE ON "tickets"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "update_notifications_updated_at"
    BEFORE UPDATE ON "notifications"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "update_waitlist_updated_at"
    BEFORE UPDATE ON "waitlist"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();