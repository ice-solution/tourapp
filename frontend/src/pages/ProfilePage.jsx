import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import { useEventUserAuth } from '../context/EventUserAuthContext.jsx'
import { api } from '../utils/api.js'

const ProfilePage = ({ event }) => {
  const { eventId } = useParams()
  const { user } = useEventUserAuth()
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.email) {
      loadRegistration()
    } else {
      setLoading(false)
    }
  }, [user, eventId])

  const loadRegistration = async () => {
    try {
      setLoading(true)
      setError('')
      // 使用新的端點獲取當前用戶的登記資料
      const response = await api.get(`/events/${eventId}/registrations/me`)
      if (response.success && response.data.registration) {
        setRegistration(response.data.registration)
      } else {
        setError('未找到您的登記資料')
      }
    } catch (error) {
      if (error.message?.includes('404') || error.message?.includes('未找到')) {
        setError('您尚未登記此活動')
      } else {
        setError(error.message || '載入登記資料失敗')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" className="py-6">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error && !registration) {
    return (
      <Container maxWidth="sm" className="py-6">
        <Alert severity="warning">{error}</Alert>
      </Container>
    )
  }

  if (!registration) {
    return (
      <Container maxWidth="sm" className="py-6">
        <Alert severity="info">您尚未登記此活動</Alert>
      </Container>
    )
  }

  const backgroundColor = event?.theme?.backgroundColor || '#c4d971'

  // 獲取活動選項的標籤
  const getFlightLabel = (flightId) => {
    const flights = event?.registrationFormConfig?.flights || []
    const flight = flights.find((f) => f.id === flightId)
    return flight ? `${flight.labelZh} (${flight.labelEn})` : flightId
  }

  const getHotelLabel = (hotelId) => {
    const hotels = event?.registrationFormConfig?.hotels || []
    const hotel = hotels.find((h) => h.id === hotelId)
    return hotel ? `${hotel.labelZh} (${hotel.labelEn})` : hotelId
  }

  const getRoomTypeLabel = (roomTypeId) => {
    const roomTypes = event?.registrationFormConfig?.roomTypes || []
    const roomType = roomTypes.find((r) => r.id === roomTypeId)
    return roomType ? `${roomType.labelZh} (${roomType.labelEn})` : roomTypeId
  }

  const getDietaryLabel = (dietaryId) => {
    const dietaryOptions = event?.registrationFormConfig?.dietaryOptions || []
    const dietary = dietaryOptions.find((d) => d.id === dietaryId)
    return dietary ? `${dietary.labelZh} (${dietary.labelEn})` : dietaryId
  }

  // 獲取選中的活動標籤
  const getSelectedEvents = () => {
    if (!registration.selectedEventIds || registration.selectedEventIds.length === 0) {
      return []
    }
    const events = event?.registrationFormConfig?.events || []
    return registration.selectedEventIds
      .map((id) => {
        const eventItem = events.find((e) => e.id === id)
        return eventItem
          ? `${eventItem.labelZh || eventItem.labelEn} (${eventItem.labelEn || eventItem.labelZh})`
          : `活動 ID: ${id}`
      })
      .filter(Boolean)
  }

  return (
    <Container maxWidth="sm" className="py-6">
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#3a2c50' }}>
        個人檔案 / Profile
      </Typography>

      <Stack spacing={3}>
        {/* 個人資料 */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: '#c9503d' }}>
            個人資料 / Personal Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                姓名 (英文) / Name (English)
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {registration.nameEn || '-'}
              </Typography>
            </Box>
            {registration.nameZh && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  姓名 (中文) / Name (Chinese)
                </Typography>
                <Typography variant="body1">{registration.nameZh}</Typography>
              </Box>
            )}
            <Divider />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                電郵 / Email
              </Typography>
              <Typography variant="body1">{registration.email || '-'}</Typography>
            </Box>
            {registration.mobile && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  手機號碼 / Mobile
                </Typography>
                <Typography variant="body1">{registration.mobile}</Typography>
              </Box>
            )}
            {registration.dob && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  出生日期 / Date of Birth
                </Typography>
                <Typography variant="body1">
                  {new Date(registration.dob).toLocaleDateString('zh-TW')}
                </Typography>
              </Box>
            )}
            {registration.passportNumber && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  護照號碼 / Passport Number
                </Typography>
                <Typography variant="body1">{registration.passportNumber}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* 航班與酒店 */}
        {(registration.flight || registration.hotel || registration.roomType) && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: '#c9503d' }}>
              航班與酒店 / Flight & Hotel
            </Typography>
            <Stack spacing={2}>
              {registration.flight && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    航班 / Flight
                  </Typography>
                  <Typography variant="body1">{getFlightLabel(registration.flight)}</Typography>
                </Box>
              )}
              {registration.hotel && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    酒店 / Hotel
                  </Typography>
                  <Typography variant="body1">{getHotelLabel(registration.hotel)}</Typography>
                </Box>
              )}
              {registration.roomType && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    房間類型 / Room Type
                  </Typography>
                  <Typography variant="body1">{getRoomTypeLabel(registration.roomType)}</Typography>
                </Box>
              )}
              {registration.roommate && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    室友 / Roommate
                  </Typography>
                  <Typography variant="body1">{registration.roommate}</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        )}

        {/* 選中的活動 */}
        {registration.selectedEventIds && registration.selectedEventIds.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: '#c9503d' }}>
              選中的活動 / Selected Events
            </Typography>
            <Stack spacing={1}>
              {getSelectedEvents().map((eventLabel, index) => (
                <Chip
                  key={index}
                  label={eventLabel}
                  variant="outlined"
                  color="primary"
                  sx={{ justifyContent: 'flex-start', height: 'auto', py: 1 }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* 特殊需求 */}
        {(registration.dietaryRestrictions || registration.specialRemarks) && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: '#c9503d' }}>
              特殊需求 / Special Requirements
            </Typography>
            <Stack spacing={2}>
              {registration.dietaryRestrictions && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    飲食需求 / Dietary Requirements
                  </Typography>
                  <Typography variant="body1">
                    {getDietaryLabel(registration.dietaryRestrictions)}
                  </Typography>
                </Box>
              )}
              {registration.specialRemarks && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    特殊備註 / Special Remarks
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {registration.specialRemarks}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        )}

        {/* 登記狀態 */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: '#c9503d' }}>
            登記狀態 / Registration Status
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={
                registration.status === 'pending'
                  ? '待審核 / Pending'
                  : registration.status === 'approved'
                  ? '已批准 / Approved'
                  : registration.status === 'rejected'
                  ? '已拒絕 / Rejected'
                  : '未知 / Unknown'
              }
              color={
                registration.status === 'approved'
                  ? 'success'
                  : registration.status === 'rejected'
                  ? 'error'
                  : 'default'
              }
            />
            {registration.createdAt && (
              <Typography variant="caption" color="text.secondary">
                登記時間 / Registered: {new Date(registration.createdAt).toLocaleString('zh-TW')}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default ProfilePage

