import {
  faSun,
  faCloud,
  faCloudSun,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faMoon,
  faCloudMoon,
  faWind,
  faTint,
  faUmbrella,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

export interface WeatherIconMapping {
  [key: string]: IconDefinition;
}

/**
 * Maps WeatherAPI condition codes to FontAwesome icons
 * Based on WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
 */
export const weatherIconMap: WeatherIconMapping = {
  // Sunny/Clear (3-digit codes from WeatherAPI)
  '113': faSun, // Sunny/Clear
  '116': faCloudSun, // Partly cloudy
  
  // Cloudy
  '119': faCloud, // Cloudy
  '122': faCloud, // Overcast
  
  // Mist/Fog
  '143': faSmog, // Mist
  '248': faSmog, // Fog
  '260': faSmog, // Freezing fog
  
  // Rain
  '176': faCloudRain, // Patchy rain possible
  '263': faUmbrella, // Patchy light drizzle
  '266': faUmbrella, // Light drizzle
  '281': faTint, // Freezing drizzle
  '284': faTint, // Heavy freezing drizzle
  '293': faCloudRain, // Patchy light rain
  '296': faCloudRain, // Light rain
  '299': faCloudRain, // Moderate rain at times
  '302': faCloudRain, // Moderate rain
  '305': faCloudRain, // Heavy rain at times
  '308': faCloudRain, // Heavy rain
  '311': faTint, // Light freezing rain
  '314': faTint, // Moderate or heavy freezing rain
  '317': faSnowflake, // Light sleet
  '320': faSnowflake, // Moderate or heavy sleet
  '350': faSnowflake, // Ice pellets
  '353': faUmbrella, // Light rain shower
  '356': faUmbrella, // Moderate or heavy rain shower
  '359': faUmbrella, // Torrential rain shower
  '362': faSnowflake, // Light sleet showers
  '365': faSnowflake, // Moderate or heavy sleet showers
  '368': faSnowflake, // Light snow showers
  '371': faSnowflake, // Moderate or heavy snow showers
  '374': faSnowflake, // Light showers of ice pellets
  '377': faSnowflake, // Moderate or heavy showers of ice pellets
  
  // Snow
  '179': faSnowflake, // Patchy snow possible
  '182': faSnowflake, // Patchy sleet possible
  '185': faTint, // Patchy freezing drizzle possible
  '227': faWind, // Blowing snow
  '230': faWind, // Blizzard
  '323': faSnowflake, // Patchy light snow
  '326': faSnowflake, // Light snow
  '329': faSnowflake, // Patchy moderate snow
  '332': faSnowflake, // Moderate snow
  '335': faSnowflake, // Patchy heavy snow
  '338': faSnowflake, // Heavy snow
  
  // Thunder
  '200': faBolt, // Thundery outbreaks possible
  '386': faBolt, // Patchy light rain with thunder
  '389': faBolt, // Moderate or heavy rain with thunder
  '392': faBolt, // Patchy light snow with thunder
  '395': faBolt, // Moderate or heavy snow with thunder
  
  // 4-digit codes (fallback for any that might still use them)
  '1000': faSun, // Sunny
  '1003': faCloudSun, // Partly cloudy
  '1006': faCloud, // Cloudy
  '1009': faCloud, // Overcast
  '1030': faSmog, // Mist
  '1063': faCloudRain, // Patchy rain possible
  '1066': faSnowflake, // Patchy snow possible
  '1069': faSnowflake, // Patchy sleet possible
  '1072': faTint, // Patchy freezing drizzle possible
  '1087': faBolt, // Thundery outbreaks possible
  '1114': faWind, // Blowing snow
  '1117': faWind, // Blizzard
  '1135': faSmog, // Fog
  '1147': faSmog, // Freezing fog
  '1150': faUmbrella, // Patchy light drizzle
  '1153': faUmbrella, // Light drizzle
  '1168': faTint, // Freezing drizzle
  '1171': faTint, // Heavy freezing drizzle
  '1180': faCloudRain, // Patchy light rain
  '1183': faCloudRain, // Light rain
  '1186': faCloudRain, // Moderate rain at times
  '1189': faCloudRain, // Moderate rain
  '1192': faCloudRain, // Heavy rain at times
  '1195': faCloudRain, // Heavy rain
  '1198': faTint, // Light freezing rain
  '1201': faTint, // Moderate or heavy freezing rain
  '1204': faSnowflake, // Light sleet
  '1207': faSnowflake, // Moderate or heavy sleet
  '1210': faSnowflake, // Patchy light snow
  '1213': faSnowflake, // Light snow
  '1216': faSnowflake, // Patchy moderate snow
  '1219': faSnowflake, // Moderate snow
  '1222': faSnowflake, // Patchy heavy snow
  '1225': faSnowflake, // Heavy snow
  '1237': faSnowflake, // Ice pellets
  '1240': faUmbrella, // Light rain shower
  '1243': faUmbrella, // Moderate or heavy rain shower
  '1246': faUmbrella, // Torrential rain shower
  '1249': faSnowflake, // Light sleet showers
  '1252': faSnowflake, // Moderate or heavy sleet showers
  '1255': faSnowflake, // Light snow showers
  '1258': faSnowflake, // Moderate or heavy snow showers
  '1261': faSnowflake, // Light showers of ice pellets
  '1264': faSnowflake, // Moderate or heavy showers of ice pellets
  '1273': faBolt, // Patchy light rain with thunder
  '1276': faBolt, // Moderate or heavy rain with thunder
  '1279': faBolt, // Patchy light snow with thunder
  '1282': faBolt, // Moderate or heavy snow with thunder
  
  // Night icons (3-digit)
  '113_night': faMoon, // Clear night
  '116_night': faCloudMoon, // Partly cloudy night
  
  // Night icons (4-digit fallback)
  '1000_night': faMoon, // Clear night
  '1003_night': faCloudMoon, // Partly cloudy night
};

/**
 * Get FontAwesome icon for a given weather condition code
 * @param conditionCode WeatherAPI condition code (e.g., "1000")
 * @param isNight Whether it's nighttime (for appropriate icon variants)
 * @returns FontAwesome icon object
 */
export const getWeatherIcon = (conditionCode: string, isNight: boolean = false): IconDefinition => {
  const nightKey = `${conditionCode}_night`;
  
  // Check for night variant first if it's night time
  if (isNight && weatherIconMap[nightKey]) {
    return weatherIconMap[nightKey];
  }
  
  // Fall back to regular icon
  return weatherIconMap[conditionCode] || faCloud;
};

/**
 * Extract condition code from WeatherAPI icon URL
 * @param iconUrl WeatherAPI icon URL (e.g., "//cdn.weatherapi.com/weather/64x64/day/113.png")
 * @returns Condition code (e.g., "113")
 */
export const extractConditionCode = (iconUrl: string): string => {
  const match = iconUrl.match(/\/(\d+)\.png$/);
  return match ? match[1] : '1000'; // Default to sunny if not found
};

/**
 * Check if it's nighttime based on WeatherAPI icon URL
 * @param iconUrl WeatherAPI icon URL
 * @returns boolean indicating if it's nighttime
 */
export const isNightTime = (iconUrl: string): boolean => {
  return iconUrl.includes('/night/');
};