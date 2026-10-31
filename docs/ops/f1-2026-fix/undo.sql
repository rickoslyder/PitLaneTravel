-- Dry-run correction: the commas between VALUES rows and the statement's
-- terminating semicolon were inside the trailing '-- Race name' comments,
-- so PostgreSQL rejected the INSERT. They now sit before those comments.
-- Pit Lane Travel · F1 2026 calendar fix · UNDO
-- Restores the exact values captured from production on 2026-10-31 20:37 UTC (1:37 PM PT),
-- before apply.sql. Idempotent; single transaction.
-- Limitation: updated_at cannot be restored exactly, because the update_races_updated_at /
-- update_circuits_updated_at triggers set it to now() on every UPDATE.
-- The new Round 16 row is DELETEd. races.id is referenced by 14 tables with ON DELETE CASCADE,
-- so this script refuses to delete it if anything (tickets, trips, reviews...) already points at it.

BEGIN;

DO $$
BEGIN
  IF ((SELECT count(*) FROM public.flight_bookings WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.meetups WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.merch WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.race_external_ids WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.race_history WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.race_weather WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.reviews WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.saved_itineraries WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.supporting_series WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.ticket_packages WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.tickets WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.tips WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.trips WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') + (SELECT count(*) FROM public.waitlist WHERE race_id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016')) > 0 THEN
    RAISE EXCEPTION 'new Rd16 row 5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016 has child rows; refusing to cascade-delete. Resolve manually.';
  END IF;
END $$;

-- 1. Remove the inserted Round 16 row (frees round 16 for Singapore).
DELETE FROM public.races WHERE id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016';

CREATE TEMP TABLE _f1_2026_before (id uuid PRIMARY KEY, round int NOT NULL, date timestamptz NOT NULL, is_sprint_weekend boolean NOT NULL, status race_status NOT NULL) ON COMMIT DROP;
INSERT INTO _f1_2026_before (id, round, date, is_sprint_weekend, status) VALUES
  ('32e601c8-7659-4982-ac80-3289e2640a2a'::uuid,  1, '2026-03-08 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Australian Grand Prix 2026
  ('d31cf86b-0415-4756-86cc-9071607d7297'::uuid,  2, '2026-03-15 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Chinese Grand Prix 2026
  ('3b008be2-a31c-4f1d-916f-6e28c1e2d758'::uuid,  3, '2026-03-29 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Japanese Grand Prix 2026
  ('dc7e3adc-9f50-43f9-879f-c145f79ad099'::uuid,  4, '2026-05-03 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Miami Grand Prix 2026
  ('b07c9c13-a7d8-4c46-a59f-35e1fc292d41'::uuid,  5, '2026-05-24 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Canadian Grand Prix 2026
  ('2e25b691-9628-4ad0-a53a-0d873767be49'::uuid,  6, '2026-06-07 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Monaco Grand Prix 2026
  ('80dfed20-171b-4a2d-9e79-40c4c083dee2'::uuid,  7, '2026-06-14 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Barcelona Grand Prix 2026
  ('10253c51-d9ee-472b-98d2-c8b95a544275'::uuid,  8, '2026-06-28 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Austrian Grand Prix 2026
  ('4f5534b9-6bbc-43ea-9a09-5487e7cdb3e9'::uuid,  9, '2026-07-05 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- British Grand Prix 2026
  ('c3c6203b-6eed-4ae9-b5fe-a2b20add3847'::uuid, 10, '2026-07-19 00:00:00+00'::timestamptz, false, 'completed'::race_status),  -- Belgian Grand Prix 2026
  ('ab0fde7f-5262-46ea-ad1e-558cc41713e5'::uuid, 11, '2026-07-26 00:00:00+00'::timestamptz, false, 'in_progress'::race_status),  -- Hungarian Grand Prix 2026
  ('7ab57db4-e002-42ea-b19c-46c7dbf2d9da'::uuid, 12, '2026-08-23 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Dutch Grand Prix 2026
  ('355df599-0738-4b15-96db-0a4d57c3f050'::uuid, 13, '2026-09-06 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Italian Grand Prix 2026
  ('7914176e-374a-4db4-8b96-23672d6c6b73'::uuid, 14, '2026-09-13 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Spanish Grand Prix 2026
  ('cd65c60a-113d-4463-94f7-f03e6bf43b22'::uuid, 15, '2026-09-26 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Azerbaijan Grand Prix 2026
  ('20d9ee04-769e-4cdb-a0a1-eb81749183a1'::uuid, 16, '2026-10-11 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Singapore Grand Prix 2026
  ('8b3e7332-4d75-409d-b181-ad7142731310'::uuid, 17, '2026-10-25 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- United States Grand Prix 2026
  ('63c49d91-e098-4c1f-bb9f-a9a82956e0fc'::uuid, 18, '2026-11-01 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Mexico City Grand Prix 2026
  ('ea4e4aa8-e992-46b1-9437-3c17ab5e94ec'::uuid, 19, '2026-11-08 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Brazilian Grand Prix 2026
  ('a6b9cf4e-5649-488a-899e-629ab147346a'::uuid, 20, '2026-11-22 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Las Vegas Grand Prix 2026
  ('64c748aa-84c8-4948-991a-c7803f439981'::uuid, 21, '2026-11-29 00:00:00+00'::timestamptz, false, 'upcoming'::race_status),  -- Qatar Grand Prix 2026
  ('35f4f68d-9f9a-42af-8ece-a24ae9408813'::uuid, 22, '2026-12-06 00:00:00+00'::timestamptz, false, 'upcoming'::race_status);  -- Abu Dhabi Grand Prix 2026

-- 2. Two-step round restore (same partial-unique-index reason as apply.sql).
UPDATE public.races r SET round = b.round + 100
  FROM _f1_2026_before b WHERE r.id = b.id AND r.round <> b.round;

UPDATE public.races r
   SET round = b.round, date = b.date, is_sprint_weekend = b.is_sprint_weekend, status = b.status
  FROM _f1_2026_before b
 WHERE r.id = b.id
   AND (r.round, r.date, r.is_sprint_weekend, r.status) IS DISTINCT FROM (b.round, b.date, b.is_sprint_weekend, b.status);

-- 3. Sepang timezone back to NULL (only if it still holds the value apply.sql wrote).
UPDATE public.circuits SET timezone_id = NULL, timezone_name = NULL
 WHERE id = '4ee323dd-9649-4bf1-b531-d7ca6445c2bc' AND timezone_id = 'Asia/Kuala_Lumpur' AND timezone_name = 'Malaysia Time';

-- 4. Original cancellation_reason on the April Bahrain row.
UPDATE public.races SET cancellation_reason = 'Cancelled after the outbreak of the 2026 Iran war; F1 and the FIA called off the race on safety grounds (announced 14 March 2026).'
 WHERE id = 'c66d3016-011d-439c-8155-f2953ac7d6f9' AND cancellation_reason IS DISTINCT FROM 'Cancelled after the outbreak of the 2026 Iran war; F1 and the FIA called off the race on safety grounds (announced 14 March 2026).';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.races r JOIN _f1_2026_before b ON b.id = r.id
              WHERE (r.round, r.date, r.is_sprint_weekend, r.status) IS DISTINCT FROM (b.round, b.date, b.is_sprint_weekend, b.status)) THEN
    RAISE EXCEPTION 'undo did not restore every row';
  END IF;
  IF EXISTS (SELECT 1 FROM public.races WHERE id = '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016') THEN RAISE EXCEPTION 'Rd16 row still present'; END IF;
END $$;

COMMIT;
