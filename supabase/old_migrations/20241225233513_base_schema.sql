-- Create enums
CREATE TYPE "public"."location_type" AS ENUM ('circuit', 'city_center', 'hotel', 'restaurant', 'attraction', 'transport');

CREATE TYPE "public"."race_status" AS ENUM ('upcoming', 'in_progress', 'completed', 'cancelled');

CREATE TYPE "public"."membership" AS ENUM ('free', 'pro');

CREATE TYPE "public"."trip_visibility" AS ENUM ('private', 'public', 'shared');

CREATE TYPE "public"."notification_channel" AS ENUM ('email', 'sms', 'both');

CREATE TYPE "public"."waitlist_status" AS ENUM ('pending', 'notified', 'purchased', 'expired');

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create mark_sprint_weekends function
CREATE OR REPLACE FUNCTION mark_sprint_weekends()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

-- Create base tables
CREATE TABLE IF NOT EXISTS "public"."circuits" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "location" text NOT NULL,
    "country" text NOT NULL,
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "image_url" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create circuit_locations table
CREATE TABLE IF NOT EXISTS "public"."circuit_locations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    "type" location_type NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "address" text,
    "place_id" text,
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "distance_from_circuit" numeric(10,2),
    "timezone" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."races" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    "name" text NOT NULL,
    "date" timestamptz NOT NULL,
    "season" integer NOT NULL,
    "round" integer NOT NULL,
    "country" text NOT NULL,
    "status" race_status DEFAULT 'upcoming' NOT NULL,
    "slug" text,
    "is_sprint_weekend" boolean DEFAULT false NOT NULL,
    "description" text,
    "weekend_start" timestamptz,
    "weekend_end" timestamptz,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."circuit_details" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES "public"."circuits"("id") ON DELETE CASCADE,
    "length" numeric(10,3) NOT NULL,
    "corners" integer NOT NULL,
    "drs_zones" integer NOT NULL,
    "lap_record_time" text,
    "lap_record_year" integer,
    "lap_record_driver" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."airports" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES "public"."circuits"("id") ON DELETE CASCADE,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "distance" numeric(10,2) NOT NULL,
    "transfer_time" text NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."local_attractions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES "public"."circuits"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "distance_from_circuit" numeric(5,2),
    "distance_from_city" numeric(5,2),
    "estimated_duration" text,
    "recommended_times" text[],
    "booking_required" boolean DEFAULT false,
    "price_range" text,
    "f1_relevance" text,
    "peak_times" jsonb,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."transport_info" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES "public"."circuits"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "options" text[],
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."podium_results" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "circuit_id" uuid NOT NULL REFERENCES "public"."circuits"("id") ON DELETE CASCADE,
    "position" integer NOT NULL CHECK (position >= 1 AND position <= 3),
    "driver" text NOT NULL,
    "team" text NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" serial PRIMARY KEY,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "ticket_type" text NOT NULL,
    "availability" text NOT NULL,
    "days_included" jsonb NOT NULL,
    "is_child_ticket" boolean DEFAULT false NOT NULL,
    "reseller_url" text NOT NULL,
    "updated_by" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."ticket_pricing" (
    "id" serial PRIMARY KEY,
    "ticket_id" integer NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    "price" numeric(10,2) NOT NULL,
    "currency" text NOT NULL,
    "valid_from" timestamptz NOT NULL,
    "valid_to" timestamptz,
    "updated_by" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."ticket_features" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL UNIQUE,
    "description" text
);

CREATE TABLE IF NOT EXISTS "public"."ticket_feature_mappings" (
    "ticket_id" integer NOT NULL,
    "feature_id" integer NOT NULL,
    PRIMARY KEY ("ticket_id", "feature_id"),
    FOREIGN KEY ("feature_id") REFERENCES "public"."ticket_features"("id")
);

