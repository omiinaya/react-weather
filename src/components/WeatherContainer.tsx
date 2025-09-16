'use client';

import React, { useMemo, useEffect } from 'react';
import { UnifiedWeather } from '@/components/UnifiedWeather';
import { useWeatherHistoryCache } from '@/hooks/useWeatherHistoryCache';
import { createFiveDayHistoricalForecast } from '@/lib/utils/weather-history-utils';
import { CurrentWeatherResponse, ForecastResponse } from '@/types/weather';

interface WeatherContainerProps {
  currentData: CurrentWeatherResponse | null;
  forecastData: ForecastResponse | null;
  location: string;
  isLoading?: boolean;
  error?: string | null;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  windSpeedUnit?: 'metric' | 'imperial';
  timeFormat?: '12hr' | '24hr';
  pressureUnit?: 'mb' | 'inHg';
}

export const WeatherContainer: React.FC<WeatherContainerProps> = ({
  currentData,
  forecastData,
  location,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'metric',
  timeFormat = '12hr',
  pressureUnit = 'mb',
}) => {
  const { historicalData, storeHistoricalData } = useWeatherHistoryCache();

  // Store new weather data in historical cache
  useEffect(() => {
    if (currentData && forecastData && location) {
      storeHistoricalData(location, forecastData, currentData);
    }
  }, [currentData, forecastData, location, storeHistoricalData]);

  // Create 5-day historical forecast
  const fiveDayForecast = useMemo(() => {
    if (!forecastData || !location) {
      return null;
    }

    return createFiveDayHistoricalForecast(
      location,
      forecastData,
      historicalData[location] || {},
      currentData || undefined
    );
  }, [forecastData, historicalData, location, currentData]);

  // Transform 5-day forecast to match expected ForecastResponse format
  const enhancedForecastData = useMemo(() => {
    if (!fiveDayForecast || !forecastData) {
      return forecastData;
    }

    return {
      ...forecastData,
      forecast: {
        ...forecastData.forecast,
        forecastday: fiveDayForecast.days,
      },
    };
  }, [fiveDayForecast, forecastData]);

  return (
    <UnifiedWeather
      currentData={currentData}
      forecastData={enhancedForecastData}
      isLoading={isLoading}
      error={error}
      temperatureUnit={temperatureUnit}
      windSpeedUnit={windSpeedUnit}
      timeFormat={timeFormat}
      pressureUnit={pressureUnit}
      days={5}
    />
  );
};