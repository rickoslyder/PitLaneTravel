BEGIN;

-- Disable triggers temporarily for faster inserts
SET session_replication_role = replica;

-- Create a temporary table to store the JSON content
CREATE TEMP TABLE temp_json_data (content jsonb);

-- Insert the JSON file content into the temporary table
INSERT INTO temp_json_data (content) VALUES (
  '{
  "users": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "password": "password123",
      "preferences": {},
      "created_at": "2024-12-09T08:48:05.488Z"
    }
  ],
  "price_alerts": [],
  "saved_searches": [],
  "races": [
    {
      "id": 20,
      "name": "Singapore Grand Prix 2025",
      "circuit": "Marina Bay Street Circuit",
      "country": "Singapore",
      "date": "2025-10-10T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Singapore.jpg",
      "description": "Night race through the illuminated streets of Marina Bay.",
      "transport_info": {
        "mrt": "Circle and Downtown lines to Promenade station",
        "taxi": "Available throughout city"
      },
      "weather_info": {
        "humidity": "85%",
        "rainfall": "High",
        "averageTemp": "28°C"
      },
      "nearest_airports": [
        {
          "code": "SIN",
          "name": "Singapore Changi Airport",
          "distance": "20km",
          "transferTime": "20-30 minutes"
        }
      ],
      "city": "Singapore",
      "latitude": "1.2914",
      "longitude": "103.8644",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.063",
        "corners": 23,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:41.905",
          "year": 2018,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": [
        {
          "team": "Ferrari",
          "driver": "Carlos Sainz",
          "position": 1
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 2
        },
        {
          "team": "Mercedes",
          "driver": "Lewis Hamilton",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Gardens by the Bay",
          "description": "Futuristic nature park"
        },
        {
          "name": "Marina Bay Sands",
          "description": "Iconic hotel and skypark"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "3845.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 13,
          "series": "F2"
        },
        {
          "round": 6,
          "series": "F1 Academy"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-10-09T23:00:00.000Z",
      "weekend_end": "2025-10-11T23:00:00.000Z"
    },
    {
      "id": 13,
      "name": "Miami Grand Prix 2025",
      "circuit": "Miami International Autodrome",
      "country": "United States",
      "date": "2025-05-09T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Miami.jpg",
      "description": "Racing around Hard Rock Stadium in the heart of Miami Gardens.",
      "transport_info": {
        "shuttle": "Free shuttle service from designated parking areas",
        "rideshare": "Dedicated pickup/dropoff zones"
      },
      "weather_info": {
        "humidity": "75%",
        "rainfall": "Low",
        "averageTemp": "27°C"
      },
      "nearest_airports": [
        {
          "code": "MIA",
          "name": "Miami International Airport",
          "distance": "25km",
          "transferTime": "30-40 minutes"
        }
      ],
      "city": "Miami",
      "latitude": "25.9581",
      "longitude": "-80.2389",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.412 km",
        "corners": 19,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:29.708",
          "year": 2023,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez",
          "position": 2
        },
        {
          "team": "Aston Martin",
          "driver": "Fernando Alonso",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "South Beach",
          "description": "Famous beach and entertainment district"
        },
        {
          "name": "Wynwood Walls",
          "description": "Outdoor museum of street art"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "3633.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 6,
          "series": "F2"
        },
        {
          "round": 4,
          "series": "F1 Academy"
        },
        {
          "round": 6,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-05-08T23:00:00.000Z",
      "weekend_end": "2025-05-10T23:00:00.000Z"
    },
    {
      "id": 14,
      "name": "Emilia Romagna Grand Prix 2025",
      "circuit": "Autodromo Enzo e Dino Ferrari",
      "country": "Italy",
      "date": "2025-05-23T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Emilia_Romagna.jpg",
      "description": "Historic Italian circuit named after Ferrari''s founder and his son.",
      "transport_info": {
        "taxi": "Available at airport and circuit",
        "shuttle": "Regular service from Bologna and Imola stations"
      },
      "weather_info": {
        "humidity": "65%",
        "rainfall": "Moderate",
        "averageTemp": "22°C"
      },
      "nearest_airports": [
        {
          "code": "BLQ",
          "name": "Bologna Guglielmo Marconi Airport",
          "distance": "40km",
          "transferTime": "45-50 minutes"
        }
      ],
      "city": "Imola",
      "latitude": "44.3439",
      "longitude": "11.7167",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.909 km",
        "corners": 19,
        "drsZones": 1,
        "lapRecord": {
          "time": "1:15.484",
          "year": 2020,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez",
          "position": 2
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Museo Checco Costa",
          "description": "Racing museum at the circuit"
        },
        {
          "name": "Historic Center of Imola",
          "description": "Medieval town center"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "1763.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 7,
          "series": "F2"
        },
        {
          "round": 4,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-05-22T23:00:00.000Z",
      "weekend_end": "2025-05-24T23:00:00.000Z"
    },
    {
      "id": 3,
      "name": "Bahrain Grand Prix 2025",
      "circuit": "Bahrain International Circuit",
      "country": "Bahrain",
      "date": "2025-04-12T22:00:00.000Z",
      "image_url": "https://picsum.photos/1920/1080",
      "description": "The season opener under the lights of Bahrain",
      "transport_info": {
        "public": {
          "options": [],
          "description": ""
        },
        "parking": {
          "options": [],
          "description": ""
        }
      },
      "weather_info": {
        "practice1": {
          "humidity": "45",
          "windSpeed": "15",
          "conditions": "Clear",
          "temperature": "24",
          "precipitation": "0"
        }
      },
      "nearest_airports": [
        {
          "code": "BAH",
          "name": "Bahrain International Airport",
          "distance": "12km",
          "transferTime": "15 mins"
        }
      ],
      "city": "Sakhir",
      "latitude": "26.0325",
      "longitude": "50.5106",
      "schedule": {
        "race": "2025-03-02 18:00",
        "practice1": "2025-02-28 13:00",
        "practice2": "2025-02-28 17:00",
        "practice3": "2025-03-01 14:00",
        "qualifying": "2025-03-01 17:00"
      },
      "ticket_info": {
        "general": {
          "price": "150",
          "availability": "medium"
        },
        "grandstand": {
          "price": "450",
          "availability": "high"
        }
      },
      "circuit_info": {
        "length": "5.412 km",
        "corners": 15,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:31.447",
          "year": 2005,
          "driver": "Pedro de la Rosa"
        }
      },
      "last_year_podium": {
        "first": {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen"
        },
        "third": {
          "team": "Aston Martin",
          "driver": "Fernando Alonso"
        },
        "second": {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez"
        }
      },
      "track_map_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Bahrain_Circuit.png",
      "status": "upcoming",
      "slug": "bahrain-grand-prix-2025",
      "local_attractions": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "description": "Learn about local motorsport history"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "type": "shopping",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 4.2,
          "category": "shopping",
          "distance": "4 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7528,
            "lng": -74.046
          },
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "5258.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 2,
          "series": "F2"
        },
        {
          "round": 2,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-04-10T23:00:00.000Z",
      "weekend_end": "2025-04-12T23:00:00.000Z"
    },
    {
      "id": 5,
      "name": "Australian Grand Prix 2025",
      "circuit": "Albert Park Circuit",
      "country": "Australia",
      "date": "2025-03-16T00:00:00.000Z",
      "image_url": "https://www.racetechmag.com/wp-content/uploads/2019/07/2019australianf1gpstart.jpg",
      "description": "Racing through Melbourne''s beautiful Albert Park",
      "transport_info": {
        "public": {
          "options": [
            "Tram service",
            "Special event buses"
          ],
          "description": "Extensive public transport options"
        },
        "parking": {
          "options": [
            "Pre-booking available"
          ],
          "description": "Official parking zones"
        }
      },
      "weather_info": {},
      "nearest_airports": [
        {
          "code": "MEL",
          "name": "Melbourne Airport",
          "distance": "25km",
          "transferTime": "35 mins"
        },
        {
          "code": "AVV",
          "name": "Avalon Airport",
          "distance": "55km",
          "transferTime": "50 mins"
        }
      ],
      "city": "Melbourne",
      "latitude": "-37.8497",
      "longitude": "144.9689",
      "schedule": {
        "race": "2025-03-23 15:00",
        "practice1": "2025-03-21 12:30",
        "practice2": "2025-03-21 16:00",
        "practice3": "2025-03-22 14:00",
        "qualifying": "2025-03-22 17:00"
      },
      "ticket_info": {
        "price": 0,
        "title": "",
        "general": {
          "price": "150",
          "availability": "medium"
        },
        "grandstand": {
          "price": "450",
          "availability": "high"
        },
        "ticketType": "3_DAY",
        "description": "",
        "resellerUrl": "",
        "availability": "available",
        "daysIncluded": {
          "friday": true,
          "sunday": true,
          "saturday": true,
          "thursday": false
        },
        "isChildTicket": false
      },
      "circuit_info": {
        "length": "5.278 km",
        "corners": 14,
        "drsZones": 4,
        "lapRecord": {
          "time": "1:20.235",
          "year": 2023,
          "driver": "Sergio Perez"
        }
      },
      "last_year_podium": {
        "first": {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen"
        },
        "third": {
          "team": "Aston Martin",
          "driver": "Fernando Alonso"
        },
        "second": {
          "team": "Mercedes",
          "driver": "Lewis Hamilton"
        }
      },
      "track_map_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Australia_Circuit.png",
      "status": "upcoming",
      "slug": "australian-grand-prix-2025",
      "local_attractions": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "description": "Learn about local motorsport history"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "type": "shopping",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 4.2,
          "category": "shopping",
          "distance": "4 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7528,
            "lng": -74.046
          },
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "4766.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 1,
          "series": "F2"
        },
        {
          "round": 1,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-03-14T00:00:00.000Z",
      "weekend_end": "2025-03-16T00:00:00.000Z"
    },
    {
      "id": 25,
      "name": "Abu Dhabi Grand Prix 2025",
      "circuit": "Yas Marina Circuit",
      "country": "United Arab Emirates",
      "date": "2025-12-05T00:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Abu_Dhabi.jpg",
      "description": "Season finale at the spectacular day-to-night race in Abu Dhabi.",
      "transport_info": {
        "taxi": "Available at airport and circuit",
        "shuttle": "Hotel shuttle services"
      },
      "weather_info": {
        "humidity": "60%",
        "rainfall": "Low",
        "averageTemp": "26°C"
      },
      "nearest_airports": [
        {
          "code": "AUH",
          "name": "Abu Dhabi International Airport",
          "distance": "15km",
          "transferTime": "20-30 minutes"
        }
      ],
      "city": "Abu Dhabi",
      "latitude": "24.4672",
      "longitude": "54.6031",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.281",
        "corners": 16,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:26.103",
          "year": 2021,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Ferrari",
          "driver": "Charles Leclerc",
          "position": 2
        },
        {
          "team": "Mercedes",
          "driver": "George Russell",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Ferrari World",
          "description": "Ferrari-themed amusement park"
        },
        {
          "name": "Yas Beach",
          "description": "Private beach club"
        }
      ],
      "suggested_itineraries": [],
      "availability": "sold_out",
      "price": "1148.00",
      "season": "winter",
      "supporting_series": [
        {
          "round": 18,
          "series": "F2"
        },
        {
          "round": 9,
          "series": "F1 Academy"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-12-03T00:00:00.000Z",
      "weekend_end": "2025-12-07T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Belgian Grand Prix 2025",
      "circuit": "Circuit de Spa-Francorchamps",
      "country": "Belgium",
      "date": "2025-07-24T23:00:00.000Z",
      "image_url": "https://images.unsplash.com/photo-1589556264800-08ae9e129a8c",
      "description": "Race through the legendary Spa-Francorchamps circuit in the heart of the Ardennes forest.",
      "transport_info": {
        "parking": "Multiple parking areas with shuttle service",
        "public_transport": {
          "bus": "Special race weekend shuttle services",
          "train": "Verviers-Central is the nearest major station"
        }
      },
      "weather_info": {
        "typical": {
          "august": {
            "temp_low": 13,
            "temp_high": 23,
            "conditions": "Unpredictable, famous for micro-climate"
          }
        }
      },
      "nearest_airports": [
        {
          "code": "BRU",
          "name": "Brussels Airport",
          "distance": "120km",
          "transferTime": "1.5 hours"
        },
        {
          "code": "LGG",
          "name": "Liège Airport",
          "distance": "60km",
          "transferTime": "1 hour"
        }
      ],
      "city": null,
      "latitude": "50.4372",
      "longitude": "5.9714",
      "schedule": {},
      "ticket_info": {
        "general": {
          "price": "150",
          "availability": "medium"
        },
        "grandstand": {
          "price": "450",
          "availability": "high"
        }
      },
      "circuit_info": {
        "length": "7.004 km",
        "corners": 19,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:46.286",
          "year": 2023,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": {},
      "track_map_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Belgium_Circuit.png",
      "status": "upcoming",
      "slug": "belgian-grand-prix",
      "local_attractions": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "description": "Learn about local motorsport history"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "type": "shopping",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 4.2,
          "category": "shopping",
          "distance": "4 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7528,
            "lng": -74.046
          },
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "6707.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 11,
          "series": "F2"
        },
        {
          "round": 8,
          "series": "F3"
        },
        {
          "round": 13,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-07-22T23:00:00.000Z",
      "weekend_end": "2025-07-26T23:00:00.000Z"
    },
    {
      "id": 27,
      "name": "Qatar Grand Prix 2025",
      "circuit": "Lusail International Circuit",
      "country": "Qatar",
      "date": "2025-11-30T00:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Qatar.jpg",
      "description": "Night race at the state-of-the-art Lusail International Circuit",
      "transport_info": {
        "taxi": "Available at airport and circuit",
        "shuttle": "Regular service from Doha"
      },
      "weather_info": {
        "humidity": "60%",
        "rainfall": "Low",
        "averageTemp": "25°C"
      },
      "nearest_airports": [
        {
          "code": "DOH",
          "name": "Hamad International Airport",
          "distance": "30km",
          "transferTime": "30-40 minutes"
        }
      ],
      "city": "Lusail",
      "latitude": "25.4866",
      "longitude": "51.4534",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.419 km",
        "corners": 16,
        "drsZones": 1,
        "lapRecord": {
          "time": "1:24.319",
          "year": 2023,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "McLaren",
          "driver": "Oscar Piastri",
          "position": 2
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 3
        }
      ],
      "track_map_url": "",
      "status": "upcoming",
      "slug": "qatar-grand-prix-2025",
      "local_attractions": [
        {
          "name": "National Museum of Qatar",
          "description": "Architectural masterpiece showcasing Qatar''s history"
        },
        {
          "name": "Katara Cultural Village",
          "description": "Cultural and entertainment destination"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "2999.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 13,
          "series": "F2"
        },
        {
          "round": 23,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-11-28T00:00:00.000Z",
      "weekend_end": "2025-11-30T00:00:00.000Z"
    },
    {
      "id": 1,
      "name": "British Grand Prix 2025",
      "circuit": "Silverstone Circuit",
      "country": "United Kingdom",
      "date": "2025-07-05T23:00:00.000Z",
      "image_url": "https://images.unsplash.com/photo-1642888622502-3899916ddc7c",
      "description": "Experience the historic British Grand Prix at Silverstone, home of British motorsport.",
      "transport_info": {
        "parking": "Multiple parking zones available around the circuit",
        "public_transport": {
          "bus": "Regular shuttle services from nearby towns",
          "train": "Nearest stations are Milton Keynes Central and Northampton"
        }
      },
      "weather_info": {
        "typical": {
          "july": {
            "temp_low": 12,
            "temp_high": 22,
            "conditions": "Variable, chances of rain"
          }
        }
      },
      "nearest_airports": [
        {
          "code": "LHR",
          "name": "London Heathrow",
          "distance": "85 miles",
          "transferTime": "2 hours"
        },
        {
          "code": "BHX",
          "name": "Birmingham",
          "distance": "60 miles",
          "transferTime": "1.5 hours"
        }
      ],
      "city": null,
      "latitude": "52.0733",
      "longitude": "-1.0146",
      "schedule": {},
      "ticket_info": {
        "general": {
          "price": "150",
          "availability": "medium"
        },
        "grandstand": {
          "price": "450",
          "availability": "high"
        }
      },
      "circuit_info": {
        "length": "5.891 km",
        "corners": 18,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:27.097",
          "year": 2023,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": {},
      "track_map_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png",
      "status": "upcoming",
      "slug": "british-grand-prix",
      "local_attractions": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "description": "Learn about local motorsport history"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "type": "shopping",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 4.2,
          "category": "shopping",
          "distance": "4 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7528,
            "lng": -74.046
          },
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "suggested_itineraries": [],
      "availability": "sold_out",
      "price": "2401.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 10,
          "series": "F2"
        },
        {
          "round": 7,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-07-03T23:00:00.000Z",
      "weekend_end": "2025-07-05T23:00:00.000Z"
    },
    {
      "id": 21,
      "name": "United States Grand Prix 2025",
      "circuit": "Circuit of The Americas",
      "country": "United States",
      "date": "2025-10-24T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/United_States.jpg",
      "description": "Modern circuit inspired by the best corners from around the world.",
      "transport_info": {
        "shuttle": "Regular service from downtown Austin",
        "rideshare": "Dedicated pickup zones"
      },
      "weather_info": {
        "humidity": "65%",
        "rainfall": "Low",
        "averageTemp": "22°C"
      },
      "nearest_airports": [
        {
          "code": "AUS",
          "name": "Austin-Bergstrom International Airport",
          "distance": "15km",
          "transferTime": "20-30 minutes"
        }
      ],
      "city": "Austin",
      "latitude": "30.1328",
      "longitude": "-97.6411",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.513",
        "corners": 20,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:36.169",
          "year": 2019,
          "driver": "Charles Leclerc"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Mercedes",
          "driver": "Lewis Hamilton",
          "position": 2
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Austin 6th Street",
          "description": "Entertainment district"
        },
        {
          "name": "Texas State Capitol",
          "description": "Historic government building"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "2245.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 19,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-10-23T23:00:00.000Z",
      "weekend_end": "2025-10-25T23:00:00.000Z"
    },
    {
      "id": 4,
      "name": "Saudi Arabian Grand Prix 2025",
      "circuit": "Jeddah Corniche Circuit",
      "country": "Saudi Arabia",
      "date": "2025-04-19T22:00:00.000Z",
      "image_url": "https://picsum.photos/1920/1080",
      "description": "Night race through the streets of Jeddah",
      "transport_info": {
        "public": {
          "options": [],
          "description": ""
        },
        "parking": {
          "options": [],
          "description": ""
        }
      },
      "weather_info": {
        "practice1": {
          "humidity": "65",
          "windSpeed": "12",
          "conditions": "Clear",
          "temperature": "26",
          "precipitation": "0"
        }
      },
      "nearest_airports": [
        {
          "code": "JED",
          "name": "King Abdulaziz International",
          "distance": "15km",
          "transferTime": "25 mins"
        }
      ],
      "city": "Jeddah",
      "latitude": "21.6319",
      "longitude": "39.1044",
      "schedule": {
        "race": "2025-03-09 20:00",
        "practice1": "2025-03-07 13:30",
        "practice2": "2025-03-07 17:00",
        "practice3": "2025-03-08 14:30",
        "qualifying": "2025-03-08 18:00"
      },
      "ticket_info": {
        "general": {
          "price": "150",
          "availability": "medium"
        },
        "grandstand": {
          "price": "450",
          "availability": "high"
        }
      },
      "circuit_info": {
        "length": "6.174 km",
        "corners": 27,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:30.734",
          "year": 2021,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": {
        "first": {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez"
        },
        "third": {
          "team": "Aston Martin",
          "driver": "Fernando Alonso"
        },
        "second": {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen"
        }
      },
      "track_map_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Saudi_Arabia_Circuit.png",
      "status": "upcoming",
      "slug": "saudi-arabian-grand-prix-2025",
      "local_attractions": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "description": "Learn about local motorsport history"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "type": "shopping",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 4.2,
          "category": "shopping",
          "distance": "4 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7528,
            "lng": -74.046
          },
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "2811.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 3,
          "series": "F2"
        },
        {
          "round": 2,
          "series": "F1 Academy"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-04-17T23:00:00.000Z",
      "weekend_end": "2025-04-19T23:00:00.000Z"
    },
    {
      "id": 29,
      "name": "Spanish Grand Prix 2025",
      "circuit": "Circuit de Barcelona-Catalunya",
      "country": "Spain",
      "date": "2025-05-30T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png",
      "description": "Racing at the historic Circuit de Barcelona-Catalunya",
      "transport_info": {
        "public": "Metro and bus services available",
        "parking": "Available at circuit"
      },
      "weather_info": {
        "rainfall": "Low",
        "averageTemp": "22°C"
      },
      "nearest_airports": [
        {
          "code": "BCN",
          "name": "Barcelona–El Prat Airport",
          "distance": "25km"
        }
      ],
      "city": "Barcelona",
      "latitude": "41.57",
      "longitude": "2.26",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.675 km",
        "corners": 16,
        "drsZones": 2
      },
      "last_year_podium": [],
      "track_map_url": "",
      "status": "upcoming",
      "slug": "spanish-grand-prix-2025",
      "local_attractions": [],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "1500.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 6,
          "series": "F2"
        },
        {
          "round": 5,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-05-29T23:00:00.000Z",
      "weekend_end": "2025-05-31T23:00:00.000Z"
    },
    {
      "id": 24,
      "name": "Las Vegas Grand Prix 2025",
      "circuit": "Las Vegas Strip Circuit",
      "country": "United States",
      "date": "2025-11-20T00:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Las_Vegas.jpg",
      "description": "Night race through the neon-lit streets of Las Vegas.",
      "transport_info": {
        "shuttle": "Hotel shuttle services",
        "monorail": "Service along the Strip"
      },
      "weather_info": {
        "humidity": "30%",
        "rainfall": "Low",
        "averageTemp": "12°C"
      },
      "nearest_airports": [
        {
          "code": "LAS",
          "name": "Harry Reid International Airport",
          "distance": "5km",
          "transferTime": "10-15 minutes"
        }
      ],
      "city": "Las Vegas",
      "latitude": "36.1699",
      "longitude": "-115.1398",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "6.201",
        "corners": 17,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:35.490",
          "year": 2023,
          "driver": "Max Verstappen"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Ferrari",
          "driver": "Charles Leclerc",
          "position": 2
        },
        {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Bellagio Fountains",
          "description": "Musical water feature"
        },
        {
          "name": "Fremont Street",
          "description": "Historic casino district"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "3281.00",
      "season": "winter",
      "supporting_series": [
        {
          "round": 17,
          "series": "F2"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-11-18T00:00:00.000Z",
      "weekend_end": "2025-11-22T00:00:00.000Z"
    },
    {
      "id": 30,
      "name": "Hungarian Grand Prix 2025",
      "circuit": "Hungaroring",
      "country": "Hungary",
      "date": "2025-08-01T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit.png",
      "description": "Racing at the twisty Hungaroring circuit",
      "transport_info": {
        "taxi": "Available from city",
        "shuttle": "Regular service from Budapest"
      },
      "weather_info": {
        "rainfall": "Medium",
        "averageTemp": "28°C"
      },
      "nearest_airports": [
        {
          "code": "BUD",
          "name": "Budapest Ferenc Liszt International Airport",
          "distance": "20km"
        }
      ],
      "city": "Budapest",
      "latitude": "47.58",
      "longitude": "19.25",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.381 km",
        "corners": 14,
        "drsZones": 2
      },
      "last_year_podium": [],
      "track_map_url": "",
      "status": "upcoming",
      "slug": "hungarian-grand-prix-2025",
      "local_attractions": [],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "1200.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 10,
          "series": "F2"
        },
        {
          "round": 9,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-07-31T23:00:00.000Z",
      "weekend_end": "2025-08-02T23:00:00.000Z"
    },
    {
      "id": 31,
      "name": "Azerbaijan Grand Prix 2025",
      "circuit": "Baku City Circuit",
      "country": "Azerbaijan",
      "date": "2025-09-19T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Baku_Circuit.png",
      "description": "Street racing in the heart of Baku",
      "transport_info": {
        "taxi": "Available throughout city",
        "shuttle": "Service from key hotels"
      },
      "weather_info": {
        "rainfall": "Low",
        "averageTemp": "24°C"
      },
      "nearest_airports": [
        {
          "code": "GYD",
          "name": "Heydar Aliyev International Airport",
          "distance": "25km"
        }
      ],
      "city": "Baku",
      "latitude": "40.37",
      "longitude": "49.85",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "6.003 km",
        "corners": 20,
        "drsZones": 2
      },
      "last_year_podium": [],
      "track_map_url": "",
      "status": "upcoming",
      "slug": "azerbaijan-grand-prix-2025",
      "local_attractions": [],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "1300.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 12,
          "series": "F2"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-09-18T23:00:00.000Z",
      "weekend_end": "2025-09-20T23:00:00.000Z"
    },
    {
      "id": 17,
      "name": "Austrian Grand Prix 2025",
      "circuit": "Red Bull Ring",
      "country": "Austria",
      "date": "2025-07-18T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Austria.jpg",
      "description": "Fast and flowing circuit in the Styrian mountains.",
      "transport_info": {
        "parking": "Extensive on-site parking available",
        "shuttle": "Regular service from Knittelfeld station"
      },
      "weather_info": {
        "humidity": "60%",
        "rainfall": "Moderate",
        "averageTemp": "24°C"
      },
      "nearest_airports": [
        {
          "code": "GRZ",
          "name": "Graz Airport",
          "distance": "85km",
          "transferTime": "60-75 minutes"
        }
      ],
      "city": "Spielberg",
      "latitude": "47.2197",
      "longitude": "14.7647",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.318",
        "corners": 10,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:05.619",
          "year": 2020,
          "driver": "Carlos Sainz"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Ferrari",
          "driver": "Charles Leclerc",
          "position": 2
        },
        {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Red Bull Ring Museum",
          "description": "Racing history exhibition"
        },
        {
          "name": "Styrian Mountains",
          "description": "Beautiful alpine scenery"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "6723.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 9,
          "series": "F2"
        },
        {
          "round": 6,
          "series": "F3"
        },
        {
          "round": 9,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-07-17T23:00:00.000Z",
      "weekend_end": "2025-07-19T23:00:00.000Z"
    },
    {
      "id": 19,
      "name": "Italian Grand Prix 2025",
      "circuit": "Autodromo Nazionale Monza",
      "country": "Italy",
      "date": "2025-09-04T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Italy.jpg",
      "description": "The Temple of Speed - F1''s fastest circuit and a historic racing venue.",
      "transport_info": {
        "bus": "Regular service from Milan",
        "train": "Shuttle service from Monza station"
      },
      "weather_info": {
        "humidity": "70%",
        "rainfall": "Low",
        "averageTemp": "22°C"
      },
      "nearest_airports": [
        {
          "code": "MXP",
          "name": "Milan Malpensa Airport",
          "distance": "45km",
          "transferTime": "45-55 minutes"
        }
      ],
      "city": "Monza",
      "latitude": "45.6156",
      "longitude": "9.2811",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.793",
        "corners": 11,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:21.046",
          "year": 2004,
          "driver": "Rubens Barrichello"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Red Bull Racing",
          "driver": "Sergio Perez",
          "position": 2
        },
        {
          "team": "Ferrari",
          "driver": "Carlos Sainz",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Monza Park",
          "description": "Historic royal park"
        },
        {
          "name": "Monza Cathedral",
          "description": "Gothic-Romanesque cathedral"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "9158.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 12,
          "series": "F2"
        },
        {
          "round": 9,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-09-02T23:00:00.000Z",
      "weekend_end": "2025-09-06T23:00:00.000Z"
    },
    {
      "id": 23,
      "name": "São Paulo Grand Prix 2025",
      "circuit": "Autódromo José Carlos Pace",
      "country": "Brazil",
      "date": "2025-11-22T00:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Brazil.jpg",
      "description": "The historic Interlagos circuit known for unpredictable weather and great racing.",
      "transport_info": {
        "taxi": "Available at circuit",
        "metro": "Line 9 to Autódromo station"
      },
      "weather_info": {
        "humidity": "80%",
        "rainfall": "High",
        "averageTemp": "24°C"
      },
      "nearest_airports": [
        {
          "code": "GRU",
          "name": "São Paulo/Guarulhos International Airport",
          "distance": "25km",
          "transferTime": "45-60 minutes"
        }
      ],
      "city": "São Paulo",
      "latitude": "-23.7036",
      "longitude": "-46.6997",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.309",
        "corners": 15,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:10.540",
          "year": 2018,
          "driver": "Valtteri Bottas"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 2
        },
        {
          "team": "Aston Martin",
          "driver": "Fernando Alonso",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Ibirapuera Park",
          "description": "Urban park and cultural center"
        },
        {
          "name": "Pinacoteca",
          "description": "Art museum"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "3111.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 16,
          "series": "F2"
        },
        {
          "round": 21,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-11-21T00:00:00.000Z",
      "weekend_end": "2025-11-23T00:00:00.000Z"
    },
    {
      "id": 12,
      "name": "Chinese Grand Prix 2025",
      "circuit": "Shanghai International Circuit",
      "country": "China",
      "date": "2025-03-23T00:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/China.jpg",
      "description": "Return to Shanghai''s unique layout with its demanding turns.",
      "transport_info": {
        "public": {
          "options": [],
          "description": ""
        },
        "parking": {
          "options": [],
          "description": ""
        }
      },
      "weather_info": {
        "humidity": "65%",
        "rainfall": "Light",
        "averageTemp": "18°C"
      },
      "nearest_airports": [
        {
          "code": "PVG",
          "name": "Shanghai Pudong International Airport",
          "distance": "40km",
          "transferTime": "45-60 minutes"
        }
      ],
      "city": "Shanghai",
      "latitude": "31.3389",
      "longitude": "121.2205",
      "schedule": {
        "race": "",
        "sprint": "",
        "practice1": "",
        "qualifying": "",
        "sprint_qualifying": ""
      },
      "ticket_info": {},
      "circuit_info": {
        "length": "5.451 km",
        "corners": 16,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:32.238",
          "year": 2004,
          "driver": "Michael Schumacher"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Ferrari",
          "driver": "Charles Leclerc",
          "position": 2
        },
        {
          "team": "Ferrari",
          "driver": "Carlos Sainz",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "id": "aed9a134-e72b-4db7-8994-d3daaaa8bb42",
          "name": "The Bund",
          "type": "attraction",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 0,
          "category": "",
          "distance": "",
          "duration": "",
          "location": {
            "lat": 0,
            "lng": 0
          },
          "description": "Famous waterfront area"
        },
        {
          "id": "bb3981fb-776a-49ba-bf10-5e3ab28d6c01",
          "name": "Yu Garden",
          "type": "attraction",
          "price": {
            "amount": 0,
            "currency": "USD"
          },
          "rating": 0,
          "category": "",
          "distance": "",
          "duration": "",
          "location": {
            "lat": 0,
            "lng": 0
          },
          "description": "Traditional Chinese garden"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "6315.00",
      "season": "spring",
      "supporting_series": [
        {
          "round": 5,
          "series": "F2"
        },
        {
          "round": 3,
          "series": "F1 Academy"
        },
        {
          "round": 2,
          "series": "F1 Sprint"
        }
      ],
      "is_sprint_weekend": true,
      "weekend_start": "2025-03-21T00:00:00.000Z",
      "weekend_end": "2025-03-23T00:00:00.000Z"
    },
    {
      "id": 11,
      "name": "Japanese Grand Prix 2025",
      "circuit": "Suzuka International Racing Course",
      "country": "Japan",
      "date": "2025-04-05T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Japan.jpg",
      "description": "The legendary figure-8 circuit that has decided many championships.",
      "transport_info": {
        "taxi": "Available at airport and circuit",
        "shuttle": "Regular service from Shiroko and Suzuka Circuit Ino stations"
      },
      "weather_info": {
        "humidity": "70%",
        "rainfall": "Moderate",
        "averageTemp": "20°C"
      },
      "nearest_airports": [
        {
          "code": "NGO",
          "name": "Chubu Centrair International Airport",
          "distance": "85km",
          "transferTime": "75-90 minutes"
        }
      ],
      "city": "Suzuka",
      "latitude": "34.8431",
      "longitude": "136.5407",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "5.807 km",
        "corners": 18,
        "drsZones": 1,
        "lapRecord": {
          "time": "1:30.983",
          "year": 2019,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "McLaren",
          "driver": "Lando Norris",
          "position": 2
        },
        {
          "team": "McLaren",
          "driver": "Oscar Piastri",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Suzuka Circuit Museum",
          "description": "Racing history museum"
        },
        {
          "name": "Nagashima Spa Land",
          "description": "One of Japan''s largest amusement parks"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "4482.00",
      "season": "spring",
      "supporting_series": [],
      "is_sprint_weekend": false,
      "weekend_start": "2025-04-03T23:00:00.000Z",
      "weekend_end": "2025-04-05T23:00:00.000Z"
    },
    {
      "id": 22,
      "name": "Mexico City Grand Prix 2025",
      "circuit": "Autódromo Hermanos Rodríguez",
      "country": "Mexico",
      "date": "2025-10-25T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Mexico.jpg",
      "description": "High-altitude circuit featuring the unique stadium section.",
      "transport_info": {
        "bus": "Special event services",
        "metro": "Line 9 to Ciudad Deportiva station"
      },
      "weather_info": {
        "humidity": "45%",
        "rainfall": "Low",
        "averageTemp": "20°C"
      },
      "nearest_airports": [
        {
          "code": "MEX",
          "name": "Mexico City International Airport",
          "distance": "10km",
          "transferTime": "15-25 minutes"
        }
      ],
      "city": "Mexico City",
      "latitude": "19.4042",
      "longitude": "-99.0907",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.304",
        "corners": 17,
        "drsZones": 3,
        "lapRecord": {
          "time": "1:17.774",
          "year": 2021,
          "driver": "Valtteri Bottas"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Mercedes",
          "driver": "Lewis Hamilton",
          "position": 2
        },
        {
          "team": "Ferrari",
          "driver": "Charles Leclerc",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Zócalo",
          "description": "Historic city center"
        },
        {
          "name": "Chapultepec Castle",
          "description": "Hilltop castle and museum"
        }
      ],
      "suggested_itineraries": [],
      "availability": "limited",
      "price": "3775.00",
      "season": "fall",
      "supporting_series": [],
      "is_sprint_weekend": false,
      "weekend_start": "2025-10-23T23:00:00.000Z",
      "weekend_end": "2025-10-28T00:00:00.000Z"
    },
    {
      "id": 15,
      "name": "Monaco Grand Prix 2025",
      "circuit": "Circuit de Monaco",
      "country": "Monaco",
      "date": "2025-05-21T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Monaco.jpg",
      "description": "The most prestigious race on the calendar through the streets of Monte Carlo.",
      "transport_info": {
        "train": "Regular service to Monaco-Monte Carlo station",
        "helicopter": "Available from Nice Airport"
      },
      "weather_info": {
        "humidity": "70%",
        "rainfall": "Low",
        "averageTemp": "21°C"
      },
      "nearest_airports": [
        {
          "code": "NCE",
          "name": "Nice Cote d''Azur Airport",
          "distance": "30km",
          "transferTime": "30-40 minutes"
        }
      ],
      "city": "Monte Carlo",
      "latitude": "43.7347",
      "longitude": "7.4206",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "3.337 km",
        "corners": 19,
        "drsZones": 1,
        "lapRecord": {
          "time": "1:12.909",
          "year": 2021,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Aston Martin",
          "driver": "Fernando Alonso",
          "position": 2
        },
        {
          "team": "Alpine",
          "driver": "Esteban Ocon",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Monte Carlo Casino",
          "description": "World-famous casino and landmark"
        },
        {
          "name": "Prince''s Palace",
          "description": "Official residence of Monaco''s Sovereign Prince"
        }
      ],
      "suggested_itineraries": [],
      "availability": "sold_out",
      "price": "3025.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 8,
          "series": "F2"
        },
        {
          "round": 5,
          "series": "F3"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-05-19T23:00:00.000Z",
      "weekend_end": "2025-05-23T23:00:00.000Z"
    },
    {
      "id": 16,
      "name": "Canadian Grand Prix 2025",
      "circuit": "Circuit Gilles Villeneuve",
      "country": "Canada",
      "date": "2025-06-20T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Canada.jpg",
      "description": "Fast circuit on the Île Notre-Dame in the St. Lawrence River.",
      "transport_info": {
        "metro": "Direct service to Jean-Drapeau station",
        "shuttle": "Water taxi service available"
      },
      "weather_info": {
        "humidity": "65%",
        "rainfall": "Moderate",
        "averageTemp": "23°C"
      },
      "nearest_airports": [
        {
          "code": "YUL",
          "name": "Montréal-Pierre Elliott Trudeau International Airport",
          "distance": "20km",
          "transferTime": "25-35 minutes"
        }
      ],
      "city": "Montreal",
      "latitude": "45.5017",
      "longitude": "-73.5228",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.361 km",
        "corners": 14,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:13.078",
          "year": 2019,
          "driver": "Valtteri Bottas"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Aston Martin",
          "driver": "Fernando Alonso",
          "position": 2
        },
        {
          "team": "Mercedes",
          "driver": "Lewis Hamilton",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Old Montreal",
          "description": "Historic district with cobblestone streets"
        },
        {
          "name": "Mount Royal",
          "description": "Park offering panoramic city views"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "7506.00",
      "season": "summer",
      "supporting_series": [
        {
          "round": 5,
          "series": "F1 Academy"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-06-19T23:00:00.000Z",
      "weekend_end": "2025-06-21T23:00:00.000Z"
    },
    {
      "id": 18,
      "name": "Dutch Grand Prix 2025",
      "circuit": "Circuit Zandvoort",
      "country": "Netherlands",
      "date": "2025-08-28T23:00:00.000Z",
      "image_url": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Netherlands.jpg",
      "description": "Seaside circuit with banked corners and passionate orange-clad fans.",
      "transport_info": {
        "train": "Direct service to Zandvoort aan Zee station",
        "bicycle": "Dedicated cycling routes available"
      },
      "weather_info": {
        "humidity": "75%",
        "rainfall": "Moderate",
        "averageTemp": "18°C"
      },
      "nearest_airports": [
        {
          "code": "AMS",
          "name": "Amsterdam Airport Schiphol",
          "distance": "30km",
          "transferTime": "30-40 minutes"
        }
      ],
      "city": "Zandvoort",
      "latitude": "52.3888",
      "longitude": "4.5409",
      "schedule": {},
      "ticket_info": {},
      "circuit_info": {
        "length": "4.259",
        "corners": 14,
        "drsZones": 2,
        "lapRecord": {
          "time": "1:11.097",
          "year": 2021,
          "driver": "Lewis Hamilton"
        }
      },
      "last_year_podium": [
        {
          "team": "Red Bull Racing",
          "driver": "Max Verstappen",
          "position": 1
        },
        {
          "team": "Aston Martin",
          "driver": "Fernando Alonso",
          "position": 2
        },
        {
          "team": "Alpine",
          "driver": "Pierre Gasly",
          "position": 3
        }
      ],
      "track_map_url": null,
      "status": "upcoming",
      "slug": null,
      "local_attractions": [
        {
          "name": "Zandvoort Beach",
          "description": "Popular coastal resort"
        },
        {
          "name": "Circuit Museum",
          "description": "Racing heritage exhibition"
        }
      ],
      "suggested_itineraries": [],
      "availability": "available",
      "price": "2854.00",
      "season": "fall",
      "supporting_series": [
        {
          "round": 5,
          "series": "F1 Academy"
        }
      ],
      "is_sprint_weekend": false,
      "weekend_start": "2025-08-26T23:00:00.000Z",
      "weekend_end": "2025-08-30T23:00:00.000Z"
    }
  ],
  "itineraries": [],
  "saved_itineraries": [
    {
      "id": 11,
      "race_id": 4,
      "user_id": 1,
      "name": "Hellom8",
      "activities": [
        {
          "id": "4",
          "name": "Racing Museum",
          "type": "attraction",
          "price": {
            "amount": 25,
            "currency": "USD"
          },
          "rating": 4.3,
          "category": "entertainment",
          "distance": "3 km from circuit",
          "duration": "2 hr hours",
          "location": {
            "lat": 40.7428,
            "lng": -74.036
          },
          "timeSlot": "09:30 AM",
          "description": "Learn about local motorsport history",
          "visitDuration": "2 hr hours"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr hours",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "timeSlot": "12:00 PM",
          "description": "Taste authentic local cuisine and street food",
          "visitDuration": "3 hr hours"
        }
      ],
      "created_at": "2024-12-09T19:31:23.529Z",
      "share_token": null,
      "date": "2024-12-12T12:00:00.000Z"
    },
    {
      "id": 12,
      "race_id": 2,
      "user_id": 1,
      "name": "new itinerary",
      "activities": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "timeSlot": "10:30",
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "timeSlot": "14:00",
          "description": "Race on a professional karting circuit"
        }
      ],
      "created_at": "2024-12-09T22:24:26.114Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 2,
      "race_id": 4,
      "user_id": 1,
      "name": "Test",
      "activities": [
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "timeSlot": "09:30",
          "travelTime": {
            "fromCircuit": "15 min from circuit",
            "fromPrevious": "10 min travel time"
          },
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "1",
          "name": "City Walking Tour",
          "type": "guided",
          "price": {
            "amount": 30,
            "currency": "USD"
          },
          "rating": 4.5,
          "category": "cultural",
          "distance": "2 km from circuit",
          "duration": "2.5 hr",
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "timeSlot": "13:00",
          "travelTime": {
            "fromCircuit": "15 min from circuit",
            "fromPrevious": "10 min travel time"
          },
          "description": "Explore historic landmarks and architecture"
        }
      ],
      "created_at": "2024-12-09T08:51:27.497Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 5,
      "race_id": 4,
      "user_id": 1,
      "name": "testing",
      "activities": [
        {
          "id": "2",
          "name": "Karting Experience",
          "distance": "5 km from circuit",
          "timeSlot": "1:00 PM",
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "distance": "3 km from circuit",
          "timeSlot": "09:00 AM",
          "description": "Learn about local motorsport history"
        }
      ],
      "created_at": "2024-12-09T09:23:24.554Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 8,
      "race_id": 2,
      "user_id": 1,
      "name": "tes6",
      "activities": [
        {
          "id": "5",
          "name": "Motorsport Mall",
          "distance": "4 km from circuit",
          "timeSlot": "09:00 AM",
          "description": "F1 merchandise and local souvenirs"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "distance": "1.5 km from circuit",
          "timeSlot": "11:00 AM",
          "description": "Taste authentic local cuisine and street food"
        }
      ],
      "created_at": "2024-12-09T10:16:07.148Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 6,
      "race_id": 2,
      "user_id": 1,
      "name": "test3",
      "activities": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "distance": "2 km from circuit",
          "timeSlot": "10:00 AM",
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "distance": "3 km from circuit",
          "timeSlot": "3:00 PM",
          "description": "Learn about local motorsport history"
        }
      ],
      "created_at": "2024-12-09T09:42:31.823Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 7,
      "race_id": 4,
      "user_id": 1,
      "name": "Test4",
      "activities": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "distance": "2 km from circuit",
          "timeSlot": "09:00 AM",
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "distance": "3 km from circuit",
          "timeSlot": "1:00 PM",
          "description": "Learn about local motorsport history"
        }
      ],
      "created_at": "2024-12-09T09:46:30.004Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 9,
      "race_id": 4,
      "user_id": 1,
      "name": "test7",
      "activities": [
        {
          "id": "2",
          "name": "Karting Experience",
          "distance": "5 km from circuit",
          "timeSlot": "09:00 AM",
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "4",
          "name": "Racing Museum",
          "distance": "3 km from circuit",
          "timeSlot": "1:00 PM",
          "description": "Learn about local motorsport history"
        }
      ],
      "created_at": "2024-12-09T10:18:36.737Z",
      "share_token": null,
      "date": "2024-12-10T01:53:05.534Z"
    },
    {
      "id": 13,
      "race_id": 4,
      "user_id": 1,
      "name": "lasttest",
      "activities": [
        {
          "id": "2",
          "name": "Karting Experience",
          "type": "activity",
          "price": {
            "amount": 45,
            "currency": "USD"
          },
          "rating": 4.8,
          "category": "sports",
          "distance": "5 km from circuit",
          "duration": "1.5 hr",
          "location": {
            "lat": 40.7228,
            "lng": -74.016
          },
          "timeSlot": "10:30",
          "description": "Race on a professional karting circuit"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "type": "guided",
          "price": {
            "amount": 55,
            "currency": "USD"
          },
          "rating": 4.6,
          "category": "dining",
          "distance": "1.5 km from circuit",
          "duration": "3 hr",
          "location": {
            "lat": 40.7328,
            "lng": -74.026
          },
          "timeSlot": "12:15",
          "description": "Taste authentic local cuisine and street food"
        }
      ],
      "created_at": "2024-12-10T01:59:51.624Z",
      "share_token": null,
      "date": "2024-12-13T12:00:00.000Z"
    },
    {
      "id": 4,
      "race_id": 4,
      "user_id": 1,
      "name": "test",
      "activities": [
        {
          "id": "1",
          "name": "City Walking Tour",
          "distance": "2 km from circuit",
          "timeSlot": "09:00 AM",
          "description": "Explore historic landmarks and architecture"
        },
        {
          "id": "3",
          "name": "Local Food Tour",
          "distance": "1.5 km from circuit",
          "timeSlot": "1:00 PM",
          "description": "Taste authentic local cuisine and street food"
        },
        {
          "id": "5",
          "name": "Motorsport Mall",
          "distance": "4 km from circuit",
          "timeSlot": "5:00 PM",
          "description": "F1 merchandise and local souvenirs"
        }
      ],
      "created_at": "2024-12-09T09:20:51.820Z",
      "share_token": null,
      "date": "2024-12-12T12:00:00.000Z"
    }
  ],
  "tickets": []
}'::jsonb
);

