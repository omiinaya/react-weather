'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

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