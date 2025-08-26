# Accessibility & Responsive Design Guide

## Overview

This document outlines the comprehensive accessibility (A11y) and responsive design strategy for the React Weather App, ensuring an inclusive experience across all devices and user abilities.

## Accessibility Standards Compliance

### WCAG 2.1 Level AA Compliance
The application adheres to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards:

- **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
- **Operable**: UI components and navigation must be operable by all users
- **Understandable**: Information and operation of UI must be understandable
- **Robust**: Content must be robust enough to work with current and future user tools

## Responsive Design System

### Breakpoint Strategy

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

### Mobile-First Approach

```typescript
// Component responsive patterns
const WeatherCard = () => {
  return (
    <div className="flex flex-col xs:flex-row md:flex-col lg:flex-row">
      {/* Responsive layout that adapts to screen size */}
    </div>
  );
};
```

### Responsive Typography Scale

```css
/* Custom responsive typography */
.text-responsive {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

.heading-responsive {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}
```

## Accessibility Implementation

### Semantic HTML Structure

```typescript
// Good: Semantic HTML
const WeatherApp = () => {
  return (
    <main>
      <header>
        <h1>Weather App</h1>
        <nav>{/* Navigation */}</nav>
      </header>
      
      <section aria-labelledby="weather-heading">
        <h2 id="weather-heading">Current Weather</h2>
        {/* Weather content */}
      </section>
      
      <footer>{/* Footer content */}</footer>
    </main>
  );
};

// Avoid: Non-semantic div soup
const BadWeatherApp = () => {
  return (
    <div>
      <div>{/* Header */}</div>
      <div>{/* Content */}</div>
      <div>{/* Footer */}</div>
    </div>
  );
};
```

### ARIA Attributes and Roles

```typescript
// Proper ARIA usage
const SearchComponent = () => {
  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search for location
      </label>
      <input
        id="search-input"
        type="text"
        placeholder="Enter location"
        aria-describedby="search-help"
      />
      <span id="search-help" className="sr-only">
        Enter a city name or zip code
      </span>
    </div>
  );
};
```

### Keyboard Navigation

```typescript
// Full keyboard accessibility
const InteractiveComponent = () => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Handle action
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Get weather information"
    >
      Get Weather
    </button>
  );
};
```

## Color and Contrast

### Accessible Color Palette

```css
/* WCAG compliant color scheme */
:root {
  --primary: #2563eb; /* Blue 600 - contrast ratio: 4.5:1 on white */
  --primary-dark: #1d4ed8; /* Blue 700 */
  --text-primary: #1f2937; /* Gray 800 */
  --text-secondary: #6b7280; /* Gray 500 */
  --background: #ffffff;
  --surface: #f9fafb; /* Gray 50 */
  --error: #dc2626; /* Red 600 */
  --success: #059669; /* Green 600 */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --primary: #0000ff;
    --text-primary: #000000;
    --background: #ffffff;
  }
}
```

### Contrast Validation

All color combinations meet WCAG 2.1 AA requirements:
- Normal text: ≥ 4.5:1 contrast ratio
- Large text: ≥ 3:1 contrast ratio
- UI components: ≥ 3:1 contrast ratio

## Screen Reader Support

### ARIA Live Regions

```typescript
// Dynamic content announcements
const WeatherUpdate = ({ message }: { message: string }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Usage
<WeatherUpdate message={`Weather updated for ${location}. Temperature is ${temp} degrees.`} />
```

### Skip Navigation

```typescript
// Skip to main content link
const SkipNavigation = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:ring-2 focus:ring-blue-600"
    >
      Skip to main content
    </a>
  );
};
```

## Focus Management

### Visible Focus Indicators

```css
/* Custom focus styles */
.focus\:ring-accessible:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Remove default outline only when using custom */
button:focus:not(:focus-visible) {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Programmatic Focus

```typescript
// Manage focus for modal dialogs
const useFocusManagement = () => {
  const focusTrapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close modal and return focus
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return focusTrapRef;
};
```

## Reduced Motion Support

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Smooth transitions for those who want them */
.transition-smooth {
  transition: all 0.3s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .motion-safe\:animate-spin {
    animation: spin 1s linear infinite;
  }
}
```

