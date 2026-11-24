-- Roll back docs/ops/grandstand-copy-accuracy/apply.sql.
-- Restores the copy that was stored before that script. Slugs are not changed.
-- Not a migration. Do not run from an agent session.

UPDATE grandstands
SET
  name = $copy$Grandstand K (Tabac / Port Hercule)$copy$,
  best_for = $copy$Best overall — the harbour front$copy$,
  views_of = ARRAY['Sainte-Dévote', 'Tabac', 'Port Hercule'],
  pros = ARRAY['The widest sweep of track from any stand', 'Iconic harbour backdrop'],
  description = $copy$Runs along the harbour front from Sainte-Dévote toward Tabac, giving the widest sweep of track of any Monaco stand.$copy$,
  updated_at = now()
WHERE id = '6a8f6c69-143f-433c-b8c2-cb5b5602930e'
  AND slug = 'grandstand-k-tabac-port-hercule';

UPDATE grandstands
SET
  name = $copy$Grandstand L (Nouvelle Chicane)$copy$,
  best_for = $copy$Overtaking & braking into the chicane$copy$,
  views_of = ARRAY['Nouvelle Chicane', 'Tunnel exit', 'Pit lane'],
  pros = ARRAY['The best overtaking spot on the circuit', 'Cars braking hard from the tunnel'],
  description = $copy$Overlooks the Nouvelle Chicane at the tunnel exit — the only real passing place on the Monaco street circuit.$copy$,
  updated_at = now()
WHERE id = '408ab011-e198-467a-9864-3b1579f806e5'
  AND slug = 'grandstand-l-nouvelle-chicane';

UPDATE grandstands
SET
  name = $copy$Grandstands 18-20 (Uscita Ascari)$copy$,
  best_for = $copy$Best value — real overtaking on the back straight$copy$,
  views_of = ARRAY['Ascari exit', 'Back straight'],
  pros = ARRAY['Cheap with real overtaking', 'Grandstand 18 is covered'],
  cons = ARRAY['Further from the pit complex'],
  description = $copy$Cheap seats at the exit of Ascari onto the back straight where real overtaking happens; Grandstand 18 is covered.$copy$,
  updated_at = now()
WHERE id = '48f98676-3c8c-43ed-a7a0-83692bd8cdbf'
  AND slug = 'grandstands-18-20-uscita-ascari';

UPDATE grandstands
SET
  views_of = ARRAY['Stowe', 'Vale'],
  description = $copy$The old Stowe stands were demolished and replaced by a single 16,000-seat wrap-around grandstand overlooking the Stowe braking zone.$copy$,
  updated_at = now()
WHERE id = '93bd1761-3f25-44aa-b07d-590f84bf1b3d'
  AND slug = 'landostand-stowe';

UPDATE grandstands
SET
  name = $copy$Turn 3 Grandstand — East Harmon Zone (Turns 3-4, Koval Straight)$copy$,
  best_for = $copy$Value hunters who want to roam — 2026 ticket includes access to West Harmon, Koval and East Harmon zones$copy$,
  description = $copy$Relocated for 2026 to the west side of Turn 3, looking at drivers attacking Turns 3-4 before they launch down the Koval Straightaway.$copy$,
  updated_at = now()
WHERE id = '7cf5f9c9-2b01-4554-9801-3304482a2157'
  AND slug = 'turn-3-grandstand-east-harmon-zone-turns-3-4-koval-straight';

UPDATE grandstands
SET
  name = $copy$West Harmon Grandstand — West Harmon Zone (Turns 14/17 area, Harmon Straight)$copy$,
  best_for = $copy$Budget speed-chasers who will use the new 2026 roaming access to East Harmon and Koval$copy$,
  views_of = ARRAY['Final-corner sequence (Turns 14/17 area)', 'Harmon Straight', 'Pit-lane entry'],
  description = $copy$Sits inside the track near the final-corner sequence and pit-lane entry, looking down the Harmon Straight at cars going by at near-max speed.$copy$,
  updated_at = now()
WHERE id = 'e7f4db57-97fb-4c2f-bed9-6e458564fb94'
  AND slug = 'west-harmon-grandstand-west-harmon-zone-turns-14-17-area-harmon-straight';
