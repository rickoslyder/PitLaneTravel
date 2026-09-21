-- Already applied to production (vsszkzazjhvlecyryzon) 2026-09-21 via
-- Supabase apply_migration named p0_rls_enable_and_revoke_stripe_fts.
-- Zero policies; no FORCE RLS. ENABLE RLS / REVOKE are idempotent-safe to re-run.
-- Do not add CREATE POLICY, public SELECT, or FORCE RLS.

-- Stripe foreign tables — remove PostgREST SELECT for API roles
REVOKE SELECT ON TABLE public.stripe_balance FROM anon, authenticated;
REVOKE SELECT ON TABLE public.stripe_accounts FROM anon, authenticated;
REVOKE SELECT ON TABLE public.stripe_balance_transactions FROM anon, authenticated;

REVOKE ALL ON TABLE public.stripe_balance FROM anon, authenticated;
REVOKE ALL ON TABLE public.stripe_accounts FROM anon, authenticated;
REVOKE ALL ON TABLE public.stripe_balance_transactions FROM anon, authenticated;

-- ENABLE RLS — unused / internal first (no policies = PostgREST lockdown)
ALTER TABLE public.applied_sql_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_external_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_external_ids ENABLE ROW LEVEL SECURITY;

-- ENABLE RLS — live catalogue / redirect tables (still no policies)
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grandstands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_redirects ENABLE ROW LEVEL SECURITY;
