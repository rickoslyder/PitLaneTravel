-- Dry-run correction: the commas between VALUES rows and the statement's
-- terminating semicolon were inside the trailing '-- Race name' comments,
-- so PostgreSQL rejected the INSERT. They now sit before those comments.
-- Pit Lane Travel · F1 2026 calendar fix (roadmap #3)
-- Source of truth: /workspace/state/pitlane/f1-2026-calendar-verified.json (Scout, 2026-10-31)
-- Prod snapshot used to build this file: 2026-10-31 20:37 UTC (1:37 PM PT). See diff.md.
--
-- What it does (single transaction, idempotent, keyed on races.id UUIDs):
--   A. 22 existing F1 2026 race rows: set round (rounds 16-22 shift to 17-23), set date to the
--      official race start in UTC, set is_sprint_weekend. Slugs and names are NOT touched,
--      so no URL changes.
--   B. INSERT one new row: Round 16, Bahrain Grand Prix at Sepang (fixed id 5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016).
--   C. Recompute status for every non-cancelled F1 2026 row from now(), using the same rule as
--      lib/race-status.ts deriveRaceStatus() with weekend_start/weekend_end NULL:
--        now() <  date                -> 'upcoming'
--        now() <  date + 24h          -> 'in_progress'
--        otherwise                    -> 'completed'
--      !!! RUN-DAY CHECK: Mexico City GP (Rd 19) starts 2026-11-01 20:00 UTC (2:00 PM CST, 1:00 PM PT).
--      !!! Run verify.sql step 3 after applying and confirm Mexico City reads 'completed' if you run
--      !!! after 2026-11-02 20:00 UTC, 'in_progress' inside the 24h window, 'upcoming' before the start.
--      !!! Re-check every row whose race falls within 24h of the run time the same way.
--   D. Sepang circuit (shared with MotoGP): fill timezone_id/timezone_name only if still NULL.
--   E. Cancelled Bahrain (April) row: append the relocation note to cancellation_reason.
--      (Choice: drop section E if you want the original reason text kept verbatim.)
--   G. Formula E Season 12 (races.season 2026): 3 stale rows, Tokyo R2 (26 Jul), London R1 (15 Aug) and
--      London R2 (16 Aug), stored 'upcoming' though past. Status recomputed from now() with the full
--      deriveRaceStatus rule (coalesce(weekend_start, date) / coalesce(weekend_end, date + 24h); both are NULL
--      on these rows). Keyed on the 3 ids; own pre- and post-checks. Snapshot: prod-snapshot-fe-s12-2026-10-31.json.
--
-- Rd 16 display choice (default chosen here): name 'Bahrain Grand Prix 2026', country 'Malaysia',
-- circuit = existing 'Petronas Sepang International Circuit' (location 'Sepang'). F1's own data says
-- country 'Bahrain', location 'Kuala Lumpur'. Slug 'bahrain-grand-prix-in-malaysia-2026-f1-2026' because the cancelled
-- April row already owns 'bahrain-grand-prix-2026-f1-2026' (slugs are not unique-constrained and
-- getRaceBySlugAction uses LIMIT 1, so a duplicate slug would make one page unreachable).
--
-- Undo: undo.sql. Verify: verify.sql. Never run with db:migrate-sql; this is a data fix, run once
-- via the Supabase SQL editor / psql as postgres after Richard's explicit yes.

BEGIN;

-- 0. Pre-flight guards: refuse to run against an unexpected shape.
DO $$
DECLARE n_live int; n_cancel int; n_new int;
BEGIN
  SELECT count(*) FILTER (WHERE status <> 'cancelled'), count(*) FILTER (WHERE status = 'cancelled')
    INTO n_live, n_cancel
    FROM public.races WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026;
  SELECT count(*) INTO n_new FROM public.races WHERE id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016';
  IF n_cancel <> 2 THEN RAISE EXCEPTION 'expected 2 cancelled F1 2026 rows, found %', n_cancel; END IF;
  IF n_live - n_new <> 22 THEN RAISE EXCEPTION 'expected 22 pre-existing live F1 2026 rows, found %', n_live - n_new; END IF;
  IF EXISTS (SELECT 1 FROM public.races WHERE slug = 'bahrain-grand-prix-in-malaysia-2026-f1-2026' AND id <> '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') THEN
    RAISE EXCEPTION 'slug bahrain-grand-prix-in-malaysia-2026-f1-2026 already used by another row';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.circuits WHERE id = '4ee323dd-9649-4bf1-b531-d7ca6445c2bc') THEN
    RAISE EXCEPTION 'Sepang circuit 4ee323dd-9649-4bf1-b531-d7ca6445c2bc missing';
  END IF;
