ALTER TABLE "public"."races"
ADD COLUMN "status" race_status DEFAULT 'upcoming'::race_status NOT NULL,
ADD COLUMN "slug" text,
ADD COLUMN "is_sprint_weekend" boolean DEFAULT false NOT NULL;
