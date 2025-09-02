'use client';

import React from 'react';
import { Cloud, Github } from 'lucide-react';
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
         
        </nav>

        {/* Spacer to balance layout */}
        <div className="flex-1" />

        {/* GitHub Repo Link and Theme Toggle - Right aligned */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open('https://github.com/omiinaya/react-weather', '_blank')}
            className={cn(
              "relative h-9 w-9 rounded-md border",
              "transition-all duration-300 ease-in-out",
              "hover:scale-105 hover:shadow-md",
              "bg-background hover:bg-accent",
              "border-border hover:border-primary/50"
            )}
            aria-label="View source code on GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}