-- Add unique constraints
ALTER TABLE circuits ADD CONSTRAINT circuits_name_key UNIQUE (name);
ALTER TABLE circuit_details ADD CONSTRAINT circuit_details_circuit_id_key UNIQUE (circuit_id);
ALTER TABLE circuit_locations ADD CONSTRAINT circuit_locations_circuit_id_place_id_key UNIQUE (circuit_id, place_id);
ALTER TABLE transport_info ADD CONSTRAINT transport_info_circuit_id_type_key UNIQUE (circuit_id, type);
ALTER TABLE local_attractions ADD CONSTRAINT local_attractions_circuit_id_name_key UNIQUE (circuit_id, name);
ALTER TABLE races ADD CONSTRAINT races_circuit_id_date_key UNIQUE (circuit_id, date);
ALTER TABLE supporting_series ADD CONSTRAINT supporting_series_race_id_series_key UNIQUE (race_id, series);
ALTER TABLE podium_results ADD CONSTRAINT podium_results_circuit_id_year_position_key UNIQUE (circuit_id, year, position);


-- Insert circuits
INSERT INTO circuits (id, name, location, country, latitude, longitude, image_url)
SELECT DISTINCT ON (races->>'circuit')
  gen_random_uuid(),
  races->>'circuit',
  COALESCE(races->>'city', races->>'circuit'),
  races->>'country',
  NULLIF(REGEXP_REPLACE(races->>'latitude', '[^0-9.-]', '', 'g'), '')::numeric,
  NULLIF(REGEXP_REPLACE(races->>'longitude', '[^0-9.-]', '', 'g'), '')::numeric,
  NULLIF(races->>'image_url', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
WHERE races->>'circuit' IS NOT NULL
  AND races->>'country' IS NOT NULL;


-- Insert circuit details
INSERT INTO circuit_details (id, circuit_id, length, corners, drs_zones, lap_record_time, lap_record_year, lap_record_driver)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(REGEXP_REPLACE(ci->>'length', '[^0-9.]', '', 'g'), '')::numeric,
  NULLIF((ci->>'corners'), '')::integer,
  NULLIF((ci->>'drsZones'), '')::integer,
  NULLIF(ci->'lapRecord'->>'time', ''),
  NULLIF((ci->'lapRecord'->>'year'), '')::integer,
  NULLIF(ci->'lapRecord'->>'driver', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_extract_path(races, 'circuit_info') AS ci
JOIN circuits c ON c.name = races->>'circuit'
WHERE ci IS NOT NULL;


-- Insert airports
INSERT INTO airports (id, circuit_id, code, name, distance, transfer_time)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(a->>'code', ''),
  NULLIF(a->>'name', ''),
  NULLIF(REGEXP_REPLACE(a->>'distance', '[^0-9.]', '', 'g'), '')::numeric,
  COALESCE(NULLIF(a->>'transfer_time', ''), '1 hour')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'nearest_airports') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'nearest_airports' IS NOT NULL
  AND a->>'name' IS NOT NULL
  AND a->>'code' IS NOT NULL;


-- Insert circuit locations
INSERT INTO circuit_locations (id, circuit_id, type, name, description, distance_from_circuit, place_id, latitude, longitude)
SELECT
  gen_random_uuid(),
  c.id,
  'transport'::location_type,
  NULLIF(a->>'name', ''),
  NULL,
  NULLIF(REGEXP_REPLACE(a->>'distance', '[^0-9.]', '', 'g'), '')::numeric,
  NULLIF(a->>'code', ''),
  COALESCE(NULLIF(REGEXP_REPLACE(a->>'latitude', '[^0-9.-]', '', 'g'), '')::numeric, c.latitude),
  COALESCE(NULLIF(REGEXP_REPLACE(a->>'longitude', '[^0-9.-]', '', 'g'), '')::numeric, c.longitude)
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'nearest_airports') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'nearest_airports' IS NOT NULL
  AND a->>'name' IS NOT NULL;


