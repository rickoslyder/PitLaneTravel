DO $$ BEGIN
 CREATE TYPE "public"."race_status" AS ENUM('live', 'upcoming', 'completed', 'cancelled');
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
 CREATE TYPE "public"."waitlist_status" AS ENUM('pending', 'notified', 'purchased', 'expired', 'cancelled');
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
 CREATE TYPE "public"."location_type" AS ENUM('circuit', 'city_center', 'parking', 'fan_zone', 'transport_hub', 'airport');
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
 CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed', 'cancelled');
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
CREATE TABLE IF NOT EXISTS "circuit_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"length" numeric(10, 3) NOT NULL,
	"corners" integer NOT NULL,
	"drs_zones" integer NOT NULL,
	"lap_record_time" text,
	"lap_record_year" integer,
	"lap_record_driver" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"distance" numeric(10, 2) NOT NULL,
	"transfer_time" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "local_attractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"distance_from_circuit" numeric(5, 2),
	"distance_from_city" numeric(5, 2),
	"estimated_duration" text,
	"recommended_times" text[],
	"booking_required" boolean DEFAULT false,
	"price_range" text,
	"f1_relevance" text,
	"peak_times" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transport_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"options" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itinerary_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"price_amount" numeric(10, 2),
	"price_currency" text,
	"rating" numeric(3, 1),
	"category" text,
	"distance" text,
	"duration" text,
	"location_lat" numeric(10, 8),
	"location_lng" numeric(11, 8),
	"time_slot" text,
	"description" text,
	"visit_duration" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"race_id" text NOT NULL,
	"ticket_category_id" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"notification_type" text DEFAULT 'email' NOT NULL,
	"status" "waitlist_status" DEFAULT 'pending' NOT NULL,
	"notification_count" integer DEFAULT 0 NOT NULL,
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supporting_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_id" uuid NOT NULL,
	"series" text NOT NULL,
	"round" integer NOT NULL,
	"openf1_session_key" integer,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"status" "supporting_series_status" DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supporting_series_openf1_session_key_unique" UNIQUE("openf1_session_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podium_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"driver" text NOT NULL,
	"team" text NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "circuit_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid NOT NULL,
	"type" "location_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text,
	"place_id" text,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"distance_from_circuit" numeric(10, 2),
	"timezone" text,
	"transfer_time" text,
	"airport_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "admin_activity_type" NOT NULL,
	"description" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "race_weather" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"temp_max" text NOT NULL,
	"temp_min" text NOT NULL,
	"temp" text NOT NULL,
	"feels_like" text NOT NULL,
	"dew" text,
	"humidity" text NOT NULL,
	"precip" text NOT NULL,
	"precip_prob" text NOT NULL,
	"wind_speed" text NOT NULL,
	"wind_dir" text,
	"pressure" text,
	"cloud_cover" text,
	"visibility" text,
	"uv_index" text,
	"sunrise" text NOT NULL,
	"sunset" text NOT NULL,
	"conditions" text NOT NULL,
	"icon" text NOT NULL,
	"unit_group" "unit_group" DEFAULT 'metric' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "world_plugs" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_code" text NOT NULL,
	"frequency" text NOT NULL,
	"name" text NOT NULL,
	"plug_type" text NOT NULL,
	"voltage" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flight_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
	"race_id" uuid NOT NULL,
	"offer_id" text NOT NULL,
	"order_id" text,
	"booking_reference" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"total_amount" text NOT NULL,
	"total_currency" text NOT NULL,
	"departure_iata" text NOT NULL,
	"arrival_iata" text NOT NULL,
	"departure_city" text,
	"arrival_city" text,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"offer_data" jsonb NOT NULL,
	"passenger_data" jsonb NOT NULL,
	"payment_data" jsonb,
	"expires_at" timestamp NOT NULL,
	"added_to_trip" boolean DEFAULT false NOT NULL,
	"last_error_message" text,
	"payment_required" boolean DEFAULT true NOT NULL,
	"payment_required_by" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_race_id_races_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_itineraries" DROP CONSTRAINT "saved_itineraries_race_id_races_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "circuits" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "circuits" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "races" ALTER COLUMN "date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "races" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "races" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "package_tickets" ALTER COLUMN "package_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "package_tickets" ALTER COLUMN "ticket_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "ticket_feature_mappings" ALTER COLUMN "ticket_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "ticket_feature_mappings" ALTER COLUMN "feature_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "ticket_packages" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_packages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_packages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ALTER COLUMN "ticket_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ALTER COLUMN "valid_from" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ALTER COLUMN "valid_to" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "availability" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "is_child_ticket" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "race_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "meetups" ALTER COLUMN "race_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "race_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tips" ALTER COLUMN "race_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tips" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tips" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "itinerary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "timezone_id" text;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "timezone_name" text;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "openf1_key" integer;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "openf1_short_name" text;--> statement-breakpoint
ALTER TABLE "circuits" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "weekend_start" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "weekend_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "status" "race_status" DEFAULT 'upcoming' NOT NULL;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "is_sprint_weekend" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "openf1_meeting_key" integer;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "openf1_session_key" integer;--> statement-breakpoint
ALTER TABLE "ticket_packages" ADD COLUMN "race_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_packages" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_packages" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "ticket_pricing" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "status" "trip_status" DEFAULT 'planning' NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "flights" jsonb DEFAULT '{"outbound":null,"return":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "accommodation" jsonb DEFAULT '{"name":null,"location":null,"roomType":null,"checkIn":null,"checkOut":null,"bookingReference":null,"confirmationCode":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "transportation_notes" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "packing_list" text[];--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "custom_notes" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_itineraries" ADD COLUMN "description" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "circuit_details" ADD CONSTRAINT "circuit_details_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airports" ADD CONSTRAINT "airports_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "local_attractions" ADD CONSTRAINT "local_attractions_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_info" ADD CONSTRAINT "transport_info_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_itinerary_id_saved_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."saved_itineraries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supporting_series" ADD CONSTRAINT "supporting_series_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podium_results" ADD CONSTRAINT "podium_results_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "circuit_locations" ADD CONSTRAINT "circuit_locations_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flight_bookings" ADD CONSTRAINT "flight_bookings_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_packages" ADD CONSTRAINT "ticket_packages_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trips" ADD CONSTRAINT "trips_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meetups" ADD CONSTRAINT "meetups_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tips" ADD CONSTRAINT "tips_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_itineraries" ADD CONSTRAINT "saved_itineraries_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_openf1_key_unique" UNIQUE("openf1_key");--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_openf1_meeting_key_unique" UNIQUE("openf1_meeting_key");--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_openf1_session_key_unique" UNIQUE("openf1_session_key");