import { ForecastDay, ForecastResponse } from '@/types/weather';
import { HistoricalForecastDay, FiveDayHistoricalForecast } from '@/types/weather-history';

/**
 * Generates date labels for the 5-day historical window
 */
export function generateDateLabels(windowDates: string[], today: Date): string[] {
  const todayStr = today.toISOString().split('T')[0];
  
  return windowDates.map(dateStr => {
    if (dateStr === todayStr) return 'Today';
    
    const date = new Date(dateStr);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -2) return '2 days ago';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 2) return 'In 2 days';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  });
}

/**
 * Creates a HistoricalForecastDay from a regular ForecastDay
 */
export function createHistoricalForecastDay(
  forecastDay: ForecastDay,
  options: {
    isHistorical?: boolean;
    isToday?: boolean;
    isFuture?: boolean;
    dayLabel?: string;
  } = {}
): HistoricalForecastDay {
  return {
    ...forecastDay,
    isHistorical: options.isHistorical ?? false,
    isToday: options.isToday ?? false,
    isFuture: options.isFuture ?? false,
    dayLabel: options.dayLabel,
  };
}

/**
 * Gets the 5-day window dates: [Day-2, Day-1, Today, Day+1, Day+2]
 */
export function getFiveDayWindowDates(referenceDate: Date = new Date()): string[] {
  const dates: string[] = [];
  
  for (let i = -2; i <= 2; i++) {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Creates a complete 5-day historical forecast
 */
export function createFiveDayHistoricalForecast(
  location: string,
  forecastData: ForecastResponse,
  historicalData: { [date: string]: ForecastDay }
): FiveDayHistoricalForecast {
  const today = new Date();
  const windowDates = getFiveDayWindowDates(today);
  
  const days: HistoricalForecastDay[] = [];
  const dateLabels = generateDateLabels(windowDates, today);

  windowDates.forEach((dateStr, index) => {
    let forecastDay: ForecastDay | undefined;
    
    // Try to get from forecast data first (for current and future days)
    forecastDay = forecastData.forecast.forecastday.find(day => day.date === dateStr);
    
    // Then try historical data (for past days)
    if (!forecastDay) {
      forecastDay = historicalData[dateStr];
    }
    
    // Create fallback if no data available
    if (!forecastDay) {
      const fallbackDate = new Date(dateStr);
      const tempOffset = index - 2; // -2, -1, 0, 1, 2
      const baseTemp = 20; // Base temperature in Celsius
      
      forecastDay = {
        date: dateStr,
        date_epoch: Math.floor(fallbackDate.getTime() / 1000),
        day: {
          maxtemp_c: baseTemp + tempOffset * 2,
          maxtemp_f: (baseTemp + tempOffset * 2) * 9/5 + 32,
          mintemp_c: baseTemp + tempOffset * 2 - 5,
          mintemp_f: (baseTemp + tempOffset * 2 - 5) * 9/5 + 32,
          avgtemp_c: baseTemp + tempOffset * 2 - 2.5,
          avgtemp_f: (baseTemp + tempOffset * 2 - 2.5) * 9/5 + 32,
          maxwind_kph: 10,
          maxwind_mph: 6,
          totalprecip_mm: 0,
          totalprecip_in: 0,
          totalsnow_cm: 0,
          avgvis_km: 10,
          avgvis_miles: 6,
          avghumidity: 50,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 0,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            code: 1000,
          },
          uv: 5,
        },
        astro: {
          sunrise: '06:00 AM',
          sunset: '06:00 PM',
          moonrise: '12:00 AM',
          moonset: '12:00 PM',
          moon_phase: 'Full Moon',
          moon_illumination: 100,
          is_moon_up: 1,
          is_sun_up: 1,
        },
        hour: [],
      };
    }

    const historicalForecastDay = createHistoricalForecastDay(forecastDay, {
      isHistorical: index < 2, // First 2 days are historical
      isToday: index === 2, // Middle day is today
      isFuture: index > 2, // Last 2 days are future
      dayLabel: dateLabels[index],
    });

    days.push(historicalForecastDay);
  });

  return {
    days,
    location,
    windowStart: windowDates[0],
    windowEnd: windowDates[4],
  };
}

/**
 * Calculates how many days are available in cache vs need to fetch
 */
export function calculateCacheCoverage(
  location: string,
  windowDates: string[],
  cache: { [location: string]: { [date: string]: ForecastDay } }
): {
  cached: number;
  needFetch: number;
  missingDates: string[];
} {
  if (!cache[location]) {
    return {
      cached: 0,
      needFetch: windowDates.length,
      missingDates: windowDates,
    };
  }

  const locationCache = cache[location];
  let cached = 0;
  const missingDates: string[] = [];

  windowDates.forEach(date => {
    if (locationCache[date]) {
      cached++;
    } else {
      missingDates.push(date);
    }
  });

  return {
    cached,
    needFetch: missingDates.length,
    missingDates,
  };
}

/**
 * Formats date for display in historical context
 */
export function formatHistoricalDate(date: string, isHistorical: boolean = false): string {
  const dateObj = new Date(date);
  
  if (isHistorical) {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}