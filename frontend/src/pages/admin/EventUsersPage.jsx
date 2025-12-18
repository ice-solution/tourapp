import { Fragment, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import { api } from '../../utils/api.js'

const EventUsersPage = () => {
  const { eventId } = useParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ displayName: '', email: '', password: '', locale: 'zh-HK' })
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, userId: null, newPassword: '' })
  const [registrations, setRegistrations] = useState([]) // 用於查找對應的登記記錄

  useEffect(() => {
    loadUsers()
    loadRegistrations()
  }, [eventId])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}/users`)
      if (response.success && response.data.users) {
        setUsers(response.data.users)
      }
    } catch (error) {
      setError(error.message || '載入用戶失敗')
    } finally {
      setLoading(false)
    }
  }

  const loadRegistrations = async () => {
    try {
      const response = await api.get(`/events/${eventId}/registrations`)
      if (response.success && response.data.registrations) {
        setRegistrations(response.data.registrations)
      }
    } catch (error) {
      console.error('Failed to load registrations:', error)
    }
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const addUser = async () => {
    if (!form.displayName || !form.email || !form.password) {
      setError('請填寫所有必填欄位')
      return
    }

    try {
      setError('')
      setMessage('')
      const response = await api.post(`/events/${eventId}/users`, form)
      if (response.success) {
        setMessage('用戶已創建')
        setForm({ displayName: '', email: '', password: '', locale: 'zh-HK' })
        await loadUsers()
      }
    } catch (error) {
      setError(error.message || '創建用戶失敗')
    }
  }

  const toggleStatus = async (userId) => {
    try {
      const user = users.find(u => u._id === userId)
      if (!user) return

      const newStatus = user.status === 'active' ? 'disabled' : 'active'
      const response = await api.patch(`/events/${eventId}/users/${userId}`, { status: newStatus })
      if (response.success) {
        await loadUsers()
      }
    } catch (error) {
      setError(error.message || '更新狀態失敗')
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.newPassword) {
      setError('請輸入新密碼')
      return
    }

    try {
      setError('')
      const response = await api.patch(`/events/${eventId}/users/${resetPasswordDialog.userId}/reset-password`, {
        password: resetPasswordDialog.newPassword,
      })
      if (response.success) {
        setMessage('密碼已重設')
        setResetPasswordDialog({ open: false, userId: null, newPassword: '' })
        await loadUsers()
      }
    } catch (error) {
      setError(error.message || '重設密碼失敗')
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('確定要刪除此用戶嗎？')) {
      return
    }

    try {
      setError('')
      const response = await api.delete(`/events/${eventId}/users/${userId}`)
      if (response.success) {
        setMessage('用戶已刪除')
        await loadUsers()
      }
    } catch (error) {
      setError(error.message || '刪除用戶失敗')
    }
  }

  // 查找對應的登記記錄以獲取登入資訊
  const getRegistrationInfo = (email) => {
    return registrations.find(reg => reg.email.toLowerCase() === email.toLowerCase())
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Event 用戶登入管理
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
        Event 用戶登入管理
      </Typography>
      
      {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Paper elevation={0} className="rounded-lg p-6">
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          新增用戶
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="顯示名稱" value={form.displayName} onChange={handleChange('displayName')} fullWidth />
          <TextField label="電郵" value={form.email} onChange={handleChange('email')} fullWidth type="email" />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={2}>
          <TextField label="暫存密碼" value={form.password} onChange={handleChange('password')} fullWidth type="password" />
          <TextField 
            select
            label="語言 (Locale)" 
            value={form.locale} 
            onChange={handleChange('locale')} 
            fullWidth
          >
            <MenuItem value="zh-HK">zh-HK</MenuItem>
            <MenuItem value="en-US">en-US</MenuItem>
          </TextField>
        </Stack>
        <Button variant="contained" sx={{ borderRadius: 1, mt: 3 }} onClick={addUser}>
          新增用戶
        </Button>
      </Paper>

      <Paper elevation={0} className="rounded-lg p-0 overflow-hidden">
        <Box className="bg-[#f5f5f5] px-6 py-3">
          <Typography variant="subtitle1" fontWeight={600}>
            用戶列表
          </Typography>
        </Box>
        <Stack spacing={0}>
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                尚無用戶
              </Typography>
            </Box>
          ) : (
            users.map((user) => {
              const registration = getRegistrationInfo(user.email)
              const initialPassword = registration?.passportNumber 
                ? (registration.passportNumber.length >= 6 
                    ? registration.passportNumber.slice(-6)
                    : registration.passportNumber.padStart(6, '0').slice(-6))
                : null

              return (
                <Fragment key={user._id}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ md: 'center' }}
                    className="px-6 py-3"
                  >
                    <Stack direction="row" spacing={2} alignItems="center" flex={{ md: 1 }}>
                      <Avatar sx={{ bgcolor: '#c9503d' }}>{(user.displayName || user.email)[0].toUpperCase()}</Avatar>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{user.displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {registration && initialPassword && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 0.5, border: '1px solid #90caf9' }}>
                            <Typography variant="caption" color="primary" fontWeight={600} display="block">
                              🔐 登入資訊
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              初始密碼: <strong>{initialPassword}</strong> (護照後6位)
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.6 }}>
                      <Chip
                        label={user.status === 'active' ? '啟用' : '停用'}
                        color={user.status === 'active' ? 'success' : 'default'}
                        onClick={() => toggleStatus(user._id)}
                        size="small"
                      />
                      <Chip label={user.locale || 'zh-HK'} variant="outlined" size="small" />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.8 }}>
                      <Typography variant="body2" color="text.secondary">
                        最後登入：{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-TW') : '尚未登入'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flex={{ md: 0.4 }}>
                      <Tooltip title="重設密碼">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => setResetPasswordDialog({ open: true, userId: user._id, newPassword: '' })}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="刪除用戶">
                        <IconButton color="error" size="small" onClick={() => deleteUser(user._id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Divider />
                </Fragment>
              )
            })
          )}
        </Stack>
      </Paper>

      {/* 重設密碼對話框 */}
      <Dialog open={resetPasswordDialog.open} onClose={() => setResetPasswordDialog({ open: false, userId: null, newPassword: '' })}>
        <DialogTitle>重設密碼</DialogTitle>
        <DialogContent>
          <TextField
            label="新密碼"
            type="password"
            fullWidth
            value={resetPasswordDialog.newPassword}
            onChange={(e) => setResetPasswordDialog({ ...resetPasswordDialog, newPassword: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog({ open: false, userId: null, newPassword: '' })}>取消</Button>
          <Button variant="contained" onClick={handleResetPassword}>確認</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default EventUsersPage
