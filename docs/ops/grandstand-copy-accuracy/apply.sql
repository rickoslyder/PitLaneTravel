-- Grandstand copy corrections. Not a migration. Do not run from an agent session.
-- Apply by hand after review. Keyed by grandstand id. Slugs are not changed.
-- A second run writes the same copy.
--
-- Sources:
-- Monaco K and L: https://acm.mc/wp-content/uploads/2025/05/Plan_Circuit_GPF12027_1920x1800-1-scaled.jpg
-- Monza 18 and 20: https://www.monzanet.it/wp-content/uploads/2026/06/GP_F1_2026_LISTINO_PREZZI_6_17.pdf
-- Silverstone Landostand: https://www.silverstone.co.uk/sites/default/files/pdf/British%20Grand%20Prix%202025%20Map.pdf
--   and https://www.silverstone.co.uk/news/silverstones-guide-grandstands
-- Las Vegas Turn 3: https://www.f1lasvegasgp.com/tickets/grandstands/turn-3-grandstand/
-- Las Vegas Lewis Hamilton Grandstand: https://www.f1lasvegasgp.com/tickets/grandstands/west-harmon-grandstands/

-- Backup. Keep this result before changing anything.
SELECT id, slug, name, best_for, description, views_of, pros, cons, covered
FROM grandstands
WHERE id IN (
  '6a8f6c69-143f-433c-b8c2-cb5b5602930e',
  '408ab011-e198-467a-9864-3b1579f806e5',
  '48f98676-3c8c-43ed-a7a0-83692bd8cdbf',
  '93bd1761-3f25-44aa-b07d-590f84bf1b3d',
  '7cf5f9c9-2b01-4554-9801-3304482a2157',
  'e7f4db57-97fb-4c2f-bed9-6e458564fb94'
)
ORDER BY id;

-- Monaco K. Quai Albert 1er, start straight.
UPDATE grandstands
SET
  name = $copy$Grandstand K (Quai Albert 1er)$copy$,
  best_for = $copy$Best overall — the harbour side of the start straight$copy$,
  views_of = ARRAY['Start/finish straight', 'Quai Albert 1er', 'Sainte-Dévote'],
  pros = ARRAY['Harbour-side block K1-K6 on the start straight', 'Iconic harbour backdrop'],
  description = $copy$The K1-K6 block along Quai Albert 1er, on the harbour side of the start/finish straight between the start line and Sainte-Dévote.$copy$,
  updated_at = now()
WHERE id = '6a8f6c69-143f-433c-b8c2-cb5b5602930e'
  AND slug = 'grandstand-k-tabac-port-hercule';

-- Monaco L. Piscine Rainier III, Swimming Pool.
UPDATE grandstands
SET
  name = $copy$Grandstand L (Swimming Pool)$copy$,
  best_for = $copy$Best for the Swimming Pool (Piscine Rainier III)$copy$,
  views_of = ARRAY['Swimming Pool', 'Piscine Rainier III'],
  pros = ARRAY['At the Swimming Pool section', 'Beside the Belvédère'],
  description = $copy$Official tribune L is Piscine Rainier III, at the Swimming Pool beside the Belvédère. It does not overlook the Nouvelle Chicane.$copy$,
  updated_at = now()
WHERE id = '408ab011-e198-467a-9864-3b1579f806e5'
  AND slug = 'grandstand-l-nouvelle-chicane';

-- Monza 18 and 20 stay one row. They are separate stands. 19 is not on the 2026 plan.
UPDATE grandstands
SET
  name = $copy$Grandstands 18 and 20 (separate stands)$copy$,
  best_for = $copy$Two separate stands: the Ascari exit, and the outside of the straight toward Parabolica$copy$,
  views_of = ARRAY['Ascari exit', 'Straight toward Parabolica'],
  pros = ARRAY['18 is Uscita Ascari A, at the Ascari exit', '20 is Rettilineo Parabolica Esterna, on the opposite side'],
  cons = ARRAY['Not one grandstand', 'Not marked on the seating map'],
  description = $copy$Not one block. The 2026 Monza plan lists 18 as Uscita Ascari A at the Ascari exit and 20 as Rettilineo Parabolica Esterna on the outside of the straight toward Parabolica. It does not list a grandstand 19. Neither stand is marked on the seating map.$copy$,
  updated_at = now()
WHERE id = '48f98676-3c8c-43ed-a7a0-83692bd8cdbf'
  AND slug = 'grandstands-18-20-uscita-ascari';

-- Silverstone Landostand. Stowe area, blocks A to D. No single point.
UPDATE grandstands
SET
  views_of = ARRAY['Stowe', 'Hangar Straight'],
  description = $copy$The Landostand is the seating area around Stowe, not one seat. The 2025 circuit plan shows blocks A to D there, and the circuit guide keeps the expanded stand around that corner.$copy$,
  updated_at = now()
WHERE id = '93bd1761-3f25-44aa-b07d-590f84bf1b3d'
  AND slug = 'landostand-stowe';

-- Las Vegas Turn 3. Koval Zone, west side of Turns 3 and 4.
UPDATE grandstands
SET
  name = $copy$Turn 3 Grandstand — Koval Zone (Turns 3-4, Koval Straight)$copy$,
  best_for = $copy$Value hunters who want to roam — the 2026 ticket is in the Koval Zone, with access to the East Harmon Zone and the Performance Zone$copy$,
  description = $copy$Relocated for 2026 to the west side of Turn 3, in the Koval Zone, looking at drivers attacking Turns 3-4 before they launch down the Koval Straightaway.$copy$,
  updated_at = now()
WHERE id = '7cf5f9c9-2b01-4554-9801-3304482a2157'
  AND slug = 'turn-3-grandstand-east-harmon-zone-turns-3-4-koval-straight';

-- Las Vegas. Former West Harmon stand, now the Lewis Hamilton Grandstand in the Performance Zone.
UPDATE grandstands
SET
  name = $copy$Lewis Hamilton Grandstand — Performance Zone (Turn 17, Harmon Straight)$copy$,
  best_for = $copy$Budget speed-chasers in the Performance Zone, with 2026 access to the East Harmon Zone and the Koval Zone$copy$,
  views_of = ARRAY['Harmon Straight', 'Turn 17', 'Finish'],
  description = $copy$In the Performance Zone, formerly the West Harmon Zone, looking down the Harmon Straight as cars run toward Turn 17 and the finish.$copy$,
  updated_at = now()
WHERE id = 'e7f4db57-97fb-4c2f-bed9-6e458564fb94'
  AND slug = 'west-harmon-grandstand-west-harmon-zone-turns-14-17-area-harmon-straight';
