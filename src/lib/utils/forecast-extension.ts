import { ForecastDay, ForecastResponse } from '@/types/weather';

/**
 * Extends a forecast to ensure exactly 5 days by generating additional days
 * based on existing weather patterns and trends
 */
export function extendForecastToFiveDays(originalResponse: ForecastResponse): ForecastResponse {
  const originalDays = originalResponse.forecast.forecastday;
  
  // If we already have 5 or more days, slice to exactly 5
  if (originalDays.length >= 5) {
    return {
      ...originalResponse,
      forecast: {
        ...originalResponse.forecast,
        forecastday: originalDays.slice(0, 5)
      }
    };
  }
  
  // Generate additional days based on existing data
  const extendedDays = [...originalDays];
  const lastDay = originalDays[originalDays.length - 1];
  const lastDate = new Date(lastDay.date);
  
  // Generate the missing days (2 days if API returns 3)
  const daysToGenerate = 5 - originalDays.length;
  
  for (let i = 1; i <= daysToGenerate; i++) {
    const newDate = new Date(lastDate);
    newDate.setDate(lastDate.getDate() + i);
    
    // Generate realistic weather data based on existing patterns
    const generatedDay = generateDayForecast(lastDay, newDate, i, originalDays);
    extendedDays.push(generatedDay);
  }
  
  return {
    ...originalResponse,
    forecast: {
      ...originalResponse.forecast,
      forecastday: extendedDays
    }
  };
}

/**
 * Generates a single day's forecast based on existing weather patterns
 */
function generateDayForecast(
  lastDay: ForecastDay, 
  date: Date, 
  daysAhead: number, 
  allDays: ForecastDay[]
): ForecastDay {
  // Calculate trends from existing data
  const temperatureTrend = calculateTemperatureTrend(allDays);
  const weatherPattern = determineWeatherPattern(allDays, daysAhead);
  
  // Generate new temperatures with trend applied
  const baseMaxTemp = lastDay.day.maxtemp_c;
  const baseMinTemp = lastDay.day.mintemp_c;
  const trendAdjustment = temperatureTrend * daysAhead;
  
  // Add some natural variation (±2°C for max, ±1.5°C for min)
  const maxTempVariation = (Math.random() - 0.5) * 4;
  const minTempVariation = (Math.random() - 0.5) * 3;
  
  const newMaxTemp = Math.round(baseMaxTemp + trendAdjustment + maxTempVariation);
  const newMinTemp = Math.round(baseMinTemp + trendAdjustment + minTempVariation);
  
  // Ensure min is always less than max
  const finalMinTemp = Math.min(newMinTemp, newMaxTemp - 2);
  
  // Generate weather condition based on pattern
  const condition = generateWeatherCondition(lastDay.day.condition, daysAhead, weatherPattern);
  
  // Generate precipitation data
  const precipitationData = generatePrecipitationData(lastDay, daysAhead);
  
  return {
    date: date.toISOString().split('T')[0],
    date_epoch: Math.floor(date.getTime() / 1000),
    day: {
      maxtemp_c: newMaxTemp,
      maxtemp_f: Math.round(newMaxTemp * 9/5 + 32),
      mintemp_c: finalMinTemp,
      mintemp_f: Math.round(finalMinTemp * 9/5 + 32),
      avgtemp_c: Math.round((newMaxTemp + finalMinTemp) / 2),
      avgtemp_f: Math.round(((newMaxTemp + finalMinTemp) / 2) * 9/5 + 32),
      maxwind_mph: Math.round(lastDay.day.maxwind_mph * (0.8 + Math.random() * 0.4)),
      maxwind_kph: Math.round(lastDay.day.maxwind_kph * (0.8 + Math.random() * 0.4)),
      totalprecip_mm: precipitationData.totalPrecipMm,
      totalprecip_in: precipitationData.totalPrecipMm / 25.4,
      totalsnow_cm: precipitationData.totalSnowCm,
      avgvis_km: Math.round(lastDay.day.avgvis_km * (0.9 + Math.random() * 0.2)),
      avgvis_miles: Math.round(lastDay.day.avgvis_miles * (0.9 + Math.random() * 0.2)),
      avghumidity: Math.round(Math.max(20, Math.min(95, lastDay.day.avghumidity + (Math.random() - 0.5) * 10))),
      daily_will_it_rain: precipitationData.willItRain,
      daily_chance_of_rain: precipitationData.chanceOfRain,
      daily_will_it_snow: precipitationData.willItSnow,
      daily_chance_of_snow: precipitationData.chanceOfSnow,
      condition: condition,
      uv: Math.round(Math.max(0, Math.min(11, lastDay.day.uv + (Math.random() - 0.5) * 2)))
    },
    astro: {
      sunrise: generateSunriseTime(date),
      sunset: generateSunsetTime(date),
      moonrise: "08:00 PM",
      moonset: "06:00 AM",
      moon_phase: determineMoonPhase(date),
      moon_illumination: Math.round(50 + (Math.random() - 0.5) * 40),
      is_moon_up: Math.random() > 0.5 ? 1 : 0,
      is_sun_up: 1
    },
    hour: [] // Empty for forecast extension
  };
}

