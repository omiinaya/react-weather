import {
  CurrentWeatherResponse,
  ForecastResponse,
  ForecastDay,
  WeatherGovPoint,
  WeatherGovForecastPeriod,
} from '@/types/weather';
import type { WeatherGovForecast, WeatherGovObservation } from '@/lib/validation/weather';

const conditionCodeMap: Record<string, number> = {
  'Sunny': 1000,
  'Clear': 1000,
  'Fair': 1000,
  'Partly Cloudy': 1003,
  'Partly Sunny': 1003,
  'Mostly Clear': 1003,
  'Cloudy': 1006,
  'Overcast': 1009,
  'Mostly Cloudy': 1006,
  'Light Rain': 1183,
  'Rain': 1186,
  'Heavy Rain': 1192,
  'Light Snow': 1210,
  'Snow': 1213,
  'Heavy Snow': 1219,
  'Thunderstorms': 1087,
  'Fog': 1147,
  'Mist': 1147,
  default: 1000,
};

function getConditionCode(text: string): number {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('thunder') || lowerText.includes('t-storm')) return 1087;
  if (lowerText.includes('heavy snow')) return 1219;
  if (lowerText.includes('snow') && !lowerText.includes('light')) return 1213;
  if (lowerText.includes('light snow') || lowerText.includes('flurries')) return 1210;
  if (lowerText.includes('heavy rain')) return 1192;
  if (lowerText.includes('rain') && !lowerText.includes('light')) return 1186;
  if (lowerText.includes('light rain') || lowerText.includes('drizzle') || lowerText.includes('showers')) return 1183;
  if (lowerText.includes('fog') || lowerText.includes('mist') || lowerText.includes('haze')) return 1147;
  if (lowerText.includes('overcast') || lowerText.includes('mostly cloudy')) return 1009;
  if (lowerText.includes('cloudy') || lowerText.includes('mostly clear')) return 1006;
  if (lowerText.includes('partly') || lowerText.includes('partly sunny') || lowerText.includes('partly cloudy')) return 1003;
  if (lowerText.includes('sunny') || lowerText.includes('clear') || lowerText.includes('fair')) return 1000;
  return conditionCodeMap.default;
}

function parseWindSpeed(windSpeedStr: string): { mph: number; kph: number; direction: string } {
  const mphMatch = windSpeedStr.match(/(\d+)\s*to\s*(\d+)\s*mph/i);
  const singleMphMatch = windSpeedStr.match(/(\d+)\s*mph/i);
  
  let mph = 0;
  let direction = 'N';
  
  if (mphMatch) {
    mph = (parseInt(mphMatch[1]) + parseInt(mphMatch[2])) / 2;
  } else if (singleMphMatch) {
    mph = parseInt(singleMphMatch[1]);
  }
  
  const kph = Math.round(mph * 1.60934);
  
  const dirMatch = windSpeedStr.match(/[A-Z]{3}/);
  if (dirMatch) {
    direction = dirMatch[0];
  }
  
  return { mph, kph, direction };
}

function celsiusToFahrenheit(celsius: number): number {
  return Math.round(celsius * 9 / 5 + 32);
}

function getWindDirection(degree: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}

export class WeatherGovTransformer {
  static transformPointToLocation(point: WeatherGovPoint, lat: number, lon: number): CurrentWeatherResponse['location'] {
    const city = point.properties.relativeLocation.properties.city;
    const state = point.properties.relativeLocation.properties.state;
    const now = new Date();
    
    return {
      name: city,
      region: state,
      country: 'US',
      lat: lat,
      lon: lon,
      tz_id: point.properties.timeZone,
      localtime_epoch: Math.floor(now.getTime() / 1000),
      localtime: now.toLocaleString('en-US', { timeZone: point.properties.timeZone }),
    };
  }

