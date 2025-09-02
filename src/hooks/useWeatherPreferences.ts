'use client';

import { useState, useCallback } from 'react';

export interface WeatherPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'metric' | 'imperial';
  timeFormat: '12hr' | '24hr';
  pressureUnit: 'mb' | 'inHg';
}

export const useWeatherPreferences = (initialPreferences?: Partial<WeatherPreferences>) => {
  const [preferences, setPreferences] = useState<WeatherPreferences>({
    temperatureUnit: initialPreferences?.temperatureUnit || 'celsius',
    windSpeedUnit: initialPreferences?.windSpeedUnit || 'metric',
    timeFormat: initialPreferences?.timeFormat || '12hr',
    pressureUnit: initialPreferences?.pressureUnit || 'mb',
  });

  const toggleTemperatureUnit = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      temperatureUnit: prev.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
    }));
  }, []);

  const toggleWindSpeedUnit = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      windSpeedUnit: prev.windSpeedUnit === 'metric' ? 'imperial' : 'metric'
    }));
  }, []);

  const toggleTimeFormat = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      timeFormat: prev.timeFormat === '12hr' ? '24hr' : '12hr'
    }));
  }, []);

  const togglePressureUnit = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      pressureUnit: prev.pressureUnit === 'mb' ? 'inHg' : 'mb'
    }));
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<WeatherPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  return {
    preferences,
    toggleTemperatureUnit,
    toggleWindSpeedUnit,
    toggleTimeFormat,
    togglePressureUnit,
    updatePreferences,
  };
};