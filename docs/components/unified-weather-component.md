# UnifiedWeather Component

## Overview
The `UnifiedWeather` component combines the functionality of both `CurrentWeather` and `WeatherForecast` components into a single, cohesive weather display. It presents the 5-day forecast at the top, followed by a "Today" separator, and then displays current weather metrics in a compact grid layout.

## Props Interface

```typescript
interface UnifiedWeatherProps {
  // Data sources
  currentData: CurrentWeatherResponse | null;
  forecastData: ForecastResponse | null;
  
  // Loading and error states
  isLoading?: boolean;
  error?: string | null;
  
  // Unit preferences
  temperatureUnit?: 'celsius' | 'fahrenheit';
  windSpeedUnit?: 'metric' | 'imperial';
  timeFormat?: '12hr' | '24hr';
  pressureUnit?: 'mb' | 'inHg';
  
  // Forecast configuration
  days?: number;
  
  // Layout options
  compactMode?: boolean;
  showLocationHeader?: boolean;
}
```

## Component Structure

### 1. Forecast Section (Top)
- Displays 5-day weather forecast in a responsive grid
- Each forecast card shows:
  - Date and day of week
  - Weather condition icon
  - Temperature range (high/low)
  - Precipitation chances (if applicable)
  - Today's forecast is highlighted with special styling

### 2. Today Separator
- Visual divider with "Today" label
- Clear separation between forecast and current weather sections
- Accessible ARIA labeling

### 3. Current Weather Section (Bottom)
- Location header (optional)
- Main weather display with temperature and condition
- Sun times (sunrise/sunset) when available
- Current time information
- Compact metrics grid with 6 weather parameters:
  - Humidity
  - Wind speed
  - Pressure
  - Visibility
  - UV Index
  - Last updated time

## Responsive Design

### Mobile (≤ 640px)
- Forecast: Horizontal scrollable cards
- Metrics: 2-column grid
- Compact spacing and typography

### Tablet (641px - 1024px)
- Forecast: 2-column grid
- Metrics: 3-column grid
- Balanced spacing

### Desktop (≥ 1025px)
- Forecast: 5-column grid (one column per day)
- Metrics: 6-column grid (full width utilization)
- Optimal spacing and typography

## Accessibility Features

- **ARIA Labels**: All interactive elements have proper aria-labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Semantic HTML structure
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Compatible with high contrast modes

## Usage Example

```typescript
import { UnifiedWeather } from '@/components/UnifiedWeather';

// In your component
<UnifiedWeather
  currentData={currentWeatherData}
  forecastData={forecastData}
  isLoading={isLoading}
  error={error}
  temperatureUnit={temperatureUnit}
  windSpeedUnit={windSpeedUnit}
  timeFormat={timeFormat}
  pressureUnit={pressureUnit}
  days={5}
/>
```

## Migration from Separate Components

### Before
```typescript
<CurrentWeather
  data={currentData}
  isLoading={isCurrentLoading}
  error={currentError}
  // ... other props
/>
<WeatherForecast
  data={forecastData}
  isLoading={isForecastLoading}
  error={forecastError}
  // ... other props
/>
```

### After
```typescript
<UnifiedWeather
  currentData={currentData}
  forecastData={forecastData}
  isLoading={isCurrentLoading || isForecastLoading}
  error={currentError || forecastError}
  // ... other props
/>
```

## Benefits

1. **Unified Data Handling**: Single component manages both current and forecast data
2. **Improved UX**: Cohesive visual hierarchy and consistent styling
3. **Performance**: Reduced re-renders compared to separate components
4. **Maintainability**: One component to update instead of two
5. **Responsive**: Better mobile experience with optimized layout

## Testing

Component includes comprehensive test coverage for:
- Loading states
- Error states
- Data rendering
- Responsive behavior
- Accessibility features

Run tests with:
```bash
npm test UnifiedWeather.test.tsx
```

## Dependencies

- React 18+
- TypeScript
- Lucide React (icons)
- FontAwesome (weather icons)
- Tailwind CSS (styling)
- Testing Library (unit tests)