-- Insert transport info
INSERT INTO transport_info (id, circuit_id, type, name, description)
SELECT
  gen_random_uuid(),
  c.id,
  t.key,
  t.key,
  t.value
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_each_text(races->'transport_info') AS t(key, value)
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'transport_info' IS NOT NULL
  AND t.key IS NOT NULL
  AND t.value IS NOT NULL;


-- Insert local attractions
INSERT INTO local_attractions (id, circuit_id, name, description)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(a->>'name', ''),
  NULLIF(a->>'description', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'local_attractions') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'local_attractions' IS NOT NULL
  AND a->>'name' IS NOT NULL
  AND a->>'description' IS NOT NULL;


-- Insert races
INSERT INTO races (id, circuit_id, name, date, season, round, country, status, slug, is_sprint_weekend, description, weekend_start, weekend_end)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(races->>'name', ''),
  (races->>'date')::timestamp with time zone,
  EXTRACT(YEAR FROM (races->>'date')::timestamp),
  ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM (races->>'date')::timestamp) ORDER BY (races->>'date')::timestamp),
  races->>'country',
  COALESCE(NULLIF(races->>'status', ''), 'upcoming')::race_status,
  NULLIF(races->>'slug', ''),
  COALESCE((races->>'is_sprint_weekend')::boolean, false),
  NULLIF(races->>'description', ''),
  NULLIF(races->>'weekend_start', '')::timestamp with time zone,
  NULLIF(races->>'weekend_end', '')::timestamp with time zone
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->>'date' IS NOT NULL
  AND races->>'country' IS NOT NULL;


