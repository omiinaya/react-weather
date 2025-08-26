import { WeatherAPIError } from '@/lib/api/weather-api';

// Type guard to check if error has code property
function isWeatherAPIError(error: unknown): error is WeatherAPIError {
  return error instanceof WeatherAPIError;
}

// Type guard to check if error is an Error object
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function handleWeatherError(error: unknown): string {
  if (isWeatherAPIError(error)) {
    switch (error.code) {
      case 1006:
        return 'Location not found. Please try another city name.';
      case 1003:
        return 'Please enter a location to search for.';
      case 1005:
        return 'Invalid API URL. Please check your configuration.';
      case 2006:
        return 'Invalid API key. Please check your configuration.';
      case 2007:
        return 'API key has been disabled. Please contact support.';
      case 2008:
        return 'API key has reached its usage limit. Please try again later.';
      case 2009:
        return 'API key does not have access to this resource.';
      case 9000:
        return 'JSON format error. Please try again.';
      case 9001:
        return 'JSON encoding error. Please try again.';
      case 9999:
        return 'Internal application error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  if (isError(error)) {
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  return 'An unexpected error occurred. Please try again.';
}

export function isNetworkError(error: unknown): boolean {
  if (isWeatherAPIError(error)) {
    return error.code >= 500 || error.message.includes('Network');
  }
  
  if (isError(error)) {
    return error.message.includes('Network') || error.message.includes('timeout');
  }
  
  return false;
}

export function shouldRetry(error: unknown): boolean {
  if (isWeatherAPIError(error)) {
    // Retry on network errors and server errors (5xx)
    return error.code >= 500 || error.message.includes('Network');
  }
  
  return false;
}