END $$;

CREATE TEMP TABLE _f1_2026_target (id uuid PRIMARY KEY, round int NOT NULL, date timestamptz NOT NULL, is_sprint_weekend boolean NOT NULL) ON COMMIT DROP;
INSERT INTO _f1_2026_target (id, round, date, is_sprint_weekend) VALUES
  ('32e601c8-7659-4982-ac80-3289e2640a2a'::uuid,  1, '2026-03-08 04:00:00+00'::timestamptz, false),  -- Australian Grand Prix 2026
  ('d31cf86b-0415-4756-86cc-9071607d7297'::uuid,  2, '2026-03-15 07:00:00+00'::timestamptz, true ),  -- Chinese Grand Prix 2026
  ('3b008be2-a31c-4f1d-916f-6e28c1e2d758'::uuid,  3, '2026-03-29 05:00:00+00'::timestamptz, false),  -- Japanese Grand Prix 2026
  ('dc7e3adc-9f50-43f9-879f-c145f79ad099'::uuid,  4, '2026-05-03 17:00:00+00'::timestamptz, true ),  -- Miami Grand Prix 2026
  ('b07c9c13-a7d8-4c46-a59f-35e1fc292d41'::uuid,  5, '2026-05-24 20:00:00+00'::timestamptz, true ),  -- Canadian Grand Prix 2026
  ('2e25b691-9628-4ad0-a53a-0d873767be49'::uuid,  6, '2026-06-07 13:00:00+00'::timestamptz, false),  -- Monaco Grand Prix 2026
  ('80dfed20-171b-4a2d-9e79-40c4c083dee2'::uuid,  7, '2026-06-14 13:00:00+00'::timestamptz, false),  -- Barcelona Grand Prix 2026
  ('10253c51-d9ee-472b-98d2-c8b95a544275'::uuid,  8, '2026-06-28 13:00:00+00'::timestamptz, false),  -- Austrian Grand Prix 2026
  ('4f5534b9-6bbc-43ea-9a09-5487e7cdb3e9'::uuid,  9, '2026-07-05 14:00:00+00'::timestamptz, true ),  -- British Grand Prix 2026
  ('c3c6203b-6eed-4ae9-b5fe-a2b20add3847'::uuid, 10, '2026-07-19 13:00:00+00'::timestamptz, false),  -- Belgian Grand Prix 2026
  ('ab0fde7f-5262-46ea-ad1e-558cc41713e5'::uuid, 11, '2026-07-26 13:00:00+00'::timestamptz, false),  -- Hungarian Grand Prix 2026
  ('7ab57db4-e002-42ea-b19c-46c7dbf2d9da'::uuid, 12, '2026-08-23 13:00:00+00'::timestamptz, true ),  -- Dutch Grand Prix 2026
  ('355df599-0738-4b15-96db-0a4d57c3f050'::uuid, 13, '2026-09-06 13:00:00+00'::timestamptz, false),  -- Italian Grand Prix 2026
  ('7914176e-374a-4db4-8b96-23672d6c6b73'::uuid, 14, '2026-09-13 13:00:00+00'::timestamptz, false),  -- Spanish Grand Prix 2026
  ('cd65c60a-113d-4463-94f7-f03e6bf43b22'::uuid, 15, '2026-09-26 11:00:00+00'::timestamptz, false),  -- Azerbaijan Grand Prix 2026
  ('20d9ee04-769e-4cdb-a0a1-eb81749183a1'::uuid, 17, '2026-10-11 12:00:00+00'::timestamptz, true ),  -- Singapore Grand Prix 2026
  ('8b3e7332-4d75-409d-b181-ad7142731310'::uuid, 18, '2026-10-25 20:00:00+00'::timestamptz, false),  -- United States Grand Prix 2026
  ('63c49d91-e098-4c1f-bb9f-a9a82956e0fc'::uuid, 19, '2026-11-01 20:00:00+00'::timestamptz, false),  -- Mexico City Grand Prix 2026
  ('ea4e4aa8-e992-46b1-9437-3c17ab5e94ec'::uuid, 20, '2026-11-08 17:00:00+00'::timestamptz, false),  -- Brazilian Grand Prix 2026
  ('a6b9cf4e-5649-488a-899e-629ab147346a'::uuid, 21, '2026-11-22 04:00:00+00'::timestamptz, false),  -- Las Vegas Grand Prix 2026
  ('64c748aa-84c8-4948-991a-c7803f439981'::uuid, 22, '2026-11-29 16:00:00+00'::timestamptz, false),  -- Qatar Grand Prix 2026
  ('35f4f68d-9f9a-42af-8ece-a24ae9408813'::uuid, 23, '2026-12-06 13:00:00+00'::timestamptz, false);  -- Abu Dhabi Grand Prix 2026

