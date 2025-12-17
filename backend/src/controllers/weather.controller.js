import { Event } from '../models/Event.js'
import { fetchWeatherForecast } from '../services/weather.service.js'
import { success, failure } from '../utils/apiResponse.js'

export const getEventWeather = async (req, res) => {
  try {
    const { latitude, longitude, timezone } = req.query
    const event = await Event.findOne({ eventId: req.params.eventId })

    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const target = latitude && longitude
      ? {
          latitude: Number(latitude),
          longitude: Number(longitude),
          timezone: timezone || event.weatherPreference?.timezone || 'auto',
        }
      : event.weatherPreference

    if (!target?.latitude || !target?.longitude) {
      return failure(res, '此 Event 尚未設定天氣地點', 422)
    }

    const data = await fetchWeatherForecast(target)
    return success(res, { forecast: data, location: target })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}


