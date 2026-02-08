import { ForecastResponse } from '@/types/weather';

/**
 * Slices forecast to a specified number of days
 * Does NOT generate fake data - only returns available real data
 */
export function extendForecastToFiveDays(originalResponse: ForecastResponse, days: number = 5): ForecastResponse {
  const originalDays = originalResponse.forecast.forecastday;
  
  // If we have enough days, slice to exactly the requested number
  if (originalDays.length >= days) {
    return {
      ...originalResponse,
      forecast: {
        ...originalResponse.forecast,
        forecastday: originalDays.slice(0, days)
      }
    };
  }
  
  // If we don't have enough days, return what we have
  // Do NOT generate fake data
  return {
    ...originalResponse,
    forecast: {
      ...originalResponse.forecast,
      forecastday: originalDays
    }
  };
}
