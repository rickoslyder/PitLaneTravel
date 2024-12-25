-- Update circuit image URLs
UPDATE "public"."circuits"
SET image_url = CASE name
    WHEN 'Marina Bay Street Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Singapore.jpg'
    WHEN 'Miami International Autodrome' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Miami.jpg'
    WHEN 'Autodromo Enzo e Dino Ferrari' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Emilia_Romagna.jpg'
    WHEN 'Bahrain International Circuit' THEN 'https://picsum.photos/1920/1080'
    WHEN 'Albert Park Circuit' THEN 'https://www.racetechmag.com/wp-content/uploads/2019/07/2019australianf1gpstart.jpg'
    WHEN 'Yas Marina Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Abu_Dhabi.jpg'
    WHEN 'Circuit de Spa-Francorchamps' THEN 'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c'
    WHEN 'Lusail International Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Qatar.jpg'
    WHEN 'Silverstone Circuit' THEN 'https://images.unsplash.com/photo-1642888622502-3899916ddc7c'
    WHEN 'Las Vegas Strip Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Las_Vegas.jpg'
    WHEN 'Circuit de Monaco' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Monaco.jpg'
    WHEN 'Circuit Gilles Villeneuve' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Canada.jpg'
    WHEN 'Red Bull Ring' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Austria.jpg'
    WHEN 'Autodromo Nazionale Monza' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Italy.jpg'
    WHEN 'Autódromo José Carlos Pace' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Brazil.jpg'
    WHEN 'Shanghai International Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/China.jpg'
    WHEN 'Suzuka International Racing Course' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Japan.jpg'
    WHEN 'Autódromo Hermanos Rodríguez' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Mexico.jpg'
    WHEN 'Circuit Zandvoort' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Netherlands.jpg'
    WHEN 'Circuit de Barcelona-Catalunya' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png'
    WHEN 'Hungaroring' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit.png'
    WHEN 'Baku City Circuit' THEN 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Baku_Circuit.png'
END
WHERE name IN (
    'Marina Bay Street Circuit',
    'Miami International Autodrome',
    'Autodromo Enzo e Dino Ferrari',
    'Bahrain International Circuit',
    'Albert Park Circuit',
    'Yas Marina Circuit',
    'Circuit de Spa-Francorchamps',
    'Lusail International Circuit',
    'Silverstone Circuit',
    'Las Vegas Strip Circuit',
    'Circuit de Monaco',
    'Circuit Gilles Villeneuve',
    'Red Bull Ring',
    'Autodromo Nazionale Monza',
    'Autódromo José Carlos Pace',
    'Shanghai International Circuit',
    'Suzuka International Racing Course',
    'Autódromo Hermanos Rodríguez',
    'Circuit Zandvoort',
    'Circuit de Barcelona-Catalunya',
    'Hungaroring',
    'Baku City Circuit'
);
