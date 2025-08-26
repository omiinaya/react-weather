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
import { WeatherCard, formatTemperature, formatWindSpeed, getWeatherIconUrl } from './WeatherCard';
import { CurrentWeatherResponse } from '@/types/weather';
import { LoadingSpinner } from './LoadingSpinner';

interface CurrentWeatherProps {
  data: CurrentWeatherResponse | null;
  isLoading?: boolean;
  error?: string | null;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  windSpeedUnit?: 'metric' | 'imperial';
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  data,
  isLoading = false,
  error = null,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'metric',
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
      {/* Location and Time */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{location.name}</h2>
            <p className="text-muted-foreground text-sm">
              {location.region && `${location.region}, `}
              {location.country}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date(location.localtime).toLocaleTimeString()}</span>
          </div>
          <p className="text-muted-foreground/70 text-xs">
            {new Date(location.localtime).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Weather Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Temperature and Condition */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src={getWeatherIconUrl(current.condition.icon)}
              alt={current.condition.text}
              className="w-20 h-20 drop-shadow-lg"
            />
          </div>
          <div className="text-5xl font-bold text-card-foreground mb-2">
            {formatTemperature(temp, temperatureUnit)}
          </div>
          <p className="text-card-foreground/80 capitalize text-lg font-medium">
            {current.condition.text}
          </p>
          <p className="text-muted-foreground text-sm">
            Feels like {formatTemperature(feelsLike, temperatureUnit)}
          </p>
        </div>

        {/* Weather Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span>Humidity</span>
            </div>
            <span className="font-semibold text-card-foreground">{current.humidity}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Wind className="w-5 h-5 text-green-400" />
              <span>Wind</span>
            </div>
            <span className="font-semibold text-card-foreground">
              {formatWindSpeed(windSpeed, windSpeedUnit)} {current.wind_dir}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span>Pressure</span>
            </div>
            <span className="font-semibold text-card-foreground">
              {windSpeedUnit === 'metric' ? `${current.pressure_mb} mb` : `${current.pressure_in} in`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Visibility</span>
            </div>
            <span className="font-semibold text-card-foreground">
              {windSpeedUnit === 'metric' ? `${current.vis_km} km` : `${current.vis_miles} mi`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Thermometer className="w-5 h-5 text-red-400" />
              <span>UV Index</span>
            </div>
            <span className="font-semibold text-card-foreground">{current.uv}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-muted/30 rounded-lg p-4 border">
        <p className="text-muted-foreground text-sm text-center">
          Last updated: {new Date(current.last_updated).toLocaleString()}
        </p>
      </div>
    </WeatherCard>
  );
};