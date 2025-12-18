import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../../utils/api.js'

// 修復 Leaflet 預設圖標問題
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 地圖點擊處理組件
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const MapPinsSettingsPage = () => {
  const { eventId } = useParams()
  const [mapPins, setMapPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPin, setEditingPin] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    lat: '',
    lng: '',
    description: '',
  })

  useEffect(() => {
    loadMapPins()
  }, [eventId])

  const loadMapPins = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}/map-pins`)
      if (response.success) {
        setMapPins(response.data.mapPins || [])
      } else {
        setError('載入地圖 Pin 失敗')
      }
    } catch (error) {
      setError(error.message || '載入地圖 Pin 失敗')
      setMapPins([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingPin(null)
    setFormData({
      name: '',
      nameEn: '',
      lat: '',
      lng: '',
      description: '',
    })
    setDialogOpen(true)
  }

  const handleEditClick = (pin) => {
    setEditingPin(pin)
    setFormData({
      name: pin.name || '',
      nameEn: pin.nameEn || '',
      lat: pin.lat?.toString() || '',
      lng: pin.lng?.toString() || '',
      description: pin.description || '',
    })
    setDialogOpen(true)
  }

  const handleMapClick = (latlng) => {
    if (dialogOpen) {
      setFormData((prev) => ({
        ...prev,
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6),
      }))
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.nameEn || !formData.lat || !formData.lng) {
      setError('請填寫所有必填欄位')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const pinData = {
        name: formData.name,
        nameEn: formData.nameEn,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        description: formData.description || '',
      }

      if (editingPin) {
        // 更新
        const response = await api.put(`/events/${eventId}/map-pins/${editingPin._id}`, pinData)
        if (response.success) {
          setMessage('已更新地圖 Pin')
          await loadMapPins()
          setDialogOpen(false)
        } else {
          setError('更新失敗')
        }
      } else {
        // 創建
        const response = await api.post(`/events/${eventId}/map-pins`, pinData)
        if (response.success) {
          setMessage('已新增地圖 Pin')
          await loadMapPins()
          setDialogOpen(false)
        } else {
          setError('新增失敗')
        }
      }
    } catch (error) {
      setError(error.message || '操作失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pinId) => {
    if (!window.confirm('確定要刪除此地圖 Pin 嗎？')) {
      return
    }

    try {
      setError('')
      const response = await api.delete(`/events/${eventId}/map-pins/${pinId}`)
      if (response.success) {
        setMessage('已刪除地圖 Pin')
        await loadMapPins()
      } else {
        setError('刪除失敗')
      }
    } catch (error) {
      setError(error.message || '刪除失敗')
    }
  }

  const defaultCenter = mapPins.length > 0 
    ? [mapPins[0].lat, mapPins[0].lng]
    : [-37.8136, 144.9631] // 默認墨爾本

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          地圖 Pin 管理
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          地圖 Pin 管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddClick}
          sx={{ bgcolor: '#c9503d', '&:hover': { bgcolor: '#a83d2e' } }}
        >
          新增 Pin
        </Button>
      </Stack>

      {message && (
        <Alert severity="success" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} className="rounded-lg p-4">
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            地圖 Pin 列表 ({mapPins.length})
          </Typography>
          {mapPins.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              尚未建立任何地圖 Pin，點擊「新增 Pin」開始建立
            </Typography>
          ) : (
            <Stack spacing={2}>
              {mapPins.map((pin) => (
                <Paper
                  key={pin._id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DragIndicatorIcon sx={{ color: '#999' }} />
                    <LocationOnIcon sx={{ color: '#c9503d' }} />
                    <Stack spacing={0.5} flex={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {pin.name} ({pin.nameEn})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        座標: {pin.lat}, {pin.lng}
                      </Typography>
                      {pin.description && (
                        <Typography variant="body2" color="text.secondary">
                          {pin.description}
                        </Typography>
                      )}
                    </Stack>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(pin)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(pin._id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* 編輯/新增對話框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPin ? '編輯地圖 Pin' : '新增地圖 Pin'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="名稱（中文）"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="名稱（英文）"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="緯度 (Latitude)"
                type="number"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                fullWidth
                required
                inputProps={{ step: 'any' }}
                helperText="點擊地圖或手動輸入座標"
              />
              <TextField
                label="經度 (Longitude)"
                type="number"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                fullWidth
                required
                inputProps={{ step: 'any' }}
                helperText="點擊地圖或手動輸入座標"
              />
            </Stack>
            <TextField
              label="描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Box sx={{ height: '400px', borderRadius: 2, overflow: 'hidden' }}>
              <MapContainer
                center={formData.lat && formData.lng 
                  ? [parseFloat(formData.lat), parseFloat(formData.lng)]
                  : defaultCenter
                }
                zoom={formData.lat && formData.lng ? 15 : 12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {formData.lat && formData.lng && (
                  <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                )}
              </MapContainer>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name || !formData.nameEn || !formData.lat || !formData.lng}
            sx={{ bgcolor: '#c9503d', '&:hover': { bgcolor: '#a83d2e' } }}
          >
            {saving ? <CircularProgress size={20} /> : '儲存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default MapPinsSettingsPage

