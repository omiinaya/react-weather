// Final debugging for the one-day offset issue
console.log('=== FINAL DATE OFFSET DEBUGGING ===');
console.log('Current system time:', new Date().toISOString());
console.log('Expected: September 16, 2025 should be Tuesday');
console.log('');

// Test the exact calculation used in the component
function testDateCalculation() {
  const actualToday = new Date('2025-09-16');
  console.log('Target date:', actualToday.toISOString());
  console.log('Target day:', actualToday.toLocaleDateString('en-US', { weekday: 'long' }));
  
  // Test different scenarios that might cause the offset
  const scenarios = [
    { name: 'UTC midnight', date: new Date('2025-09-16T00:00:00Z') },
    { name: 'Local midnight', date: new Date('2025-09-16') },
    { name: 'Current time', date: new Date() },
    { name: 'API mock (Sep 15)', date: new Date('2025-09-15') }
  ];
  
  scenarios.forEach(({ name, date }) => {
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    const diff = Math.floor((date.getTime() - actualToday.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`${name}: ${formatted} (offset: ${diff} days)`);
  });
  
  // Test the exact calculation used in the component
  console.log('\n=== COMPONENT CALCULATION TEST ===');
  const todayStr = actualToday.toISOString().split('T')[0];
  console.log('todayStr:', todayStr);
  
  // Test with API response date
  const apiDate = new Date('2025-09-15'); // This is what the API returns
  const diffDays = Math.floor((apiDate.getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
  console.log('API date (2025-09-15):', apiDate.toLocaleDateString('en-US', { weekday: 'long' }));
  console.log('Calculated diffDays:', diffDays);
  console.log('Expected label:', diffDays === 0 ? 'Today' : diffDays === -1 ? 'Yesterday' : 'Other');
}

// Test timezone impact
function testTimezoneImpact() {
  console.log('\n=== TIMEZONE IMPACT TEST ===');
  const utc = new Date('2025-09-16T00:00:00Z');
  const local = new Date('2025-09-16');
  
  console.log('UTC date:', utc.toISOString());
  console.log('Local date:', local.toISOString());
  console.log('Offset hours:', (local.getTime() - utc.getTime()) / (1000 * 60 * 60));
  console.log('getTimezoneOffset():', new Date().getTimezoneOffset(), 'minutes');
}

testDateCalculation();
testTimezoneImpact();

console.log('\n=== SOLUTION IDENTIFIED ===');
console.log('The issue is likely that the API returns dates starting from Sep 15,');
console.log('but the calculation needs to ensure Sep 16 is identified as "Today".');
console.log('We need to adjust the calculation to ensure the correct date is labeled as Today.');