'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationSearch } from '@/components/LocationSearch';
import { UnifiedWeather } from '@/components/UnifiedWeather';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { getWeatherAPIService, WeatherAPIError } from '@/lib/api/weather-api';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const [location, setLocation] = useState<string>('New York');
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'metric' | 'imperial'>('metric');
  const [timeFormat, setTimeFormat] = useState<'12hr' | '24hr'>('12hr');
  const [pressureUnit, setPressureUnit] = useState<'mb' | 'inHg'>('mb');
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

  const toggleTimeFormat = useCallback(() => {
    setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr');
  }, []);

  const togglePressureUnit = useCallback(() => {
    setPressureUnit(prev => prev === 'mb' ? 'inHg' : 'mb');
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

  // Combine errors - prefer current weather error if both exist
  const combinedError = currentError || forecastError;

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
            <div className="w-full max-w-md mb-4">
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
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {windSpeedUnit === 'metric' ? 'km/h' : 'mph'}
              </button>
              <button
                onClick={toggleTimeFormat}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {timeFormat === '12hr' ? '12hr' : '24hr'}
              </button>
              <button
                onClick={togglePressureUnit}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm
                  hover:scale-105 hover:shadow-md
                  ${theme === 'dark'
                    ? 'bg-card border-border text-foreground hover:bg-accent hover:border-accent'
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  }
                `}
              >
                {pressureUnit === 'mb' ? 'mb' : 'inHg'}
              </button>
            </div>
          </div>

          {/* Error Banner - More Compact */}
          {hasError && (
            <div className={`
              rounded-lg p-4 mb-6 border transition-all duration-300 animate-scale-in
              ${theme === 'dark'
                ? 'bg-destructive/20 border-destructive/40 text-destructive-foreground shadow-lg'
                : 'bg-destructive/15 border-destructive/30 text-destructive shadow-lg'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    ${theme === 'dark' ? 'bg-destructive/40' : 'bg-destructive/30'}
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

          {/* Unified Weather Component */}
          <div className="w-full">
            <UnifiedWeather
              currentData={currentWeatherData || null}
              forecastData={forecastData || null}
              isLoading={isLoading}
              error={combinedError}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              timeFormat={timeFormat}
              pressureUnit={pressureUnit}
              days={5}
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
