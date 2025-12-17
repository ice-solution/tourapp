import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import CloudIcon from '@mui/icons-material/Cloud'
import UmbrellaIcon from '@mui/icons-material/Umbrella'
import ThunderstormIcon from '@mui/icons-material/Thunderstorm'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import { api } from '../utils/api.js'

const getWeatherIcon = (condition) => {
  switch (condition) {
    case 'sunny':
      return <WbSunnyIcon sx={{ color: '#ffa726', fontSize: 32 }} />
    case 'cloudy':
      return <CloudIcon sx={{ color: '#90a4ae', fontSize: 32 }} />
    case 'rainy':
      return <UmbrellaIcon sx={{ color: '#42a5f5', fontSize: 32 }} />
    case 'stormy':
      return <ThunderstormIcon sx={{ color: '#5c6bc0', fontSize: 32 }} />
    case 'snowy':
      return <AcUnitIcon sx={{ color: '#90caf9', fontSize: 32 }} />
    default:
      return <CloudIcon sx={{ color: '#90a4ae', fontSize: 32 }} />
  }
}

const getDayName = (date) => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[date.getDay()]
}

const getWeatherCondition = (weathercode) => {
  // WMO Weather interpretation codes (WW)
  // 0-1: Clear/Partly cloudy -> sunny
  // 2-3: Cloudy -> cloudy
  // 45-48: Fog -> cloudy
  // 51-67: Drizzle/Rain -> rainy
  // 71-77: Snow -> snowy
  // 80-99: Rain showers/Thunderstorm -> stormy
  if (weathercode === null || weathercode === undefined) return 'cloudy'
  if (weathercode <= 1) return 'sunny'
  if (weathercode <= 3 || (weathercode >= 45 && weathercode <= 48)) return 'cloudy'
  if (weathercode >= 51 && weathercode <= 67) return 'rainy'
  if (weathercode >= 71 && weathercode <= 77) return 'snowy'
  if (weathercode >= 80) return 'stormy'
  return 'cloudy'
}

const WeatherPage = ({ event }) => {
  const { eventId } = useParams()
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState(null)

  useEffect(() => {
    loadWeather()
  }, [eventId, event])

  const loadWeather = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 如果 event 有 weatherPreference，使用它
      const weatherPreference = event?.weatherPreference
      if (!weatherPreference || !weatherPreference.latitude || !weatherPreference.longitude) {
        setError('此活動尚未設定天氣地點')
        setLoading(false)
        return
      }

      // 調用天氣 API
      const response = await api.get(
        `/events/${eventId}/weather?latitude=${weatherPreference.latitude}&longitude=${weatherPreference.longitude}&timezone=${weatherPreference.timezone || 'auto'}`
      )

      if (response.success && response.data.forecast) {
        const forecast = response.data.forecast
        setLocation(response.data.location)

        // 轉換 API 資料為顯示格式
        const today = new Date()
        const dailyData = forecast.daily || {}
        const dates = dailyData.time || []
        const maxTemps = dailyData.temperature_2m_max || []
        const minTemps = dailyData.temperature_2m_min || []
        const precipitations = dailyData.precipitation_sum || []
        const weathercodes = dailyData.weathercode || []

        const formattedForecast = dates.map((dateStr, index) => {
          const date = new Date(dateStr)
          return {
            date,
            dayName: index === 0 ? '今天' : `星期${getDayName(date)}`,
            condition: getWeatherCondition(weathercodes[index]),
            minTemp: Math.round(minTemps[index] || 0),
            maxTemp: Math.round(maxTemps[index] || 0),
            precipitation: Math.round((precipitations[index] || 0) * 10) / 10,
          }
        })

        setWeatherData(formattedForecast)
      }
    } catch (error) {
      setError(error.message || '載入天氣資料失敗')
      // 如果 API 失敗，使用模擬數據作為後備
    const today = new Date()
    const forecast = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      forecast.push({
        date,
        dayName: i === 0 ? '今天' : `星期${getDayName(date)}`,
          condition: 'cloudy',
          minTemp: 18,
          maxTemp: 24,
          precipitation: 0,
      })
    }
      setWeatherData(forecast)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" className="py-6">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" className="py-6">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            天氣預報
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {location?.locationName ? `${location.locationName} - ` : ''}未來 7 天天氣預報
          </Typography>
          {error && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        <Stack spacing={2}>
          {weatherData.map((day, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                borderRadius: '20px',
                p: 3,
                backgroundColor: 'white',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ minWidth: 80 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {day.dayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {day.date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>{getWeatherIcon(day.condition)}</Box>
                  <Stack spacing={0.5} flex={1}>
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography variant="h6" fontWeight={700}>
                        {day.maxTemp}°
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / {day.minTemp}°
                      </Typography>
                    </Stack>
                    {day.precipitation > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        降雨機率 {day.precipitation * 10}%
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}

export default WeatherPage


