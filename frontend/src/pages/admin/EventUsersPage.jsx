import { Fragment, useState } from 'react'
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
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Box from '@mui/material/Box'

const initialUsers = [
  {
    id: 'user-1',
    displayName: 'Winky Leung',
    email: 'winky@example.com',
    status: 'active',
    locale: 'zh-HK',
    lastLoginAt: '2025-02-12 19:02',
  },
  {
    id: 'user-2',
    displayName: 'Alex Chan',
    email: 'alex@example.com',
    status: 'disabled',
    locale: 'en-US',
    lastLoginAt: '2025-02-04 08:13',
  },
]

const EventUsersPage = () => {
  const [users, setUsers] = useState(initialUsers)
  const [form, setForm] = useState({ displayName: '', email: '', password: '', locale: 'zh-HK' })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const addUser = () => {
    if (!form.displayName || !form.email || !form.password) {
      return
    }
    setUsers((prev) => [
      {
        id: `user-${prev.length + 1}`,
        displayName: form.displayName,
        email: form.email,
        locale: form.locale,
        status: 'active',
        lastLoginAt: '尚未登入',
      },
      ...prev,
    ])
    setForm({ displayName: '', email: '', password: '', locale: 'zh-HK' })
  }

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === 'active' ? 'disabled' : 'active',
            }
          : user,
      ),
    )
  }

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        Event 用戶登入管理
      </Typography>
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
          <TextField label="語言 (Locale)" value={form.locale} onChange={handleChange('locale')} fullWidth />
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
          {users.map((user) => (
            <Fragment key={user.id}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ md: 'center' }}
                className="px-6 py-3"
              >
                <Stack direction="row" spacing={2} alignItems="center" flex={{ md: 1 }}>
                  <Avatar sx={{ bgcolor: '#c9503d' }}>{user.displayName[0]}</Avatar>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{user.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.6 }}>
                  <Chip
                    label={user.status === 'active' ? '啟用' : '停用'}
                    color={user.status === 'active' ? 'success' : 'default'}
                    onClick={() => toggleStatus(user.id)}
                  />
                  <Chip label={user.locale} variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.8 }}>
                  <Typography variant="body2">最後登入：{user.lastLoginAt}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flex={{ md: 0.4 }}>
                  <Tooltip title="重設密碼">
                    <IconButton color="primary">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="刪除用戶">
                    <IconButton color="error" onClick={() => deleteUser(user.id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Divider />
            </Fragment>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default EventUsersPage
