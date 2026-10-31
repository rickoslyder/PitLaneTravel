-- Pit Lane Travel · F1 2026 calendar fix · VERIFY (read-only SELECTs; run before and after apply.sql)

-- 1. Row counts: expect live=23, cancelled=2 after apply (live=22 before).
SELECT count(*) FILTER (WHERE status <> 'cancelled') AS live,
       count(*) FILTER (WHERE status = 'cancelled')  AS cancelled
  FROM public.races WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026;

-- 2. Every live row matches Scout's calendar (expect 0 rows returned).
WITH expected(round, id, date, is_sprint_weekend) AS (VALUES
  ( 1, '32e601c8-7659-4982-ac80-3289e2640a2a'::uuid, '2026-03-08 04:00:00+00'::timestamptz, false),
  ( 2, 'd31cf86b-0415-4756-86cc-9071607d7297'::uuid, '2026-03-15 07:00:00+00'::timestamptz, true ),
  ( 3, '3b008be2-a31c-4f1d-916f-6e28c1e2d758'::uuid, '2026-03-29 05:00:00+00'::timestamptz, false),
  ( 4, 'dc7e3adc-9f50-43f9-879f-c145f79ad099'::uuid, '2026-05-03 17:00:00+00'::timestamptz, true ),
  ( 5, 'b07c9c13-a7d8-4c46-a59f-35e1fc292d41'::uuid, '2026-05-24 20:00:00+00'::timestamptz, true ),
  ( 6, '2e25b691-9628-4ad0-a53a-0d873767be49'::uuid, '2026-06-07 13:00:00+00'::timestamptz, false),
  ( 7, '80dfed20-171b-4a2d-9e79-40c4c083dee2'::uuid, '2026-06-14 13:00:00+00'::timestamptz, false),
  ( 8, '10253c51-d9ee-472b-98d2-c8b95a544275'::uuid, '2026-06-28 13:00:00+00'::timestamptz, false),
  ( 9, '4f5534b9-6bbc-43ea-9a09-5487e7cdb3e9'::uuid, '2026-07-05 14:00:00+00'::timestamptz, true ),
  (10, 'c3c6203b-6eed-4ae9-b5fe-a2b20add3847'::uuid, '2026-07-19 13:00:00+00'::timestamptz, false),
  (11, 'ab0fde7f-5262-46ea-ad1e-558cc41713e5'::uuid, '2026-07-26 13:00:00+00'::timestamptz, false),
  (12, '7ab57db4-e002-42ea-b19c-46c7dbf2d9da'::uuid, '2026-08-23 13:00:00+00'::timestamptz, true ),
  (13, '355df599-0738-4b15-96db-0a4d57c3f050'::uuid, '2026-09-06 13:00:00+00'::timestamptz, false),
  (14, '7914176e-374a-4db4-8b96-23672d6c6b73'::uuid, '2026-09-13 13:00:00+00'::timestamptz, false),
  (15, 'cd65c60a-113d-4463-94f7-f03e6bf43b22'::uuid, '2026-09-26 11:00:00+00'::timestamptz, false),
  (17, '20d9ee04-769e-4cdb-a0a1-eb81749183a1'::uuid, '2026-10-11 12:00:00+00'::timestamptz, true ),
  (18, '8b3e7332-4d75-409d-b181-ad7142731310'::uuid, '2026-10-25 20:00:00+00'::timestamptz, false),
  (19, '63c49d91-e098-4c1f-bb9f-a9a82956e0fc'::uuid, '2026-11-01 20:00:00+00'::timestamptz, false),
  (20, 'ea4e4aa8-e992-46b1-9437-3c17ab5e94ec'::uuid, '2026-11-08 17:00:00+00'::timestamptz, false),
  (21, 'a6b9cf4e-5649-488a-899e-629ab147346a'::uuid, '2026-11-22 04:00:00+00'::timestamptz, false),
  (22, '64c748aa-84c8-4948-991a-c7803f439981'::uuid, '2026-11-29 16:00:00+00'::timestamptz, false),
  (23, '35f4f68d-9f9a-42af-8ece-a24ae9408813'::uuid, '2026-12-06 13:00:00+00'::timestamptz, false),
  (16, '5e9a6c2e-1b0f-4d7a-9c3e-16a2026f1016'::uuid, '2026-10-04 07:00:00+00'::timestamptz, false)
)
SELECT e.round AS expected_round, e.id, r.round, r.date, e.date AS expected_date, r.is_sprint_weekend, e.is_sprint_weekend AS expected_sprint
  FROM expected e LEFT JOIN public.races r ON r.id = e.id
 WHERE r.id IS NULL OR (r.round, r.date, r.is_sprint_weekend) IS DISTINCT FROM (e.round, e.date, e.is_sprint_weekend);

-- 3. Status vs the deriveRaceStatus rule at this moment (expect 0 rows). RUN-DAY: eyeball Mexico City.
SELECT round, name, date, status,
       CASE WHEN now() < date THEN 'upcoming' WHEN now() < date + interval '24 hours' THEN 'in_progress' ELSE 'completed' END AS expected_status
  FROM public.races
 WHERE series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND season = 2026 AND status <> 'cancelled'
   AND status::text <> CASE WHEN now() < date THEN 'upcoming' WHEN now() < date + interval '24 hours' THEN 'in_progress' ELSE 'completed' END;

-- 4. Full calendar for eyeballing.
SELECT r.round, r.planned_round, r.name, r.slug, r.date, r.status, r.is_sprint_weekend, r.country, c.name AS circuit, c.timezone_id
  FROM public.races r JOIN public.circuits c ON c.id = r.circuit_id
 WHERE r.series_id = '2f9da9e4-331e-4ab4-b4ed-161e4970b318' AND r.season = 2026
 ORDER BY r.status = 'cancelled', r.round;

-- 5. No duplicate slugs anywhere (expect 0 rows) and the new Rd16 slug resolves to one row.
SELECT slug, count(*) FROM public.races WHERE slug IS NOT NULL GROUP BY slug HAVING count(*) > 1;
SELECT id, name, slug, circuit_id FROM public.races WHERE slug = 'bahrain-grand-prix-in-malaysia-2026-f1-2026';

-- 6. Sepang circuit timezone and the April Bahrain cancellation note.
SELECT id, name, location, country, timezone_id, timezone_name FROM public.circuits WHERE id = '4ee323dd-9649-4bf1-b531-d7ca6445c2bc';
SELECT id, name, status, round, planned_round, cancellation_reason FROM public.races WHERE id = 'c66d3016-011d-439c-8155-f2953ac7d6f9';

-- After apply, HTTP checks: / , /races , /races/bahrain-grand-prix-in-malaysia-2026-f1-2026 , /races/las-vegas-grand-prix-2026-f1-2026 all 200.
