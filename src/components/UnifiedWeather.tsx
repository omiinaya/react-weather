'use client';

import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Thermometer,
  MapPin,
  Clock,
  Calendar,
  CloudRain,
  Umbrella
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun as faSolidSun, faMoon as faSolidMoon } from '@fortawesome/free-solid-svg-icons';
import { WeatherCard, formatTemperature, formatWindSpeed, formatDate } from './WeatherCard';
import { CurrentWeatherResponse, ForecastResponse, Astro, CurrentWeather as CurrentWeatherType } from '@/types/weather';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeatherIcon, extractConditionCode, isNightTime } from '@/lib/utils/weather-icons';
import { cn } from '@/lib/utils/cn';

interface UnifiedWeatherProps {
  currentData: CurrentWeatherResponse | null;
  forecastData: ForecastResponse | null;
  isLoading?: boolean;
  error?: string | null;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  windSpeedUnit?: 'metric' | 'imperial';
  timeFormat?: '12hr' | '24hr';
  pressureUnit?: 'mb' | 'inHg';
  days?: number;
  compactMode?: boolean;
  showLocationHeader?: boolean;
}

export const UnifiedWeather: React.FC<UnifiedWeatherProps> = React.memo(({
  currentData,
  forecastData,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'metric',
  timeFormat = '12hr',
  pressureUnit = 'mb',
  days = 5,
  showLocationHeader = true,
}) => {
  if (isLoading) {
    return (
      <WeatherCard title="Weather Forecast" isLoading>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading weather data...</p>
        </div>
      </WeatherCard>
    );
  }

  if (error) {
    return (
      <WeatherCard title="Weather Forecast">
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

  if (!currentData && !forecastData) {
    return (
      <WeatherCard title="Weather Forecast">
        <div className="text-center py-8">
          <div className="text-primary mb-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl">🌤️</span>
            </div>
          </div>
          <p className="text-muted-foreground">Search for a location to see weather information</p>
        </div>
      </WeatherCard>
    );
  }

  const forecastDays = forecastData?.forecast?.forecastday || [];
  
  const sunData: Astro | null = forecastDays[0]?.astro || null;
  const location = currentData?.location || forecastData?.location;

  return (
    <div className="space-y-6">
      {/* Location, Sun Times, and Date Header - Slim 1-row layout */}
      {showLocationHeader && location && (
        <div className="flex flex-wrap gap-3">
          {/* Location Card */}
          <div className="flex items-center gap-3 bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm flex-1 min-w-[200px]">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-card-foreground truncate">{location.name}</h2>
              <p className="text-muted-foreground text-xs truncate">
                {location.region && `${location.region}, `}
                {location.country}
              </p>
            </div>
          </div>

          {/* Sun Times Card */}
          {sunData && (
            <div className="flex items-center gap-4 bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm flex-1 min-w-[200px]">
              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-muted-foreground">Sunrise</span>
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faSolidSun} className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-card-foreground">
                    {formatTime(createTimeString(sunData.sunrise), timeFormat)}
                  </span>
                </div>
              </div>
              
              <div className="w-px h-6 bg-border/50"></div>
              
              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-muted-foreground">Sunset</span>
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faSolidMoon} className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-card-foreground">
                    {formatTime(createTimeString(sunData.sunset), timeFormat)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date/Time Card */}
          {location && (
            <div className="flex flex-col items-center justify-center bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm flex-1 min-w-[120px]">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{formatTime(location.localtime, timeFormat)}</span>
              </div>
              <p className="text-muted-foreground/70 text-xs mt-1">
                {new Date(location.localtime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      )}

      <WeatherCard title="Weather Forecast">
        {/* Forecast Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            5-Day Weather Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Historical data placeholders */}
            <div className="weather-card p-3 sm:p-4 text-center transition-all duration-300 bg-muted/30">
              <div className="mb-3 min-h-[44px] flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs sm:text-sm mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{(() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 2);
                    return date.toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });
                  })()}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-amber-600 bg-amber-100 dark:bg-amber-900/30">
                  2 days ago
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Historical data</div>
            </div>

            <div className="weather-card p-3 sm:p-4 text-center transition-all duration-300 bg-muted/30">
              <div className="mb-3 min-h-[44px] flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs sm:text-sm mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{(() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 1);
                    return date.toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });
                  })()}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-amber-600 bg-amber-100 dark:bg-amber-900/30">
                  1 day ago
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Historical data</div>
            </div>

            {/* Actual forecast data */}
            {forecastDays.slice(0, 3).map((day, index) => {
              const maxTemp = temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
              const minTemp = temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;
              const chanceOfRain = day.day.daily_chance_of_rain;
              const chanceOfSnow = day.day.daily_chance_of_snow;

              return (
                <div
                  key={day.date}
                  className={cn(
                    'weather-card p-3 sm:p-4 text-center transition-all duration-300',
                    'hover:scale-105 hover:shadow-md',
                    index === 0 && 'ring-2 ring-primary/50 bg-primary/5'
                  )}
                  aria-label={`Forecast for ${formatDate(day.date)}`}
                >
                  {/* Date */}
                  <div className="mb-3 min-h-[44px] flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs sm:text-sm mb-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(day.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      index === 0
                        ? 'text-primary bg-primary/10'
                        : 'text-green-600 bg-green-100 dark:bg-green-900/30'
                    )}>
                      {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'Day after tomorrow'}
                    </span>
                  </div>

                  {/* Weather Icon */}
                  <div className="mb-3">
                    <FontAwesomeIcon
                      icon={getWeatherIcon(
                        extractConditionCode(day.day.condition.icon),
                        isNightTime(day.day.condition.icon)
                      )}
                      className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto drop-shadow-sm"
                    />
                    <p className="text-card-foreground/80 text-xs capitalize mt-1 line-clamp-1">
                      {day.day.condition.text}
                    </p>
                  </div>

                  {/* Temperatures */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-card-foreground font-bold text-sm sm:text-base">
                        {formatTemperature(maxTemp, temperatureUnit)}
                      </span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {formatTemperature(minTemp, temperatureUnit)}
                      </span>
                    </div>
                  </div>

                  {/* Precipitation */}
                  {(chanceOfRain > 0 || chanceOfSnow > 0) && (
                    <div className="space-y-1 mb-3">
                      {chanceOfRain > 0 && (
                        <div className="flex items-center justify-center gap-1 text-blue-400 text-xs">
                          <CloudRain className="w-3 h-3" />
                          <span>{chanceOfRain}%</span>
                        </div>
                      )}
                      {chanceOfSnow > 0 && (
                        <div className="flex items-center justify-center gap-1 text-blue-300 text-xs">
                          <Umbrella className="w-3 h-3" />
                          <span>{chanceOfSnow}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today Separator */}
        <div className="flex items-center my-6" aria-label="Today's weather section">
          <div className="flex-1 h-px bg-border/50"></div>
          <span className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full">
            Today
          </span>
          <div className="flex-1 h-px bg-border/50"></div>
        </div>

        {/* Current Weather Section */}
        {currentData && (
          <div>
            {/* Compact Weather Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <WeatherMetric
                icon={<Droplets className="w-4 h-4 text-blue-500" />}
                label="Humidity"
                value={`${currentData.current.humidity}%`}
              />

              <WeatherMetric
                icon={<Wind className="w-4 h-4 text-green-500" />}
                label="Wind"
                value={formatWindSpeed(
                  windSpeedUnit === 'metric'
                    ? currentData.current.wind_kph
                    : currentData.current.wind_mph,
                  windSpeedUnit
                )}
              />

              <WeatherMetric
                icon={<Gauge className="w-4 h-4 text-purple-500" />}
                label="Pressure"
                value={formatPressure(currentData.current, pressureUnit)}
              />

              <WeatherMetric
                icon={<Eye className="w-4 h-4 text-amber-500" />}
                label="Visibility"
                value={
                  windSpeedUnit === 'metric'
                    ? `${currentData.current.vis_km} km`
                    : `${currentData.current.vis_miles} mi`
                }
              />

              <WeatherMetric
                icon={<Thermometer className="w-4 h-4 text-red-500" />}
                label="UV Index"
                value={`${currentData.current.uv}`}
              />

              <WeatherMetric
                icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                label="Updated"
                value={formatTime(currentData.current.last_updated, timeFormat)}
              />
            </div>
          </div>
        )}
      </WeatherCard>
    </div>
  );
});

// Add display name for better debugging
UnifiedWeather.displayName = 'UnifiedWeather';

// Weather Metric Component
const WeatherMetric: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div
    className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200"
    aria-label={`${label}: ${value}`}
  >
    {icon}
    <div className="min-w-0">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-semibold text-card-foreground">{value}</span>
    </div>
  </div>
);

// Utility function to format time based on 12hr/24hr preference - moved outside component
const formatTime = (dateString: string, format: '12hr' | '24hr' = '12hr'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12hr'
  };
  return date.toLocaleTimeString([], options);
};

// Helper function to convert time string (e.g., "06:23 AM") to Date object - moved outside component
const createTimeString = (timeStr: string): string => {
  // Create a date object with today's date and the given time
  const today = new Date();
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format if needed
  let hours24 = hours;
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  
  today.setHours(hours24, minutes, 0, 0);
  return today.toISOString();
};

// Utility function to format pressure based on unit preference - moved outside component
const formatPressure = (current: CurrentWeatherType, unit: 'mb' | 'inHg' = 'mb'): string => {
  return unit === 'mb' ? `${current.pressure_mb} mb` : `${current.pressure_in} inHg`;
};