-- Insert supporting series
INSERT INTO supporting_series (id, race_id, series, round)
SELECT
  gen_random_uuid(),
  r.id,
  NULLIF(s->>'series', ''),
  NULLIF((s->>'round'), '')::integer
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'supporting_series') AS s
JOIN circuits c ON c.name = races->>'circuit'
JOIN races r ON r.circuit_id = c.id AND r.name = races->>'name'
WHERE races->'supporting_series' IS NOT NULL
  AND s->>'series' IS NOT NULL;


-- Insert podium results
INSERT INTO podium_results (id, circuit_id, position, driver, team, year)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF((p->>'position'), '')::integer,
  NULLIF(p->>'driver', ''),
  NULLIF(p->>'team', ''),
  EXTRACT(YEAR FROM (races->>'date')::timestamp) - 1
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'last_year_podium') AS p
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'last_year_podium' IS NOT NULL
  AND jsonb_typeof(races->'last_year_podium') = 'array'
  AND p->>'driver' IS NOT NULL
  AND p->>'team' IS NOT NULL
  AND p->>'position' IS NOT NULL;


-- Insert saved itineraries
INSERT INTO saved_itineraries (id, user_id, race_id, itinerary, created_at, updated_at)
SELECT
  (i->>'id')::integer,
  (i->>'user_id')::text,
  r.id as race_id,
  jsonb_build_object(
    'name', i->>'name',
    'date', i->>'date',
    'share_token', i->>'share_token',
    'activities', i->'activities'
  ) as itinerary,
  (i->>'created_at')::timestamp with time zone,
  (i->>'created_at')::timestamp with time zone as updated_at
