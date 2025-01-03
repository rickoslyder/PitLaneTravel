alter table "public"."trips"
add column "saved_merch" jsonb default '[]'::jsonb; 