-- A1. Move rows whose round changes out of the way first. The partial unique index
--     races_series_season_round_active_idx (series_id, season, round) WHERE status <> 'cancelled'
--     is not deferrable, so shifting 16..22 -> 17..23 in one pass can collide mid-statement.
UPDATE public.races r SET round = t.round + 100
  FROM _f1_2026_target t
 WHERE r.id = t.id AND r.round <> t.round;

-- A2. Final round, race-start time and sprint flag.
UPDATE public.races r
   SET round = t.round, date = t.date, is_sprint_weekend = t.is_sprint_weekend
  FROM _f1_2026_target t
 WHERE r.id = t.id
   AND (r.round, r.date, r.is_sprint_weekend) IS DISTINCT FROM (t.round, t.date, t.is_sprint_weekend);

-- B. New Round 16 row (Bahrain GP relocated to Sepang). Status is fixed up in step C.
INSERT INTO public.races (id, circuit_id, series_id, name, date, season, round, country, status, slug, is_sprint_weekend)
SELECT '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016'::uuid, '4ee323dd-9649-4bf1-b531-d7ca6445c2bc'::uuid, '2f9da9e4-331e-4ab4-b4ed-161e4970b318'::uuid,
       'Bahrain Grand Prix 2026', '2026-10-04 07:00:00+00'::timestamptz, 2026, 16, 'Malaysia', 'completed', 'bahrain-grand-prix-in-malaysia-2026-f1-2026', false
 WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016');

-- C. Status from the run time (see RUN-DAY CHECK above).
UPDATE public.races r
   SET status = s.new_status
  FROM (
    SELECT id,
           (CASE WHEN now() < date THEN 'upcoming'
                 WHEN now() < date + interval '24 hours' THEN 'in_progress'
                 ELSE 'completed' END)::race_status AS new_status
      FROM public.races
     WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026 AND status <> 'cancelled'
  ) s
 WHERE r.id = s.id AND r.status IS DISTINCT FROM s.new_status;

-- D. Sepang timezone (only fills NULLs; MotoGP Malaysia shares this circuit row).
UPDATE public.circuits
   SET timezone_id = 'Asia/Kuala_Lumpur', timezone_name = 'Malaysia Time'
 WHERE id = '4ee323dd-9649-4bf1-b531-d7ca6445c2bc' AND timezone_id IS NULL AND timezone_name IS NULL;

-- E. Relocation note on the cancelled April Bahrain row (optional, see header).
UPDATE public.races
   SET cancellation_reason = 'Cancelled in its April slot after the outbreak of the 2026 Iran war; F1 and the FIA called off the race on safety grounds (announced 14 March 2026). On 26 July 2026 the Bahrain Grand Prix was moved to the Sepang International Circuit in Malaysia, where it ran as Round 16 on 4 October 2026.'
 WHERE id = 'c66d3016-011d-439c-8155-f2953ac7d6f9' AND status = 'cancelled'
   AND cancellation_reason IS DISTINCT FROM 'Cancelled in its April slot after the outbreak of the 2026 Iran war; F1 and the FIA called off the race on safety grounds (announced 14 March 2026). On 26 July 2026 the Bahrain Grand Prix was moved to the Sepang International Circuit in Malaysia, where it ran as Round 16 on 4 October 2026.';

