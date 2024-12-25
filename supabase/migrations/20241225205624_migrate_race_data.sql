-- Update races with description and weekend dates
UPDATE races r
SET 
    description = s.description,
    weekend_start = s.weekend_start::timestamp with time zone,
    weekend_end = s.weekend_end::timestamp with time zone
FROM (
    VALUES 
    ('Singapore Grand Prix 2025', 'Night race through the illuminated streets of Marina Bay.', '2025-10-09T23:00:00.000Z', '2025-10-11T23:00:00.000Z'),
    ('Miami Grand Prix 2025', 'Racing around Hard Rock Stadium in the heart of Miami Gardens.', '2025-05-08T23:00:00.000Z', '2025-05-10T23:00:00.000Z'),
    ('Emilia Romagna Grand Prix 2025', 'Historic Italian circuit named after Ferrari''s founder and his son.', '2025-05-22T23:00:00.000Z', '2025-05-24T23:00:00.000Z'),
    ('Bahrain Grand Prix 2025', 'The season opener under the lights of Bahrain', '2025-04-10T23:00:00.000Z', '2025-04-12T23:00:00.000Z'),
    ('Australian Grand Prix 2025', 'Racing through Melbourne''s beautiful Albert Park', '2025-03-14T00:00:00.000Z', '2025-03-16T00:00:00.000Z'),
    ('Abu Dhabi Grand Prix 2025', 'Season finale at the spectacular day-to-night race in Abu Dhabi.', '2025-12-03T00:00:00.000Z', '2025-12-07T00:00:00.000Z'),
    ('Belgian Grand Prix 2025', 'Race through the legendary Spa-Francorchamps circuit in the heart of the Ardennes forest.', '2025-07-22T23:00:00.000Z', '2025-07-26T23:00:00.000Z'),
    ('Qatar Grand Prix 2025', 'Night race at the state-of-the-art Lusail International Circuit', '2025-11-28T00:00:00.000Z', '2025-11-30T00:00:00.000Z'),
    ('British Grand Prix 2025', 'Experience the historic British Grand Prix at Silverstone, home of British motorsport.', '2025-07-03T23:00:00.000Z', '2025-07-05T23:00:00.000Z'),
    ('United States Grand Prix 2025', 'Modern circuit inspired by the best corners from around the world.', '2025-10-23T23:00:00.000Z', '2025-10-25T23:00:00.000Z'),
    ('Saudi Arabian Grand Prix 2025', 'Night race through the streets of Jeddah', '2025-04-17T23:00:00.000Z', '2025-04-19T23:00:00.000Z'),
    ('Spanish Grand Prix 2025', 'Racing at the historic Circuit de Barcelona-Catalunya', '2025-05-29T23:00:00.000Z', '2025-05-31T23:00:00.000Z'),
    ('Las Vegas Grand Prix 2025', 'Night race through the neon-lit streets of Las Vegas.', '2025-11-18T00:00:00.000Z', '2025-11-22T00:00:00.000Z'),
    ('Hungarian Grand Prix 2025', 'Racing at the twisty Hungaroring circuit', '2025-07-31T23:00:00.000Z', '2025-08-02T23:00:00.000Z'),
    ('Azerbaijan Grand Prix 2025', 'Street racing in the heart of Baku', '2025-09-18T23:00:00.000Z', '2025-09-20T23:00:00.000Z'),
    ('Austrian Grand Prix 2025', 'Fast and flowing circuit in the Styrian mountains.', '2025-07-17T23:00:00.000Z', '2025-07-19T23:00:00.000Z'),
    ('Italian Grand Prix 2025', 'The Temple of Speed - F1''s fastest circuit and a historic racing venue.', '2025-09-02T23:00:00.000Z', '2025-09-06T23:00:00.000Z'),
    ('São Paulo Grand Prix 2025', 'The historic Interlagos circuit known for unpredictable weather and great racing.', '2025-11-21T00:00:00.000Z', '2025-11-23T00:00:00.000Z'),
    ('Chinese Grand Prix 2025', 'Return to Shanghai''s unique layout with its demanding turns.', '2025-03-21T00:00:00.000Z', '2025-03-23T00:00:00.000Z'),
    ('Japanese Grand Prix 2025', 'The legendary figure-8 circuit that has decided many championships.', '2025-04-03T23:00:00.000Z', '2025-04-05T23:00:00.000Z'),
    ('Mexico City Grand Prix 2025', 'High-altitude circuit featuring the unique stadium section.', '2025-10-23T23:00:00.000Z', '2025-10-28T00:00:00.000Z'),
    ('Monaco Grand Prix 2025', 'The most prestigious race on the calendar through the streets of Monte Carlo.', '2025-05-19T23:00:00.000Z', '2025-05-23T23:00:00.000Z'),
    ('Canadian Grand Prix 2025', 'Fast circuit on the Île Notre-Dame in the St. Lawrence River.', '2025-06-19T23:00:00.000Z', '2025-06-21T23:00:00.000Z'),
    ('Dutch Grand Prix 2025', 'Seaside circuit with banked corners and passionate orange-clad fans.', '2025-08-26T23:00:00.000Z', '2025-08-30T23:00:00.000Z')
) AS s(name, description, weekend_start, weekend_end)
WHERE r.name = s.name;

