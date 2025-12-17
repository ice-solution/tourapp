import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { api } from '../../utils/api.js'

const EventOverviewPage = () => {
  const { eventId } = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        const event = response.data.event
        setTitle(event.title || '')
        setDescription(event.description || '')
        setIsPublished(event.isPublished || false)
      }
    } catch (error) {
      setError(error.message || '載入活動失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')
      const response = await api.patch(`/events/${eventId}`, {
        title,
        description,
        isPublished,
      })
      if (response.success) {
        setMessage('已儲存活動設定')
      }
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Event 設定總覽
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
        Event 設定總覽
      </Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Paper className="rounded-lg p-6" elevation={0}>
        <Stack spacing={3}>
          <Typography variant="subtitle1" fontWeight={600}>
            Event 資訊
          </Typography>
          <TextField
            label="Event ID"
            helperText="英數字與連字號，用作前台路由與 API 存取（不可修改）"
            value={eventId}
            disabled
            fullWidth
          />
          <TextField
            label="Event 名稱"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />
          <TextField
            label="簡介"
            multiline
            minRows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
          />
          <Divider />
          <FormControlLabel
            control={<Switch checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />}
            label={isPublished ? '已發布' : '未發布'}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ alignSelf: 'flex-start', borderRadius: 1 }}
          >
            {saving ? '儲存中...' : '儲存設定'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default EventOverviewPage

