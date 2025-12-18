import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import { useEventUserAuth } from '../context/EventUserAuthContext.jsx'
import { api } from '../utils/api.js'

const EventLoginPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useEventUserAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [event, setEvent] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${eventId}`, { replace: true })
    }
  }, [isAuthenticated, navigate, eventId])

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        setEvent(response.data.event)
      }
    } catch (error) {
      setError('載入活動資訊失敗')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('請填寫電郵與密碼')
      return
    }

    try {
      setLoading(true)
      setError('')
      const result = await login(email, password)
      if (result.success) {
        navigate(`/${eventId}`, { replace: true })
      } else {
        setError(result.error || '登入失敗')
      }
    } catch (error) {
      setError(error.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      className="min-h-screen"
      sx={{
        backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box className="flex flex-col flex-1 px-6 pt-14 pb-10 text-white">
        <Stack spacing={1.5} className="mt-8">
          <Typography variant="h4" fontWeight={700}>
            {event?.title || '活動登入'}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {event?.title || 'Event Login'}
          </Typography>
          {event?.eventId && (
            <Typography variant="h5" fontWeight={800} color="#f2354b">
              {event.eventId}
            </Typography>
          )}
        </Stack>

        <Box className="mt-auto">
          <Paper
            elevation={20}
            className="rounded-[32px] p-6"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
            component="form"
            onSubmit={handleSubmit}
          >
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  電郵 / Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="請使用公司電郵 e.g. xxxx@pruhk.com"
                  variant="outlined"
                  margin="dense"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  密碼 / Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="請填寫密碼"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="dense"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword((prev) => !prev)} 
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: 999,
                  py: 1.5,
                  fontWeight: 700,
                  backgroundColor: '#c9503d',
                  '&:hover': { backgroundColor: '#a83d2e' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '登入 LOGIN'}
              </Button>
              
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  或 / OR
                </Typography>
              </Divider>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<AssignmentTurnedInIcon />}
                onClick={() => navigate(`/${eventId}/registration`)}
                sx={{
                  borderRadius: 999,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: '#c9503d',
                  color: '#c9503d',
                  '&:hover': { 
                    borderColor: '#a83d2e',
                    backgroundColor: 'rgba(201, 80, 61, 0.08)',
                  },
                }}
              >
                前往登記 / Go to Registration
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                <Link to="#" className="text-[#c9503d] no-underline">
                  忘記密碼 / Forget password
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default EventLoginPage


