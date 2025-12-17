import { useEffect, useState, Fragment } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { api } from '../../utils/api.js'

const EventRegistrationsPage = () => {
  const { eventId } = useParams()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadRegistrations()
  }, [eventId])

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}/registrations`)
      if (response.success && response.data.registrations) {
        setRegistrations(response.data.registrations)
      }
    } catch (error) {
      setError(error.message || '載入登記資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (registration) => {
    setSelectedRegistration(registration)
    setEditForm({
      status: registration.status || 'Registered',
      dietary: registration.dietary || '',
      specialRemarks: registration.specialRemarks || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      setError('')
      const response = await api.put(
        `/events/${eventId}/registrations/${selectedRegistration._id}`,
        editForm
      )
      if (response.success) {
        await loadRegistrations()
        setEditDialogOpen(false)
        setSelectedRegistration(null)
      }
    } catch (error) {
      setError(error.message || '更新失敗')
    }
  }

  const handleDelete = async (registrationId) => {
    if (!window.confirm('確定要刪除此登記嗎？')) {
      return
    }
    try {
      setError('')
      const response = await api.delete(`/events/${eventId}/registrations/${registrationId}`)
      if (response.success) {
        await loadRegistrations()
      }
    } catch (error) {
      setError(error.message || '刪除失敗')
    }
  }

  const handleExport = () => {
    // 將登記資料轉換為 CSV 格式
    const headers = [
      '姓名 (英文)',
      '姓名 (中文)',
      '電郵',
      '手機號碼',
      '出生日期',
      '護照號碼',
      '航班',
      '酒店',
      '房間類型',
      '室友',
      '選擇的活動',
      '飲食需求',
      '特殊備註',
      '狀態',
      '登記時間',
      '最後更新',
    ]
    const rows = registrations.map((reg) => [
      reg.nameEn || '',
      reg.nameZh || '',
      reg.email || '',
      reg.mobile || '',
      reg.dob ? new Date(reg.dob).toLocaleDateString('zh-TW') : '',
      reg.passportNumber || '',
      reg.flight || '',
      reg.hotel || '',
      reg.roomType || '',
      reg.roommate || '',
      (reg.selectedEventIds || []).join('; ') || '',
      reg.dietary || '',
      reg.specialRemarks || '',
      reg.status || '',
      reg.createdAt ? new Date(reg.createdAt).toLocaleString('zh-TW') : '',
      reg.updatedAt ? new Date(reg.updatedAt).toLocaleString('zh-TW') : '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `registrations-${eventId}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success'
      case 'Cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Registered':
        return '已登記'
      case 'Confirmed':
        return '已確認'
      case 'Cancelled':
        return '已取消'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          登記管理
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
          登記管理
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRegistrations}
            sx={{ borderRadius: 1 }}
          >
            重新載入
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={registrations.length === 0}
            sx={{ borderRadius: 1 }}
          >
            匯出 CSV
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper elevation={0} className="rounded-lg p-0 overflow-hidden">
        <Box className="bg-[#f5f5f5] px-6 py-3">
          <Typography variant="subtitle1" fontWeight={600}>
            登記列表 ({registrations.length})
          </Typography>
        </Box>
        {registrations.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              目前沒有任何登記
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {registrations.map((registration, index) => (
              <Fragment key={registration._id}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ md: 'center' }}
                  className="px-6 py-4"
                >
                  <Stack direction="row" spacing={2} alignItems="center" flex={{ md: 1 }}>
                    <Avatar sx={{ bgcolor: '#c9503d' }}>
                      {(registration.nameEn || registration.nameZh || '?')[0].toUpperCase()}
                    </Avatar>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>
                        {registration.nameEn || registration.nameZh || '未提供姓名'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {registration.email}
                      </Typography>
                      {registration.nameZh && (
                        <Typography variant="caption" color="text.secondary">
                          {registration.nameZh}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <Stack spacing={1} flex={{ md: 1.2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {registration.flight && (
                        <Chip label={`航班: ${registration.flight}`} size="small" variant="outlined" />
                      )}
                      {registration.hotel && (
                        <Chip label={`酒店: ${registration.hotel}`} size="small" variant="outlined" />
                      )}
                      {registration.roomType && (
                        <Chip label={`房間: ${registration.roomType}`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    {registration.dietary && (
                      <Typography variant="caption" color="text.secondary">
                        飲食: {registration.dietary}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.6 }}>
                    <Chip
                      label={getStatusLabel(registration.status)}
                      color={getStatusColor(registration.status)}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flex={{ md: 0.4 }}>
                    <Tooltip title="查看詳情">
                      <IconButton color="info" onClick={() => {
                        setSelectedRegistration(registration)
                        setDetailDialogOpen(true)
                      }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編輯">
                      <IconButton color="primary" onClick={() => handleEdit(registration)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton color="error" onClick={() => handleDelete(registration._id)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                {index < registrations.length - 1 && <Divider />}
              </Fragment>
            ))}
          </Stack>
        )}
      </Paper>

      {/* 詳細資料對話框 */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>登記詳情</DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>個人資料</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">姓名 (英文)</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedRegistration.nameEn || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">姓名 (中文)</Typography>
                      <Typography variant="body1">{selectedRegistration.nameZh || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">電郵</Typography>
                      <Typography variant="body1">{selectedRegistration.email || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">手機號碼</Typography>
                      <Typography variant="body1">{selectedRegistration.mobile || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">出生日期</Typography>
                      <Typography variant="body1">{selectedRegistration.dob ? new Date(selectedRegistration.dob).toLocaleDateString('zh-TW') : '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">護照號碼</Typography>
                      <Typography variant="body1">{selectedRegistration.passportNumber || '-'}</Typography>
                    </Box>
                    {selectedRegistration.passportUrl && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">護照副本</Typography>
                        <Box sx={{ mt: 1 }}>
                          <img src={selectedRegistration.passportUrl} alt="Passport" style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>航班與住宿</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">航班</Typography>
                      <Typography variant="body1">{selectedRegistration.flight || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">酒店</Typography>
                      <Typography variant="body1">{selectedRegistration.hotel || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">房間類型</Typography>
                      <Typography variant="body1">{selectedRegistration.roomType || '-'}</Typography>
                    </Box>
                    {selectedRegistration.roommate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">室友</Typography>
                        <Typography variant="body1">{selectedRegistration.roommate}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>

              {selectedRegistration.selectedEventIds && selectedRegistration.selectedEventIds.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>選擇的活動</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Stack spacing={1} direction="row" flexWrap="wrap">
                      {selectedRegistration.selectedEventIds.map((id, idx) => (
                        <Chip key={idx} label={id} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>特殊需求</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">飲食需求</Typography>
                      <Typography variant="body1">{selectedRegistration.dietary || '-'}</Typography>
                    </Box>
                    {selectedRegistration.specialRemarks && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">特殊備註</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedRegistration.specialRemarks}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>狀態與時間</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">狀態</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={getStatusLabel(selectedRegistration.status)}
                          color={getStatusColor(selectedRegistration.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">登記時間</Typography>
                      <Typography variant="body1">
                        {selectedRegistration.createdAt ? new Date(selectedRegistration.createdAt).toLocaleString('zh-TW') : '-'}
                      </Typography>
                    </Box>
                    {selectedRegistration.updatedAt && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">最後更新</Typography>
                        <Typography variant="body1">
                          {new Date(selectedRegistration.updatedAt).toLocaleString('zh-TW')}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>關閉</Button>
          <Button variant="contained" onClick={() => {
            setDetailDialogOpen(false)
            handleEdit(selectedRegistration)
          }}>
            編輯
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編輯對話框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>編輯登記</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="狀態"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="Registered">已登記</MenuItem>
              <MenuItem value="Confirmed">已確認</MenuItem>
              <MenuItem value="Cancelled">已取消</MenuItem>
            </TextField>
            <TextField
              label="飲食需求"
              value={editForm.dietary}
              onChange={(e) => setEditForm({ ...editForm, dietary: e.target.value })}
              fullWidth
            />
            <TextField
              label="特殊備註"
              multiline
              minRows={3}
              value={editForm.specialRemarks}
              onChange={(e) => setEditForm({ ...editForm, specialRemarks: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default EventRegistrationsPage


