create schema if not exists "drizzle";

create sequence "drizzle"."__drizzle_migrations_id_seq";

create table "drizzle"."__drizzle_migrations" (
    "id" integer not null default nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);


alter sequence "drizzle"."__drizzle_migrations_id_seq" owned by "drizzle"."__drizzle_migrations"."id";

CREATE UNIQUE INDEX __drizzle_migrations_pkey ON drizzle.__drizzle_migrations USING btree (id);

alter table "drizzle"."__drizzle_migrations" add constraint "__drizzle_migrations_pkey" PRIMARY KEY using index "__drizzle_migrations_pkey";


create type "public"."membership" as enum ('free', 'pro');

create type "public"."race_status" as enum ('live', 'upcoming', 'completed', 'cancelled');

create type "public"."review_type" as enum ('grandstand', 'accommodation', 'transport', 'general');

create type "public"."ticket_availability" as enum ('available', 'sold_out', 'low_stock', 'pending');

create type "public"."trip_visibility" as enum ('private', 'public', 'shared');

create sequence "public"."ticket_features_id_seq";

create sequence "public"."ticket_packages_id_seq";

create table "public"."meetups" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" text not null,
    "race_id" text not null,
    "title" text not null,
    "description" text not null,
    "location" text not null,
    "date" timestamp without time zone not null,
    "max_attendees" integer,
    "attendees" text[],
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."package_tickets" (
    "package_id" integer not null,
    "ticket_id" integer not null,
    "quantity" integer not null default 1,
    "discount_percentage" numeric(5,2)
);


