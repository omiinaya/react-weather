'use client';

import React from 'react';
import { Calendar, CloudRain, Umbrella, Sun } from 'lucide-react';
import { WeatherCard, formatTemperature, formatDate, getWeatherIconUrl } from './WeatherCard';
import { ForecastResponse } from '@/types/weather';
import { LoadingSpinner } from './LoadingSpinner';

interface WeatherForecastProps {
  data: ForecastResponse | null;
  isLoading?: boolean;
  error?: string | null;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  days?: number;
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
  data,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  days = 5,
}) => {
  if (isLoading) {
    return (
      <WeatherCard title="5-Day Forecast" isLoading>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70">Loading forecast data...</p>
        </div>
      </WeatherCard>
    );
  }

  if (error) {
    return (
      <WeatherCard title="5-Day Forecast">
        <div className="text-center py-8">
          <div className="text-red-300 mb-2">⚠️</div>
          <p className="text-red-200">{error}</p>
          <p className="text-white/70 text-sm mt-2">
            Please try searching for another location.
          </p>
        </div>
      </WeatherCard>
    );
  }

  if (!data || !data.forecast?.forecastday?.length) {
    return (
      <WeatherCard title="5-Day Forecast">
        <div className="text-center py-8">
          <div className="text-blue-300 mb-2">📅</div>
          <p className="text-white/70">Search for a location to see weather forecast</p>
        </div>
      </WeatherCard>
    );
  }

  const forecastDays = data.forecast.forecastday.slice(0, days);

  return (
    <WeatherCard title="5-Day Forecast">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {forecastDays.map((day, index) => {
          const maxTemp = temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
          const minTemp = temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;
          const isToday = index === 0;
          const chanceOfRain = day.day.daily_chance_of_rain;
          const chanceOfSnow = day.day.daily_chance_of_snow;

          return (
            <div
              key={day.date}
              className={cn(
                'bg-white/5 rounded-lg p-4 text-center',
                'transition-all duration-200 hover:bg-white/10',
                isToday && 'ring-2 ring-blue-400/50'
              )}
            >
              {/* Date */}
              <div className="mb-3">
                <div className="flex items-center justify-center gap-1 text-white/70 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(day.date, { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                {isToday && (
                  <span className="text-blue-300 text-xs font-medium bg-blue-400/20 px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </div>

              {/* Weather Icon */}
              <div className="mb-3">
                <img
                  src={getWeatherIconUrl(day.day.condition.icon)}
                  alt={day.day.condition.text}
                  className="w-12 h-12 mx-auto"
                />
                <p className="text-white/80 text-xs capitalize mt-1">
                  {day.day.condition.text}
                </p>
              </div>

              {/* Temperatures */}
              <div className="mb-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-semibold text-lg">
                    {formatTemperature(maxTemp, temperatureUnit)}
                  </span>
                  <span className="text-white/60 text-sm">
                    {formatTemperature(minTemp, temperatureUnit)}
                  </span>
                </div>
              </div>

              {/* Precipitation */}
              {(chanceOfRain > 0 || chanceOfSnow > 0) && (
                <div className="space-y-1">
                  {chanceOfRain > 0 && (
                    <div className="flex items-center justify-center gap-1 text-blue-300 text-xs">
                      <CloudRain className="w-3 h-3" />
                      <span>{chanceOfRain}% rain</span>
                    </div>
                  )}
                  {chanceOfSnow > 0 && (
                    <div className="flex items-center justify-center gap-1 text-blue-200 text-xs">
                      <Umbrella className="w-3 h-3" />
                      <span>{chanceOfSnow}% snow</span>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div className="flex items-center gap-1 justify-center">
                    <Sun className="w-3 h-3" />
                    <span>UV {day.day.uv}</span>
                  </div>
                  <div>
                    <span>Hum {day.day.avghumidity}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sunrise/Sunset for today */}
      {forecastDays[0] && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span>🌅</span>
                <span>Sunrise</span>
              </div>
              <span className="text-white font-medium">
                {forecastDays[0].astro.sunrise}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span>🌇</span>
                <span>Sunset</span>
              </div>
              <span className="text-white font-medium">
                {forecastDays[0].astro.sunset}
              </span>
            </div>
          </div>
        </div>
      )}
    </WeatherCard>
  );
};

// Helper function for class names (since we can't import cn from WeatherCard in this context)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}