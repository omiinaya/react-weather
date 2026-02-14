'use client';

import React from 'react';
import { UnifiedWeather } from '@/components/UnifiedWeather';
import { CurrentWeatherResponse, ForecastResponse, WeatherGovForecastPeriod } from '@/types/weather';

interface WeatherContainerProps {
  currentData: CurrentWeatherResponse | null;
  forecastData: ForecastResponse | null;
  rawForecastPeriods?: WeatherGovForecastPeriod[];
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
  rawForecastPeriods,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'metric',
  timeFormat = '12hr',
  pressureUnit = 'mb',
}) => {
  return (
    <UnifiedWeather
      currentData={currentData}
      forecastData={forecastData}
      rawForecastPeriods={rawForecastPeriods}
      isLoading={isLoading}
      error={error}
      temperatureUnit={temperatureUnit}
      windSpeedUnit={windSpeedUnit}
      timeFormat={timeFormat}
      pressureUnit={pressureUnit}
    />
  );
};
