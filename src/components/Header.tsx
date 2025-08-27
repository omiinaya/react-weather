'use client';

import React from 'react';
import { Cloud, MapPin, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-all duration-300"
    )}>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "bg-primary text-primary-foreground",
            "transition-all duration-300 hover:scale-105"
          )}>
            <Cloud className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">Weather App</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Real-time forecasts</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-accent px-3"
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Locations</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-accent px-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center ml-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}