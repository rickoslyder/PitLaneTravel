import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const unitGroupEnum = pgEnum("unit_group", ["us", "metric"])

export const raceWeatherTable = pgTable("race_weather", {
  id: uuid("id").defaultRandom().primaryKey(),
  raceId: uuid("race_id").notNull(),
  date: timestamp("date").notNull(),
  tempMax: text("temp_max").notNull(),
  tempMin: text("temp_min").notNull(),
  temp: text("temp").notNull(),
  feelsLike: text("feels_like").notNull(),
  dew: text("dew"),
  humidity: text("humidity").notNull(),
  precip: text("precip").notNull(),
  precipProb: text("precip_prob").notNull(),
  windSpeed: text("wind_speed").notNull(),
  windDir: text("wind_dir"),
  pressure: text("pressure"),
  cloudCover: text("cloud_cover"),
  visibility: text("visibility"),
  uvIndex: text("uv_index"),
  sunrise: text("sunrise").notNull(),
  sunset: text("sunset").notNull(),
  conditions: text("conditions").notNull(),
  icon: text("icon").notNull(),
  unitGroup: unitGroupEnum("unit_group").notNull().default("metric"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})