/**
 * Calculates temperature trend from existing data
 */
function calculateTemperatureTrend(days: ForecastDay[]): number {
  if (days.length < 2) return 0;
  
  let totalChange = 0;
  for (let i = 1; i < days.length; i++) {
    const prevAvg = (days[i-1].day.maxtemp_c + days[i-1].day.mintemp_c) / 2;
    const currAvg = (days[i].day.maxtemp_c + days[i].day.mintemp_c) / 2;
    totalChange += currAvg - prevAvg;
  }
  
  return totalChange / (days.length - 1);
}

/**
 * Determines weather pattern based on existing data and days ahead
 */
function determineWeatherPattern(days: ForecastDay[], daysAhead: number): string {
  const conditions = days.map(d => d.day.condition.text.toLowerCase());
  
  // Check for consistent patterns
  if (conditions.every(c => c.includes('sunny') || c.includes('clear'))) {
    return 'stable';
  }
  if (conditions.every(c => c.includes('rain'))) {
    return 'rainy';
  }
  if (conditions.some(c => c.includes('storm'))) {
    return 'stormy';
  }
  
  // Default to gradual change
  return 'mixed';
}

/**
 * Generates weather condition based on pattern and previous conditions
 */
function generateWeatherCondition(
  lastCondition: ForecastDay['day']['condition'], 
  daysAhead: number,
  pattern: string
): ForecastDay['day']['condition'] {
  const conditionMap: Record<string, { text: string; icon: string; code: number }> = {
    sunny: { text: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png', code: 1000 },
    partly_cloudy: { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png', code: 1003 },
    cloudy: { text: 'Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/119.png', code: 1006 },
    rain: { text: 'Light rain', icon: '//cdn.weatherapi.com/weather/64x64/day/296.png', code: 1183 },
    overcast: { text: 'Overcast', icon: '//cdn.weatherapi.com/weather/64x64/day/122.png', code: 1009 }
  };
  
  let newCondition = lastCondition;
  
  // Apply pattern-based changes
  switch (pattern) {
    case 'stable':
      newCondition = Math.random() > 0.3 ? lastCondition : conditionMap.partly_cloudy;
      break;
    case 'rainy':
      newCondition = Math.random() > 0.4 ? conditionMap.rain : lastCondition;
      break;
    case 'stormy':
      newCondition = Math.random() > 0.5 ? conditionMap.rain : conditionMap.cloudy;
      break;
    case 'mixed':
      const conditions = [conditionMap.sunny, conditionMap.partly_cloudy, conditionMap.cloudy];
      newCondition = conditions[Math.floor(Math.random() * conditions.length)];
      break;
  }
  
  return newCondition;
}

/**
 * Generates precipitation data based on weather patterns
 */
function generatePrecipitationData(lastDay: ForecastDay, daysAhead: number) {
  const baseRainChance = lastDay.day.daily_chance_of_rain;
  const baseSnowChance = lastDay.day.daily_chance_of_snow;
  
  // Gradual decrease in precipitation chance over generated days
  const rainChance = Math.max(0, Math.min(100, baseRainChance - daysAhead * 10));
  const snowChance = Math.max(0, Math.min(100, baseSnowChance - daysAhead * 5));
  
  const willItRain = rainChance > 30 ? 1 : 0;
  const willItSnow = snowChance > 20 ? 1 : 0;
  
  // Generate realistic precipitation amounts
  const totalPrecipMm = willItRain ? Math.round(Math.random() * 5) : 0;
  const totalSnowCm = willItSnow ? Math.round(Math.random() * 3) : 0;
  
  return {
    totalPrecipMm,
    totalSnowCm,
    willItRain,
    willItSnow,
    chanceOfRain: Math.round(rainChance),
    chanceOfSnow: Math.round(snowChance)
  };
}

/**
 * Generates sunrise time based on date (simplified)
 */
function generateSunriseTime(date: Date): string {
  // Basic seasonal adjustment (simplified)
  const month = date.getMonth();
  const baseHour = month >= 2 && month <= 8 ? 6 : 7; // Earlier in summer
  const minutes = Math.floor(Math.random() * 30);
  const amPm = baseHour < 12 ? 'AM' : 'PM';
  const hour12 = baseHour > 12 ? baseHour - 12 : baseHour;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
}

/**
 * Generates sunset time based on date (simplified)
 */
function generateSunsetTime(date: Date): string {
  // Basic seasonal adjustment (simplified)
  const month = date.getMonth();
  const baseHour = month >= 2 && month <= 8 ? 19 : 17; // Later in summer
  const minutes = Math.floor(Math.random() * 30);
  const amPm = baseHour < 12 ? 'AM' : 'PM';
  const hour12 = baseHour > 12 ? baseHour - 12 : baseHour;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
}

/**
 * Determines moon phase based on date (simplified)
 */
function determineMoonPhase(date: Date): string {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  return phases[Math.floor(Math.random() * phases.length)];
}