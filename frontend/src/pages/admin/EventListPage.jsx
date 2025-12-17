import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { api } from '../../utils/api.js'

const EventListPage = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ eventId: '', title: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/events')
      if (response.success) {
        setEvents(response.data.events || [])
      }
    } catch (error) {
      setError(error.message || '載入活動列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.eventId || !newEvent.title) {
      setError('請填寫 Event ID 和標題')
      return
    }
    try {
      setCreating(true)
      setError('')
      const response = await api.post('/events', newEvent)
      if (response.success) {
        setCreateDialogOpen(false)
        setNewEvent({ eventId: '', title: '', description: '' })
        await loadEvents()
      }
    } catch (error) {
      setError(error.message || '建立活動失敗')
    } finally {
      setCreating(false)
    }
  }

  const handleSelectEvent = (eventId) => {
    navigate(`/admin/events/${eventId}/overview`)
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          載入中...
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          活動管理
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} sx={{ borderRadius: 1 }}>
          建立新活動
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {events.length === 0 ? (
        <Paper className="rounded-lg p-6" elevation={0}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            尚無活動，請建立第一個活動
          </Typography>
        </Paper>
      ) : (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={2}>
          {events.map((event) => (
            <Card key={event._id} sx={{ borderRadius: 1 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.isPublished ? '已發布' : '未發布'}
                    color={event.isPublished ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Event ID: <strong>{event.eventId}</strong>
                </Typography>
                {event.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {event.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleSelectEvent(event.eventId)}>
                  管理
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>建立新活動</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Event ID"
              helperText="英數字與連字號，用作前台路由與 API 存取"
              value={newEvent.eventId}
              onChange={(e) => setNewEvent({ ...newEvent, eventId: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Event 名稱"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="簡介"
              multiline
              minRows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateEvent} disabled={creating}>
            {creating ? '建立中...' : '建立'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default EventListPage

