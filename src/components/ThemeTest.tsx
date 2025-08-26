'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThemeTest() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Theme Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Current Theme:</span>
          <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
            {theme}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            size="sm"
          >
            Light Mode
          </Button>
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            size="sm"
          >
            Dark Mode
          </Button>
          <Button 
            variant="outline"
            onClick={toggleTheme}
            size="sm"
          >
            Toggle Theme
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-card border rounded-lg">
            <div className="font-medium mb-2">Card Colors</div>
            <div className="h-4 bg-primary rounded mb-1"></div>
            <div className="h-4 bg-secondary rounded mb-1"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
          
          <div className="p-3 bg-card border rounded-lg">
            <div className="font-medium mb-2">Text Colors</div>
            <div className="text-foreground">Foreground Text</div>
            <div className="text-muted-foreground">Muted Text</div>
            <div className="text-primary">Primary Text</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}