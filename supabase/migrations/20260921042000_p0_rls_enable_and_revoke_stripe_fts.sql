-- Already applied to production (vsszkzazjhvlecyryzon) 2026-09-21 via
-- Supabase apply_migration named p0_rls_enable_and_revoke_stripe_fts.
-- CI-safe: Stripe REVOKEs run only when to_regclass('public.stripe_…') is not
-- null, and missing anon/authenticated roles are ignored. Production already
-- applied the REVOKEs. Zero policies; no FORCE RLS. ENABLE RLS / REVOKE are
-- idempotent-safe to re-run. Do not add CREATE POLICY, public SELECT, or FORCE RLS.

-- Stripe foreign tables — remove PostgREST SELECT for API roles when present.
-- Local CI Postgres has no Stripe wrappers; skip those objects there.
DO $$
DECLARE
  ft text;
  role_name text;
BEGIN
  FOREACH ft IN ARRAY ARRAY[
    'stripe_balance',
    'stripe_accounts',
    'stripe_balance_transactions'
  ]
  LOOP
    IF to_regclass('public.' || ft) IS NOT NULL THEN
      FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated']
      LOOP
        BEGIN
          EXECUTE format('REVOKE SELECT ON TABLE public.%I FROM %I', ft, role_name);
          EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', ft, role_name);
        EXCEPTION
          WHEN undefined_object THEN NULL;
        END;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ENABLE RLS — unused / internal first (no policies = PostgREST lockdown)
ALTER TABLE public.applied_sql_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_external_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_external_ids ENABLE ROW LEVEL SECURITY;

-- ENABLE RLS — live catalogue / redirect tables (still no policies)
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grandstands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_redirects ENABLE ROW LEVEL SECURITY;
