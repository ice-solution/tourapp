import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { Registration } from '../components/Registration'
import { api } from '../utils/api.js'

const RegistrationPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        setEvent(response.data.event)
      }
    } catch (error) {
      setError(error.message || '載入活動失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (eventId) {
      navigate(`/${eventId}`)
    } else {
      navigate('/')
    }
  }

  const handleComplete = () => {
    // 登記完成後返回活動頁面
    if (eventId) {
      navigate(`/${eventId}`)
    } else {
      navigate('/')
    }
  }

  const handleSyncToCMS = async (data) => {
    try {
      // 調用 API 將資料同步到 CMS
      await api.post(`/events/${eventId}/registrations`, data)
    } catch (error) {
      console.error('Failed to sync to CMS:', error)
      throw error // 讓 Registration 組件知道同步失敗
    }
  }

  // 生成穩定的活動 ID 的輔助函數（與 EventRegistrationsPage 保持一致）
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

  // 將 event 的 scheduleItems 轉換為 Registration 組件需要的格式
  const convertScheduleToRegistrationFormat = () => {
    if (!event || !event.tiles) return []
    
    // 從 tiles 中找出 schedule 類型的 tile
    const scheduleTile = event.tiles.find(tile => tile.type === 'schedule' && tile.scheduleItems)
    if (!scheduleTile || !scheduleTile.scheduleItems) return []

    // 按日期分組
    const groupedByDate = scheduleTile.scheduleItems.reduce((acc, item, index) => {
      let dateKey = '未指定日期'
      let dateEn = '未指定日期'
      
      if (item.date) {
        const dateObj = new Date(item.date)
        if (!isNaN(dateObj.getTime())) {
          // 格式化為 yyyy-mm-dd
          const year = dateObj.getFullYear()
          const month = String(dateObj.getMonth() + 1).padStart(2, '0')
          const day = String(dateObj.getDate()).padStart(2, '0')
          dateKey = `${year}-${month}-${day}`
          dateEn = dateKey
        }
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          dateEn: dateEn,
          events: []
        }
      }
      
      const eventId = generateEventId(item, index)
      const timeLabel = item.timeLabel || (item.timeRange?.start && item.timeRange?.end 
        ? `${item.timeRange.start} - ${item.timeRange.end}`
        : item.timeRange?.start || '')
      
      acc[dateKey].events.push({
        id: eventId,
        title: item.descriptionZh || item.descriptionEn || 'Event',
        time: timeLabel,
        requiresRegistration: true // 可以根據實際需求調整
      })
      
      return acc
    }, {})

    return Object.values(groupedByDate)
  }

  if (loading) {
    return (
      <Box className="min-h-screen bg-white flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  if (error && !event) {
    return (
      <Box className="min-h-screen bg-white flex items-center justify-center p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  const schedule = convertScheduleToRegistrationFormat()
  const settings = {} // 可以從 event 或其他地方獲取 CMS 設置
  const formConfig = event?.registrationFormConfig || undefined

  return (
    <Box className="min-h-screen bg-white">
      <Registration
        onBack={handleBack}
        onComplete={handleComplete}
        settings={settings}
        syncToCMS={handleSyncToCMS}
        schedule={schedule}
        formConfig={formConfig}
      />
    </Box>
  )
}

export default RegistrationPage

