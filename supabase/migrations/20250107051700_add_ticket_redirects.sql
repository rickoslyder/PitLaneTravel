create table if not exists "public"."ticket_redirects" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_id" integer not null references "public"."tickets"("id") on delete cascade,
    "slug" text not null,
    "destination_url" text not null,
    "clicks" integer not null default 0,
    "last_clicked_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "ticket_redirects_pkey" primary key ("id"),
    constraint "ticket_redirects_slug_key" unique ("slug")
);

-- Create an index on slug for faster lookups
create index if not exists "ticket_redirects_slug_idx" on "public"."ticket_redirects" ("slug");

-- Create an index on ticket_id for faster lookups
create index if not exists "ticket_redirects_ticket_id_idx" on "public"."ticket_redirects" ("ticket_id"); 