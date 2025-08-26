'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeatherAPIService } from '@/lib/api/weather-api';

interface LocationSuggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  isLoading = false,
  className,
  placeholder = 'Search for a city...',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await getWeatherAPIService().searchLocations(searchQuery);
      
      // WeatherAPI search returns an array of locations
      if (Array.isArray(results)) {
        const locationSuggestions: LocationSuggestion[] = results.map((location: any, index) => ({
          id: index,
          name: location.name,
          region: location.region,
          country: location.country,
          lat: location.lat,
          lon: location.lon,
        }));
        
        setSuggestions(locationSuggestions);
        setShowSuggestions(locationSuggestions.length > 0);
      }
    } catch (err) {
      setError('Failed to search locations');
      console.error('Location search error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchLocations(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationString = `${suggestion.name}, ${suggestion.country}`;
    setQuery(locationString);
    setShowSuggestions(false);
    onLocationSelect(locationString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onLocationSelect(query.trim());
    }
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'bg-white/90 backdrop-blur-sm',
              'text-gray-900 placeholder-gray-500',
              'transition-all duration-200',
              error && 'border-red-300 focus:ring-red-500'
            )}
            disabled={isLoading}
            aria-label="Search for location"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2',
              'p-1 rounded-md transition-colors',
              isLoading || !query.trim()
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            )}
            aria-label="Search"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.name}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.region && `${suggestion.region}, `}
                  {suggestion.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isSearching && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};