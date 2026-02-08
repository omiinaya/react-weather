import axios from 'axios';
import {
  currentWeatherResponseSchema,
  forecastResponseSchema,
  weatherGovForecastSchema,
  weatherGovObservationSchema,
  type CurrentWeatherResponse,
  type ForecastResponse,
  type WeatherGovForecast,
  type WeatherGovObservation,
} from '@/lib/validation/weather';
import { extendForecastToFiveDays } from '@/lib/utils/forecast-extension';
import { WeatherGovTransformer } from '@/lib/utils/weather-gov-transformer';
import type { WeatherGovPoint, WeatherGovStations } from '@/types/weather';

const WEATHER_GOV_BASE_URL = 'https://api.weather.gov';

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
  private userAgent: string;

  constructor() {
    this.userAgent = process.env.NEXT_PUBLIC_USER_AGENT || 'react-weather-app';
  }

  private getWeatherGovUrl(endpoint: string): string {
    const isClientSide = typeof window !== 'undefined';

    if (isClientSide) {
      return `/api/weather-proxy?path=${encodeURIComponent(endpoint)}`;
    } else {
      return `${WEATHER_GOV_BASE_URL}${endpoint}`;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    needData: boolean = true
  ): Promise<T> {
    const url = this.getWeatherGovUrl(endpoint);

    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/geo+json',
        },
        timeout: 15000,
      });

      if (!needData) {
        return response.data as T;
      }

      const data = response.data;

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new WeatherAPIError(
            error.response.status,
            error.response.statusText || 'API error',
            error
          );
        }
        throw new WeatherAPIError(500, error.message, error);
      }
      throw new WeatherAPIError(500, 'Network error', error);
    }
  }

  async getPointData(lat: number, lon: number): Promise<WeatherGovPoint> {
    const data = await this.makeRequest<WeatherGovPoint>(`/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
    
    if (!data.properties?.gridId || !data.properties?.gridX || !data.properties?.gridY) {
      throw new WeatherAPIError(404, 'Location not covered by NWS');
    }
    
    return data;
  }

  async getForecast(
    location: string | { lat: number; lon: number },
    _days?: number
  ): Promise<ForecastResponse> {
    let lat: number, lon: number;

    if (typeof location === 'string') {
      const coords = await this.geocodeLocation(location);
      lat = coords.lat;
      lon = coords.lon;
    } else {
      lat = location.lat;
      lon = location.lon;
    }

    const point = await this.getPointData(lat, lon);

    const forecastData = await this.makeRequest<{ properties?: { periods?: unknown[] } }>(
      `/gridpoints/${point.properties.gridId}/${point.properties.gridX},${point.properties.gridY}/forecast`
    );

    const forecast = weatherGovForecastSchema.parse(forecastData);

    let observation: WeatherGovObservation | null = null;

    try {
      observation = await this.getCurrentObservation(point);
    } catch {
      console.warn('Could not get current observation for forecast, using forecast data only');
    }

    const response = WeatherGovTransformer.transformForecastToResponse(point, observation, forecast);

    const parsedResponse = forecastResponseSchema.parse(response);

    return extendForecastToFiveDays(parsedResponse, 5);
  }

  async getCurrentWeather(location: string | { lat: number; lon: number }): Promise<CurrentWeatherResponse> {
    let lat: number, lon: number;

    if (typeof location === 'string') {
      const coords = await this.geocodeLocation(location);
      lat = coords.lat;
      lon = coords.lon;
    } else {
      lat = location.lat;
      lon = location.lon;
    }

    const point = await this.getPointData(lat, lon);

    let observation: WeatherGovObservation | null = null;
    let forecastResponse: WeatherGovForecast | null = null;

    try {
      observation = await this.getCurrentObservation(point);
    } catch (error) {
      console.warn('Could not get current observation, using forecast as fallback');
    }

    if (!observation) {
      try {
        const forecastData = await this.makeRequest<{ properties?: { periods?: unknown[] } }>(
          `/gridpoints/${point.properties.gridId}/${point.properties.gridX},${point.properties.gridY}/forecast`
        );
        forecastResponse = weatherGovForecastSchema.parse(forecastData);
      } catch {
        console.error('Failed to get forecast fallback');
      }
    }

    const locationData = WeatherGovTransformer.transformPointToLocation(point, lat, lon);
    const currentWeather = WeatherGovTransformer.transformObservationToCurrentWeather(observation, locationData, forecastResponse || undefined);

    const response: CurrentWeatherResponse = {
      location: locationData,
      current: currentWeather,
    };

    try {
      return currentWeatherResponseSchema.parse(response);
    } catch (error) {
      throw new WeatherAPIError(
        500,
        'Invalid response format from weather API',
        error
      );
    }
  }

  private async getCurrentObservation(point: WeatherGovPoint) {
    try {
      const stationsData = await this.makeRequest<WeatherGovStations>(
        `/gridpoints/${point.properties.gridId}/${point.properties.gridX},${point.properties.gridY}/stations`
      );

      if (!stationsData.features || stationsData.features.length === 0) {
        throw new WeatherAPIError(404, 'No weather stations found for this location');
      }

      const stationId = stationsData.features[0].properties.stationIdentifier;
      const observationData = await this.makeRequest<{ properties?: Record<string, unknown> }>(
        `/stations/${stationId}/observations/latest`
      );

      return weatherGovObservationSchema.parse(observationData);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new WeatherAPIError(
          500,
          'Observation data validation failed',
          error
        );
      }
      throw new WeatherAPIError(
        500,
        'Failed to get current weather observation',
        error
      );
    }
  }

  async searchLocations(query: string): Promise<unknown> {
    if (query.length < 2) {
      return [];
    }

    try {
      const coords = await this.geocodeLocation(query);

      return [{
        id: 1,
        name: coords.name || this.extractCityFromQuery(query),
        region: coords.state || '',
        country: 'US',
        lat: coords.lat,
        lon: coords.lon,
      }];
    } catch (error) {
      return [];
    }
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lon: number; state?: string; name?: string }> {
    try {
      const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
      const response = await axios.get(searchUrl, { timeout: 10000 });

      const results = response.data.results;

      if (!results || results.length === 0) {
        throw new WeatherAPIError(404, 'Location not found');
      }

      const result = results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        state: result.admin1,
        name: result.name,
      };
    } catch {
      throw new WeatherAPIError(
        404,
        'Could not geocode location'
      );
    }
  }

  private extractCityFromQuery(query: string): string {
    const parts = query.split(',');
    return parts[0].trim();
  }
}

let weatherAPIServiceInstance: WeatherAPIService | null = null;

export function getWeatherAPIService(): WeatherAPIService {
  if (!weatherAPIServiceInstance) {
    weatherAPIServiceInstance = new WeatherAPIService();
  }
  return weatherAPIServiceInstance;
}
