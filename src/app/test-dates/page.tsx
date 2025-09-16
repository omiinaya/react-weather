'use client';

import { useEffect } from 'react';

export default function TestDates() {
  useEffect(() => {
    // Test the actual date calculation logic
    console.log('=== DATE DEBUGGING TEST ===');
    
    // Current date is September 16, 2025 (Tuesday)
    const currentDate = new Date('2025-09-16T00:00:00Z');
    console.log('Current UTC date:', currentDate.toISOString());
    console.log('Current local date:', currentDate.toLocaleString());
    console.log('Day of week:', currentDate.toLocaleDateString('en-US', { weekday: 'long' }));
    
    // Test date calculations for 5-day window
    const windowDates = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      windowDates.push({
        offset: i,
        dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        localDate: date.toLocaleDateString()
      });
    }
    
    console.log('5-day window:', windowDates);
    
    // Test formatDate function
    const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }): string => {
      return new Date(dateString).toLocaleDateString('en-US', options);
    };
    
    console.log('Formatted dates:', windowDates.map(d => ({
      date: d.dateStr,
      formatted: formatDate(d.dateStr),
      full: formatDate(d.dateStr, { weekday: 'long', month: 'long', day: 'numeric' })
    })));
    
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Date Debugging Test</h1>
      <p className="mb-4">Check browser console for detailed date calculations.</p>
      <p className="mb-2">Expected: September 16, 2025 should be Tuesday</p>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Current Date Info:</h2>
        <p>UTC: {new Date().toISOString()}</p>
        <p>Local: {new Date().toLocaleString()}</p>
        <p>Day: {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
      </div>
    </div>
  );
}