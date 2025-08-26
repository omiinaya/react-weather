'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationSearch } from '@/components/LocationSearch';
import { CurrentWeather } from '@/components/CurrentWeather';
import { WeatherForecast } from '@/components/WeatherForecast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { getWeatherAPIService, WeatherAPIError } from '@/lib/api/weather-api';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const [location, setLocation] = useState<string>('');
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'metric' | 'imperial'>('metric');
  const { theme } = useTheme();

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
    <div className="min-h-screen bg-background">
      <Header />
      <LoadingOverlay isLoading={isLoading} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex flex-col items-center mb-6">
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-4
                ${theme === 'dark'
                  ? 'bg-weather-gradient text-primary-foreground'
                  : 'weather-sunny text-primary-foreground'
                }
                transition-all duration-500
              `}>
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
                Weather Forecast
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Get accurate weather information for any location worldwide
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="flex flex-col items-center mb-8 animate-slide-up">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              isLoading={isLoading}
              className="mb-6"
              placeholder="Enter city name (e.g., New York, London, Tokyo)..."
            />
            
            {/* Unit Toggles */}
            <div className="flex gap-3">
              <button
                onClick={toggleTemperatureUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent'
                    : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                  }
                `}
              >
                °{temperatureUnit === 'celsius' ? 'C' : 'F'}
              </button>
              <button
                onClick={toggleWindSpeedUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent'
                    : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                  }
                `}
              >
                {windSpeedUnit === 'metric' ? 'km/h' : 'mph'}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {hasError && (
            <div className={`
              rounded-lg p-4 mb-8 border transition-all duration-300 animate-scale-in
              ${theme === 'dark'
                ? 'bg-destructive/20 border-destructive/30 text-destructive-foreground'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    ${theme === 'dark' ? 'bg-destructive/30' : 'bg-destructive/20'}
                  `}>
                    <span className="text-sm">⚠️</span>
                  </div>
                  <p className="text-sm">
                    {currentError || forecastError || 'Unknown error'}
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className={`
                    px-3 py-1 rounded text-sm transition-all duration-200
                    hover:scale-105 hover:shadow-sm
                    ${theme === 'dark'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
                      : 'bg-destructive text-white hover:bg-destructive/90'
                    }
                  `}
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
          <div className="mt-12 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Weather data provided by WeatherAPI.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
