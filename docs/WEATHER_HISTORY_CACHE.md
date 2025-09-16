# Weather History Cache System

## Overview

The weather history cache system provides a comprehensive solution for storing and retrieving historical weather data, enabling a 5-day forecast window that includes actual weather data for the past 2 days combined with current and future forecasts.

## Architecture

### Core Components

1. **useWeatherHistoryCache Hook** (`src/hooks/useWeatherHistoryCache.ts`)
   - Manages historical weather data storage in localStorage
   - Provides methods to store, retrieve, and clear cached data
   - Generates 5-day historical forecast windows

2. **WeatherContainer Component** (`src/components/WeatherContainer.tsx`)
   - Integrates historical data with current weather API responses
   - Creates enhanced 5-day forecasts using real historical data

3. **Utility Functions** (`src/lib/utils/weather-history-utils.ts`)
   - Date calculations for 5-day windows
   - Data transformation utilities
   - Cache coverage analysis

4. **Type Definitions** (`src/types/weather-history.ts`)
   - TypeScript interfaces for historical data structures
   - Enhanced forecast day types with metadata

## Data Structure

### 5-Day Historical Window
```
[Day-2, Day-1, Today, Day+1, Day+2]
```

- **Days -2 and -1**: Historical data from cache
- **Day 0 (Today)**: Current weather data
- **Days +1 and +2**: Forecast data from API

### Cache Storage Format
```typescript
interface WeatherHistoryCache {
  [location: string]: {
    [date: string]: ForecastDay;
  };
}
```

## Usage

### Basic Implementation

```typescript
import { useWeatherHistoryCache } from '@/hooks/useWeatherHistoryCache';
import { WeatherContainer } from '@/components/WeatherContainer';

// In your component:
const { 
  historicalData, 
  storeHistoricalData, 
  getFiveDayForecast 
} = useWeatherHistoryCache();

// Store new weather data
storeHistoricalData(location, forecastData, currentData);
```

### Enhanced Forecast Generation

```typescript
import { createFiveDayHistoricalForecast } from '@/lib/utils/weather-history-utils';

const fiveDayForecast = createFiveDayHistoricalForecast(
  location,
  forecastData,
  historicalData[location] || {},
  currentData
);
```

## Features

### 1. Persistent Storage
- Uses browser localStorage for data persistence
- Automatically loads cached data on app startup
- Stores up to 2 days of historical data per location

### 2. Smart Data Combination
- Automatically combines cached historical data with API responses
- Falls back to generated data when historical data is unavailable
- Maintains data consistency across sessions

### 3. Date Labeling
- Provides contextual labels for historical dates:
  - "2 days ago"
  - "Yesterday"
  - "Today"
  - "Tomorrow"
  - "In 2 days"

### 4. Visual Indicators
- Historical days: Amber color scheme
- Today: Primary color scheme
- Future days: Green color scheme

## API Integration

### WeatherAPI Compatibility
- Designed to work with WeatherAPI.com responses
- Transforms current weather into forecast day format
- Handles missing historical data gracefully

### Error Handling
- Graceful degradation when historical data is unavailable
- Fallback to generated data patterns
- Clear error messaging for debugging

## Testing

### Manual Testing Steps
1. Load the application and search for a location
2. Observe the 5-day forecast window
3. Check browser DevTools → Application → Local Storage
4. Verify historical data is cached under key: `weather-history-cache`
5. Reload the page to confirm persistence

### Expected Behavior
- First visit: Shows 3 days from API + 2 fallback days
- Subsequent visits: Shows actual historical data for past days
- Data accumulates over time for better accuracy

## Performance Considerations

### Storage Optimization
- LocalStorage size: ~2-5KB per location for 2 days of data
- Automatic cleanup for old locations
- Minimal memory footprint

### Load Times
- Instant retrieval from cache vs API calls
- Background caching doesn't block UI
- Efficient data merging algorithms

## Future Enhancements

### Potential Improvements
1. **Historical API Integration**: Connect to WeatherAPI history endpoint for actual historical data
2. **Data Sync**: Cross-device synchronization of cached data
3. **Advanced Analytics**: Weather trend analysis over time
4. **Export/Import**: Allow users to backup their weather history
5. **Geolocation Caching**: Automatic caching for frequently accessed locations

## Configuration

### Environment Variables
```bash
# Weather API key (required for current/future data)
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

### Browser Requirements
- localStorage support (all modern browsers)
- No additional dependencies required

## Troubleshooting

### Common Issues
1. **No historical data showing**: Check browser localStorage permissions
2. **Incorrect date labels**: Verify system timezone settings
3. **Cache corruption**: Use clearCache() method to reset

### Debug Commands
```javascript
// Check cache contents
console.log(JSON.parse(localStorage.getItem('weather-history-cache')));

// Clear specific location cache
clearCache('New York');

// Clear all cache
clearCache();
```

## Dependencies

### Core Dependencies
- React Query (for API caching)
- localStorage API
- TypeScript for type safety

### Browser APIs
- localStorage
- Date/Time APIs
- JSON serialization