## Form Accessibility

### Accessible Form Patterns

```typescript
const SearchForm = () => {
  const [error, setError] = useState('');

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="location-search" className="block text-sm font-medium">
          Location
        </label>
        <input
          id="location-search"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'location-error' : undefined}
          className={error ? 'border-red-500' : ''}
        />
        {error && (
          <div id="location-error" className="text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <button type="submit" aria-label="Search for weather">
        Search
      </button>
    </form>
  );
};
```

## Testing Accessibility

### Automated Testing

```json
// package.json scripts
{
  "scripts": {
    "test:a11y": "npm run build && serve -s out & wait-on http://localhost:3000 && pa11y-ci",
    "lint:a11y": "eslint --ext .ts,.tsx --plugin jsx-a11y --rule 'jsx-a11y/alt-text: error' src/"
  }
}
```

### Manual Testing Checklist

**Keyboard Navigation**
- [ ] Tab through all interactive elements
- [ ] Enter/space to activate buttons and controls
- [ ] Escape to close modals and dialogs
- [ ] Arrow keys for custom components

**Screen Reader Testing**
- [ ] Announcements for dynamic content
- [ ] Proper reading order
- [ ] Meaningful alt text for images
- [ ] Form field labels and instructions

**Visual Testing**
- [ ] High contrast mode compatibility
- [ ] Zoom to 200% without loss of functionality
- [ ] Color blindness simulation
- [ ] Reduced motion preferences

### Tools for Testing

- **Lighthouse**: Automated accessibility auditing
- **axe-core**: Integration testing for accessibility
- **pa11y**: Command-line accessibility testing
- **Wave**: Browser extension for quick checks
- **NVDA**: Screen reader for Windows testing
- **VoiceOver**: Screen reader for macOS testing

## Responsive Patterns

### Grid and Flexbox Layouts

```typescript
// Responsive grid layout
const WeatherGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Weather cards that respond to screen size */}
    </div>
  );
};

// Flexbox with wrapping
const ForecastList = () => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* Forecast items that wrap on smaller screens */}
    </div>
  );
};
```

### Responsive Images

```typescript
// Next.js Image component with responsive sizes
const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  return (
    <Image
      src={condition.icon}
      alt={condition.text}
      width={64}
      height={64}
      sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 64px"
      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
    />
  );
};
```

### Touch Target Sizes

```css
/* Minimum touch target size */
.btn-accessible {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem 1rem;
}

/* Spacing for touch devices */
.touch-spacing {
  margin: 0.5rem;
}

@media (hover: none) and (pointer: coarse) {
  .touch-optimized {
    padding: 1rem;
  }
}
```

## Performance and Accessibility

### Loading States

```typescript
// Accessible loading patterns
const LoadingSpinner = () => {
  return (
    <div role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading weather data...</span>
    </div>
  );
};

// Skeleton screens for better perceived performance
const WeatherCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-4 w-3/4 mb-2" />
      <div className="bg-gray-200 h-8 w-1/2" />
      <div className="bg-gray-200 h-20 w-full mt-2" />
    </div>
  );
};
```

## Internationalization Considerations

### RTL Support

```css
/* RTL support with logical properties */
.weather-card {
  padding-inline-start: 1rem;
  padding-inline-end: 1rem;
  margin-inline-start: auto;
  margin-inline-end: auto;
}

/* Direction-aware styling */
[dir="rtl"] .weather-icon {
  transform: scaleX(-1);
}
```

### Language Support

```typescript
// Accessible language switching
const LanguageSelector = () => {
  return (
    <div role="region" aria-label="Language selection">
      <button
        onClick={() => changeLanguage('en')}
        aria-pressed={currentLanguage === 'en'}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('es')}
        aria-pressed={currentLanguage === 'es'}
      >
        Español
      </button>
    </div>
  );
};
```

This comprehensive accessibility and responsive design guide ensures that the React Weather App provides an inclusive, accessible experience for all users across all devices and abilities.