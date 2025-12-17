import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// 修復 Leaflet 預設圖標問題
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 地點數據
const locations = [
  {
    id: 1,
    name: '墨爾本中央商務區',
    nameEn: 'Melbourne CBD',
    lat: -37.8136,
    lng: 144.9631,
    description: '墨爾本市中心商業區',
  },
  {
    id: 2,
    name: '聯邦廣場',
    nameEn: 'Federation Square',
    lat: -37.8183,
    lng: 144.9631,
    description: '文化與藝術中心',
  },
  {
    id: 3,
    name: '皇家植物園',
    nameEn: 'Royal Botanic Gardens',
    lat: -37.8304,
    lng: 144.9796,
    description: '美麗的植物園',
  },
  {
    id: 4,
    name: '聖基爾達海灘',
    nameEn: 'St Kilda Beach',
    lat: -37.8676,
    lng: 144.978,
    description: '熱門海灘景點',
  },
  {
    id: 5,
    name: '墨爾本博物館',
    nameEn: 'Melbourne Museum',
    lat: -37.8033,
    lng: 144.9717,
    description: '歷史與文化博物館',
  },
]

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
  const [selectedLocation, setSelectedLocation] = useState(locations[0])
  const [mapCenter, setMapCenter] = useState([locations[0].lat, locations[0].lng])

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    setMapCenter([location.lat, location.lng])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 80px)', overflow: 'hidden' }}>
      {/* 上半部分：地圖 */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 0, minHeight: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location) => (
            <Marker
              key={location.id}
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
              </Popup>
            </Marker>
          ))}
          <MapController center={mapCenter} zoom={15} />
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
              <Box key={location.id}>
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
                      backgroundColor: selectedLocation.id === location.id ? '#f5f5f5' : 'white',
                      border: selectedLocation.id === location.id ? '2px solid #c9503d' : '1px solid rgba(0, 0, 0, 0.06)',
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
                          backgroundColor: selectedLocation.id === location.id ? '#c9503d' : '#f0f0f0',
                          color: selectedLocation.id === location.id ? 'white' : '#666',
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
                        <Typography variant="caption" color="text.secondary">
                          {location.description}
                        </Typography>
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

