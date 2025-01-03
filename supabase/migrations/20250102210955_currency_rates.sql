-- Create currency rates table
create table if not exists "public"."currency_rates" (
    "id" text primary key,
    "from_currency" text not null,
    "to_currency" text not null,
    "rate" numeric(20,10) not null,
    "last_updated" timestamp with time zone not null default now(),
    "last_fetch_success" timestamp with time zone not null default now(),
    "last_fetch_error" text,
    "is_active" boolean not null default true
);

-- Create unique index on currency pairs
create unique index if not exists "currency_pair_idx" on "public"."currency_rates" ("from_currency", "to_currency");

-- Insert initial exchange rate pairs for supported currencies
insert into "public"."currency_rates" ("id", "from_currency", "to_currency", "rate")
values 
    ('USD-EUR', 'USD', 'EUR', 1.0),
    ('USD-GBP', 'USD', 'GBP', 1.0),
    ('USD-AUD', 'USD', 'AUD', 1.0),
    ('USD-CAD', 'USD', 'CAD', 1.0),
    ('EUR-USD', 'EUR', 'USD', 1.0),
    ('EUR-GBP', 'EUR', 'GBP', 1.0),
    ('EUR-AUD', 'EUR', 'AUD', 1.0),
    ('EUR-CAD', 'EUR', 'CAD', 1.0),
    ('GBP-USD', 'GBP', 'USD', 1.0),
    ('GBP-EUR', 'GBP', 'EUR', 1.0),
    ('GBP-AUD', 'GBP', 'AUD', 1.0),
    ('GBP-CAD', 'GBP', 'CAD', 1.0),
    ('AUD-USD', 'AUD', 'USD', 1.0),
    ('AUD-EUR', 'AUD', 'EUR', 1.0),
    ('AUD-GBP', 'AUD', 'GBP', 1.0),
    ('AUD-CAD', 'AUD', 'CAD', 1.0),
    ('CAD-USD', 'CAD', 'USD', 1.0),
    ('CAD-EUR', 'CAD', 'EUR', 1.0),
    ('CAD-GBP', 'CAD', 'GBP', 1.0),
    ('CAD-AUD', 'CAD', 'AUD', 1.0)
on conflict ("id") do nothing;
