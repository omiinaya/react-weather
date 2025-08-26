'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationSearch } from '@/components/LocationSearch';
import { CurrentWeather } from '@/components/CurrentWeather';
import { WeatherForecast } from '@/components/WeatherForecast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { getWeatherAPIService, WeatherAPIError } from '@/lib/api/weather-api';

export default function Home() {
  const [location, setLocation] = useState<string>('');
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'metric' | 'imperial'>('metric');

  // Fetch current weather data
  const {
    data: currentWeatherData,
    isLoading: isCurrentWeatherLoading,
    error: currentWeatherError,
    refetch: refetchCurrentWeather,
  } = useQuery({
    queryKey: ['current-weather', location],
    queryFn: () => getWeatherAPIService().getCurrentWeather(location),
    enabled: !!location,
    retry: 1,
  });

  // Fetch forecast data
  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastErrorResponse,
    refetch: refetchForecast,
  } = useQuery({
    queryKey: ['forecast', location],
    queryFn: () => getWeatherAPIService().getForecast(location, 5),
    enabled: !!location,
    retry: 1,
  });

  const handleLocationSelect = useCallback((selectedLocation: string) => {
    setLocation(selectedLocation);
  }, []);

  const handleRetry = useCallback(() => {
    if (location) {
      refetchCurrentWeather();
      refetchForecast();
    }
  }, [location, refetchCurrentWeather, refetchForecast]);

  const toggleTemperatureUnit = useCallback(() => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  }, []);

  const toggleWindSpeedUnit = useCallback(() => {
    setWindSpeedUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
  }, []);

  const getErrorMessage = (error: unknown): string | null => {
    console.log('getErrorMessage called with:', error);
    if (error instanceof WeatherAPIError) {
      console.log('WeatherAPIError:', error.message);
      return error.message;
    }
    if (error instanceof Error) {
      console.log('Error:', error.message);
      return error.message;
    }
    console.log('Unknown error type, returning generic message');
    return 'An unexpected error occurred';
  };

  const currentError = currentWeatherError ? getErrorMessage(currentWeatherError) : null;
  const forecastError = forecastErrorResponse ? getErrorMessage(forecastErrorResponse) : null;

  const isLoading = isCurrentWeatherLoading || isForecastLoading;
  const hasError = currentError || forecastError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <LoadingOverlay isLoading={isLoading} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Weather App
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Real-time weather information at your fingertips
            </p>
          </div>

          {/* Search Section */}
          <div className="flex flex-col items-center mb-8">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              isLoading={isLoading}
              className="mb-4"
              placeholder="Enter city name (e.g., New York, London, Tokyo)..."
            />
            
            {/* Unit Toggles */}
            <div className="flex gap-4">
              <button
                onClick={toggleTemperatureUnit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                °{temperatureUnit === 'celsius' ? 'C' : 'F'}
              </button>
              <button
                onClick={toggleWindSpeedUnit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                {windSpeedUnit === 'metric' ? 'km/h' : 'mph'}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {hasError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-200">⚠️</span>
                  <p className="text-red-200">
                    {currentError || forecastError || 'Unknown error'}
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Weather Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Weather */}
            <div className="lg:col-span-1">
              <CurrentWeather
                data={currentWeatherData || null}
                isLoading={isCurrentWeatherLoading}
                error={currentError}
                temperatureUnit={temperatureUnit}
                windSpeedUnit={windSpeedUnit}
              />
            </div>

            {/* Forecast */}
            <div className="lg:col-span-1">
              <WeatherForecast
                data={forecastData || null}
                isLoading={isForecastLoading}
                error={forecastError}
                temperatureUnit={temperatureUnit}
                days={5}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-blue-200 text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-blue-200/70 text-xs mt-1">
              Weather data provided by WeatherAPI.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
