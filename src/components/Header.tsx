'use client';

import React from 'react';
import { Cloud, MapPin, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme } = useTheme();

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-all duration-300"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "bg-primary text-primary-foreground",
            "transition-all duration-300 hover:scale-105"
          )}>
            <Cloud className="w-6 h-6" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-xl font-bold text-foreground">Weather App</h1>
            <p className="text-sm text-muted-foreground">Real-time forecasts</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-accent"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Locations
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-accent"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </nav>

        {/* Theme Toggle and Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
}