

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."admin_activity_type" AS ENUM (
    'ticket',
    'meetup',
    'transport',
    'attraction',
    'series'
);


ALTER TYPE "public"."admin_activity_type" OWNER TO "postgres";


CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'failed',
    'expired',
    'cancelled'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."location_type" AS ENUM (
    'circuit',
    'city_center',
    'hotel',
    'restaurant',
    'attraction',
    'transport',
    'airport'
);


ALTER TYPE "public"."location_type" OWNER TO "postgres";


CREATE TYPE "public"."membership" AS ENUM (
    'free',
    'pro'
);


ALTER TYPE "public"."membership" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'email',
    'sms',
    'both'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."race_status" AS ENUM (
    'upcoming',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."race_status" OWNER TO "postgres";


CREATE TYPE "public"."supporting_series_status" AS ENUM (
    'scheduled',
    'live',
    'completed',
    'delayed',
    'cancelled'
);


ALTER TYPE "public"."supporting_series_status" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'planning',
    'booked',
    'completed'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE TYPE "public"."trip_visibility" AS ENUM (
    'private',
    'public',
    'shared'
);


ALTER TYPE "public"."trip_visibility" OWNER TO "postgres";


CREATE TYPE "public"."unit_group" AS ENUM (
    'us',
    'metric'
);


ALTER TYPE "public"."unit_group" OWNER TO "postgres";


CREATE TYPE "public"."waitlist_status" AS ENUM (
    'pending',
    'notified',
    'purchased',
    'expired'
);


ALTER TYPE "public"."waitlist_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_sprint_weekends"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.series = 'F1 Sprint' THEN
            UPDATE races SET is_sprint_weekend = true WHERE id = NEW.race_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.series = 'F1 Sprint' THEN
            UPDATE races SET is_sprint_weekend = false WHERE id = OLD.race_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."mark_sprint_weekends"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "itinerary_id" integer NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "location" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."admin_activity_type" NOT NULL,
    "description" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."circuit_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "length" numeric(10,3) NOT NULL,
    "corners" integer NOT NULL,
    "drs_zones" integer NOT NULL,
    "lap_record_time" "text",
    "lap_record_year" integer,
    "lap_record_driver" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."circuit_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."circuit_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "type" "public"."location_type" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "address" "text",
    "place_id" "text",
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "distance_from_circuit" numeric(10,2),
    "timezone" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "transfer_time" "text",
    "airport_code" "text"
);


ALTER TABLE "public"."circuit_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."circuits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "location" "text" NOT NULL,
    "country" "text" NOT NULL,
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "openf1_key" integer,
    "openf1_short_name" "text",
    "timezone_id" "text",
    "timezone_name" "text",
    "website_url" "text"
);


ALTER TABLE "public"."circuits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flight_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "trip_id" "uuid",
    "offer_id" "text" NOT NULL,
    "order_id" "text",
    "booking_reference" "text",
    "status" "public"."booking_status" DEFAULT 'pending'::"public"."booking_status" NOT NULL,
    "total_amount" "text" NOT NULL,
    "total_currency" "text" NOT NULL,
    "departure_iata" "text" NOT NULL,
    "arrival_iata" "text" NOT NULL,
    "departure_city" "text",
    "arrival_city" "text",
    "departure_time" timestamp with time zone NOT NULL,
    "arrival_time" timestamp with time zone NOT NULL,
    "offer_data" "jsonb" NOT NULL,
    "passenger_data" "jsonb" NOT NULL,
    "payment_data" "jsonb",
    "expires_at" timestamp with time zone NOT NULL,
    "added_to_trip" boolean DEFAULT false NOT NULL,
    "last_error_message" "text",
    "payment_required" boolean DEFAULT true NOT NULL,
    "payment_required_by" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."flight_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."local_attractions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "distance_from_circuit" numeric(5,2),
    "distance_from_city" numeric(5,2),
    "estimated_duration" "text",
    "recommended_times" "text"[],
    "booking_required" boolean DEFAULT false,
    "price_range" "text",
    "f1_relevance" "text",
    "peak_times" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."local_attractions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meetups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "max_attendees" integer,
    "attendees" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."meetups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."package_tickets" (
    "package_id" integer NOT NULL,
    "ticket_id" integer NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "discount_percentage" numeric(5,2)
);


