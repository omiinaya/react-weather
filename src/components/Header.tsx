'use client';

import React from 'react';
import { Cloud, MapPin, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-all duration-300"
    )}>
      <div className="container flex h-16 items-center px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg",
            "bg-primary text-primary-foreground",
            "transition-all duration-300 hover:scale-105"
          )}>
            <Cloud className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground leading-tight">Weather App</h1>
            <p className="text-xs text-muted-foreground hidden sm:block leading-tight">Real-time forecasts</p>
          </div>
        </div>

        {/* Spacer to push navigation to center */}
        <div className="flex-1" />

        {/* Navigation - Centered */}
        <nav className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground/80 hover:text-foreground hover:bg-accent",
              "px-2 md:px-3 h-8 transition-all duration-200"
            )}
          >
            <MapPin className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline text-sm">Locations</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground/80 hover:text-foreground hover:bg-accent",
              "px-2 md:px-3 h-8 transition-all duration-200"
            )}
          >
            <Settings className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline text-sm">Settings</span>
          </Button>
        </nav>

        {/* Spacer to balance layout */}
        <div className="flex-1" />

        {/* Theme Toggle - Right aligned */}
        <div className="flex items-center flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}