FROM temp_json_data,
jsonb_array_elements(content->'saved_itineraries') AS i
JOIN races r ON r.id = (
  SELECT id FROM races 
  WHERE round = (i->>'race_id')::integer 
  LIMIT 1
);


-- Insert activities
INSERT INTO activities (id, itinerary_id, type, category, title, description, start_time, end_time, location, notes)
WITH parsed_times AS (
  SELECT
    si.id as itinerary_id,
    a,
    CASE 
      WHEN a->>'timeSlot' ~ '(\d{1,2}):(\d{2})\s*(AM|PM)' THEN
        (si.itinerary->>'date')::timestamp with time zone + 
        make_interval(
          hours := (
            CASE 
              WHEN a->>'timeSlot' ~ 'PM' AND substring(a->>'timeSlot' from '(\d{1,2}):')::int < 12 THEN
                substring(a->>'timeSlot' from '(\d{1,2}):')::int + 12
              WHEN a->>'timeSlot' ~ 'AM' AND substring(a->>'timeSlot' from '(\d{1,2}):')::int = 12 THEN
                0
              ELSE
                substring(a->>'timeSlot' from '(\d{1,2}):')::int
            END
          ),
          mins := substring(a->>'timeSlot' from ':(\d{2})')::int
        )
      ELSE
        (si.itinerary->>'date')::timestamp with time zone + '9:00'::interval
    END as start_time
  FROM saved_itineraries si,
  jsonb_array_elements(si.itinerary->'activities') as a
  WHERE a->>'name' IS NOT NULL
)
SELECT
  gen_random_uuid(),
  itinerary_id,
  COALESCE(a->>'type', 'activity'),
  COALESCE(a->>'category', 'other'),
  a->>'name' as title,
  a->>'description',
  start_time,
  start_time + COALESCE(
    CASE 
      WHEN a->>'duration' ~ '(\d+(\.\d+)?)(\s*hr)' THEN
        (substring(a->>'duration' from '(\d+(\.\d+)?)')::numeric || ' hours')::interval
      ELSE
        '2 hours'::interval
    END,
    '2 hours'::interval
  ) as end_time,
  COALESCE(a->>'distance', '') || CASE WHEN a->>'distance' IS NOT NULL THEN ' from circuit' ELSE '' END as location,
  jsonb_build_object(
    'price', a->'price',
    'rating', a->'rating',
    'location', a->'location',
    'travelTime', a->'travelTime'
  )::text as notes
FROM parsed_times;


-- Clean up
DROP TABLE temp_json_data;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;