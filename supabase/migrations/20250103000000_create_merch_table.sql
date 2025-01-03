create type "public"."merch_category" as enum (
  'clothing',
  'accessories',
  'memorabilia',
  'collectibles',
  'other'
);

create table "public"."merch" (
  "id" uuid not null default gen_random_uuid(),
  "race_id" uuid not null references races(id) on delete cascade,
  "name" text not null,
  "description" text not null,
  "category" merch_category not null,
  "price" text not null,
  "currency" text not null default 'USD',
  "image_url" text,
  "purchase_url" text,
  "in_stock" text not null default 'available',
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  constraint merch_pkey primary key (id)
);

create index merch_race_id_idx on public.merch using btree (race_id);

-- Set up RLS
alter table "public"."merch" enable row level security;

create policy "Enable read access for all users"
  on "public"."merch"
  for select
  using (true);

create policy "Enable insert for authenticated users only"
  on "public"."merch"
  for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
  on "public"."merch"
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
  on "public"."merch"
  for delete
  using (auth.role() = 'authenticated'); 