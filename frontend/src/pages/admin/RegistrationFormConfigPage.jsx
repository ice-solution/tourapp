import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import { api } from '../../utils/api.js'

const defaultConfig = {
  flights: [
    {
      id: 'A',
      labelEn: 'Group Flight (Recommended)',
      labelZh: '團體航班 (推薦)',
      descriptionEn: 'CX105 HKG-MEL / CX104 MEL-HKG',
      descriptionZh: 'CX105 HKG-MEL / CX104 MEL-HKG',
    },
    {
      id: 'B',
      labelEn: 'Self Arrangement',
      labelZh: '自行安排',
      descriptionEn: 'Flight allowance will be reimbursed',
      descriptionZh: '航班津貼將獲退還',
    },
  ],
  hotels: [
    {
      id: 'Hyatt',
      labelEn: 'Grand Hyatt Melbourne',
      labelZh: '墨爾本君悅酒店',
    },
    {
      id: 'Langham',
      labelEn: 'The Langham Melbourne',
      labelZh: '墨爾本朗廷酒店',
    },
  ],
  roomTypes: [
    {
      id: 'Single',
      labelEn: 'Single Room',
      labelZh: '單人房',
    },
    {
      id: 'Twin',
      labelEn: 'Twin Share',
      labelZh: '雙人房',
    },
  ],
  dietaryOptions: [
    { id: 'None', labelEn: 'None', labelZh: '無' },
    { id: 'Vegetarian', labelEn: 'Vegetarian', labelZh: '素食' },
    { id: 'No Beef', labelEn: 'No Beef', labelZh: '不吃牛肉' },
    { id: 'No Pork', labelEn: 'No Pork', labelZh: '不吃豬肉' },
    { id: 'Halal', labelEn: 'Halal', labelZh: '清真' },
    { id: 'Gluten Free', labelEn: 'Gluten Free', labelZh: '無麩質' },
  ],
}

const RegistrationFormConfigPage = () => {
  const { eventId } = useParams()
  const [config, setConfig] = useState(defaultConfig)
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadConfig()
  }, [eventId])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        const eventConfig = response.data.event.registrationFormConfig || defaultConfig
        setConfig(eventConfig)
        setJsonText(JSON.stringify(eventConfig, null, 2))
      }
    } catch (error) {
      setError(error.message || '載入配置失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleJsonChange = (value) => {
    setJsonText(value)
    try {
      const parsed = JSON.parse(value)
      setConfig(parsed)
      setError('')
    } catch (e) {
      // 允許無效的 JSON，只在保存時驗證
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')
      
      let configToSave
      try {
        configToSave = JSON.parse(jsonText)
      } catch (e) {
        setError('JSON 格式錯誤，請檢查語法')
        setSaving(false)
        return
      }

      const response = await api.put(`/events/${eventId}/registration-form-config`, configToSave)
      if (response.success) {
        setMessage('已儲存配置')
        await loadConfig()
      }
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('確定要重置為預設配置嗎？')) {
      setConfig(defaultConfig)
      setJsonText(JSON.stringify(defaultConfig, null, 2))
      setError('')
      setMessage('')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `registration-form-config-${eventId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        const parsed = JSON.parse(content)
        setConfig(parsed)
        setJsonText(JSON.stringify(parsed, null, 2))
        setError('')
        setMessage('JSON 檔案已載入，請點擊「儲存」以套用')
      } catch (error) {
        setError('無法解析 JSON 檔案：' + error.message)
      }
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          登記表單配置
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          登記表單配置
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadConfig}
            sx={{ borderRadius: 1 }}
          >
            重新載入
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ borderRadius: 1 }}
          >
            下載 JSON
          </Button>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="upload-json"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="upload-json">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
              sx={{ borderRadius: 1 }}
            >
              上傳 JSON
            </Button>
          </label>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ borderRadius: 1 }}
          >
            重置為預設
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 1 }}
          >
            {saving ? '儲存中...' : '儲存配置'}
          </Button>
        </Stack>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Paper elevation={0} className="rounded-lg p-6">
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            JSON 配置
          </Typography>
          <Typography variant="body2" color="text.secondary">
            編輯以下 JSON 來配置登記表單的選項（航班、酒店、房間類型、飲食選項等）
          </Typography>
          <TextField
            multiline
            minRows={20}
            maxRows={30}
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            placeholder={JSON.stringify(defaultConfig, null, 2)}
          />
          <Alert severity="info">
            <Typography variant="body2">
              <strong>配置結構說明：</strong>
              <br />
              • <code>flights</code>: 航班選項（id, labelEn, labelZh, descriptionEn, descriptionZh）
              <br />
              • <code>hotels</code>: 酒店選項（id, labelEn, labelZh）
              <br />
              • <code>roomTypes</code>: 房間類型（id, labelEn, labelZh）
              <br />
              • <code>dietaryOptions</code>: 飲食選項（id, labelEn, labelZh）
            </Typography>
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default RegistrationFormConfigPage

