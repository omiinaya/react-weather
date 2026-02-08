'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationSearch } from '@/components/LocationSearch';
import { WeatherContainer } from '@/components/WeatherContainer';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { getWeatherAPIService, WeatherAPIError } from '@/lib/api/weather-api';
import { useTheme } from '@/contexts/ThemeContext';
import { useWeatherPreferences } from '@/hooks/useWeatherPreferences';

export default function Home() {
  const [location, setLocation] = useState<string | { lat: number; lon: number }>('New York');
  const {
    preferences,
    toggleTemperatureUnit,
    toggleWindSpeedUnit,
    toggleTimeFormat,
    togglePressureUnit,
  } = useWeatherPreferences();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current weather data
  const {
    data: currentWeatherData,
    isLoading: isCurrentWeatherLoading,
    error: currentWeatherError,
    refetch: refetchCurrentWeather,
  } = useQuery({
    queryKey: ['current-weather', typeof location === 'string' ? location : `${location.lat},${location.lon}`],
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
    queryKey: ['forecast', typeof location === 'string' ? location : `${location.lat},${location.lon}`],
    queryFn: () => getWeatherAPIService().getForecast(location),
    enabled: !!location,
    retry: 1,
  });

  const handleLocationSelect = useCallback((selectedLocation: string | { lat: number; lon: number }) => {
    setLocation(selectedLocation);
  }, []);

  const handleRetry = useCallback(() => {
    if (location) {
      refetchCurrentWeather();
      refetchForecast();
    }
  }, [location, refetchCurrentWeather, refetchForecast]);


  const getErrorMessage = useCallback((error: unknown): string | null => {
    if (error instanceof WeatherAPIError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }, []);


  // Memoize error handling and loading states
  const currentError = useMemo(() =>
    currentWeatherError ? getErrorMessage(currentWeatherError) : null,
    [currentWeatherError, getErrorMessage]
  );
  
  const forecastError = useMemo(() =>
    forecastErrorResponse ? getErrorMessage(forecastErrorResponse) : null,
    [forecastErrorResponse, getErrorMessage]
  );

  const isLoading = useMemo(() =>
    isCurrentWeatherLoading || isForecastLoading,
    [isCurrentWeatherLoading, isForecastLoading]
  );
  
  const hasError = useMemo(() =>
    currentError || forecastError,
    [currentError, forecastError]
  );

  // Combine errors - prefer current weather error if both exist
  const combinedError = useMemo(() =>
    currentError || forecastError,
    [currentError, forecastError]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <LoadingOverlay isLoading={isLoading} />
      
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - More Compact */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Weather Forecast
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Get real-time weather updates and forecasts for any location worldwide
            </p>
          </div>

          {/* Search Section - More Compact */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 animate-slide-up">
            <div className="w-full max-w-md mb-4" onClick={(e) => e.stopPropagation()}>
              <LocationSearch
               onLocationSelect={handleLocationSelect}
               isLoading={isLoading}
               className="w-full"
               placeholder="Enter city name (e.g., New York, London, Tokyo)..."
             />
            </div>
            
            {/* Unit Toggles - Smaller and More Compact */}
            <div className="flex gap-3">
              <button
                onClick={toggleTemperatureUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${!mounted
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : theme === 'dark'
                      ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                °{preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}
              </button>
              <button
                onClick={toggleWindSpeedUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${!mounted
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : theme === 'dark'
                      ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {preferences.windSpeedUnit === 'metric' ? 'km/h' : 'mph'}
              </button>
              <button
                onClick={toggleTimeFormat}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${!mounted
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : theme === 'dark'
                      ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {preferences.timeFormat === '12hr' ? '12hr' : '24hr'}
              </button>
              <button
                onClick={togglePressureUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${!mounted
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : theme === 'dark'
                      ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {preferences.pressureUnit === 'mb' ? 'mb' : 'inHg'}
              </button>
            </div>
          </div>

          {/* Error Banner - More Compact */}
          {hasError && (
            <div className={`
              rounded-lg p-4 mb-6 border transition-all duration-300 animate-scale-in
              ${!mounted
                ? 'bg-destructive/15 border-destructive/30 text-destructive shadow-lg'
                : theme === 'dark'
                  ? 'bg-destructive/20 border-destructive/40 text-destructive-foreground shadow-lg'
                  : 'bg-destructive/15 border-destructive/30 text-destructive shadow-lg'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    ${!mounted ? 'bg-destructive/30' : theme === 'dark' ? 'bg-destructive/40' : 'bg-destructive/30'}
                  `}>
                    <span className="text-sm">⚠️</span>
                  </div>
                  <p className="text-sm font-medium">
                   {currentError || forecastError || 'Unknown error'}
                 </p>
                </div>
                <button
                  onClick={handleRetry}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    hover:scale-105 hover:shadow-md
                    ${!mounted
                      ? 'bg-destructive text-white hover:bg-destructive/90'
                      : theme === 'dark'
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

{/* Weather Container with Historical Data */}
        <div className="w-full">
          <WeatherContainer
            currentData={currentWeatherData || null}
            forecastData={forecastData || null}
            location={currentWeatherData?.location?.name || (typeof location === 'string' ? location : '')}
            isLoading={isLoading}
            error={combinedError}
            {...preferences}
          />
          </div>

          {/* Footer - More Compact */}
          <div className="mt-12 text-center animate-fade-in">
            <p className="text-muted-foreground text-xs sm:text-sm">
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
