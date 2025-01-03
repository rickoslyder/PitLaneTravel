-- Create an enum for package types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."package_type" AS ENUM ('weekend', 'vip', 'hospitality', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to ticket_packages table
ALTER TABLE "public"."ticket_packages"
ADD COLUMN IF NOT EXISTS "base_price" numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "max_quantity" integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "valid_from" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "valid_to" timestamptz,
ADD COLUMN IF NOT EXISTS "terms_and_conditions" text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "is_featured" boolean NOT NULL DEFAULT false;

-- Handle the package_type column separately
DO $$ BEGIN
    -- First add the column as text
    ALTER TABLE "public"."ticket_packages"
    ADD COLUMN IF NOT EXISTS "package_type" text;
    
    -- Set default values for existing rows
    UPDATE "public"."ticket_packages"
    SET "package_type" = 'custom'
    WHERE "package_type" IS NULL;
    
    -- Now alter the column to use the enum type
    ALTER TABLE "public"."ticket_packages"
    ALTER COLUMN "package_type" TYPE "public"."package_type" 
    USING "package_type"::"public"."package_type";
    
    -- Finally set the NOT NULL constraint and default
    ALTER TABLE "public"."ticket_packages"
    ALTER COLUMN "package_type" SET NOT NULL,
    ALTER COLUMN "package_type" SET DEFAULT 'custom'::"public"."package_type";
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Add check constraints safely
DO $$ BEGIN
    -- Add base_price check
    ALTER TABLE "public"."ticket_packages"
    ADD CONSTRAINT "ticket_packages_base_price_check" 
    CHECK (base_price >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- Add max_quantity check
    ALTER TABLE "public"."ticket_packages"
    ADD CONSTRAINT "ticket_packages_max_quantity_check" 
    CHECK (max_quantity > 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- Add valid_dates check
    ALTER TABLE "public"."ticket_packages"
    ADD CONSTRAINT "ticket_packages_valid_dates_check" 
    CHECK (valid_to IS NULL OR valid_to > valid_from);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 