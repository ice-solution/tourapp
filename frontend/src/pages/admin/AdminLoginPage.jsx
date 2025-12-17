import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email || !password) {
      setError('請輸入帳號與密碼')
      return
    }
    setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate('/admin/events')
    } else {
      setError(result.message || '登入失敗')
    }
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-[#c4d971] via-[#f7d9a8] to-[#f5a6c4]" display="flex" alignItems="center" justifyContent="center" px={2}>
      <Paper elevation={6} className="w-full max-w-md rounded-lg p-10">
        <Stack spacing={3} alignItems="center">
          <Avatar sx={{ bgcolor: '#c9503d', width: 64, height: 64 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              後台登入
            </Typography>
            <Typography variant="body2" color="text.secondary">
              請輸入管理員帳號與密碼存取後台設定
            </Typography>
          </Box>
          {error && <Alert severity="warning">{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} className="w-full space-y-4">
            <TextField
              label="帳號"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="密碼"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" size="large" fullWidth sx={{ borderRadius: 1 }}>
              登入
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default AdminLoginPage

