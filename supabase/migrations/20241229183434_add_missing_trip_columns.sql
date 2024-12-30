-- Create the trip_status enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('planning', 'booked', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to trips table if they don't exist
DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN status trip_status NOT NULL DEFAULT 'planning';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN flights jsonb DEFAULT '{"outbound": null, "return": null}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN accommodation jsonb DEFAULT '{"name": null, "location": null, "roomType": null, "checkIn": null, "checkOut": null, "bookingReference": null, "confirmationCode": null}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN transportation_notes text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN packing_list text[];
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE trips ADD COLUMN custom_notes jsonb DEFAULT '{}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
