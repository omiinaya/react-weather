import axios from 'axios';
import {
  currentWeatherResponseSchema,
  forecastResponseSchema,
  weatherErrorSchema,
  type CurrentWeatherResponse,
  type ForecastResponse,
} from '@/lib/validation/weather';
import { extendForecastToFiveDays } from '@/lib/utils/forecast-extension';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export class WeatherAPIError extends Error {
  constructor(
    public code: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

export class WeatherAPIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || process.env.WEATHER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY or NEXT_PUBLIC_WEATHER_API_KEY environment variable is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T> {
    const url = `${WEATHER_API_BASE_URL}${endpoint}`;
    const requestParams = {
      key: this.apiKey,
      ...params,
    };
    
    try {
      const response = await axios.get(url, {
        params: requestParams,
        timeout: 10000, // 10 second timeout
      });
      
      // Log API responses for monitoring
      if (endpoint.includes('forecast')) {
        console.log('Weather forecast dates:', response.data?.forecast?.forecastday?.map((day: any) => ({
          date: day.date,
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        })));
      }
      
      return response.data;
    } catch (error) {
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          try {
            const errorData = weatherErrorSchema.parse(error.response.data);
            throw new WeatherAPIError(
              errorData.error.code,
              errorData.error.message,
              error
            );
          } catch {
            // If validation fails, use generic error
            throw new WeatherAPIError(
              error.response?.status || 500,
              error.response?.statusText || 'Unknown API error',
              error
            );
          }
        }
        throw new WeatherAPIError(
          error.response?.status || 500,
          error.message,
          error
        );
      }
      throw new WeatherAPIError(500, 'Network error', error);
    }
  }

  async getCurrentWeather(location: string | { lat: number; lon: number }): Promise<CurrentWeatherResponse> {
    const query = typeof location === 'string' ? location : `${location.lat},${location.lon}`;
    const data = await this.makeRequest('/current.json', {
      q: query,
      aqi: 'no',
    });

    try {
      return currentWeatherResponseSchema.parse(data);
    } catch (error) {
      throw new WeatherAPIError(
        500,
        'Invalid response format from weather API',
        error
      );
    }
  }

  async getForecast(
    location: string | { lat: number; lon: number },
    days: number = 5  // Always request 5 days, extend if needed
  ): Promise<ForecastResponse> {
    if (days < 1 || days > 10) {
      throw new WeatherAPIError(400, 'Days must be between 1 and 10');
    }

    const query = typeof location === 'string' ? location : `${location.lat},${location.lon}`;
    
    // Always request maximum available days (5) from API
    const data = await this.makeRequest('/forecast.json', {
      q: query,
      days: 5, // Request 5 days regardless of parameter
      aqi: 'no',
      alerts: 'no',
    });

    try {
      const parsedResponse = forecastResponseSchema.parse(data);
      
      // Ensure we always return exactly 5 days
      return extendForecastToFiveDays(parsedResponse);
    } catch (error) {
      throw new WeatherAPIError(
        500,
        'Invalid response format from weather API',
        error
      );
    }
  }

  async searchLocations(query: string): Promise<unknown> {
    if (query.length < 2) {
      return [];
    }

    const data = await this.makeRequest('/search.json', {
      q: query,
    });

    // Note: WeatherAPI search endpoint returns an array of locations
    return data;
  }
}

// Create and export a function to get the service instance
let weatherAPIServiceInstance: WeatherAPIService | null = null;

export function getWeatherAPIService(): WeatherAPIService {
  if (!weatherAPIServiceInstance) {
    weatherAPIServiceInstance = new WeatherAPIService();
  }
  return weatherAPIServiceInstance;
}