  static transformObservationToCurrentWeather(
    observation: WeatherGovObservation | null,
    location: CurrentWeatherResponse['location'],
    forecast?: WeatherGovForecast
  ): CurrentWeatherResponse['current'] {
    const props = observation?.properties;
    const now = new Date();

    const currentPeriod = forecast?.properties.periods.find(p => {
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      return now >= start && now <= end;
    });

    const isDay = currentPeriod?.isDaytime ? 1 : 0;

    let tempC, tempF, conditionText, conditionCode, iconUrl;

    if (observation && props) {
      tempC = props.temperature?.value ?? 0;
      tempF = celsiusToFahrenheit(tempC);
      conditionText = props.textDescription || 'Clear';
      conditionCode = getConditionCode(conditionText);
      iconUrl = props.icon || `https://api.weather.gov/icons/land/${isDay ? 'day' : 'night'}/skc?size=medium`;
    } else if (currentPeriod) {
      tempF = currentPeriod.temperature;
      tempC = Math.round((tempF - 32) * 5 / 9);
      conditionText = currentPeriod.shortForecast || 'Clear';
      conditionCode = getConditionCode(conditionText);
      iconUrl = currentPeriod.icon || `https://api.weather.gov/icons/land/${isDay ? 'day' : 'night'}/skc?size=medium`;
    } else {
      throw new Error('Weather data unavailable - no observation or forecast data provided');
    }

    const dewpointC = props?.dewpoint?.value ?? Math.round(tempC - 10);
    const windSpeedKmh = props?.windSpeed?.value ?? parseWindSpeed(currentPeriod?.windSpeed || '5 mph').kph;
    const windSpeedMph = Math.round(windSpeedKmh / 1.60934);
    const windDegree = props?.windDirection?.value ?? 0;

    const pressurePa = props?.barometricPressure?.value ?? 101325;
    const pressureMb = Math.round(pressurePa / 100);
    const pressureIn = Math.round((pressureMb / 33.864) * 100) / 100;

    const lastUpdated = props?.timestamp || (currentPeriod?.startTime ?? now.toISOString());

    return {
      last_updated_epoch: Math.floor(new Date(lastUpdated).getTime() / 1000),
      last_updated: lastUpdated,
      temp_c: tempC,
      temp_f: tempF,
      is_day: isDay,
      condition: {
        text: conditionText,
        icon: iconUrl,
        code: conditionCode,
      },
      wind_mph: windSpeedMph,
      wind_kph: Math.round(windSpeedKmh),
      wind_degree: windDegree,
      wind_dir: getWindDirection(windDegree),
      pressure_mb: pressureMb,
      pressure_in: pressureIn,
      precip_mm: props?.textDescription?.toLowerCase().includes('rain') ? 1 : 0,
      precip_in: props?.textDescription?.toLowerCase().includes('rain') ? 0.04 : 0,
      humidity: props?.relativeHumidity?.value ?? 50,
      cloud: 0,
      feelslike_c: tempC,
      feelslike_f: tempF,
      windchill_c: tempC,
      windchill_f: tempF,
      heatindex_c: tempC,
      heatindex_f: tempF,
      dewpoint_c: dewpointC,
      dewpoint_f: celsiusToFahrenheit(dewpointC),
      vis_km: props?.visibility?.value ?? 10,
      vis_miles: Math.round((props?.visibility?.value ?? 10) / 1.60934 * 10) / 10,
      uv: currentPeriod?.isDaytime ? 5 : 0,
      gust_mph: 0,
      gust_kph: 0,
    };
  }

  static transformForecastToResponse(
    point: WeatherGovPoint,
    observation: WeatherGovObservation | null,
    forecast: WeatherGovForecast
  ): ForecastResponse {
    const lat = point.geometry.coordinates[1] as number;
    const lon = point.geometry.coordinates[0] as number;
    const location = this.transformPointToLocation(point, lat, lon);
    const current = this.transformObservationToCurrentWeather(observation, location, forecast);
    
    const forecastDays = this.transformForecastPeriods(forecast.properties.periods);
    
    return {
      location,
      current,
      forecast: {
        forecastday: forecastDays,
      },
    };
  }