create table "public"."profiles" (
    "user_id" text not null,
    "membership" membership not null default 'free'::membership,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" text not null,
    "race_id" text not null,
    "content" text not null,
    "rating" text not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."ticket_feature_mappings" (
    "ticket_id" integer not null,
    "feature_id" integer not null
);


create table "public"."ticket_features" (
    "id" integer not null default nextval('ticket_features_id_seq'::regclass),
    "name" text not null,
    "description" text
);


create table "public"."ticket_packages" (
    "id" integer not null default nextval('ticket_packages_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "created_at" timestamp without time zone default now()
);


create table "public"."tips" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" text not null,
    "race_id" text not null,
    "content" text not null,
    "category" text not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."trips" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" text not null,
    "race_id" text not null,
    "title" text not null,
    "description" text not null,
    "visibility" trip_visibility not null default 'private'::trip_visibility,
    "shared_with" text[],
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter sequence "public"."ticket_features_id_seq" owned by "public"."ticket_features"."id";

alter sequence "public"."ticket_packages_id_seq" owned by "public"."ticket_packages"."id";

CREATE UNIQUE INDEX meetups_pkey ON public.meetups USING btree (id);

CREATE UNIQUE INDEX package_tickets_package_id_ticket_id_pk ON public.package_tickets USING btree (package_id, ticket_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX ticket_feature_mappings_ticket_id_feature_id_pk ON public.ticket_feature_mappings USING btree (ticket_id, feature_id);

CREATE UNIQUE INDEX ticket_features_name_unique ON public.ticket_features USING btree (name);

CREATE UNIQUE INDEX ticket_features_pkey ON public.ticket_features USING btree (id);

CREATE UNIQUE INDEX ticket_packages_pkey ON public.ticket_packages USING btree (id);

CREATE UNIQUE INDEX tips_pkey ON public.tips USING btree (id);

CREATE UNIQUE INDEX trips_pkey ON public.trips USING btree (id);

alter table "public"."meetups" add constraint "meetups_pkey" PRIMARY KEY using index "meetups_pkey";

alter table "public"."package_tickets" add constraint "package_tickets_package_id_ticket_id_pk" PRIMARY KEY using index "package_tickets_package_id_ticket_id_pk";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."ticket_feature_mappings" add constraint "ticket_feature_mappings_ticket_id_feature_id_pk" PRIMARY KEY using index "ticket_feature_mappings_ticket_id_feature_id_pk";

alter table "public"."ticket_features" add constraint "ticket_features_pkey" PRIMARY KEY using index "ticket_features_pkey";

alter table "public"."ticket_packages" add constraint "ticket_packages_pkey" PRIMARY KEY using index "ticket_packages_pkey";

alter table "public"."tips" add constraint "tips_pkey" PRIMARY KEY using index "tips_pkey";

alter table "public"."trips" add constraint "trips_pkey" PRIMARY KEY using index "trips_pkey";

alter table "public"."package_tickets" add constraint "package_tickets_package_id_ticket_packages_id_fk" FOREIGN KEY (package_id) REFERENCES ticket_packages(id) not valid;

alter table "public"."package_tickets" validate constraint "package_tickets_package_id_ticket_packages_id_fk";

alter table "public"."ticket_feature_mappings" add constraint "ticket_feature_mappings_feature_id_ticket_features_id_fk" FOREIGN KEY (feature_id) REFERENCES ticket_features(id) not valid;

alter table "public"."ticket_feature_mappings" validate constraint "ticket_feature_mappings_feature_id_ticket_features_id_fk";

alter table "public"."ticket_features" add constraint "ticket_features_name_unique" UNIQUE using index "ticket_features_name_unique";

grant delete on table "public"."meetups" to "anon";

grant insert on table "public"."meetups" to "anon";

grant references on table "public"."meetups" to "anon";

grant select on table "public"."meetups" to "anon";

grant trigger on table "public"."meetups" to "anon";

grant truncate on table "public"."meetups" to "anon";

grant update on table "public"."meetups" to "anon";

grant delete on table "public"."meetups" to "authenticated";

grant insert on table "public"."meetups" to "authenticated";

grant references on table "public"."meetups" to "authenticated";

grant select on table "public"."meetups" to "authenticated";

grant trigger on table "public"."meetups" to "authenticated";

grant truncate on table "public"."meetups" to "authenticated";

grant update on table "public"."meetups" to "authenticated";

grant delete on table "public"."meetups" to "service_role";

grant insert on table "public"."meetups" to "service_role";

grant references on table "public"."meetups" to "service_role";

grant select on table "public"."meetups" to "service_role";

grant trigger on table "public"."meetups" to "service_role";

grant truncate on table "public"."meetups" to "service_role";

grant update on table "public"."meetups" to "service_role";

grant delete on table "public"."package_tickets" to "anon";

grant insert on table "public"."package_tickets" to "anon";

grant references on table "public"."package_tickets" to "anon";

grant select on table "public"."package_tickets" to "anon";

grant trigger on table "public"."package_tickets" to "anon";

grant truncate on table "public"."package_tickets" to "anon";

grant update on table "public"."package_tickets" to "anon";

grant delete on table "public"."package_tickets" to "authenticated";

grant insert on table "public"."package_tickets" to "authenticated";

grant references on table "public"."package_tickets" to "authenticated";

grant select on table "public"."package_tickets" to "authenticated";

grant trigger on table "public"."package_tickets" to "authenticated";

grant truncate on table "public"."package_tickets" to "authenticated";

grant update on table "public"."package_tickets" to "authenticated";

grant delete on table "public"."package_tickets" to "service_role";

grant insert on table "public"."package_tickets" to "service_role";

grant references on table "public"."package_tickets" to "service_role";

grant select on table "public"."package_tickets" to "service_role";

grant trigger on table "public"."package_tickets" to "service_role";

grant truncate on table "public"."package_tickets" to "service_role";

grant update on table "public"."package_tickets" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."ticket_feature_mappings" to "anon";

grant insert on table "public"."ticket_feature_mappings" to "anon";

grant references on table "public"."ticket_feature_mappings" to "anon";

grant select on table "public"."ticket_feature_mappings" to "anon";

grant trigger on table "public"."ticket_feature_mappings" to "anon";

grant truncate on table "public"."ticket_feature_mappings" to "anon";

grant update on table "public"."ticket_feature_mappings" to "anon";

grant delete on table "public"."ticket_feature_mappings" to "authenticated";

grant insert on table "public"."ticket_feature_mappings" to "authenticated";

grant references on table "public"."ticket_feature_mappings" to "authenticated";

grant select on table "public"."ticket_feature_mappings" to "authenticated";

grant trigger on table "public"."ticket_feature_mappings" to "authenticated";

grant truncate on table "public"."ticket_feature_mappings" to "authenticated";

grant update on table "public"."ticket_feature_mappings" to "authenticated";

grant delete on table "public"."ticket_feature_mappings" to "service_role";

grant insert on table "public"."ticket_feature_mappings" to "service_role";

grant references on table "public"."ticket_feature_mappings" to "service_role";

grant select on table "public"."ticket_feature_mappings" to "service_role";

grant trigger on table "public"."ticket_feature_mappings" to "service_role";

grant truncate on table "public"."ticket_feature_mappings" to "service_role";

grant update on table "public"."ticket_feature_mappings" to "service_role";

grant delete on table "public"."ticket_features" to "anon";

grant insert on table "public"."ticket_features" to "anon";

grant references on table "public"."ticket_features" to "anon";

grant select on table "public"."ticket_features" to "anon";

grant trigger on table "public"."ticket_features" to "anon";

grant truncate on table "public"."ticket_features" to "anon";

grant update on table "public"."ticket_features" to "anon";

grant delete on table "public"."ticket_features" to "authenticated";

grant insert on table "public"."ticket_features" to "authenticated";

grant references on table "public"."ticket_features" to "authenticated";

grant select on table "public"."ticket_features" to "authenticated";

grant trigger on table "public"."ticket_features" to "authenticated";

grant truncate on table "public"."ticket_features" to "authenticated";

grant update on table "public"."ticket_features" to "authenticated";

grant delete on table "public"."ticket_features" to "service_role";

grant insert on table "public"."ticket_features" to "service_role";

grant references on table "public"."ticket_features" to "service_role";

grant select on table "public"."ticket_features" to "service_role";

grant trigger on table "public"."ticket_features" to "service_role";

grant truncate on table "public"."ticket_features" to "service_role";

grant update on table "public"."ticket_features" to "service_role";

grant delete on table "public"."ticket_packages" to "anon";

grant insert on table "public"."ticket_packages" to "anon";

grant references on table "public"."ticket_packages" to "anon";

grant select on table "public"."ticket_packages" to "anon";

grant trigger on table "public"."ticket_packages" to "anon";

grant truncate on table "public"."ticket_packages" to "anon";

grant update on table "public"."ticket_packages" to "anon";

grant delete on table "public"."ticket_packages" to "authenticated";

grant insert on table "public"."ticket_packages" to "authenticated";

grant references on table "public"."ticket_packages" to "authenticated";

grant select on table "public"."ticket_packages" to "authenticated";

grant trigger on table "public"."ticket_packages" to "authenticated";

grant truncate on table "public"."ticket_packages" to "authenticated";

grant update on table "public"."ticket_packages" to "authenticated";

grant delete on table "public"."ticket_packages" to "service_role";

grant insert on table "public"."ticket_packages" to "service_role";

grant references on table "public"."ticket_packages" to "service_role";

grant select on table "public"."ticket_packages" to "service_role";

grant trigger on table "public"."ticket_packages" to "service_role";

grant truncate on table "public"."ticket_packages" to "service_role";

grant update on table "public"."ticket_packages" to "service_role";

grant delete on table "public"."tips" to "anon";

grant insert on table "public"."tips" to "anon";

grant references on table "public"."tips" to "anon";

grant select on table "public"."tips" to "anon";

grant trigger on table "public"."tips" to "anon";

grant truncate on table "public"."tips" to "anon";

grant update on table "public"."tips" to "anon";

grant delete on table "public"."tips" to "authenticated";

grant insert on table "public"."tips" to "authenticated";

grant references on table "public"."tips" to "authenticated";

grant select on table "public"."tips" to "authenticated";

grant trigger on table "public"."tips" to "authenticated";

grant truncate on table "public"."tips" to "authenticated";

grant update on table "public"."tips" to "authenticated";

grant delete on table "public"."tips" to "service_role";

grant insert on table "public"."tips" to "service_role";

grant references on table "public"."tips" to "service_role";

grant select on table "public"."tips" to "service_role";

grant trigger on table "public"."tips" to "service_role";

grant truncate on table "public"."tips" to "service_role";

grant update on table "public"."tips" to "service_role";

grant delete on table "public"."trips" to "anon";

grant insert on table "public"."trips" to "anon";

grant references on table "public"."trips" to "anon";

grant select on table "public"."trips" to "anon";

grant trigger on table "public"."trips" to "anon";

grant truncate on table "public"."trips" to "anon";

grant update on table "public"."trips" to "anon";

grant delete on table "public"."trips" to "authenticated";

grant insert on table "public"."trips" to "authenticated";

grant references on table "public"."trips" to "authenticated";

grant select on table "public"."trips" to "authenticated";

grant trigger on table "public"."trips" to "authenticated";

grant truncate on table "public"."trips" to "authenticated";

grant update on table "public"."trips" to "authenticated";

grant delete on table "public"."trips" to "service_role";

grant insert on table "public"."trips" to "service_role";

grant references on table "public"."trips" to "service_role";

grant select on table "public"."trips" to "service_role";

grant trigger on table "public"."trips" to "service_role";

grant truncate on table "public"."trips" to "service_role";

grant update on table "public"."trips" to "service_role";


