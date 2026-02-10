import { extendForecastToFiveDays } from '../lib/utils/forecast-extension';
import { ForecastResponse, ForecastDay } from '@/types/weather';

describe('Forecast Extension Utility', () => {
  const createMockForecastDay = (date: string, maxTemp: number, minTemp: number) => ({
    date,
    date_epoch: Math.floor(new Date(date).getTime() / 1000),
    day: {
      maxtemp_c: maxTemp,
      maxtemp_f: Math.round(maxTemp * 9/5 + 32),
      mintemp_c: minTemp,
      mintemp_f: Math.round(minTemp * 9/5 + 32),
      avgtemp_c: Math.round((maxTemp + minTemp) / 2),
      avgtemp_f: Math.round(((maxTemp + minTemp) / 2) * 9/5 + 32),
      maxwind_mph: 10,
      maxwind_kph: 16,
      totalprecip_mm: 0,
      totalprecip_in: 0,
      totalsnow_cm: 0,
      avgvis_km: 10,
      avgvis_miles: 6,
      avghumidity: 65,
      daily_will_it_rain: 0,
      daily_chance_of_rain: 10,
      daily_will_it_snow: 0,
      daily_chance_of_snow: 0,
      condition: {
        text: 'Sunny',
        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        code: 1000
      },
      uv: 5
    },
    astro: {
      sunrise: '06:30 AM',
      sunset: '08:00 PM',
      moonrise: '10:00 PM',
      moonset: '05:00 AM',
      moon_phase: 'Waxing Crescent',
      moon_illumination: 45,
      is_moon_up: 0,
      is_sun_up: 1
    },
    hour: []
  });

  const createMockResponse = (days: ForecastDay[]): ForecastResponse => ({
    location: {
      name: 'Test City',
      region: 'Test Region',
      country: 'Test Country',
      lat: 40.7128,
      lon: -74.006,
      tz_id: 'America/New_York',
      localtime_epoch: 1609459200,
      localtime: '2021-01-01 12:00'
    },
    current: {
      last_updated_epoch: 1609459200,
      last_updated: '2021-01-01 12:00',
      temp_c: 20,
      temp_f: 68,
      is_day: 1,
      condition: {
        text: 'Sunny',
        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        code: 1000
      },
      wind_mph: 5,
      wind_kph: 8,
      wind_degree: 180,
      wind_dir: 'S',
      pressure_mb: 1013,
      pressure_in: 29.9,
      precip_mm: 0,
      precip_in: 0,
      humidity: 65,
      cloud: 0,
      feelslike_c: 20,
      feelslike_f: 68,
      windchill_c: 19,
      windchill_f: 66,
      heatindex_c: 20,
      heatindex_f: 68,
      dewpoint_c: 13,
      dewpoint_f: 55,
      vis_km: 10,
      vis_miles: 6,
      gust_mph: 8,
      gust_kph: 13,
      uv: 5
    },
    forecast: {
      forecastday: days
    }
  });

  it('should extend 3-day forecast to 5 days', () => {
    const threeDayResponse = createMockForecastResponse([
      createMockForecastDay('2021-01-01', 20, 10),
      createMockForecastDay('2021-01-02', 22, 12),
      createMockForecastDay('2021-01-03', 24, 14)
    ]);

    const extended = extendForecastToFiveDays(threeDayResponse);
    
    expect(extended.forecast.forecastday).toHaveLength(5);
    expect(extended.forecast.forecastday[3].date).toBe('2021-01-04');
    expect(extended.forecast.forecastday[4].date).toBe('2021-01-05');
  });

  it('should extend 1-day forecast to 5 days', () => {
    const oneDayResponse = createMockForecastResponse([
      createMockForecastDay('2021-01-01', 18, 8)
    ]);

    const extended = extendForecastToFiveDays(oneDayResponse);
    
    expect(extended.forecast.forecastday).toHaveLength(5);
    expect(extended.forecast.forecastday[1].date).toBe('2021-01-02');
    expect(extended.forecast.forecastday[2].date).toBe('2021-01-03');
    expect(extended.forecast.forecastday[3].date).toBe('2021-01-04');
    expect(extended.forecast.forecastday[4].date).toBe('2021-01-05');
  });

  it('should handle 5+ day forecast by slicing to exactly 5 days', () => {
    const sevenDayResponse = createMockForecastResponse([
      createMockForecastDay('2021-01-01', 20, 10),
      createMockForecastDay('2021-01-02', 22, 12),
      createMockForecastDay('2021-01-03', 24, 14),
      createMockForecastDay('2021-01-04', 25, 15),
      createMockForecastDay('2021-01-05', 23, 13),
      createMockForecastDay('2021-01-06', 21, 11),
      createMockForecastDay('2021-01-07', 19, 9)
    ]);

    const extended = extendForecastToFiveDays(sevenDayResponse);
    
    expect(extended.forecast.forecastday).toHaveLength(5);
    expect(extended.forecast.forecastday[0].date).toBe('2021-01-01');
    expect(extended.forecast.forecastday[4].date).toBe('2021-01-05');
  });

  it('should maintain realistic temperature trends', () => {
    const threeDayResponse = createMockForecastResponse([
      createMockForecastDay('2021-01-01', 20, 10),
      createMockForecastDay('2021-01-02', 22, 12),
      createMockForecastDay('2021-01-03', 24, 14)
    ]);

    const extended = extendForecastToFiveDays(threeDayResponse);
    
    // Generated temperatures should be reasonable and follow trend
    const day4Max = extended.forecast.forecastday[3].day.maxtemp_c;
    const day5Max = extended.forecast.forecastday[4].day.maxtemp_c;
    
    expect(day4Max).toBeGreaterThanOrEqual(22);
    expect(day4Max).toBeLessThanOrEqual(30);
    expect(day5Max).toBeGreaterThanOrEqual(20);
    expect(day5Max).toBeLessThanOrEqual(32);
  });

  it('should preserve original properties in extended response', () => {
    const originalResponse = createMockForecastResponse([
      createMockForecastDay('2021-01-01', 20, 10)
    ]);

    const extended = extendForecastToFiveDays(originalResponse);
    
    // Original properties should be preserved
    expect(extended.location.name).toBe('Test City');
    expect(extended.current.temp_c).toBe(20);
    expect(extended.forecast.forecastday[0].day.maxtemp_c).toBe(20);
  });

  function createMockForecastResponse(days: ForecastDay[]): ForecastResponse {
    return createMockResponse(days);
  }
});