  static transformForecastPeriods(periods: WeatherGovForecastPeriod[]): ForecastDay[] {
    const days: Map<string, { date: string; date_epoch: number; daytime: WeatherGovForecastPeriod | null; nighttime: WeatherGovForecastPeriod | null }> = new Map();
    
    // Debug: log first few periods
    if (periods.length > 0) {
      console.log('First period:', periods[0].name, periods[0].startTime, periods[0].temperature);
      console.log('Last period:', periods[periods.length - 1].name, periods[periods.length - 1].startTime);
    }

    periods.forEach((period) => {
      // Extract date from API response (which is in ISO format like "2025-02-08T01:00:00Z")
      // Don't convert timezone - use the date as-is from the API
      const date = period.startTime.split('T')[0];

      if (!days.has(date)) {
        days.set(date, {
          date,
          date_epoch: Math.floor(new Date(date + 'T00:00:00Z').getTime() / 1000),
          daytime: null,
          nighttime: null,
        });
      }
      
      const dayData = days.get(date)!;
      if (period.isDaytime) {
        dayData.daytime = period;
      } else {
        dayData.nighttime = period;
      }
    });
    
    // Debug: Log all days before mapping
    console.log('Days map contents:', Array.from(days.keys()));

    const forecastDays = Array.from(days.values())
      .map(({ date, date_epoch, daytime, nighttime }) => {
        const dayPeriod = daytime || nighttime;

        // Use daytime temp for "day" and nighttime temp for "night"
        // Only use actual period data, don't cross-fallback between day/night
        const maxTempF = daytime?.temperature ?? 0;
        const minTempF = nighttime?.temperature ?? 0;

        // Debug
        console.log(`Transformed day ${date}: day=${daytime?.temperature}, night=${nighttime?.temperature}`);

          const maxTempC = Math.round((maxTempF - 32) * 5 / 9);
          const minTempC = Math.round((minTempF - 32) * 5 / 9);
        
        const conditionText = dayPeriod?.shortForecast ?? 'Clear';
        const conditionCode = getConditionCode(conditionText);
        const { mph: windMph, kph: windKph } = parseWindSpeed(dayPeriod?.windSpeed ?? '5 mph');
        const pop = dayPeriod?.probabilityOfPrecipitation?.value ?? 0;
        
        const midnightDate = new Date(date);
        midnightDate.setHours(0, 0, 0, 0);
        
        const isClear = conditionText.toLowerCase().includes('sunny') || conditionText.toLowerCase().includes('clear');
        const visibilityKm = isClear ? 16 : 10;
        
        return {
          date,
          date_epoch,
          day: {
            maxtemp_c: maxTempC,
            maxtemp_f: maxTempF,
            mintemp_c: minTempC,
            mintemp_f: minTempF,
            avgtemp_c: Math.round((maxTempC + minTempC) / 2),
            avgtemp_f: Math.round((maxTempF + minTempF) / 2),
            maxwind_mph: windMph,
            maxwind_kph: windKph,
            totalprecip_mm: pop > 0 ? Math.round((pop / 100) * 25.4) / 10 : 0,
            totalprecip_in: pop > 0 ? Math.round(((pop / 100) * 10) / 100 + 0.399) : 0,
            totalsnow_cm: 0,
            avgvis_km: visibilityKm,
            avgvis_miles: Math.round(visibilityKm / 1.60934 * 10) / 10,
            avghumidity: 65,
            daily_will_it_rain: pop > 30 ? 1 : 0,
            daily_chance_of_rain: pop,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: conditionText,
              icon: dayPeriod?.icon ?? `https://api.weather.gov/icons/land/day/skc?size=medium`,
              code: conditionCode,
            },
            uv: dayPeriod?.isDaytime ? 5 : 0,
          },
          astro: {
            sunrise: '06:00 AM',
            sunset: '06:00 PM',
            moonrise: '12:00 AM',
            moonset: '12:00 PM',
            moon_phase: 'New',
            moon_illumination: 0,
            is_moon_up: 0,
            is_sun_up: dayPeriod?.isDaytime ? 1 : 0,
          },
          hour: [],
        };
      })
      .filter(day => {
        const dayDate = new Date(day.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dayDate >= today;
      })
      .slice(0, 5);
    
    return forecastDays;
  }
}