ALTER TABLE "public"."package_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."podium_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "driver" "text" NOT NULL,
    "team" "text" NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "podium_results_position_check" CHECK ((("position" >= 1) AND ("position" <= 3)))
);


ALTER TABLE "public"."podium_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "text" NOT NULL,
    "membership" "public"."membership" DEFAULT 'free'::"public"."membership" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."race_weather" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "race_id" "uuid" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "temp_max" numeric(4,1) NOT NULL,
    "temp_min" numeric(4,1) NOT NULL,
    "temp" numeric(4,1) NOT NULL,
    "feels_like" numeric(4,1) NOT NULL,
    "dew" numeric(4,1),
    "humidity" numeric(4,1) NOT NULL,
    "precip" numeric(4,1) NOT NULL,
    "precip_prob" numeric(4,1) NOT NULL,
    "wind_speed" numeric(4,1) NOT NULL,
    "wind_dir" numeric(4,1),
    "pressure" numeric(6,1),
    "cloud_cover" numeric(4,1),
    "visibility" numeric(4,1),
    "uv_index" numeric(2,0),
    "sunrise" "text",
    "sunset" "text",
    "conditions" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "unit_group" "public"."unit_group" DEFAULT 'metric'::"public"."unit_group" NOT NULL
);


ALTER TABLE "public"."race_weather" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."races" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "season" integer NOT NULL,
    "round" integer NOT NULL,
    "country" "text" NOT NULL,
    "status" "public"."race_status" DEFAULT 'upcoming'::"public"."race_status" NOT NULL,
    "slug" "text",
    "is_sprint_weekend" boolean DEFAULT false NOT NULL,
    "description" "text",
    "weekend_start" timestamp with time zone,
    "weekend_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "openf1_meeting_key" integer,
    "openf1_session_key" integer
);


ALTER TABLE "public"."races" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "rating" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_itineraries" (
    "id" integer NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "itinerary" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."saved_itineraries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."saved_itineraries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."saved_itineraries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."saved_itineraries_id_seq" OWNED BY "public"."saved_itineraries"."id";



CREATE TABLE IF NOT EXISTS "public"."supporting_series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "race_id" "uuid" NOT NULL,
    "series" "text" NOT NULL,
    "round" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "openf1_session_key" integer,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "status" "public"."supporting_series_status" DEFAULT 'scheduled'::"public"."supporting_series_status"
);


ALTER TABLE "public"."supporting_series" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_feature_mappings" (
    "ticket_id" integer NOT NULL,
    "feature_id" integer NOT NULL
);


ALTER TABLE "public"."ticket_feature_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_features" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."ticket_features" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ticket_features_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."ticket_features_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ticket_features_id_seq" OWNED BY "public"."ticket_features"."id";



CREATE TABLE IF NOT EXISTS "public"."ticket_packages" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."ticket_packages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ticket_packages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."ticket_packages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ticket_packages_id_seq" OWNED BY "public"."ticket_packages"."id";