-- Insert transport info data for public transport
INSERT INTO transport_info (circuit_id, type, name, description, options)
SELECT 
    c.id as circuit_id,
    'public_transport',
    CASE 
        WHEN c.name = 'Marina Bay Street Circuit' THEN 'MRT'
        WHEN c.name = 'Circuit de Monaco' THEN 'Train'
        WHEN c.name = 'Circuit Gilles Villeneuve' THEN 'Metro'
        WHEN c.name = 'Silverstone Circuit' THEN 'Shuttle Bus'
        WHEN c.name = 'Hungaroring' THEN 'Shuttle Bus'
        WHEN c.name = 'Circuit de Barcelona-Catalunya' THEN 'Public Transport'
        WHEN c.name = 'Red Bull Ring' THEN 'Shuttle Service'
        WHEN c.name = 'Circuit Zandvoort' THEN 'Train'
        ELSE 'Shuttle Service'
    END,
    CASE 
        WHEN c.name = 'Marina Bay Street Circuit' THEN 'Circle and Downtown lines to Promenade station'
        WHEN c.name = 'Circuit de Monaco' THEN 'Regular service to Monaco-Monte Carlo station'
        WHEN c.name = 'Circuit Gilles Villeneuve' THEN 'Direct service to Jean-Drapeau station'
        WHEN c.name = 'Silverstone Circuit' THEN 'Regular shuttle services from nearby towns'
        WHEN c.name = 'Hungaroring' THEN 'Regular service from Budapest'
        WHEN c.name = 'Circuit de Barcelona-Catalunya' THEN 'Metro and bus services available'
        WHEN c.name = 'Red Bull Ring' THEN 'Regular service from Knittelfeld station'
        WHEN c.name = 'Circuit Zandvoort' THEN 'Direct service to Zandvoort aan Zee station'
        ELSE 'Regular shuttle service available'
    END,
    ARRAY['Shuttle Bus', 'Public Transport']
FROM circuits c;

-- Add parking information
INSERT INTO transport_info (circuit_id, type, name, description, options)
SELECT 
    c.id as circuit_id,
    'parking',
    'Circuit Parking',
    CASE 
        WHEN c.name = 'Silverstone Circuit' THEN 'Multiple parking zones available around the circuit'
        WHEN c.name = 'Circuit de Barcelona-Catalunya' THEN 'Available at circuit'
        WHEN c.name = 'Red Bull Ring' THEN 'Extensive on-site parking available'
        ELSE 'Official parking available'
    END,
    ARRAY['General Parking', 'VIP Parking']
FROM circuits c; 