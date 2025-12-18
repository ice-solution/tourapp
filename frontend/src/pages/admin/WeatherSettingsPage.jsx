import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import UmbrellaIcon from '@mui/icons-material/Umbrella'
import { api } from '../../utils/api.js'

const mockForecast = [
  { date: '2025-10-27', min: 17, max: 22, precipitation: 4, weatherCode: 'rain' },
  { date: '2025-10-28', min: 18, max: 24, precipitation: 0, weatherCode: 'sunny' },
  { date: '2025-10-29', min: 16, max: 21, precipitation: 1, weatherCode: 'cloudy' },
  { date: '2025-10-30', min: 15, max: 20, precipitation: 5, weatherCode: 'rain' },
  { date: '2025-10-31', min: 17, max: 23, precipitation: 0, weatherCode: 'sunny' },
  { date: '2025-11-01', min: 18, max: 24, precipitation: 2, weatherCode: 'cloudy' },
  { date: '2025-11-02', min: 19, max: 25, precipitation: 0, weatherCode: 'sunny' },
]

// 常見城市列表（預設座標和時區）
const COMMON_CITIES = [
  // 香港/中國
  { name: '香港 (Hong Kong)', latitude: 22.3193, longitude: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: '北京 (Beijing)', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { name: '上海 (Shanghai)', latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai' },
  { name: '廣州 (Guangzhou)', latitude: 23.1291, longitude: 113.2644, timezone: 'Asia/Shanghai' },
  { name: '深圳 (Shenzhen)', latitude: 22.5431, longitude: 114.0579, timezone: 'Asia/Shanghai' },
  // 台灣
  { name: '台北 (Taipei)', latitude: 25.0330, longitude: 121.5654, timezone: 'Asia/Taipei' },
  { name: '高雄 (Kaohsiung)', latitude: 22.6273, longitude: 120.3014, timezone: 'Asia/Taipei' },
  // 日本
  { name: '東京 (Tokyo)', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: '大阪 (Osaka)', latitude: 34.6937, longitude: 135.5023, timezone: 'Asia/Tokyo' },
  { name: '福岡 (Fukuoka)', latitude: 33.5902, longitude: 130.4017, timezone: 'Asia/Tokyo' },
  { name: '京都 (Kyoto)', latitude: 35.0116, longitude: 135.7681, timezone: 'Asia/Tokyo' },
  // 韓國
  { name: '首爾 (Seoul)', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  { name: '釜山 (Busan)', latitude: 35.1796, longitude: 129.0756, timezone: 'Asia/Seoul' },
  // 新加坡/馬來西亞
  { name: '新加坡 (Singapore)', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: '吉隆坡 (Kuala Lumpur)', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  // 泰國
  { name: '曼谷 (Bangkok)', latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok' },
  // 澳洲
  { name: '墨爾本 (Melbourne)', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { name: '悉尼 (Sydney)', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: '布里斯本 (Brisbane)', latitude: -27.4698, longitude: 153.0251, timezone: 'Australia/Brisbane' },
  { name: '珀斯 (Perth)', latitude: -31.9505, longitude: 115.8605, timezone: 'Australia/Perth' },
  // 紐西蘭
  { name: '奧克蘭 (Auckland)', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland' },
  // 其他
  { name: '倫敦 (London)', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: '紐約 (New York)', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: '洛杉磯 (Los Angeles)', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
]

const weatherIcon = (code) => {
  switch (code) {
    case 'sunny':
      return <WbSunnyIcon color="warning" />
    case 'rain':
      return <UmbrellaIcon color="primary" />
    default:
      return <CloudOutlinedIcon color="action" />
  }
}

const WeatherSettingsPage = () => {
  const { eventId } = useParams()
  const [location, setLocation] = useState({ 
    locationName: '', 
    latitude: '', 
    longitude: '', 
    timezone: 'auto' 
  })
  const [selectedCity, setSelectedCity] = useState('')
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadWeatherSettings()
  }, [eventId])

  const loadWeatherSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event?.weatherPreference) {
        const wp = response.data.event.weatherPreference
        setLocation({
          locationName: wp.locationName || '',
          latitude: wp.latitude?.toString() || '',
          longitude: wp.longitude?.toString() || '',
          timezone: wp.timezone || 'auto',
        })
        // 檢查是否匹配預設城市
        const matchedCity = COMMON_CITIES.find(
          city => Math.abs(city.latitude - wp.latitude) < 0.01 && 
                  Math.abs(city.longitude - wp.longitude) < 0.01
        )
        if (matchedCity) {
          setSelectedCity(matchedCity.name)
        }
      }
    } catch (error) {
      setError(error.message || '載入天氣設定失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCityChange = (event) => {
    const cityName = event.target.value
    setSelectedCity(cityName)
    
    if (cityName) {
      const city = COMMON_CITIES.find(c => c.name === cityName)
      if (city) {
        setLocation({
          locationName: city.name.split(' (')[0], // 只取中文名
          latitude: city.latitude.toString(),
          longitude: city.longitude.toString(),
          timezone: city.timezone,
        })
      }
    } else {
      // 清空選擇
      setLocation({
        locationName: '',
        latitude: '',
        longitude: '',
        timezone: 'auto',
      })
    }
  }

  const handleChange = (field) => (event) => {
    setLocation((prev) => ({ ...prev, [field]: event.target.value }))
    // 如果手動修改，清空城市選擇
    if (field !== 'locationName' && selectedCity) {
      setSelectedCity('')
    }
  }

  const handleSave = async () => {
    if (!location.locationName || !location.latitude || !location.longitude) {
      setError('請填寫所有必填欄位')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')
      
      const response = await api.put(`/events/${eventId}/weather`, {
        locationName: location.locationName,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        timezone: location.timezone || 'auto',
      })

      if (response.success) {
        setMessage('已儲存天氣設定')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError('儲存失敗')
      }
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const fetchForecast = async () => {
    if (!location.latitude || !location.longitude) {
      setError('請先設定地點座標')
      return
    }

    try {
      setFetching(true)
      setError('')
      const response = await api.get(
        `/events/${eventId}/weather?latitude=${location.latitude}&longitude=${location.longitude}&timezone=${location.timezone || 'auto'}`
      )
      if (response.success) {
        setForecast(response.data.forecast?.daily || [])
      } else {
        setError('取得天氣預報失敗')
      }
    } catch (error) {
      setError(error.message || '取得天氣預報失敗')
    } finally {
      setFetching(false)
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          天氣設定
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        天氣設定
      </Typography>

      {message && (
        <Alert severity="success" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} className="rounded-lg p-6">
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          指定活動地點
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          選擇常見城市可自動填入座標和時區，或手動輸入自訂地點
        </Alert>
        
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>選擇城市（快速設定）</InputLabel>
            <Select
              value={selectedCity}
              onChange={handleCityChange}
              label="選擇城市（快速設定）"
            >
              <MenuItem value="">
                <em>不使用預設城市（手動輸入）</em>
              </MenuItem>
              <Divider />
              {COMMON_CITIES.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <TextField 
              label="地點名稱" 
              value={location.locationName} 
              onChange={handleChange('locationName')} 
              fullWidth 
              required
              helperText="例如：墨爾本、東京、香港"
            />
            <TextField 
              label="時區" 
              value={location.timezone} 
              onChange={handleChange('timezone')} 
              fullWidth 
              helperText="選擇城市後自動填入，或手動輸入（如：Asia/Hong_Kong）"
            />
          </Stack>

          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <TextField 
              label="緯度 (Latitude)" 
              type="number"
              value={location.latitude} 
              onChange={handleChange('latitude')} 
              fullWidth 
              required
              inputProps={{ step: 'any' }}
              helperText="選擇城市後自動填入"
            />
            <TextField 
              label="經度 (Longitude)" 
              type="number"
              value={location.longitude} 
              onChange={handleChange('longitude')} 
              fullWidth 
              required
              inputProps={{ step: 'any' }}
              helperText="選擇城市後自動填入"
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              sx={{ borderRadius: 1, bgcolor: '#c9503d', '&:hover': { bgcolor: '#a83d2e' } }} 
              onClick={handleSave}
              disabled={saving || !location.locationName || !location.latitude || !location.longitude}
            >
              {saving ? <CircularProgress size={20} /> : '儲存設定'}
            </Button>
            <Button 
              variant="outlined" 
              sx={{ borderRadius: 1 }} 
              onClick={fetchForecast}
              disabled={fetching || !location.latitude || !location.longitude}
            >
              {fetching ? <CircularProgress size={20} /> : '取得 7 日預報'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {forecast.length > 0 && (
        <Paper elevation={0} className="rounded-lg p-6">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              {location.locationName} 未來 7 天天氣
            </Typography>
            <Chip label={`Timezone: ${location.timezone}`} variant="outlined" />
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>日期</TableCell>
                <TableCell>天氣</TableCell>
                <TableCell align="right">最低溫 (°C)</TableCell>
                <TableCell align="right">最高溫 (°C)</TableCell>
                <TableCell align="right">降雨量 (mm)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecast.map((day, index) => (
                <TableRow key={day.date || index}>
                  <TableCell>{day.date || day.time || '-'}</TableCell>
                  <TableCell>
                    {day.weathercode !== undefined ? (
                      day.weathercode < 3 ? <WbSunnyIcon color="warning" /> :
                      day.weathercode >= 51 && day.weathercode < 70 ? <UmbrellaIcon color="primary" /> :
                      <CloudOutlinedIcon color="action" />
                    ) : (
                      <CloudOutlinedIcon color="action" />
                    )}
                  </TableCell>
                  <TableCell align="right">{day.temperature_2m_min?.toFixed(1) || day.min || '-'}</TableCell>
                  <TableCell align="right">{day.temperature_2m_max?.toFixed(1) || day.max || '-'}</TableCell>
                  <TableCell align="right">{day.precipitation_sum?.toFixed(1) || day.precipitation || '0.0'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}

export default WeatherSettingsPage

