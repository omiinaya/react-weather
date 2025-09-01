import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnifiedWeather } from './UnifiedWeather';
import { CurrentWeatherResponse, ForecastResponse } from '@/types/weather';

// Mock data for testing
const mockCurrentData: CurrentWeatherResponse = {
  location: {
    name: 'Test City',
    region: 'Test Region',
    country: 'Test Country',
    lat: 40.7128,
    lon: -74.0060,
    tz_id: 'America/New_York',
    localtime_epoch: 1735776000,
    localtime: '2025-01-02 12:00'
  },
  current: {
    last_updated_epoch: 1735776000,
    last_updated: '2025-01-02 12:00',
    temp_c: 20,
    temp_f: 68,
    is_day: 1,
    condition: {
      text: 'Sunny',
      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      code: 113
    },
    wind_mph: 5,
    wind_kph: 8,
    wind_degree: 180,
    wind_dir: 'S',
    pressure_mb: 1013,
    pressure_in: 29.92,
    precip_mm: 0,
    precip_in: 0,
    humidity: 50,
    cloud: 0,
    feelslike_c: 21,
    feelslike_f: 70,
    windchill_c: 20,
    windchill_f: 68,
    heatindex_c: 21,
    heatindex_f: 70,
    dewpoint_c: 10,
    dewpoint_f: 50,
    vis_km: 10,
    vis_miles: 6,
    uv: 6,
    gust_mph: 8,
    gust_kph: 13
  }
};

const mockForecastData: ForecastResponse = {
  location: mockCurrentData.location,
  current: mockCurrentData.current,
  forecast: {
    forecastday: [
      {
        date: '2025-01-02',
        date_epoch: 1735776000,
        day: {
          maxtemp_c: 25,
          maxtemp_f: 77,
          mintemp_c: 15,
          mintemp_f: 59,
          avgtemp_c: 20,
          avgtemp_f: 68,
          maxwind_mph: 10,
          maxwind_kph: 16,
          totalprecip_mm: 0,
          totalprecip_in: 0,
          totalsnow_cm: 0,
          avgvis_km: 10,
          avgvis_miles: 6,
          avghumidity: 50,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 0,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            code: 113
          },
          uv: 6
        },
        astro: {
          sunrise: '07:00 AM',
          sunset: '05:00 PM',
          moonrise: '08:00 PM',
          moonset: '06:00 AM',
          moon_phase: 'Waxing Gibbous',
          moon_illumination: 80,
          is_moon_up: 0,
          is_sun_up: 1
        },
        hour: []
      }
    ]
  }
};

describe('UnifiedWeather', () => {
  test('renders loading state', () => {
    render(<UnifiedWeather currentData={null} forecastData={null} isLoading={true} />);
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<UnifiedWeather currentData={null} forecastData={null} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(<UnifiedWeather currentData={null} forecastData={null} />);
    expect(screen.getByText('Search for a location to see weather information')).toBeInTheDocument();
  });

  test('renders with current weather data only', () => {
    render(<UnifiedWeather currentData={mockCurrentData} forecastData={null} />);
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
  });

  test('renders with forecast data only', () => {
    render(<UnifiedWeather currentData={null} forecastData={mockForecastData} />);
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  test('renders with both current and forecast data', () => {
    render(<UnifiedWeather currentData={mockCurrentData} forecastData={mockForecastData} />);
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
  });

  test('displays weather metrics correctly', () => {
    render(<UnifiedWeather currentData={mockCurrentData} forecastData={mockForecastData} />);
    expect(screen.getByText('50%')).toBeInTheDocument(); // Humidity
    expect(screen.getByText('8 km/h')).toBeInTheDocument(); // Wind
    expect(screen.getByText('1013 mb')).toBeInTheDocument(); // Pressure
  });
});