import { useState } from 'react'
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
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import UmbrellaIcon from '@mui/icons-material/Umbrella'

const mockForecast = [
  { date: '2025-10-27', min: 17, max: 22, precipitation: 4, weatherCode: 'rain' },
  { date: '2025-10-28', min: 18, max: 24, precipitation: 0, weatherCode: 'sunny' },
  { date: '2025-10-29', min: 16, max: 21, precipitation: 1, weatherCode: 'cloudy' },
  { date: '2025-10-30', min: 15, max: 20, precipitation: 5, weatherCode: 'rain' },
  { date: '2025-10-31', min: 17, max: 23, precipitation: 0, weatherCode: 'sunny' },
  { date: '2025-11-01', min: 18, max: 24, precipitation: 2, weatherCode: 'cloudy' },
  { date: '2025-11-02', min: 19, max: 25, precipitation: 0, weatherCode: 'sunny' },
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
  const [location, setLocation] = useState({ name: 'Fukuoka', latitude: '33.5902', longitude: '130.4017', timezone: 'Asia/Tokyo' })
  const [forecast, setForecast] = useState(mockForecast)

  const handleChange = (field) => (event) => {
    setLocation((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const fetchForecast = () => {
    setForecast(mockForecast)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        天氣設定
      </Typography>
      <Paper elevation={0} className="rounded-lg p-6">
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          指定活動地點
        </Typography>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <TextField label="城市名稱" value={location.name} onChange={handleChange('name')} fullWidth />
          <TextField label="時區" value={location.timezone} onChange={handleChange('timezone')} fullWidth />
        </Stack>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} mt={2}>
          <TextField label="Latitude" value={location.latitude} onChange={handleChange('latitude')} fullWidth />
          <TextField label="Longitude" value={location.longitude} onChange={handleChange('longitude')} fullWidth />
        </Stack>
        <Button variant="contained" sx={{ borderRadius: 1, mt: 3 }} onClick={fetchForecast}>
          取得 7 日預報
        </Button>
      </Paper>

      <Paper elevation={0} className="rounded-lg p-6">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
            {location.name} 未來 7 天天氣
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
            {forecast.map((day) => (
              <TableRow key={day.date}>
                <TableCell>{day.date}</TableCell>
                <TableCell>{weatherIcon(day.weatherCode)}</TableCell>
                <TableCell align="right">{day.min}</TableCell>
                <TableCell align="right">{day.max}</TableCell>
                <TableCell align="right">{day.precipitation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}

export default WeatherSettingsPage

