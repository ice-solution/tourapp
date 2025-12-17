import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import LensBlurIcon from '@mui/icons-material/LensBlur'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import SparkleIcon from '@mui/icons-material/AutoAwesome'
import { api } from '../../utils/api.js'

const ThemeSettingsPage = () => {
  const { eventId } = useParams()
  const [theme, setTheme] = useState({
    backgroundColor: '#c4d971',
    primaryColor: '#c9503d',
    secondaryColor: '#ef7b20',
    accentColor: '#ffffff',
    iconStyle: 'default',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadTheme()
  }, [eventId])

  const loadTheme = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event?.theme) {
        setTheme({
          backgroundColor: response.data.event.theme.backgroundColor || '#c4d971',
          primaryColor: response.data.event.theme.primaryColor || '#c9503d',
          secondaryColor: response.data.event.theme.secondaryColor || '#ef7b20',
          accentColor: response.data.event.theme.accentColor || '#ffffff',
          iconStyle: response.data.event.theme.iconStyle || 'default',
        })
      }
    } catch (error) {
      setError(error.message || '載入主題設定失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')
      const response = await api.patch(`/events/${eventId}/theme`, theme)
      if (response.success) {
        setMessage('已儲存主題設定')
      }
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field) => (event) => {
    setTheme((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleIconStyle = (_event, value) => {
    if (value) {
      setTheme((prev) => ({ ...prev, iconStyle: value }))
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Theme 設定
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
        Theme 設定
      </Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Paper className="rounded-lg p-6" elevation={0}>
        <Stack spacing={4}>
          <Typography variant="subtitle1" fontWeight={600}>
            介面主題顏色
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                背景顏色
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: theme.backgroundColor,
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('color-bg').click()}
                />
                <TextField
                  id="color-bg"
                  type="color"
                  value={theme.backgroundColor}
                  onChange={handleChange('backgroundColor')}
                  sx={{ display: 'none' }}
                />
                <TextField
                  label="Hex"
                  value={theme.backgroundColor}
                  onChange={handleChange('backgroundColor')}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                主色
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: theme.primaryColor,
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('color-primary').click()}
                />
                <TextField
                  id="color-primary"
                  type="color"
                  value={theme.primaryColor}
                  onChange={handleChange('primaryColor')}
                  sx={{ display: 'none' }}
                />
                <TextField
                  label="Hex"
                  value={theme.primaryColor}
                  onChange={handleChange('primaryColor')}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                次色
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: theme.secondaryColor,
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('color-secondary').click()}
                />
                <TextField
                  id="color-secondary"
                  type="color"
                  value={theme.secondaryColor}
                  onChange={handleChange('secondaryColor')}
                  sx={{ display: 'none' }}
                />
                <TextField
                  label="Hex"
                  value={theme.secondaryColor}
                  onChange={handleChange('secondaryColor')}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                重點顏色
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: theme.accentColor,
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('color-accent').click()}
                />
                <TextField
                  id="color-accent"
                  type="color"
                  value={theme.accentColor}
                  onChange={handleChange('accentColor')}
                  sx={{ display: 'none' }}
                />
                <TextField
                  label="Hex"
                  value={theme.accentColor}
                  onChange={handleChange('accentColor')}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>
          </Stack>
          <Divider flexItem />
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Icon 風格
            </Typography>
            <ToggleButtonGroup value={theme.iconStyle} exclusive onChange={handleIconStyle} color="primary">
              <ToggleButton value="default">
                <LensBlurIcon className="mr-2" />
                Default
              </ToggleButton>
              <ToggleButton value="rounded">
                <EmojiEmotionsIcon className="mr-2" />
                Rounded
              </ToggleButton>
              <ToggleButton value="spark">
                <SparkleIcon className="mr-2" />
                Spark
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Divider flexItem />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              預覽
            </Typography>
            <Box
              className="rounded-lg p-6"
              sx={{
                background: theme.backgroundColor,
                color: theme.primaryColor,
                border: `1px solid ${theme.accentColor}`,
              }}
            >
              <Typography variant="h6">Fukuoka Foodies Go!</Typography>
              <Typography variant="body2" color="text.primary">
                背景顏色、按鈕及 icon 風格將依以上設定呈現。
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 1, alignSelf: 'flex-start' }}
          >
            {saving ? '儲存中...' : '儲存主題'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default ThemeSettingsPage

