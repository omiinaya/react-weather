'use client';

import React from 'react';
import { Calendar, CloudRain, Umbrella, Sun, Droplets } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WeatherCard, formatTemperature, formatDate } from './WeatherCard';
import { ForecastResponse } from '@/types/weather';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeatherIcon, extractConditionCode, isNightTime } from '@/lib/utils/weather-icons';

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
          <p className="mt-4 text-muted-foreground">Loading forecast data...</p>
        </div>
      </WeatherCard>
    );
  }

  if (error) {
    return (
      <WeatherCard title="5-Day Forecast">
        <div className="text-center py-8">
          <div className="text-destructive mb-3">
            <div className="w-12 h-12 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
          <p className="text-destructive font-medium mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">
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
          <div className="text-primary mb-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
          </div>
          <p className="text-muted-foreground">Search for a location to see weather forecast</p>
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
                'weather-card p-4 text-center transition-all duration-300',
                'hover:scale-105 hover:shadow-md',
                isToday && 'ring-2 ring-primary/50 bg-primary/5'
              )}
            >
              {/* Date */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(day.date, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                {isToday && (
                  <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </div>

              {/* Weather Icon */}
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={getWeatherIcon(
                    extractConditionCode(day.day.condition.icon),
                    isNightTime(day.day.condition.icon)
                  )}
                  className="w-12 h-12 text-blue-500 mx-auto drop-shadow-sm"
                />
                <p className="text-card-foreground/80 text-xs capitalize mt-2">
                  {day.day.condition.text}
                </p>
              </div>

              {/* Temperatures */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-card-foreground font-bold text-lg">
                    {formatTemperature(maxTemp, temperatureUnit)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {formatTemperature(minTemp, temperatureUnit)}
                  </span>
                </div>
              </div>

              {/* Precipitation */}
              {(chanceOfRain > 0 || chanceOfSnow > 0) && (
                <div className="space-y-2 mb-4">
                  {chanceOfRain > 0 && (
                    <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
                      <CloudRain className="w-3 h-3" />
                      <span>{chanceOfRain}% rain</span>
                    </div>
                  )}
                  {chanceOfSnow > 0 && (
                    <div className="flex items-center justify-center gap-2 text-blue-300 text-xs">
                      <Umbrella className="w-3 h-3" />
                      <span>{chanceOfSnow}% snow</span>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 justify-center">
                    <Sun className="w-3 h-3" />
                    <span>UV {day.day.uv}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Droplets className="w-3 h-3" />
                    <span>{day.day.avghumidity}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WeatherCard>
  );
};

// Helper function for class names (since we can't import cn from WeatherCard in this context)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}