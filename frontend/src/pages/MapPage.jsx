import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { api } from '../utils/api.js'

// 修復 Leaflet 預設圖標問題
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})


// 地圖控制組件，用於移動地圖視圖
const MapController = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, {
        animate: true,
        duration: 0.5,
      })
    }
  }, [center, zoom, map])
  
  return null
}


const MapPage = () => {
  const { eventId } = useParams()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([-37.8136, 144.9631]) // 默認墨爾本

  useEffect(() => {
    loadMapPins()
  }, [eventId])

  const loadMapPins = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/events/${eventId}/map-pins`)
      if (response.success && response.data.mapPins) {
        const pins = response.data.mapPins
        setLocations(pins)
        if (pins.length > 0) {
          setSelectedLocation(pins[0])
          // 計算所有 pins 的中心點
          const avgLat = pins.reduce((sum, pin) => sum + pin.lat, 0) / pins.length
          const avgLng = pins.reduce((sum, pin) => sum + pin.lng, 0) / pins.length
          setMapCenter([avgLat, avgLng])
        }
      } else {
        setLocations([])
      }
    } catch (error) {
      console.error('Failed to load map pins:', error)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    setMapCenter([location.lat, location.lng])
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 80px)' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (locations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 80px)' }}>
        <Typography variant="h6" color="text.secondary">
          暫無地圖標記
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 80px)', overflow: 'hidden' }}>
      {/* 上半部分：地圖 */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 0, minHeight: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={locations.length > 1 ? 12 : 15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          key={locations.length} // 當 locations 變化時重新渲染地圖
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location) => (
            <Marker
              key={location._id || location.id}
              position={[location.lat, location.lng]}
              eventHandlers={{
                click: () => handleLocationClick(location),
              }}
            >
              <Popup>
                <Typography variant="subtitle2" fontWeight={600}>
                  {location.name}
                </Typography>
                <Typography variant="body2">{location.nameEn}</Typography>
                {location.description && (
                  <Typography variant="caption" color="text.secondary">
                    {location.description}
                  </Typography>
                )}
              </Popup>
            </Marker>
          ))}
          <MapController center={mapCenter} zoom={locations.length > 1 ? 12 : 15} />
        </MapContainer>
      </Box>

      {/* 下半部分：地點列表 */}
      <Box
        sx={{
          height: '50%',
          backgroundColor: 'white',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            地點列表
          </Typography>
          <Typography variant="body2" color="text.secondary">
            點擊地點查看地圖位置
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2 }}>
          <Stack spacing={1}>
            {locations.map((location, index) => (
              <Box key={location._id || location.id || index}>
                <ButtonBase
                  onClick={() => handleLocationClick(location)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: '16px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      p: 2.5,
                      borderRadius: '16px',
                      backgroundColor: (selectedLocation?._id === location._id) || (selectedLocation?.id === location.id) ? '#f5f5f5' : 'white',
                      border: (selectedLocation?._id === location._id) || (selectedLocation?.id === location.id) ? '2px solid #c9503d' : '1px solid rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: selectedLocation?._id === location._id || selectedLocation?.id === location.id ? '#c9503d' : '#f0f0f0',
                          color: selectedLocation?._id === location._id || selectedLocation?.id === location.id ? 'white' : '#666',
                        }}
                      >
                        <LocationOnIcon />
                      </Box>
                      <Stack spacing={0.5} flex={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {location.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.nameEn}
                        </Typography>
                        {location.description && (
                          <Typography variant="caption" color="text.secondary">
                            {location.description}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                </ButtonBase>
                {index < locations.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default MapPage

