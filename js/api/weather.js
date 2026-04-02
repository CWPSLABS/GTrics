// ============================================
// api/weather.js — Open-Meteo (no key needed)
// ============================================
import { CONFIG } from '../config.js';
import { cache } from '../utils/cache.js';

export async function fetchWeather(lat = CONFIG.DEFAULT_LAT, lng = CONFIG.DEFAULT_LNG) {
  const cacheKey = `weather_${lat}_${lng}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'precipitation',
    ].join(','),
    hourly: 'temperature_2m',
    timezone: 'Africa/Accra',
    forecast_days: 1,
  });

  const res = await fetch(`${CONFIG.URLS.weather}?${params}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

  const data = await res.json();
  cache.set(cacheKey, data, CONFIG.CACHE_TTL.weather);
  return data;
}

/**
 * Reverse-geocode lat/lng to a short suburb/city name.
 * Prioritises suburb over district to avoid long municipal names on mobile.
 */
export async function getCityName(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;

    const raw = addr?.suburb
             || addr?.neighbourhood
             || addr?.quarter
             || addr?.town
             || addr?.city
             || addr?.county
             || CONFIG.DEFAULT_CITY;

    // Hard cap at 20 characters to protect mobile layout
    return raw.length > 20 ? raw.slice(0, 20).trim() + '…' : raw;
  } catch {
    return CONFIG.DEFAULT_CITY;
  }
}
