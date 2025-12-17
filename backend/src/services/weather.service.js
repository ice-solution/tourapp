import { env } from '../config/env.js'

const DEFAULT_PARAMS = {
  daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'weathercode'].join(','),
  current_weather: true,
  forecast_days: 7,
}

const buildQueryString = (params) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

export const fetchWeatherForecast = async ({ latitude, longitude, timezone = 'auto' }) => {
  const query = buildQueryString({
    ...DEFAULT_PARAMS,
    latitude,
    longitude,
    timezone,
  })

  const response = await fetch(`${env.weatherApiBase}?${query}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Weather API error: ${message}`)
  }

  return response.json()
}


