ALTER TABLE local_attractions
  ADD COLUMN latitude DECIMAL(10,7),
  ADD COLUMN longitude DECIMAL(10,7),
  ADD COLUMN distance_from_circuit DECIMAL(5,2),
  ADD COLUMN distance_from_city DECIMAL(5,2),
  ADD COLUMN estimated_duration TEXT,
  ADD COLUMN recommended_times TEXT[],
  ADD COLUMN booking_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN price_range TEXT,
  ADD COLUMN f1_relevance TEXT,
  ADD COLUMN peak_times JSONB;
