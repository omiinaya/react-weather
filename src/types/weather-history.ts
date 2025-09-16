import { ForecastDay } from './weather';

export interface HistoricalForecastDay extends ForecastDay {
  isHistorical?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  dayLabel?: string;
}

export interface FiveDayHistoricalForecast {
  days: HistoricalForecastDay[];
  location: string;
  windowStart: string;
  windowEnd: string;
}

export interface WeatherHistoryCache {
  [location: string]: {
    [date: string]: HistoricalForecastDay;
  };
}

export interface DateRange {
  start: string;
  end: string;
}

export interface HistoricalWeatherContext {
  location: string;
  referenceDate: Date;
  windowDates: string[];
  historicalCount: number;
  futureCount: number;
}