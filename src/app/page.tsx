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
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex flex-col items-center mb-8">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center mb-6
                ${theme === 'dark'
                  ? 'bg-weather-gradient text-primary-foreground shadow-lg'
                  : 'weather-sunny text-primary-foreground shadow-lg'
                }
                transition-all duration-500
              `}>
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Weather Forecast
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Get accurate weather information for any location worldwide
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="flex flex-col items-center mb-10 animate-slide-up">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              isLoading={isLoading}
              className="mb-8 w-full max-w-md"
              placeholder="Enter city name (e.g., New York, London, Tokyo)..."
            />
            
            {/* Unit Toggles */}
            <div className="flex gap-4">
              <button
                onClick={toggleTemperatureUnit}
                className={`
                  px-5 py-3 rounded-xl border-2 transition-all duration-200 font-medium
                  hover:scale-105 hover:shadow-lg
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                °{temperatureUnit === 'celsius' ? 'C' : 'F'}
              </button>
              <button
                onClick={toggleWindSpeedUnit}
                className={`
                  px-5 py-3 rounded-xl border-2 transition-all duration-200 font-medium
                  hover:scale-105 hover:shadow-lg
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
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
              rounded-xl p-6 mb-10 border-2 transition-all duration-300 animate-scale-in
              ${theme === 'dark'
                ? 'bg-destructive/20 border-destructive/40 text-destructive-foreground shadow-lg'
                : 'bg-destructive/15 border-destructive/30 text-destructive shadow-lg'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${theme === 'dark' ? 'bg-destructive/40' : 'bg-destructive/30'}
                  `}>
                    <span className="text-base">⚠️</span>
                  </div>
                  <p className="text-base font-medium">
                    {currentError || forecastError || 'Unknown error'}
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    hover:scale-105 hover:shadow-md
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
          <div className="flex flex-col gap-8">
            {/* Current Weather - Full Width */}
            <div className="w-full">
              <CurrentWeather
                data={currentWeatherData || null}
                isLoading={isCurrentWeatherLoading}
                error={currentError}
                temperatureUnit={temperatureUnit}
                windSpeedUnit={windSpeedUnit}
              />
            </div>

            {/* Forecast - Full Width */}
            <div className="w-full">
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
          <div className="mt-16 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-muted-foreground/70 text-xs mt-2">
              Weather data provided by WeatherAPI.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