CREATE TABLE IF NOT EXISTS "public"."ticket_pricing" (
    "id" integer NOT NULL,
    "ticket_id" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "currency" "text" NOT NULL,
    "valid_from" timestamp with time zone NOT NULL,
    "valid_to" timestamp with time zone,
    "updated_by" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."ticket_pricing" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ticket_pricing_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."ticket_pricing_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ticket_pricing_id_seq" OWNED BY "public"."ticket_pricing"."id";



CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" integer NOT NULL,
    "race_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "ticket_type" "text" NOT NULL,
    "availability" "text" NOT NULL,
    "days_included" "jsonb" NOT NULL,
    "is_child_ticket" boolean DEFAULT false NOT NULL,
    "reseller_url" "text" NOT NULL,
    "updated_by" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."tickets_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tickets_id_seq" OWNED BY "public"."tickets"."id";



CREATE TABLE IF NOT EXISTS "public"."tips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."tips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transport_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "circuit_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "options" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."transport_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "visibility" "public"."trip_visibility" DEFAULT 'private'::"public"."trip_visibility" NOT NULL,
    "shared_with" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status" "public"."trip_status" DEFAULT 'planning'::"public"."trip_status" NOT NULL,
    "flights" "jsonb" DEFAULT '{"return": null, "outbound": null}'::"jsonb",
    "accommodation" "jsonb" DEFAULT '{"name": null, "checkIn": null, "checkOut": null, "location": null, "roomType": null, "bookingReference": null, "confirmationCode": null}'::"jsonb",
    "transportation_notes" "text",
    "packing_list" "text"[],
    "custom_notes" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "race_id" "uuid" NOT NULL,
    "ticket_category_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "notification_type" "public"."notification_type" NOT NULL,
    "status" "public"."waitlist_status" DEFAULT 'pending'::"public"."waitlist_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."world_plugs" (
    "id" integer NOT NULL,
    "country_code" "text" NOT NULL,
    "frequency" "text" NOT NULL,
    "name" "text" NOT NULL,
    "plug_type" "text" NOT NULL,
    "voltage" "text" NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."world_plugs" OWNER TO "postgres";


COMMENT ON TABLE "public"."world_plugs" IS 'Stores information about electrical plug types, voltages, and frequencies for different countries.';



CREATE SEQUENCE IF NOT EXISTS "public"."world_plugs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."world_plugs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."world_plugs_id_seq" OWNED BY "public"."world_plugs"."id";



ALTER TABLE ONLY "public"."saved_itineraries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."saved_itineraries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ticket_features" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ticket_features_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ticket_packages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ticket_packages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ticket_pricing" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ticket_pricing_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tickets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tickets_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."world_plugs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."world_plugs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_activities"
    ADD CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."circuit_details"
    ADD CONSTRAINT "circuit_details_circuit_id_key" UNIQUE ("circuit_id");



ALTER TABLE ONLY "public"."circuit_details"
    ADD CONSTRAINT "circuit_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."circuit_locations"
    ADD CONSTRAINT "circuit_locations_circuit_id_place_id_key" UNIQUE ("circuit_id", "place_id");



ALTER TABLE ONLY "public"."circuit_locations"
    ADD CONSTRAINT "circuit_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."circuits"
    ADD CONSTRAINT "circuits_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."circuits"
    ADD CONSTRAINT "circuits_openf1_key_key" UNIQUE ("openf1_key");



ALTER TABLE ONLY "public"."circuits"
    ADD CONSTRAINT "circuits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."circuits"
    ADD CONSTRAINT "circuits_website_url_key" UNIQUE ("website_url");



ALTER TABLE ONLY "public"."flight_bookings"
    ADD CONSTRAINT "flight_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."local_attractions"
    ADD CONSTRAINT "local_attractions_circuit_id_name_key" UNIQUE ("circuit_id", "name");



ALTER TABLE ONLY "public"."local_attractions"
    ADD CONSTRAINT "local_attractions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meetups"
    ADD CONSTRAINT "meetups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."package_tickets"
    ADD CONSTRAINT "package_tickets_pkey" PRIMARY KEY ("package_id", "ticket_id");



ALTER TABLE ONLY "public"."podium_results"
    ADD CONSTRAINT "podium_results_circuit_id_year_position_key" UNIQUE ("circuit_id", "year", "position");



ALTER TABLE ONLY "public"."podium_results"
    ADD CONSTRAINT "podium_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."race_weather"
    ADD CONSTRAINT "race_weather_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."races"
    ADD CONSTRAINT "races_circuit_id_date_key" UNIQUE ("circuit_id", "date");



ALTER TABLE ONLY "public"."races"
    ADD CONSTRAINT "races_openf1_meeting_key_key" UNIQUE ("openf1_meeting_key");



ALTER TABLE ONLY "public"."races"
    ADD CONSTRAINT "races_openf1_session_key_key" UNIQUE ("openf1_session_key");



ALTER TABLE ONLY "public"."races"
    ADD CONSTRAINT "races_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_itineraries"
    ADD CONSTRAINT "saved_itineraries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supporting_series"
    ADD CONSTRAINT "supporting_series_openf1_session_key_key" UNIQUE ("openf1_session_key");



ALTER TABLE ONLY "public"."supporting_series"
    ADD CONSTRAINT "supporting_series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supporting_series"
    ADD CONSTRAINT "supporting_series_race_id_series_key" UNIQUE ("race_id", "series");



ALTER TABLE ONLY "public"."ticket_feature_mappings"
    ADD CONSTRAINT "ticket_feature_mappings_pkey" PRIMARY KEY ("ticket_id", "feature_id");



ALTER TABLE ONLY "public"."ticket_features"
    ADD CONSTRAINT "ticket_features_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ticket_features"
    ADD CONSTRAINT "ticket_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_packages"
    ADD CONSTRAINT "ticket_packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_pricing"
    ADD CONSTRAINT "ticket_pricing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tips"
    ADD CONSTRAINT "tips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transport_info"
    ADD CONSTRAINT "transport_info_circuit_id_type_key" UNIQUE ("circuit_id", "type");



ALTER TABLE ONLY "public"."transport_info"
    ADD CONSTRAINT "transport_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."world_plugs"
    ADD CONSTRAINT "world_plugs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activities_category" ON "public"."activities" USING "btree" ("category");



CREATE INDEX "idx_activities_itinerary_id" ON "public"."activities" USING "btree" ("itinerary_id");



CREATE INDEX "idx_activities_type" ON "public"."activities" USING "btree" ("type");



CREATE INDEX "idx_circuit_details_circuit_id" ON "public"."circuit_details" USING "btree" ("circuit_id");



CREATE INDEX "idx_circuit_locations_circuit_id" ON "public"."circuit_locations" USING "btree" ("circuit_id");



CREATE INDEX "idx_circuit_locations_place_id" ON "public"."circuit_locations" USING "btree" ("place_id");



CREATE INDEX "idx_circuit_locations_type" ON "public"."circuit_locations" USING "btree" ("type");



CREATE INDEX "idx_circuits_openf1_key" ON "public"."circuits" USING "btree" ("openf1_key");



CREATE INDEX "idx_flight_bookings_arrival_time" ON "public"."flight_bookings" USING "btree" ("arrival_time");



CREATE INDEX "idx_flight_bookings_departure_time" ON "public"."flight_bookings" USING "btree" ("departure_time");



CREATE INDEX "idx_flight_bookings_status" ON "public"."flight_bookings" USING "btree" ("status");



CREATE INDEX "idx_flight_bookings_trip_id" ON "public"."flight_bookings" USING "btree" ("trip_id");



CREATE INDEX "idx_flight_bookings_user_id" ON "public"."flight_bookings" USING "btree" ("user_id");



CREATE INDEX "idx_local_attractions_circuit_id" ON "public"."local_attractions" USING "btree" ("circuit_id");



CREATE INDEX "idx_podium_results_circuit_id" ON "public"."podium_results" USING "btree" ("circuit_id");



CREATE INDEX "idx_podium_results_driver" ON "public"."podium_results" USING "btree" ("driver");



CREATE INDEX "idx_podium_results_team" ON "public"."podium_results" USING "btree" ("team");



CREATE INDEX "idx_podium_results_year" ON "public"."podium_results" USING "btree" ("year");



CREATE INDEX "idx_race_weather_date" ON "public"."race_weather" USING "btree" ("date");



CREATE INDEX "idx_race_weather_race_id" ON "public"."race_weather" USING "btree" ("race_id");



CREATE INDEX "idx_race_weather_unit_group" ON "public"."race_weather" USING "btree" ("unit_group");



CREATE INDEX "idx_races_openf1_meeting_key" ON "public"."races" USING "btree" ("openf1_meeting_key");



CREATE INDEX "idx_races_openf1_session_key" ON "public"."races" USING "btree" ("openf1_session_key");



CREATE INDEX "idx_supporting_series_openf1_session_key" ON "public"."supporting_series" USING "btree" ("openf1_session_key");



CREATE INDEX "idx_supporting_series_race_id" ON "public"."supporting_series" USING "btree" ("race_id");



CREATE INDEX "idx_supporting_series_series" ON "public"."supporting_series" USING "btree" ("series");



CREATE INDEX "idx_supporting_series_start_time" ON "public"."supporting_series" USING "btree" ("start_time");



CREATE INDEX "idx_supporting_series_status" ON "public"."supporting_series" USING "btree" ("status");



CREATE INDEX "idx_transport_info_circuit_id" ON "public"."transport_info" USING "btree" ("circuit_id");



CREATE INDEX "idx_waitlist_race_id" ON "public"."waitlist" USING "btree" ("race_id");



CREATE INDEX "idx_waitlist_status" ON "public"."waitlist" USING "btree" ("status");



CREATE INDEX "idx_waitlist_ticket_category" ON "public"."waitlist" USING "btree" ("ticket_category_id");



CREATE INDEX "idx_waitlist_user_id" ON "public"."waitlist" USING "btree" ("user_id");



CREATE INDEX "idx_world_plugs_name" ON "public"."world_plugs" USING "btree" ("name");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."world_plugs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_activities_updated_at" BEFORE UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_admin_activities_updated_at" BEFORE UPDATE ON "public"."admin_activities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_circuit_details_updated_at" BEFORE UPDATE ON "public"."circuit_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_circuit_locations_updated_at" BEFORE UPDATE ON "public"."circuit_locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_circuits_updated_at" BEFORE UPDATE ON "public"."circuits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_flight_bookings_updated_at" BEFORE UPDATE ON "public"."flight_bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_is_sprint_weekend" AFTER INSERT OR DELETE ON "public"."supporting_series" FOR EACH ROW EXECUTE FUNCTION "public"."mark_sprint_weekends"();



CREATE OR REPLACE TRIGGER "update_local_attractions_updated_at" BEFORE UPDATE ON "public"."local_attractions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_meetups_updated_at" BEFORE UPDATE ON "public"."meetups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_podium_results_updated_at" BEFORE UPDATE ON "public"."podium_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_race_weather_updated_at" BEFORE UPDATE ON "public"."race_weather" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_races_updated_at" BEFORE UPDATE ON "public"."races" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_saved_itineraries_updated_at" BEFORE UPDATE ON "public"."saved_itineraries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supporting_series_updated_at" BEFORE UPDATE ON "public"."supporting_series" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ticket_pricing_updated_at" BEFORE UPDATE ON "public"."ticket_pricing" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tickets_updated_at" BEFORE UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tips_updated_at" BEFORE UPDATE ON "public"."tips" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transport_info_updated_at" BEFORE UPDATE ON "public"."transport_info" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_trips_updated_at" BEFORE UPDATE ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_waitlist_updated_at" BEFORE UPDATE ON "public"."waitlist" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "public"."saved_itineraries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."circuit_details"
    ADD CONSTRAINT "circuit_details_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."circuit_locations"
    ADD CONSTRAINT "circuit_locations_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flight_bookings"
    ADD CONSTRAINT "flight_bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."local_attractions"
    ADD CONSTRAINT "local_attractions_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meetups"
    ADD CONSTRAINT "meetups_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."package_tickets"
    ADD CONSTRAINT "package_tickets_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."ticket_packages"("id");



ALTER TABLE ONLY "public"."podium_results"
    ADD CONSTRAINT "podium_results_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."race_weather"
    ADD CONSTRAINT "race_weather_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."races"
    ADD CONSTRAINT "races_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_itineraries"
    ADD CONSTRAINT "saved_itineraries_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supporting_series"
    ADD CONSTRAINT "supporting_series_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_feature_mappings"
    ADD CONSTRAINT "ticket_feature_mappings_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "public"."ticket_features"("id");



ALTER TABLE ONLY "public"."ticket_pricing"
    ADD CONSTRAINT "ticket_pricing_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tips"
    ADD CONSTRAINT "tips_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transport_info"
    ADD CONSTRAINT "transport_info_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TYPE "public"."location_type" TO "anon";
GRANT ALL ON TYPE "public"."location_type" TO "authenticated";
GRANT ALL ON TYPE "public"."location_type" TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_sprint_weekends"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_sprint_weekends"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_sprint_weekends"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."admin_activities" TO "anon";
GRANT ALL ON TABLE "public"."admin_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_activities" TO "service_role";



GRANT ALL ON TABLE "public"."circuit_details" TO "anon";
GRANT ALL ON TABLE "public"."circuit_details" TO "authenticated";
GRANT ALL ON TABLE "public"."circuit_details" TO "service_role";



GRANT ALL ON TABLE "public"."circuit_locations" TO "anon";
GRANT ALL ON TABLE "public"."circuit_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."circuit_locations" TO "service_role";



GRANT ALL ON TABLE "public"."circuits" TO "anon";
GRANT ALL ON TABLE "public"."circuits" TO "authenticated";
GRANT ALL ON TABLE "public"."circuits" TO "service_role";



GRANT ALL ON TABLE "public"."flight_bookings" TO "anon";
GRANT ALL ON TABLE "public"."flight_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."flight_bookings" TO "service_role";



GRANT ALL ON TABLE "public"."local_attractions" TO "anon";
GRANT ALL ON TABLE "public"."local_attractions" TO "authenticated";
GRANT ALL ON TABLE "public"."local_attractions" TO "service_role";



GRANT ALL ON TABLE "public"."meetups" TO "anon";
GRANT ALL ON TABLE "public"."meetups" TO "authenticated";
GRANT ALL ON TABLE "public"."meetups" TO "service_role";



GRANT ALL ON TABLE "public"."package_tickets" TO "anon";
GRANT ALL ON TABLE "public"."package_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."package_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."podium_results" TO "anon";
GRANT ALL ON TABLE "public"."podium_results" TO "authenticated";
GRANT ALL ON TABLE "public"."podium_results" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."race_weather" TO "anon";
GRANT ALL ON TABLE "public"."race_weather" TO "authenticated";
GRANT ALL ON TABLE "public"."race_weather" TO "service_role";



GRANT ALL ON TABLE "public"."races" TO "anon";
GRANT ALL ON TABLE "public"."races" TO "authenticated";
GRANT ALL ON TABLE "public"."races" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."saved_itineraries" TO "anon";
GRANT ALL ON TABLE "public"."saved_itineraries" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_itineraries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."saved_itineraries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."saved_itineraries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."saved_itineraries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."supporting_series" TO "anon";
GRANT ALL ON TABLE "public"."supporting_series" TO "authenticated";
GRANT ALL ON TABLE "public"."supporting_series" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_feature_mappings" TO "anon";
GRANT ALL ON TABLE "public"."ticket_feature_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_feature_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_features" TO "anon";
GRANT ALL ON TABLE "public"."ticket_features" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ticket_features_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ticket_features_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ticket_features_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_packages" TO "anon";
GRANT ALL ON TABLE "public"."ticket_packages" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_packages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ticket_packages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ticket_packages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ticket_packages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_pricing" TO "anon";
GRANT ALL ON TABLE "public"."ticket_pricing" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_pricing" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ticket_pricing_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ticket_pricing_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ticket_pricing_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tickets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tickets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tickets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tips" TO "anon";
GRANT ALL ON TABLE "public"."tips" TO "authenticated";
GRANT ALL ON TABLE "public"."tips" TO "service_role";



GRANT ALL ON TABLE "public"."transport_info" TO "anon";
GRANT ALL ON TABLE "public"."transport_info" TO "authenticated";
GRANT ALL ON TABLE "public"."transport_info" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



GRANT ALL ON TABLE "public"."world_plugs" TO "anon";
GRANT ALL ON TABLE "public"."world_plugs" TO "authenticated";
GRANT ALL ON TABLE "public"."world_plugs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."world_plugs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."world_plugs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."world_plugs_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
