import React from 'react';
import { cn } from '@/lib/utils/cn';

interface WeatherCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  isLoading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  children,
  className,
  title,
  isLoading = false,
}) => {
  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20',
        'transition-all duration-300 hover:shadow-xl hover:bg-white/15',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

// Utility function to format temperature with unit
export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string => {
  return unit === 'celsius' ? `${Math.round(temp)}°C` : `${Math.round(temp)}°F`;
};

// Utility function to format wind speed
export const formatWindSpeed = (speed: number, unit: 'metric' | 'imperial' = 'metric'): string => {
  return unit === 'metric' ? `${speed} km/h` : `${speed} mph`;
};

// Utility function to format date
export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}): string => {
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Utility function to get weather icon URL
export const getWeatherIconUrl = (iconPath: string): string => {
  // WeatherAPI icons are relative paths like "//cdn.weatherapi.com/weather/64x64/day/113.png"
  // We need to convert them to absolute URLs
  if (iconPath.startsWith('//')) {
    return `https:${iconPath}`;
  }
  return iconPath;
};