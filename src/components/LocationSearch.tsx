'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeatherAPIService } from '@/lib/api/weather-api';
import { SearchLocation } from '@/types/weather';

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
        const locationSuggestions: LocationSuggestion[] = results.map((location: SearchLocation, index) => ({
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-12 py-3 border rounded-lg',
              'focus:ring-2 focus:ring-primary focus:border-transparent',
              'bg-background/80 backdrop-blur-sm',
              'text-foreground placeholder-muted-foreground',
              'transition-all duration-200',
              'hover:border-primary/50 focus:border-primary',
              error && 'border-destructive focus:ring-destructive'
            )}
            disabled={isLoading}
            aria-label="Search for location"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2',
              'p-2 rounded-md transition-all duration-200',
              'hover:scale-105 hover:shadow-sm',
              isLoading || !query.trim()
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-primary hover:bg-accent'
            )}
            aria-label="Search"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto animate-scale-in">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-all duration-200 flex items-center gap-3 group"
            >
              <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {suggestion.name}
                </div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  {suggestion.region && `${suggestion.region}, `}
                  {suggestion.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isSearching && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 animate-scale-in">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Searching locations...</span>
          </div>
        </div>
      )}
    </div>
  );
};