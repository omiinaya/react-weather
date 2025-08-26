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
          <p className="mt-4 text-white/70">Loading weather data...</p>
        </div>
      </WeatherCard>
    );
  }

  if (error) {
    return (
      <WeatherCard title="Current Weather">
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

  if (!data) {
    return (
      <WeatherCard title="Current Weather">
        <div className="text-center py-8">
          <div className="text-blue-300 mb-2">🌤️</div>
          <p className="text-white/70">Search for a location to see current weather</p>
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
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-300" />
          <div>
            <h2 className="text-xl font-bold text-white">{location.name}</h2>
            <p className="text-white/80 text-sm">
              {location.region && `${location.region}, `}
              {location.country}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date(location.localtime).toLocaleTimeString()}</span>
          </div>
          <p className="text-white/60 text-xs">
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
              className="w-16 h-16"
            />
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {formatTemperature(temp, temperatureUnit)}
          </div>
          <p className="text-white/80 capitalize">{current.condition.text}</p>
          <p className="text-white/60 text-sm">
            Feels like {formatTemperature(feelsLike, temperatureUnit)}
          </p>
        </div>

        {/* Weather Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Droplets className="w-5 h-5 text-blue-300" />
              <span>Humidity</span>
            </div>
            <span className="text-white font-medium">{current.humidity}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Wind className="w-5 h-5 text-blue-300" />
              <span>Wind</span>
            </div>
            <span className="text-white font-medium">
              {formatWindSpeed(windSpeed, windSpeedUnit)} {current.wind_dir}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Gauge className="w-5 h-5 text-blue-300" />
              <span>Pressure</span>
            </div>
            <span className="text-white font-medium">
              {windSpeedUnit === 'metric' ? `${current.pressure_mb} mb` : `${current.pressure_in} in`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Eye className="w-5 h-5 text-blue-300" />
              <span>Visibility</span>
            </div>
            <span className="text-white font-medium">
              {windSpeedUnit === 'metric' ? `${current.vis_km} km` : `${current.vis_miles} mi`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Thermometer className="w-5 h-5 text-blue-300" />
              <span>UV Index</span>
            </div>
            <span className="text-white font-medium">{current.uv}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-white/70 text-sm text-center">
          Last updated: {new Date(current.last_updated).toLocaleString()}
        </p>
      </div>
    </WeatherCard>
  );
};