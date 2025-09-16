import { extendForecastToFiveDays } from './forecast-extension';
import { ForecastResponse } from '@/types/weather';

// Simple manual test function
export function testForecastExtension() {
  console.log('Testing forecast extension utility...');

  // Create mock data
  const mockResponse: ForecastResponse = {
    location: {
      name: 'Test City',
      region: 'Test Region',
      country: 'Test Country',
      lat: 40.7128,
      lon: -74.0060,
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
      forecastday: [
        {
          date: '2021-01-01',
          date_epoch: 1609459200,
          day: {
            maxtemp_c: 20,
            maxtemp_f: 68,
            mintemp_c: 10,
            mintemp_f: 50,
            avgtemp_c: 15,
            avgtemp_f: 59,
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
            sunrise: '07:00 AM',
            sunset: '05:00 PM',
            moonrise: '08:00 PM',
            moonset: '06:00 AM',
            moon_phase: 'Waxing Crescent',
            moon_illumination: 45,
            is_moon_up: 0,
            is_sun_up: 1
          },
          hour: []
        },
        {
          date: '2021-01-02',
          date_epoch: 1609545600,
          day: {
            maxtemp_c: 22,
            maxtemp_f: 72,
            mintemp_c: 12,
            mintemp_f: 54,
            avgtemp_c: 17,
            avgtemp_f: 63,
            maxwind_mph: 12,
            maxwind_kph: 19,
            totalprecip_mm: 0,
            totalprecip_in: 0,
            totalsnow_cm: 0,
            avgvis_km: 10,
            avgvis_miles: 6,
            avghumidity: 60,
            daily_will_it_rain: 0,
            daily_chance_of_rain: 5,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: 'Partly cloudy',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
              code: 1003
            },
            uv: 6
          },
          astro: {
            sunrise: '07:00 AM',
            sunset: '05:00 PM',
            moonrise: '09:00 PM',
            moonset: '06:30 AM',
            moon_phase: 'Waxing Crescent',
            moon_illumination: 55,
            is_moon_up: 0,
            is_sun_up: 1
          },
          hour: []
        },
        {
          date: '2021-01-03',
          date_epoch: 1609632000,
          day: {
            maxtemp_c: 19,
            maxtemp_f: 66,
            mintemp_c: 9,
            mintemp_f: 48,
            avgtemp_c: 14,
            avgtemp_f: 57,
            maxwind_mph: 15,
            maxwind_kph: 24,
            totalprecip_mm: 2,
            totalprecip_in: 0.08,
            totalsnow_cm: 0,
            avgvis_km: 9,
            avgvis_miles: 6,
            avghumidity: 70,
            daily_will_it_rain: 1,
            daily_chance_of_rain: 60,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: 'Light rain',
              icon: '//cdn.weatherapi.com/weather/64x64/day/296.png',
              code: 1183
            },
            uv: 3
          },
          astro: {
            sunrise: '07:01 AM',
            sunset: '05:01 PM',
            moonrise: '10:00 PM',
            moonset: '07:00 AM',
            moon_phase: 'First Quarter',
            moon_illumination: 65,
            is_moon_up: 0,
            is_sun_up: 1
          },
          hour: []
        }
      ]
    }
  };

  try {
    const extended = extendForecastToFiveDays(mockResponse);
    
    console.log('✅ Test successful!');
    console.log(`Original days: ${mockResponse.forecast.forecastday.length}`);
    console.log(`Extended days: ${extended.forecast.forecastday.length}`);
    
    // Show all days
    extended.forecast.forecastday.forEach((day, index) => {
      console.log(`Day ${index + 1}: ${day.date} - ${day.day.maxtemp_c}°C/${day.day.mintemp_c}°C - ${day.day.condition.text}`);
    });
    
    // Verify the extension
    if (extended.forecast.forecastday.length === 5) {
      console.log('✅ Successfully extended to 5 days!');
    } else {
      console.error('❌ Failed to extend to 5 days');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
if (typeof window !== 'undefined') {
  // In browser
  testForecastExtension();
} else {
  // In Node.js
  testForecastExtension();
}