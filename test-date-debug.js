// Standalone date debugging test
// This script will help us understand the date calculation issue

console.log('=== DATE DEBUGGING ANALYSIS ===');
console.log('Current system date:', new Date().toISOString());
console.log('Expected: September 16, 2025 should be Tuesday\n');

// Test the actual date calculation logic used in the app
function simulateDateCalculations() {
  // Simulate the current date as September 16, 2025 (Tuesday)
  const mockToday = new Date('2025-09-16T00:00:00Z');
  
  console.log('=== MOCK TODAY ===');
  console.log('Mock date:', mockToday.toISOString());
  console.log('Mock date (local):', mockToday.toLocaleString());
  console.log('Mock day of week:', mockToday.toLocaleDateString('en-US', { weekday: 'long' }));
  
  // Simulate getFiveDayWindowDates function
  function getFiveDayWindowDates(referenceDate = new Date()) {
    const dates = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(referenceDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
  
  // Simulate generateDateLabels function
  function generateDateLabels(windowDates, today) {
    const todayStr = today.toISOString().split('T')[0];
    const labels = [];
    
    windowDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let label;
      if (dateStr === todayStr) {
        label = 'Today';
      } else if (diffDays === -2) {
        label = '2 days ago';
      } else if (diffDays === -1) {
        label = 'Yesterday';
      } else if (diffDays === 1) {
        label = 'Tomorrow';
      } else if (diffDays === 2) {
        label = 'In 2 days';
      } else {
        label = new Date(dateStr).toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
      
      labels.push({
        dateStr,
        label,
        dayOfWeek: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }),
        diffDays
      });
    });
    
    return labels;
  }
  
  // Simulate formatDate function
  function formatDate(dateString, options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) {
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  const windowDates = getFiveDayWindowDates(mockToday);
  const labels = generateDateLabels(windowDates, mockToday);
  
  console.log('\n=== 5-DAY WINDOW CALCULATION ===');
  console.log('Window dates:', windowDates);
  console.log('Generated labels:', labels);
  
  console.log('\n=== FORMATTED DATES ===');
  labels.forEach(item => {
    console.log(`${item.dateStr}: ${item.label} (${item.dayOfWeek}) - diffDays: ${item.diffDays}`);
  });
  
  // Test timezone edge case
  console.log('\n=== TIMEZONE ANALYSIS ===');
  const now = new Date();
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  console.log('Current UTC date:', utcDate.toISOString());
  console.log('Current local date:', now.toLocaleString());
  console.log('UTC day:', utcDate.toLocaleDateString('en-US', { weekday: 'long' }));
  console.log('Local day:', now.toLocaleDateString('en-US', { weekday: 'long' }));
  
  // Check if there's a timezone offset causing the issue
  const offsetHours = now.getTimezoneOffset() / 60;
  console.log('Timezone offset (hours):', offsetHours);
}

// Run the analysis
simulateDateCalculations();

// Test with different reference points
console.log('\n=== TESTING WITH ACTUAL SYSTEM DATE ===');
const actualSystemDate = new Date();
const windowDates = [];
for (let i = -2; i <= 2; i++) {
  const date = new Date(actualSystemDate);
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];
  windowDates.push({
    dateStr,
    dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
    shortFormat: date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  });
}

console.log('Actual system 5-day window:');
windowDates.forEach(item => {
  console.log(`${item.dateStr}: ${item.shortFormat} (${item.dayOfWeek})`);
});