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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import OutlinedInput from '@mui/material/OutlinedInput'
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
  const [event, setEvent] = useState(null)
  const [availableEvents, setAvailableEvents] = useState([])

  useEffect(() => {
    loadRegistrations()
    loadEvent()
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

  // 生成穩定的活動 ID（與 RegistrationPage 保持一致）
  const generateEventId = (item, index) => {
    // 優先使用 _id
    if (item._id) return item._id
    
    // 如果沒有 _id，使用內容生成穩定的 ID
    const dateStr = item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    const timeStr = item.timeLabel || (item.timeRange?.start || '')
    const desc = item.descriptionZh || item.descriptionEn || ''
    
    // 使用日期、時間和描述的組合生成一個穩定的 ID
    const contentHash = `${dateStr}-${timeStr}-${desc}`.replace(/\s+/g, '-').toLowerCase()
    return contentHash || `event-${index}`
  }

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        setEvent(response.data.event)
        
        const allEvents = []
        const seenIds = new Set() // 用於去重
        
        // 1. 優先從 formConfig.events 獲取選修活動（新方式）
        const formConfigEvents = response.data.event.registrationFormConfig?.events || []
        formConfigEvents.forEach(event => {
          if (!seenIds.has(event.id)) {
            allEvents.push({
              id: event.id,
              name: `${event.labelZh || event.labelEn || 'Event'} (${event.labelEn || event.labelZh || 'Event'})`,
              nameZh: event.labelZh || event.labelEn || 'Event',
              nameEn: event.labelEn || event.labelZh || 'Event',
              date: event.date || '',
              time: event.time || '',
              fullLabel: event.fullLabel || `${event.date || ''} ${event.time || ''} - ${event.labelZh || event.labelEn || 'Event'} (${event.labelEn || event.labelZh || 'Event'})`,
              source: 'formConfig',
            })
            seenIds.add(event.id)
          }
        })
        
        // 2. 從 schedule tile 中提取活動（僅用於向後兼容舊數據的匹配，不顯示在編輯選單中）
        // 但我們需要保存這些信息以便匹配舊登記記錄中的活動 ID
        const scheduleTile = response.data.event.tiles?.find(tile => tile.type === 'schedule' && tile.scheduleItems)
        if (scheduleTile && scheduleTile.scheduleItems) {
          scheduleTile.scheduleItems.forEach((item, index) => {
            const eventId = generateEventId(item, index)
            // 只添加不在 formConfig.events 中的活動（用於匹配舊數據）
            if (!seenIds.has(eventId) && !seenIds.has(item._id?.toString())) {
              const dateStr = item.date ? new Date(item.date).toLocaleDateString('zh-TW') : '未指定日期'
              const timeStr = item.timeLabel || (item.timeRange?.start && item.timeRange?.end 
                ? `${item.timeRange.start} - ${item.timeRange.end}`
                : item.timeRange?.start || '')
              const name = item.descriptionZh || item.descriptionEn || `活動 ${index + 1}`
              const nameEn = item.descriptionEn || item.descriptionZh || `Event ${index + 1}`
              
              allEvents.push({
                id: eventId,
                name: `${name} (${nameEn})`,
                nameZh: name,
                nameEn: nameEn,
                date: dateStr,
                time: timeStr,
                fullLabel: `${dateStr} ${timeStr} - ${name} (${nameEn})`,
                originalItem: item,
                mongoId: item._id,
                source: 'schedule',
              })
              seenIds.add(eventId)
              if (item._id) seenIds.add(item._id.toString())
            }
          })
        }
        
        setAvailableEvents(allEvents)
      }
    } catch (error) {
      console.error('Failed to load event:', error)
    }
  }

  const handleEdit = (registration) => {
    setSelectedRegistration(registration)
    setEditForm({
      // 個人資料
      nameEn: registration.nameEn || '',
      nameZh: registration.nameZh || '',
      email: registration.email || '',
      mobile: registration.mobile || '',
      dob: registration.dob ? new Date(registration.dob).toISOString().split('T')[0] : '',
      passportNumber: registration.passportNumber || '',
      // 航班與住宿
      flight: registration.flight || '',
      hotel: registration.hotel || '',
      roomType: registration.roomType || '',
      roommate: registration.roommate || '',
      // 活動選擇 - 保持為陣列格式
      selectedEventIds: Array.isArray(registration.selectedEventIds) ? registration.selectedEventIds : (registration.selectedEventIds ? [registration.selectedEventIds] : []),
      // 特殊需求
      dietary: registration.dietary || '',
      specialRemarks: registration.specialRemarks || '',
      // 狀態
      status: registration.status || 'Registered',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      setError('')
      // 處理 selectedEventIds：確保是陣列格式
      const formData = { ...editForm }
      if (typeof formData.selectedEventIds === 'string' && formData.selectedEventIds.trim()) {
        formData.selectedEventIds = formData.selectedEventIds.split(',').map(id => id.trim()).filter(id => id)
      } else if (Array.isArray(formData.selectedEventIds)) {
        // 已經是陣列，保持不變
        formData.selectedEventIds = formData.selectedEventIds.filter(id => id)
      } else if (!formData.selectedEventIds || formData.selectedEventIds === '') {
        formData.selectedEventIds = []
      }
      
      // 處理日期：如果是字串，轉換為 Date
      if (formData.dob && typeof formData.dob === 'string') {
        formData.dob = new Date(formData.dob)
      }
      
      const response = await api.put(
        `/events/${eventId}/registrations/${selectedRegistration._id}`,
        formData
      )
      if (response.success) {
        await loadRegistrations()
        setEditDialogOpen(false)
        setSelectedRegistration(null)
        setEditForm({})
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
                  alignItems={{ md: 'flex-start' }}
                  className="px-6 py-4"
                >
                  <Stack direction="row" spacing={2} alignItems="center" flex={{ md: 0.8 }}>
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
                      {registration.nameZh && registration.nameEn && (
                        <Typography variant="caption" color="text.secondary">
                          {registration.nameZh}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <Stack spacing={1.5} flex={{ md: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {registration.mobile && (
                        <Chip label={`手機: ${registration.mobile}`} size="small" variant="outlined" />
                      )}
                      {registration.dob && (
                        <Chip 
                          label={`出生: ${new Date(registration.dob).toLocaleDateString('zh-TW')}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                      {registration.passportNumber && (
                        <Chip 
                          label={`護照: ${registration.passportNumber}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                      {registration.passportNumber && (
                        <Chip 
                          label={`登入: ${registration.email}`} 
                          size="small" 
                          variant="outlined" 
                          color="info"
                          title={`初始密碼: ${registration.passportNumber.length >= 6 ? registration.passportNumber.slice(-6) : registration.passportNumber.padStart(6, '0').slice(-6)}`}
                        />
                      )}
                    </Stack>
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
                      {registration.roommate && (
                        <Chip label={`室友: ${registration.roommate}`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {registration.dietary && (
                        <Chip label={`飲食: ${registration.dietary}`} size="small" variant="outlined" />
                      )}
                      {registration.selectedEventIds && registration.selectedEventIds.length > 0 && (
                        <Chip 
                          label={`活動: ${registration.selectedEventIds.length} 個`} 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                        />
                      )}
                      {registration.specialRemarks && (
                        <Chip 
                          label="有備註" 
                          size="small" 
                          variant="outlined" 
                          color="warning"
                        />
                      )}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" flex={{ md: 0.5 }}>
                    <Chip
                      label={getStatusLabel(registration.status)}
                      color={getStatusColor(registration.status)}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flex={{ md: 0.3 }}>
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
                    {selectedRegistration.passportNumber && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #90caf9' }}>
                        <Typography variant="caption" fontWeight={600} color="primary" display="block" gutterBottom>
                          🔐 登入資訊 / Login Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          登入帳號 / Login Account: <strong>{selectedRegistration.email}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          初始密碼 / Initial Password: <strong>{selectedRegistration.passportNumber.length >= 6 
                            ? selectedRegistration.passportNumber.slice(-6)
                            : selectedRegistration.passportNumber.padStart(6, '0').slice(-6)}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                          💡 使用護照號碼後6位作為首次登入密碼 / Use the last 6 digits of passport number as initial password
                        </Typography>
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
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>選擇的活動 Selected Events</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Stack spacing={1}>
                      {selectedRegistration.selectedEventIds.map((id, idx) => {
                        // 首先嘗試直接匹配 ID
                        let event = availableEvents.find(e => e.id === id)
                        
                        // 如果直接匹配失敗，嘗試通過 _id 匹配（用於舊數據）
                        if (!event && availableEvents.length > 0) {
                          event = availableEvents.find(e => e.mongoId === id || e.originalItem?._id === id)
                        }
                        
                        return (
                          <Box key={idx} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {event ? event.fullLabel : `活動 ID: ${id}`}
                            </Typography>
                            {event ? (
                              <Typography variant="caption" color="text.secondary">
                                ID: {id}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="error">
                                無法找到此活動（可能已被刪除或修改）Unable to find this event (may have been deleted or modified)
                              </Typography>
                            )}
                          </Box>
                        )
                      })}
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
      <Dialog 
        open={editDialogOpen} 
        onClose={() => {
          setEditDialogOpen(false)
          setEditForm({})
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>編輯登記 Edit Registration</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                個人資料
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="姓名 (英文) Name (English)"
                    value={editForm.nameEn || ''}
                    onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="姓名 (中文) Name (Chinese)"
                    value={editForm.nameZh || ''}
                    onChange={(e) => setEditForm({ ...editForm, nameZh: e.target.value })}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="電郵 Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  fullWidth
                  required
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="手機號碼 Mobile"
                    value={editForm.mobile || ''}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="出生日期 Date of Birth"
                    type="date"
                    value={editForm.dob || ''}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <TextField
                  label="護照號碼 Passport Number"
                  value={editForm.passportNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, passportNumber: e.target.value })}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                航班與住宿 Flight & Accommodation
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="航班 Flight"
                  value={editForm.flight || ''}
                  onChange={(e) => setEditForm({ ...editForm, flight: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="">無 None</MenuItem>
                  <MenuItem value="Group Flight">Group Flight</MenuItem>
                  <MenuItem value="Self">Self Arrangement</MenuItem>
                </TextField>
                <TextField
                  label="酒店 Hotel"
                  value={editForm.hotel || ''}
                  onChange={(e) => setEditForm({ ...editForm, hotel: e.target.value })}
                  fullWidth
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="房間類型 Room Type"
                    value={editForm.roomType || ''}
                    onChange={(e) => setEditForm({ ...editForm, roomType: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="">無 None</MenuItem>
                    <MenuItem value="Single">Single Room</MenuItem>
                    <MenuItem value="Twin">Twin Share</MenuItem>
                  </TextField>
                  <TextField
                    label="室友 Roommate"
                    value={editForm.roommate || ''}
                    onChange={(e) => setEditForm({ ...editForm, roommate: e.target.value })}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                活動選擇 Event Selection
              </Typography>
              {(() => {
                // 只顯示 formConfig.events 中的選修活動（用於編輯）
                const formConfigEvents = event?.registrationFormConfig?.events || []
                const editableEvents = formConfigEvents.map(event => ({
                  id: event.id,
                  name: `${event.labelZh || event.labelEn || 'Event'} (${event.labelEn || event.labelZh || 'Event'})`,
                  nameZh: event.labelZh || event.labelEn || 'Event',
                  nameEn: event.labelEn || event.labelZh || 'Event',
                  date: event.date || '',
                  time: event.time || '',
                  fullLabel: event.fullLabel || `${event.date || ''} ${event.time || ''} - ${event.labelZh || event.labelEn || 'Event'} (${event.labelEn || event.labelZh || 'Event'})`,
                }))
                
                return editableEvents.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>選擇活動 Select Events</InputLabel>
                    <Select
                      multiple
                      value={(() => {
                        // 將舊的 ID 轉換為新的穩定 ID，以便正確顯示選中狀態
                        const ids = editForm.selectedEventIds || []
                        return ids.map(id => {
                          // 如果已經是穩定 ID，直接返回
                          const event = editableEvents.find(e => e.id === id)
                          if (event) return event.id
                          
                          // 嘗試通過 availableEvents 匹配（用於舊數據）
                          const eventByMongoId = availableEvents.find(e => e.mongoId === id || e.originalItem?._id === id)
                          if (eventByMongoId) {
                            // 如果舊數據的活動在 formConfig 中有對應，使用 formConfig 的 ID
                            const matchingFormEvent = editableEvents.find(e => 
                              e.date === eventByMongoId.date && 
                              e.time === eventByMongoId.time &&
                              (e.nameZh === eventByMongoId.nameZh || e.nameEn === eventByMongoId.nameEn)
                            )
                            return matchingFormEvent ? matchingFormEvent.id : eventByMongoId.id
                          }
                          
                          return id
                        }).filter(id => editableEvents.some(e => e.id === id) || availableEvents.some(e => e.id === id || e.mongoId === id || e.originalItem?._id === id))
                      })()}
                      onChange={(e) => {
                        const value = e.target.value
                        const selectedIds = typeof value === 'string' ? value.split(',') : value
                        // 確保只保存穩定 ID
                        const normalizedIds = selectedIds.map(id => {
                          const event = editableEvents.find(e => e.id === id)
                          return event ? event.id : id
                        })
                        setEditForm({ ...editForm, selectedEventIds: normalizedIds })
                      }}
                      input={<OutlinedInput label="選擇活動 Select Events" />}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) return '未選擇'
                        return selected.map(id => {
                          // 首先從可編輯活動中匹配
                          let event = editableEvents.find(e => e.id === id)
                          // 如果沒有，從 availableEvents 中匹配（用於顯示舊數據）
                          if (!event) {
                            event = availableEvents.find(e => e.id === id || e.mongoId === id || e.originalItem?._id === id)
                          }
                          return event ? event.name : `活動 ID: ${id}`
                        }).join(', ')
                      }}
                    >
                      {editableEvents.map((event) => {
                        // 檢查是否選中（支持多種 ID 格式）
                        const isSelected = (editForm.selectedEventIds || []).some(id => 
                          id === event.id || 
                          availableEvents.some(e => (e.id === id || e.mongoId === id || e.originalItem?._id === id) && 
                            e.date === event.date && e.time === event.time && 
                            (e.nameZh === event.nameZh || e.nameEn === event.nameEn))
                        )
                        return (
                          <MenuItem key={event.id} value={event.id}>
                            <Checkbox checked={isSelected} />
                            <ListItemText 
                              primary={event.fullLabel}
                              secondary={`ID: ${event.id}`}
                            />
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                ) : (
                <TextField
                  label="選擇的活動 ID (用逗號分隔) Selected Event IDs (comma-separated)"
                  value={typeof editForm.selectedEventIds === 'string' 
                    ? editForm.selectedEventIds 
                    : (editForm.selectedEventIds || []).join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, selectedEventIds: e.target.value })}
                  fullWidth
                  helperText="如果沒有可用的活動列表，請手動輸入活動 ID（用逗號分隔）"
                />
              )
              })()}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                特殊需求 Special Requirements
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="飲食需求 Dietary Requirements"
                  value={editForm.dietary || ''}
                  onChange={(e) => setEditForm({ ...editForm, dietary: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="特殊備註 Special Remarks"
                  multiline
                  minRows={3}
                  value={editForm.specialRemarks || ''}
                  onChange={(e) => setEditForm({ ...editForm, specialRemarks: e.target.value })}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                狀態 Status
              </Typography>
              <TextField
                select
                label="狀態 Status"
                value={editForm.status || 'Registered'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="Registered">已登記 Registered</MenuItem>
                <MenuItem value="Confirmed">已確認 Confirmed</MenuItem>
                <MenuItem value="Cancelled">已取消 Cancelled</MenuItem>
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false)
            setEditForm({})
          }}>取消</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            儲存 Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default EventRegistrationsPage


