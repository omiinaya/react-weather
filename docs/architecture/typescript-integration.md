# TypeScript Integration Guide

## Overview

This document outlines the TypeScript implementation strategy for the React Weather App, ensuring type safety, better developer experience, and maintainable codebase.

## TypeScript Configuration

### tsconfig.json Setup

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Type Definitions

### Core Weather Types

```typescript
// src/types/weather.ts

export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface CurrentWeather {
  last_updated_epoch: number;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastDay {
  date: string;
  date_epoch: number;
  day: DayForecast;
  astro: Astronomy;
  hour: HourForecast[];
}

export interface DayForecast {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_mph: number;
  maxwind_kph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  totalsnow_cm: number;
  avgvis_km: number;
  avgvis_miles: number;
  avghumidity: number;
  daily_will_it_rain: number;
  daily_chance_of_rain: number;
  daily_will_it_snow: number;
  daily_chance_of_snow: number;
  condition: WeatherCondition;
  uv: number;
}

export interface Astronomy {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: number;
}

export interface HourForecast {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  will_it_rain: number;
  chance_of_rain: number;
  will_it_snow: number;
  chance_of_snow: number;
  vis_km: number;
  vis_miles: number;
  gust_mph: number;
  gust_kph: number;
  uv: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
}

export interface ForecastData {
  location: Location;
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}
```

### API Response Types with Zod Validation

```typescript
// src/lib/api/schemas.ts
import { z } from 'zod';

export const weatherConditionSchema = z.object({
  text: z.string(),
  icon: z.string(),
  code: z.number(),
});

export const locationSchema = z.object({
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  tz_id: z.string(),
  localtime_epoch: z.number(),
  localtime: z.string(),
});

export const currentWeatherSchema = z.object({
  last_updated_epoch: z.number(),
  last_updated: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  is_day: z.number(),
  condition: weatherConditionSchema,
  wind_mph: z.number(),
  wind_kph: z.number(),
  wind_degree: z.number(),
  wind_dir: z.string(),
  pressure_mb: z.number(),
  pressure_in: z.number(),
  precip_mm: z.number(),
  precip_in: z.number(),
  humidity: z.number(),
  cloud: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  windchill_c: z.number(),
  windchill_f: z.number(),
  heatindex_c: z.number(),
  heatindex_f: z.number(),
  dewpoint_c: z.number(),
  dewpoint_f: z.number(),
  vis_km: z.number(),
  vis_miles: z.number(),
  uv: z.number(),
  gust_mph: z.number(),
  gust_kph: z.number(),
});

export const weatherDataSchema = z.object({
  location: locationSchema,
  current: currentWeatherSchema,
});

export const forecastDataSchema = z.object({
  location: locationSchema,
  current: currentWeatherSchema,
  forecast: z.object({
    forecastday: z.array(z.any()), // Will be refined with specific forecast schemas
  }),
});

// Utility function for safe API response parsing
export function parseApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('API response validation failed:', error);
    throw new Error('Invalid API response format');
  }
}
```

## Component Props Typing

### Functional Component Patterns

```typescript
// Basic component with props
interface WeatherCardProps {
  temperature: number;
  condition: string;
  location: string;
  unit?: 'celsius' | 'fahrenheit';
  isLoading?: boolean;
  onUnitChange?: (unit: 'celsius' | 'fahrenheit') => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  condition,
  location,
  unit = 'celsius',
  isLoading = false,
  onUnitChange,
}) => {
  // Component implementation
};

// Component with children
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

// Component with default props using interface merging
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  // Implementation
};
```

### Context Typing

```typescript
// src/contexts/WeatherContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { WeatherData, ForecastData } from '@/types/weather';

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  isLoading: boolean;
  error: string | null;
  searchHistory: string[];
}

type WeatherAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'SET_FORECAST'; payload: ForecastData }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface WeatherContextType {
  state: WeatherState;
  dispatch: React.Dispatch<WeatherAction>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
```

## Custom Hooks Typing

```typescript
// src/hooks/useWeather.ts
import { useState, useEffect } from 'react';
import { WeatherData, ForecastData } from '@/types/weather';
import { weatherApi } from '@/lib/api';

interface UseWeatherReturn {
  weather: WeatherData | null;
  forecast: ForecastData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWeather = (location: string): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implementation...
};

// Generic hook with TypeScript
interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  remove: () => void;
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  // Implementation...
};
```

## API Client Typing

```typescript
// src/lib/api/weatherApi.ts
import { WeatherData, ForecastData } from '@/types/weather';
import { parseApiResponse, weatherDataSchema, forecastDataSchema } from './schemas';

export class WeatherApiClient {
  private baseUrl = 'https://api.weatherapi.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    const response = await fetch(
      `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return parseApiResponse(weatherDataSchema, data);
  }

  async getForecast(location: string, days: number = 5): Promise<ForecastData> {
    const response = await fetch(
      `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return parseApiResponse(forecastDataSchema, data);
  }
}
```

## Utility Types and Helpers

```typescript
// src/types/utils.ts

// Generic response type for API calls
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Partial utility for form states
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Async function return type
export type AsyncReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => Promise<infer U> ? U : never;

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## Testing with TypeScript

```typescript
// __tests__/components/WeatherCard.test.tsx
import { render, screen } from '@testing-library/react';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherCondition } from '@/types/weather';

const mockCondition: WeatherCondition = {
  text: 'Sunny',
  icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
  code: 1000,
};

describe('WeatherCard', () => {
  it('renders temperature correctly', () => {
    render(
      <WeatherCard
        temperature={25}
        condition={mockCondition.text}
        location="New York"
      />
    );
    
    expect(screen.getByText('25°C')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(
      <WeatherCard
        temperature={25}
        condition={mockCondition.text}
        location="New York"
        isLoading={true}
      />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Strict Null Checks
- Always enable `strictNullChecks`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Explicitly handle undefined cases

### 2. Type Narrowing
```typescript
function processWeather(data: WeatherData | null) {
  if (!data) {
    // Handle null case
    return;
  }
  
  // TypeScript knows data is WeatherData here
  console.log(data.location.name);
}
```

### 3. Avoid Any Type
- Use `unknown` instead of `any` for unknown types
- Use type guards to narrow unknown types
- Prefer specific types over generics when possible

### 4. Utility Types
- Use built-in TypeScript utilities: `Partial`, `Pick`, `Omit`, `Record`
- Create custom utility types for common patterns

### 5. API Response Validation
- Always validate API responses with Zod or similar
- Don't trust external data sources
- Provide fallbacks for invalid data

## Common Patterns

### Type Guards
```typescript
function isWeatherData(data: unknown): data is WeatherData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'location' in data &&
    'current' in data
  );
}
```

### Discriminated Unions
```typescript
type ApiResult = 
  | { status: 'success'; data: WeatherData }
  | { status: 'loading' }
  | { status: 'error'; message: string };

function handleResult(result: ApiResult) {
  switch (result.status) {
    case 'success':
      console.log(result.data);
      break;
    case 'loading':
      console.log('Loading...');
      break;
    case 'error':
      console.error(result.message);
      break;
  }
}
```

This TypeScript integration guide provides a comprehensive foundation for building a type-safe React weather application with excellent developer experience and maintainability.