CREATE TABLE IF NOT EXISTS "public"."ticket_packages" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."package_tickets" (
    "package_id" integer NOT NULL REFERENCES "public"."ticket_packages"("id"),
    "ticket_id" integer NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "discount_percentage" numeric(5,2),
    PRIMARY KEY ("package_id", "ticket_id")
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" text PRIMARY KEY,
    "membership" membership DEFAULT 'free' NOT NULL,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."saved_itineraries" (
    "id" serial PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "itinerary" jsonb NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "itinerary_id" integer NOT NULL REFERENCES saved_itineraries(id) ON DELETE CASCADE,
    "type" text NOT NULL,
    "category" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "start_time" timestamptz NOT NULL,
    "end_time" timestamptz NOT NULL,
    "location" text,
    "notes" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "content" text NOT NULL,
    "rating" text NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."tips" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "content" text NOT NULL,
    "category" text NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."meetups" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "location" text NOT NULL,
    "date" timestamptz NOT NULL,
    "max_attendees" integer,
    "attendees" text[],
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "visibility" trip_visibility DEFAULT 'private' NOT NULL,
    "shared_with" text[],
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."supporting_series" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "series" text NOT NULL,
    "round" integer NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" text NOT NULL,
    "race_id" uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    "ticket_category_id" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "notification_channel" notification_channel NOT NULL,
    "status" waitlist_status DEFAULT 'pending' NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_circuit_locations_circuit_id ON circuit_locations(circuit_id);
CREATE INDEX idx_circuit_locations_type ON circuit_locations(type);
CREATE INDEX idx_circuit_locations_place_id ON circuit_locations(place_id);

CREATE INDEX idx_airports_circuit_id ON airports(circuit_id);
CREATE INDEX idx_airports_code ON airports(code);

CREATE INDEX idx_circuit_details_circuit_id ON circuit_details(circuit_id);

CREATE INDEX idx_local_attractions_circuit_id ON local_attractions(circuit_id);

CREATE INDEX idx_transport_info_circuit_id ON transport_info(circuit_id);

CREATE INDEX idx_podium_results_circuit_id ON podium_results(circuit_id);
CREATE INDEX idx_podium_results_driver ON podium_results(driver);
CREATE INDEX idx_podium_results_team ON podium_results(team);
CREATE INDEX idx_podium_results_year ON podium_results(year);

CREATE INDEX idx_supporting_series_race_id ON supporting_series(race_id);
CREATE INDEX idx_supporting_series_series ON supporting_series(series);

CREATE INDEX idx_activities_itinerary_id ON activities(itinerary_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_category ON activities(category);

CREATE INDEX idx_waitlist_race_id ON waitlist(race_id);
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_ticket_category ON waitlist(ticket_category_id);

-- Create triggers
CREATE TRIGGER update_circuit_locations_updated_at
    BEFORE UPDATE ON circuit_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circuits_updated_at
    BEFORE UPDATE ON circuits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON races
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circuit_details_updated_at
    BEFORE UPDATE ON circuit_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airports_updated_at
    BEFORE UPDATE ON airports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_attractions_updated_at
    BEFORE UPDATE ON local_attractions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_info_updated_at
    BEFORE UPDATE ON transport_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podium_results_updated_at
    BEFORE UPDATE ON podium_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_pricing_updated_at
    BEFORE UPDATE ON ticket_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_itineraries_updated_at
    BEFORE UPDATE ON saved_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
    BEFORE UPDATE ON tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetups_updated_at
    BEFORE UPDATE ON meetups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supporting_series_updated_at
    BEFORE UPDATE ON supporting_series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_is_sprint_weekend
    AFTER INSERT OR DELETE ON supporting_series
    FOR EACH ROW
    EXECUTE FUNCTION mark_sprint_weekends();

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";

GRANT ALL ON TABLE "public"."circuit_locations" TO "anon";
GRANT ALL ON TABLE "public"."circuit_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."circuit_locations" TO "service_role";

GRANT ALL ON TYPE "public"."location_type" TO "anon";
GRANT ALL ON TYPE "public"."location_type" TO "authenticated";
GRANT ALL ON TYPE "public"."location_type" TO "service_role";

GRANT ALL ON TABLE "public"."airports" TO "anon";
