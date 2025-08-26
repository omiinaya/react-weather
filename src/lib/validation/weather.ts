import { z } from 'zod';

// Base schemas
export const conditionSchema = z.object({
  text: z.string(),
  icon: z.string(),
  code: z.number(),
});

export const locationSchema = z.object({
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  tz_id: z.string(),
  localtime_epoch: z.number(),
  localtime: z.string(),
});

export const currentWeatherSchema = z.object({
  last_updated_epoch: z.number(),
  last_updated: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  is_day: z.number(),
  condition: conditionSchema,
  wind_mph: z.number(),
  wind_kph: z.number(),
  wind_degree: z.number(),
  wind_dir: z.string(),
  pressure_mb: z.number(),
  pressure_in: z.number(),
  precip_mm: z.number(),
  precip_in: z.number(),
  humidity: z.number(),
  cloud: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  windchill_c: z.number(),
  windchill_f: z.number(),
  heatindex_c: z.number(),
  heatindex_f: z.number(),
  dewpoint_c: z.number(),
  dewpoint_f: z.number(),
  vis_km: z.number(),
  vis_miles: z.number(),
  uv: z.number(),
  gust_mph: z.number(),
  gust_kph: z.number(),
});

export const forecastDaySchema = z.object({
  date: z.string(),
  date_epoch: z.number(),
  day: z.object({
    maxtemp_c: z.number(),
    maxtemp_f: z.number(),
    mintemp_c: z.number(),
    mintemp_f: z.number(),
    avgtemp_c: z.number(),
    avgtemp_f: z.number(),
    maxwind_mph: z.number(),
    maxwind_kph: z.number(),
    totalprecip_mm: z.number(),
    totalprecip_in: z.number(),
    totalsnow_cm: z.number(),
    avgvis_km: z.number(),
    avgvis_miles: z.number(),
    avghumidity: z.number(),
    daily_will_it_rain: z.number(),
    daily_chance_of_rain: z.number(),
    daily_will_it_snow: z.number(),
    daily_chance_of_snow: z.number(),
    condition: conditionSchema,
    uv: z.number(),
  }),
  astro: z.object({
    sunrise: z.string(),
    sunset: z.string(),
    moonrise: z.string(),
    moonset: z.string(),
    moon_phase: z.string(),
    moon_illumination: z.number(),
    is_moon_up: z.number(),
    is_sun_up: z.number(),
  }),
  hour: z.array(
    z.object({
      time_epoch: z.number(),
      time: z.string(),
      temp_c: z.number(),
      temp_f: z.number(),
      is_day: z.number(),
      condition: conditionSchema,
      wind_mph: z.number(),
      wind_kph: z.number(),
      wind_degree: z.number(),
      wind_dir: z.string(),
      pressure_mb: z.number(),
      pressure_in: z.number(),
      precip_mm: z.number(),
      precip_in: z.number(),
      humidity: z.number(),
      cloud: z.number(),
      feelslike_c: z.number(),
      feelslike_f: z.number(),
      windchill_c: z.number(),
      windchill_f: z.number(),
      heatindex_c: z.number(),
      heatindex_f: z.number(),
      dewpoint_c: z.number(),
      dewpoint_f: z.number(),
      vis_km: z.number(),
      vis_miles: z.number(),
      gust_mph: z.number(),
      gust_kph: z.number(),
      uv: z.number(),
      chance_of_rain: z.number(),
      chance_of_snow: z.number(),
    })
  ),
});

// Response schemas
export const currentWeatherResponseSchema = z.object({
  location: locationSchema,
  current: currentWeatherSchema,
});

export const forecastResponseSchema = z.object({
  location: locationSchema,
  current: currentWeatherSchema,
  forecast: z.object({
    forecastday: z.array(forecastDaySchema),
  }),
});

export const weatherErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
});

// Type exports
export type CurrentWeatherResponse = z.infer<typeof currentWeatherResponseSchema>;
export type ForecastResponse = z.infer<typeof forecastResponseSchema>;
export type WeatherError = z.infer<typeof weatherErrorSchema>;