-- F. Post-conditions: abort (and roll back everything) unless the end state is exactly right.
DO $$
DECLARE n int; rounds int[];
BEGIN
  SELECT count(*), array_agg(round ORDER BY round) INTO n, rounds
    FROM public.races WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026 AND status <> 'cancelled';
  IF n <> 23 OR rounds <> ARRAY(SELECT generate_series(1,23)) THEN
    RAISE EXCEPTION 'live F1 2026 rounds are not exactly 1..23: n=% rounds=%', n, rounds;
  END IF;
  IF EXISTS (SELECT 1 FROM public.races r JOIN _f1_2026_target t ON t.id = r.id
              WHERE (r.round, r.date, r.is_sprint_weekend) IS DISTINCT FROM (t.round, t.date, t.is_sprint_weekend)) THEN
    RAISE EXCEPTION 'a target row did not take its new values';
  END IF;
  IF (SELECT count(*) FROM public.races WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026 AND status = 'cancelled') <> 2 THEN
    RAISE EXCEPTION 'cancelled row count changed';
  END IF;
END $$;

-- G. Formula E Season 12 stale statuses (3 rows, keyed on id).
-- G0. Pre-check: the 3 rows exist, are FE season 2026 rounds 15-17, not cancelled, and their race date is past.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.races
   WHERE id IN ('f13e9208-37a5-4013-bd0f-b00913198376', '2683f6b2-4244-48cc-ae8d-7b4a8cd0aa7c', 'b7538e11-8916-4870-b103-cd81a7490c3d')
     AND series_id = '46c1e7f7-e53b-4658-bf39-82c6f278fd7a' AND season = 2026 AND round IN (15, 16, 17)
     AND status <> 'cancelled' AND date < now();
  IF n <> 3 THEN RAISE EXCEPTION 'FE S12 pre-check: expected 3 matching rows (FE 2026 rounds 15-17, past, not cancelled), found %', n; END IF;
  IF EXISTS (SELECT 1 FROM public.races WHERE id IN ('f13e9208-37a5-4013-bd0f-b00913198376', '2683f6b2-4244-48cc-ae8d-7b4a8cd0aa7c', 'b7538e11-8916-4870-b103-cd81a7490c3d') AND status NOT IN ('upcoming', 'completed')) THEN
    RAISE EXCEPTION 'FE S12 pre-check: a row has an unexpected status (not upcoming/completed); inspect before running';
  END IF;
END $$;

-- G1. Status from the run time (same rule as lib/race-status.ts deriveRaceStatus).
UPDATE public.races r
   SET status = s.new_status
  FROM (
    SELECT id,
           (CASE WHEN now() < coalesce(weekend_start, date) THEN 'upcoming'
                 WHEN now() < coalesce(weekend_end, date + interval '24 hours') THEN 'in_progress'
                 ELSE 'completed' END)::race_status AS new_status
      FROM public.races
     WHERE id IN ('f13e9208-37a5-4013-bd0f-b00913198376', '2683f6b2-4244-48cc-ae8d-7b4a8cd0aa7c', 'b7538e11-8916-4870-b103-cd81a7490c3d')
  ) s
 WHERE r.id = s.id AND r.status IS DISTINCT FROM s.new_status;

-- G2. Post-check: all 3 now 'completed', and no other FE season-2026 row disagrees with the rule.
DO $$
BEGIN
  IF (SELECT count(*) FROM public.races WHERE id IN ('f13e9208-37a5-4013-bd0f-b00913198376', '2683f6b2-4244-48cc-ae8d-7b4a8cd0aa7c', 'b7538e11-8916-4870-b103-cd81a7490c3d') AND status = 'completed') <> 3 THEN
    RAISE EXCEPTION 'FE S12 post-check: not all 3 rows are completed';
  END IF;
  IF EXISTS (SELECT 1 FROM public.races
              WHERE series_id = '46c1e7f7-e53b-4658-bf39-82c6f278fd7a' AND season = 2026 AND status <> 'cancelled'
                AND status::text <> (CASE WHEN now() < coalesce(weekend_start, date) THEN 'upcoming'
                 WHEN now() < coalesce(weekend_end, date + interval '24 hours') THEN 'in_progress'
                 ELSE 'completed' END)) THEN
    RAISE EXCEPTION 'FE S12 post-check: another FE season-2026 row still disagrees with deriveRaceStatus';
  END IF;
END $$;

COMMIT;
