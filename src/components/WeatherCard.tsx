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
        'weather-card p-6',
        'animate-fade-in',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-weather-pulse"></div>
          {title}
        </h3>
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

// Utility function to format date - display exactly as YYYY-MM-DD without timezone conversion
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  // Parse the date string directly
  const [year, month, day] = dateString.split('-').map(Number);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create date using UTC to avoid timezone shifts
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = options?.weekday ? dayNames[date.getUTCDay()] + ', ' : '';
  const monthStr = options?.month ? monthNames[month - 1] : '';
  const dayStr = options?.day ? ' ' + day : '';
  return `${weekday}${monthStr}${dayStr}`;
};
