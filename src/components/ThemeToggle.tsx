'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with consistent classes during SSR
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "relative h-9 w-9 rounded-md border",
          "bg-background border-border",
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 opacity-0" />
        <Moon className="absolute h-4 w-4 opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-md border",
        "transition-all duration-300 ease-in-out",
        "hover:scale-105 hover:shadow-md",
        "bg-background hover:bg-accent",
        "border-border hover:border-primary/50",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className={cn(
        "h-4 w-4 transition-all duration-300",
        "rotate-0 scale-100",
        theme === 'dark' && "-rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "absolute h-4 w-4 transition-all duration-300",
        "rotate-90 scale-0",
        theme === 'dark' && "rotate-0 scale-100"
      )} />
    </Button>
  );
}