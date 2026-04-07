
// modules/weatherWidget.js — WeatherAPI.com

import { fetchWeather, getCityName } from '../api/weather.js';
import { renderError } from '../utils/errorHandler.js';

export async function initWeatherWidget(lat, lng, cityName) {
  const container = document.getElementById('weather-widget');

  try {
    const data = await fetchWeather(lat, lng);
    const c = data.current;
    const condition = c.condition;

    container.innerHTML = `
      <div class="weather-main">
        <div>
          <div class="weather-city">${cityName}</div>
          <div class="weather-temp">${Math.round(c.temp_c)}<sup>°C</sup></div>
          <div class="weather-desc">${condition.text}</div>
        </div>
        <div class="weather-icon">
          <img 
            src="https:${condition.icon}" 
            alt="${condition.text}"
            style="width:64px;height:64px"
          />
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-detail-item">
          <div class="weather-detail-label">Feels like</div>
          <div class="weather-detail-value">${Math.round(c.feelslike_c)}°C</div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-label">Humidity</div>
          <div class="weather-detail-value">${c.humidity}%</div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-label">Wind</div>
          <div class="weather-detail-value">${c.wind_kph} km/h</div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-label">UV Index</div>
          <div class="weather-detail-value">${c.uv}</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('[Weather]', err);
    renderError('weather-widget', 'Weather unavailable', () => initWeatherWidget(lat, lng, cityName));
  }
}
