# Testing Strategy & Performance Optimization

## Testing Overview

This document outlines the comprehensive testing strategy and performance optimization techniques for the React Weather App, ensuring high quality, reliability, and excellent user experience.

## Testing Pyramid Strategy

### Unit Testing (70% of tests)
**Tools**: Jest, React Testing Library
**Coverage**: Components, utilities, hooks, pure functions

### Integration Testing (20% of tests)
**Tools**: React Testing Library, Jest
**Coverage**: Component interactions, API integrations

### End-to-End Testing (10% of tests)
**Tools**: Cypress
**Coverage**: Critical user flows, cross-browser testing

## Unit Testing Implementation

### Component Testing

```typescript
// __tests__/components/WeatherCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherCondition } from '@/types/weather';

const mockCondition: WeatherCondition = {
  text: 'Sunny',
  icon: 'test-icon.png',
  code: 1000,
};

describe('WeatherCard', () => {
  it('renders temperature and condition correctly', () => {
    render(
      <WeatherCard
        temperature={25}
        condition={mockCondition}
        location="New York"
        unit="celsius"
      />
    );
    
    expect(screen.getByText('25°C')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('handles unit conversion', () => {
    const mockOnUnitChange = jest.fn();
    
    render(
      <WeatherCard
        temperature={25}
        condition={mockCondition}
        location="New York"
        unit="celsius"
        onUnitChange={mockOnUnitChange}
      />
    );
    
    const fahrenheitButton = screen.getByText('°F');
    fireEvent.click(fahrenheitButton);
    
    expect(mockOnUnitChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('shows loading state', () => {
    render(
      <WeatherCard
        temperature={25}
        condition={mockCondition}
        location="New York"
        isLoading={true}
      />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// __tests__/hooks/useWeather.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWeather } from '@/hooks/useWeather';
import { weatherApi } from '@/lib/api';

jest.mock('@/lib/api');

describe('useWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches weather data successfully', async () => {
    const mockWeatherData = { location: { name: 'New York' }, current: { temp_c: 25 } };
    (weatherApi.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);

    const { result } = renderHook(() => useWeather('New York'));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.weather).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    const errorMessage = 'API Error';
    (weatherApi.getCurrentWeather as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWeather('Invalid Location'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });
});
```

### Utility Function Testing

```typescript
// __tests__/utils/weatherUtils.test.ts
import { formatTemperature, getWeatherIcon } from '@/utils/weatherUtils';

describe('weatherUtils', () => {
  describe('formatTemperature', () => {
    it('formats celsius temperature', () => {
      expect(formatTemperature(25, 'celsius')).toBe('25°C');
    });

    it('formats fahrenheit temperature', () => {
      expect(formatTemperature(77, 'fahrenheit')).toBe('77°F');
    });

    it('rounds temperature to nearest integer', () => {
      expect(formatTemperature(25.6, 'celsius')).toBe('26°C');
    });
  });

  describe('getWeatherIcon', () => {
    it('returns correct icon for sunny weather', () => {
      expect(getWeatherIcon(1000)).toBe('/icons/sunny.png');
    });

    it('returns default icon for unknown code', () => {
      expect(getWeatherIcon(9999)).toBe('/icons/default.png');
    });
  });
});
```

## Integration Testing

### Component Interaction Testing

```typescript
// __tests__/integration/WeatherApp.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeatherApp from '@/components/WeatherApp';
import { weatherApi } from '@/lib/api';

jest.mock('@/lib/api');

describe('WeatherApp Integration', () => {
  const mockWeatherData = {
    location: { name: 'New York' },
    current: { temp_c: 25, condition: { text: 'Sunny' } }
  };

  beforeEach(() => {
    (weatherApi.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);
  });

  it('searches for weather and displays results', async () => {
    render(<WeatherApp />);

    const searchInput = screen.getByPlaceholderText('Enter location');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'New York' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.getByText('Sunny')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('New York');
  });

  it('handles search errors gracefully', async () => {
    (weatherApi.getCurrentWeather as jest.Mock).mockRejectedValue(new Error('City not found'));

    render(<WeatherApp />);

    fireEvent.change(screen.getByPlaceholderText('Enter location'), {
      target: { value: 'Invalid City' }
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('City not found')).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing with Cypress

### Cypress Configuration

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});
```

### E2E Test Examples

```typescript
// cypress/e2e/weather.cy.ts
describe('Weather App E2E Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/current.json*', {
      fixture: 'weather.json'
    }).as('getWeather');

    cy.visit('/');
  });

  it('loads and displays weather data', () => {
    cy.get('[data-testid="search-input"]').type('New York');
    cy.get('[data-testid="search-button"]').click();

    cy.wait('@getWeather');

    cy.contains('25°C').should('be.visible');
    cy.contains('Sunny').should('be.visible');
    cy.contains('New York').should('be.visible');
  });

  it('handles invalid location searches', () => {
    cy.intercept('GET', '**/current.json*', {
      statusCode: 400,
      body: { error: { message: 'No matching location found.' } }
    }).as('getWeatherError');

    cy.get('[data-testid="search-input"]').type('Invalid City');
    cy.get('[data-testid="search-button"]').click();

    cy.wait('@getWeatherError');

    cy.contains('No matching location found').should('be.visible');
  });

  it('maintains search history', () => {
    cy.get('[data-testid="search-input"]').type('London');
    cy.get('[data-testid="search-button"]').click();

    cy.wait('@getWeather');

    cy.get('[data-testid="search-history"]').should('contain', 'London');
  });
});
```

## Performance Testing

### Lighthouse CI Integration

```javascript
// .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouse.config.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Lighthouse Configuration

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      startServerReadyPattern: 'ready on',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Performance Optimization Techniques

### Bundle Optimization

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['cdn.weatherapi.com'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
});
```

### React Performance Optimizations

```typescript
// Use React.memo for expensive components
export const WeatherCard = React.memo(({ temperature, condition, location }) => {
  // Component implementation
});

// Use useCallback for event handlers
const handleSearch = useCallback((query: string) => {
  // Search logic
}, []);

// Use useMemo for expensive calculations
const formattedDate = useMemo(() => {
  return new Date().toLocaleDateString();
}, []);

// Virtualize long lists
import { FixedSizeList as List } from 'react-window';

const ForecastList = ({ forecastDays }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ForecastDay day={forecastDays[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={forecastDays.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### API Performance

```typescript
// Implement caching with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['weather', location],
  queryFn: () => weatherApi.getCurrentWeather(location),
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});

// Implement debouncing for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## Monitoring and Analytics

### Performance Monitoring

```typescript
// src/utils/performance.ts
export const trackWebVitals = (metric: any) => {
  // Send to analytics service
  console.log(metric);
};

export const trackApiPerformance = (url: string, duration: number) => {
  // Track API response times
};

export const trackUserInteraction = (action: string, data?: any) => {
  // Track user interactions
};
```

### Error Tracking

```typescript
// src/utils/errorHandler.ts
export const logError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context);
  // Send to error tracking service (Sentry, etc.)
};

// Error Boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }
  
  render() {
    return this.props.children;
  }
}
```

## Test Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 80%+
- **Components**: 75%+
- **Hooks**: 85%+
- **Utilities**: 90%+
- **API Layer**: 80%+

### Coverage Configuration

```json
// package.json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/index.ts",
      "!src/**/types.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

This comprehensive testing strategy ensures that the React Weather App meets high quality standards while maintaining excellent performance across all user interactions and scenarios.