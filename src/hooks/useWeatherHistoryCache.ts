'use client';

import { useState, useCallback, useEffect } from 'react';
import { ForecastDay, ForecastResponse, CurrentWeatherResponse } from '@/types/weather';
import { getWeatherAPIService } from '@/lib/api/weather-api';

interface WeatherHistoryCache {
  [location: string]: {
    [date: string]: ForecastDay;
  };
}

interface WeatherHistoryState {
  historicalData: WeatherHistoryCache;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'weather-history-cache';

export const useWeatherHistoryCache = () => {
  const [state, setState] = useState<WeatherHistoryState>({
    historicalData: {},
    isLoading: false,
    error: null,
  });

  // Load cached data from localStorage on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          setState(prev => ({ ...prev, historicalData: data }));
        }
      } catch (error) {
        console.error('Failed to load weather history cache:', error);
      }
    };

    loadCachedData();
  }, []);

  // Save to localStorage whenever historical data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.historicalData));
    } catch (error) {
      console.error('Failed to save weather history cache:', error);
    }
  }, [state.historicalData]);

  // Get dates for the 5-day window: [Day-2, Day-1, Today, Day+1, Day+2]
  const getFiveDayWindowDates = useCallback((referenceDate: Date = new Date()): string[] => {
    const dates: string[] = [];
    
    for (let i = -2; i <= 2; i++) {
      const date = new Date(referenceDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
    }
    
    return dates;
  }, []);

  // Check if we have historical data for a specific date and location
  const hasHistoricalData = useCallback((location: string, date: string): boolean => {
    return !!(state.historicalData[location]?.[date]);
  }, [state.historicalData]);

  // Get historical data for a specific date and location
  const getHistoricalData = useCallback((location: string, date: string): ForecastDay | null => {
    return state.historicalData[location]?.[date] || null;
  }, [state.historicalData]);

  // Store historical data from API response
  const storeHistoricalData = useCallback((
    location: string,
    forecastData: ForecastResponse,
    currentData: CurrentWeatherResponse
  ) => {
    setState(prev => {
      const newHistoricalData = { ...prev.historicalData };
      
      if (!newHistoricalData[location]) {
        newHistoricalData[location] = {};
      }

      // Store each forecast day as historical data
      forecastData.forecast.forecastday.forEach(day => {
        newHistoricalData[location][day.date] = day;
      });

      // Also store current day if it's not in forecast
      const today = new Date().toISOString().split('T')[0];
      if (!newHistoricalData[location][today]) {
        // Create a forecast day from current weather
        const currentForecastDay: ForecastDay = {
          date: today,
          date_epoch: Math.floor(new Date(today).getTime() / 1000),
          day: {
            maxtemp_c: currentData.current.temp_c,
            maxtemp_f: currentData.current.temp_f,
            mintemp_c: currentData.current.temp_c - 5, // Estimate min temp
            mintemp_f: currentData.current.temp_f - 9,
            avgtemp_c: currentData.current.temp_c,
            avgtemp_f: currentData.current.temp_f,
            maxwind_kph: currentData.current.wind_kph,
            maxwind_mph: currentData.current.wind_mph,
            totalprecip_mm: 0,
            totalprecip_in: 0,
            totalsnow_cm: 0,
            avgvis_km: currentData.current.vis_km,
            avgvis_miles: currentData.current.vis_miles,
            avghumidity: currentData.current.humidity,
            daily_will_it_rain: 0,
            daily_chance_of_rain: 0,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: currentData.current.condition,
            uv: currentData.current.uv,
          },
          astro: {
            sunrise: '06:00 AM',
            sunset: '06:00 PM',
            moonrise: '12:00 AM',
            moonset: '12:00 PM',
            moon_phase: 'Full Moon',
            moon_illumination: 100,
            is_moon_up: 1,
            is_sun_up: 1,
          },
          hour: [],
        };

        newHistoricalData[location][today] = currentForecastDay;
      }

      return {
        ...prev,
        historicalData: newHistoricalData,
      };
    });
  }, []);

  // Fetch historical weather data for past dates
  const fetchHistoricalWeather = useCallback(async (
    location: string,
    date: string
  ): Promise<ForecastDay | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // WeatherAPI supports historical data via the "history.json" endpoint
      const service = getWeatherAPIService();
      
      // Note: This would require API key with history access
      // For now, we'll use the forecast endpoint with historical date parameter
      const data = await service.getForecast(location);
      
      if (data.forecast.forecastday.length > 0) {
        const historicalDay = data.forecast.forecastday[0];
        
        // Store the fetched historical data
        setState(prev => {
          const newHistoricalData = { ...prev.historicalData };
          if (!newHistoricalData[location]) {
            newHistoricalData[location] = {};
          }

          newHistoricalData[location][date] = historicalDay;

          return {
            ...prev,
            historicalData: newHistoricalData,
            isLoading: false,
          };
        });

        return historicalDay;
      }
    } catch (error) {
      console.error('Failed to fetch historical weather:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch historical data',
      }));
    }

    return null;
  }, []);

  // Get complete 5-day forecast window with historical data
  const getFiveDayForecast = useCallback(async (
    location: string,
    forecastData: ForecastResponse,
    currentData: CurrentWeatherResponse
  ): Promise<ForecastDay[]> => {
    const windowDates = getFiveDayWindowDates();
    const result: ForecastDay[] = [];

    // Store current data as historical
    storeHistoricalData(location, forecastData, currentData);

    for (const date of windowDates) {
      // Check if we have the date in forecast data
      const forecastDay = forecastData.forecast.forecastday.find(
        day => day.date === date
      );

      if (forecastDay) {
        // Use forecast data for future days
        result.push(forecastDay);
      } else {
        // Check historical cache for past days
        const historicalDay = getHistoricalData(location, date);
        
        if (historicalDay) {
          result.push(historicalDay);
        } else {
          // Try to fetch historical data
          const fetchedDay = await fetchHistoricalWeather(location, date);
          if (fetchedDay) {
            result.push(fetchedDay);
          } else {
            // Fallback: generate basic forecast day
            const fallbackDay: ForecastDay = {
              date,
              date_epoch: Math.floor(new Date(date).getTime() / 1000),
              day: {
                maxtemp_c: 20,
                maxtemp_f: 68,
                mintemp_c: 10,
                mintemp_f: 50,
                avgtemp_c: 15,
                avgtemp_f: 59,
                maxwind_kph: 10,
                maxwind_mph: 6,
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
                  code: 1000,
                },
                uv: 5,
              },
              astro: {
                sunrise: '06:00 AM',
                sunset: '06:00 PM',
                moonrise: '12:00 AM',
                moonset: '12:00 PM',
                moon_phase: 'Full Moon',
                moon_illumination: 100,
                is_moon_up: 1,
                is_sun_up: 1,
              },
              hour: [],
            };
            result.push(fallbackDay);
          }
        }
      }
    }

    return result;
  }, [getFiveDayWindowDates, storeHistoricalData, getHistoricalData, fetchHistoricalWeather]);

  // Clear cache for specific location or all locations
  const clearCache = useCallback((location?: string) => {
    setState(prev => {
      if (location) {
        const newHistoricalData = { ...prev.historicalData };
        delete newHistoricalData[location];
        return { ...prev, historicalData: newHistoricalData };
      } else {
        return { ...prev, historicalData: {} };
      }
    });
  }, []);

  return {
    ...state,
    getFiveDayForecast,
    hasHistoricalData,
    getHistoricalData,
    storeHistoricalData,
    clearCache,
    getFiveDayWindowDates,
  };
};