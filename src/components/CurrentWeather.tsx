'use client';

import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Thermometer,
  MapPin,
  Clock
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { WeatherCard, formatTemperature, formatWindSpeed } from './WeatherCard';
import { CurrentWeatherResponse, Astro } from '@/types/weather';
import type { CurrentWeather as CurrentWeatherType } from '@/types/weather';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeatherIcon, extractConditionCode, isNightTime } from '@/lib/utils/weather-icons';


interface CurrentWeatherProps {
  data: CurrentWeatherResponse | null;
  isLoading?: boolean;
  error?: string | null;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  windSpeedUnit?: 'metric' | 'imperial';
  timeFormat?: '12hr' | '24hr';
  pressureUnit?: 'mb' | 'inHg';
  sunData?: Astro | null;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = React.memo(({
  data,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'metric',
  timeFormat = '12hr',
  pressureUnit = 'mb',
  sunData = null,
}) => {
  if (isLoading) {
    return (
      <WeatherCard title="Current Weather" isLoading>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading weather data...</p>
        </div>
      </WeatherCard>
    );
  }

  if (error) {
    return (
      <WeatherCard title="Current Weather">
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

  if (!data) {
    return (
      <WeatherCard title="Current Weather">
        <div className="text-center py-8">
          <div className="text-primary mb-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl">🌤️</span>
            </div>
          </div>
          <p className="text-muted-foreground">Search for a location to see current weather</p>
        </div>
      </WeatherCard>
    );
  }

  const { location, current } = data;
  const temp = temperatureUnit === 'celsius' ? current.temp_c : current.temp_f;
  const feelsLike = temperatureUnit === 'celsius' ? current.feelslike_c : current.feelslike_f;
  const windSpeed = windSpeedUnit === 'metric' ? current.wind_kph : current.wind_mph;

  return (
    <WeatherCard title="Current Weather">
      {/* Compact Header with Location and Main Weather */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        {/* Location Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-card-foreground truncate">{location.name}</h2>
            <p className="text-muted-foreground text-xs truncate">
              {location.region && `${location.region}, `}
              {location.country}
            </p>
          </div>
        </div>

        {/* Main Weather Display - Horizontal Layout */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={getWeatherIcon(
                extractConditionCode(current.condition.icon),
                isNightTime(current.condition.icon)
              )}
              className="w-12 h-12 text-blue-500 drop-shadow-lg flex-shrink-0"
            />
            <div className="text-left">
              <div className="text-3xl font-bold text-card-foreground leading-none">
                {formatTemperature(temp, temperatureUnit)}
              </div>
              <p className="text-card-foreground/80 capitalize text-sm font-medium">
                {current.condition.text}
              </p>
              <p className="text-muted-foreground text-xs">
                Feels like {formatTemperature(feelsLike, temperatureUnit)}
              </p>
            </div>
          </div>

          {/* Sun Times - Integrated between temperature and date */}
          {sunData && (
            <div className="flex items-center gap-4 text-center flex-shrink-0 hidden sm:flex">
              {/* Sunrise Section */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">Sunrise</span>
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faSun} className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-card-foreground">{sunData.sunrise}</span>
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-px h-6 bg-border/50"></div>
              
              {/* Sunset Section */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">Sunset</span>
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faMoon} className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-card-foreground">{sunData.sunset}</span>
                </div>
              </div>
            </div>
          )}

          {/* Time Info */}
         <div className="text-right flex-shrink-0 hidden sm:block">
           <div className="flex items-center gap-1 text-muted-foreground text-xs justify-end">
             <Clock className="w-3 h-3" />
             <span>{formatTime(location.localtime, timeFormat)}</span>
           </div>
           <p className="text-muted-foreground/70 text-xs">
             {new Date(location.localtime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
           </p>
         </div>
        </div>
      </div>

      {/* Compact Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200">
          <Droplets className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block">Humidity</span>
            <span className="text-sm font-semibold text-card-foreground">{current.humidity}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200">
          <Wind className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block">Wind</span>
            <span className="text-sm font-semibold text-card-foreground">
              {formatWindSpeed(windSpeed, windSpeedUnit)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200">
          <Gauge className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block">Pressure</span>
            <span className="text-sm font-semibold text-card-foreground">
              {formatPressure(current, pressureUnit)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200">
          <Eye className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block">Visibility</span>
            <span className="text-sm font-semibold text-card-foreground">
              {windSpeedUnit === 'metric' ? `${current.vis_km} km` : `${current.vis_miles} mi`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-all duration-200">
          <Thermometer className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block">UV Index</span>
            <span className="text-sm font-semibold text-card-foreground">{current.uv}</span>
          </div>
        </div>

        {/* Last Updated - Mobile visible, desktop in grid */}
       <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50 col-span-2 sm:col-span-1">
         <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
         <div className="min-w-0">
           <span className="text-xs text-muted-foreground block">Updated</span>
           <span className="text-sm font-semibold text-card-foreground">
             {formatTime(current.last_updated, timeFormat)}
           </span>
         </div>
       </div>
      </div>

    </WeatherCard>
  );
});

// Add display name for better debugging
CurrentWeather.displayName = 'CurrentWeather';

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

// Utility function to format pressure based on unit preference - moved outside component
const formatPressure = (current: CurrentWeatherType, unit: 'mb' | 'inHg' = 'mb'): string => {
  return unit === 'mb' ? `${current.pressure_mb} mb` : `${current.pressure_in} inHg`;
};