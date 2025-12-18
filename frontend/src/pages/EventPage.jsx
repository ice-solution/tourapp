import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import EventNoteIcon from '@mui/icons-material/EventNote'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'
import LanguageIcon from '@mui/icons-material/Language'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import {
  NavBar,
  Banner,
  GreetingCard,
  NavigationCard,
  ItineraryDialog,
  Footer,
} from '../components'
import InformationDialog from '../components/InformationDialog'
import TravelGuideDialog from './TravelGuideDialog'
import DinnerDialog from './DinnerDialog'
import FlightHotelDialog from './FlightHotelDialog'
import WeatherPage from './WeatherPage'
import MapPage from './MapPage'
import ProfilePage from './ProfilePage'
import { api } from '../utils/api.js'

const footerActions = [
  { id: 'home', labelZh: '主頁', labelEn: 'Main Page', icon: HomeOutlinedIcon },
  { id: 'profile', labelZh: '個人檔案', labelEn: 'Profile', icon: PersonOutlineIcon },
  { id: 'weather', labelZh: '天氣', labelEn: 'Weather', icon: CloudOutlinedIcon },
  { id: 'map', labelZh: '實時地圖', labelEn: 'Map', icon: MapOutlinedIcon },
]

const EventPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isItineraryOpen, setIsItineraryOpen] = useState(false)
  const [isDinnerOpen, setIsDinnerOpen] = useState(false)
  const [isTravelOpen, setIsTravelOpen] = useState(false)
  const [isFlightHotelOpen, setIsFlightHotelOpen] = useState(false)
  const [isInformationOpen, setIsInformationOpen] = useState(false)
  const [currentInformationTile, setCurrentInformationTile] = useState(null)
  const [bottomValue, setBottomValue] = useState(0)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event) {
        setEvent(response.data.event)
        if (!response.data.event.isPublished) {
          setError('此活動尚未發布')
        }
      }
    } catch (error) {
      setError(error.message || '載入活動失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCardAction = (card) => {
    if (card.type === 'registration') {
      navigate(`/${eventId}/registration`)
      return
    }

    if (card.type === 'information') {
      setCurrentInformationTile(card)
      setIsInformationOpen(true)
      return
    }

    if (card.type === 'dialog') {
      // 只有 schedule 類型才打開 itinerary
      if (card.scheduleItems) {
        setIsItineraryOpen(true)
      }
      return
    }

    if (card.type === 'dinner-dialog') {
      setIsDinnerOpen(true)
      return
    }

    if (card.type === 'travel-dialog') {
      setIsTravelOpen(true)
      return
    }

    if (card.type === 'flight-hotel-dialog') {
      setIsFlightHotelOpen(true)
      return
    }

    if (card.type === 'link' && card.href) {
      window.open(card.href, '_blank', 'noopener,noreferrer')
    }
  }

  const navigationCards = useMemo(() => {
    if (!event || !event.tiles) return []
    return event.tiles
      .filter((tile) => tile.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((tile) => {
        const iconMap = {
          assignment: AssignmentTurnedInIcon,
          event: EventNoteIcon,
          travel: TravelExploreIcon,
          flight: FlightTakeoffIcon,
          info: InfoOutlinedIcon,
          trophy: EmojiEventsIcon,
          dinner: DinnerDiningIcon,
          language: LanguageIcon,
          survey: QuestionAnswerIcon,
          gallery: PhotoLibraryIcon,
          external: OpenInNewIcon,
        }
        return {
          id: tile._id,
          primary: tile.titleZh,
          secondary: tile.titleEn,
          icon: iconMap[tile.iconKey] || EventNoteIcon,
          type: tile.type === 'schedule' ? 'dialog' : tile.type === 'external' ? 'link' : tile.type === 'registration' ? 'registration' : tile.type === 'information' ? 'information' : 'dialog',
          href: tile.type === 'external' ? tile.externalUrl : undefined,
          scheduleItems: tile.type === 'schedule' ? tile.scheduleItems : undefined,
          informationData: tile.type === 'information' ? tile.informationData : undefined,
        }
      })
  }, [event])

  const footerLabel = useMemo(
    () => `${footerActions[bottomValue].labelZh} ${footerActions[bottomValue].labelEn}`,
    [bottomValue],
  )

  const isProfilePage = bottomValue === 1
  const isWeatherPage = bottomValue === 2
  const isMapPage = bottomValue === 3

  if (loading) {
    return (
      <Box className="min-h-screen bg-[#c4d971] flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  if (error && !event) {
    return (
      <Box className="min-h-screen bg-[#c4d971] flex items-center justify-center p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!event) {
    return (
      <Box className="min-h-screen bg-[#c4d971] flex items-center justify-center p-4">
        <Alert severity="warning">活動不存在</Alert>
      </Box>
    )
  }

  const backgroundColor = event.theme?.backgroundColor || '#c4d971'

  return (
    <Box className="min-h-screen pb-24" sx={{ backgroundColor }}>
      <NavBar />
      {error && (
        <Container maxWidth="sm" className="pt-4">
          <Alert severity="warning">{error}</Alert>
        </Container>
      )}

      {isMapPage ? (
        <MapPage event={event} />
      ) : isWeatherPage ? (
        <WeatherPage event={event} />
      ) : isProfilePage ? (
        <ProfilePage event={event} />
      ) : (
        <Container maxWidth="sm" className="space-y-6 py-6">
          {event.banners && event.banners.length > 0 && (
            <Banner
              title={event.banners[0].title || event.title}
              subtitle={event.title}
              description={event.banners[0].description || event.description}
              imageUrl={event.banners[0].imageUrl}
              textColor={event.banners[0].imageUrl ? '#ffffff' : '#3a2c50'}
            />
          )}
          <GreetingCard greeting="Good Afternoon 午安" userName="User" />
          <Box className="grid grid-cols-3 gap-3">
            {navigationCards.map((card) => (
              <Box key={card.id} className="flex">
                <NavigationCard card={card} onClick={handleCardAction} />
              </Box>
            ))}
          </Box>
        </Container>
      )}

      <Footer
        actions={footerActions}
        value={bottomValue}
        onChange={(_event, newValue) => setBottomValue(newValue)}
      />

      {isItineraryOpen && (() => {
        const itineraryCard = navigationCards.find((c) => c.type === 'dialog' && c.scheduleItems)
        if (!itineraryCard || !itineraryCard.scheduleItems) {
          return (
            <ItineraryDialog
              open={isItineraryOpen}
              onClose={() => setIsItineraryOpen(false)}
              tabs={[]}
            />
          )
        }
        
        // 將 scheduleItems 按日期分組
        const groupedByDate = itineraryCard.scheduleItems.reduce((acc, item) => {
          let dateKey = '未指定日期'
          if (item.date) {
            const dateObj = new Date(item.date)
            if (!isNaN(dateObj.getTime())) {
              // 格式化為 yyyy-mm-dd
              const year = dateObj.getFullYear()
              const month = String(dateObj.getMonth() + 1).padStart(2, '0')
              const day = String(dateObj.getDate()).padStart(2, '0')
              dateKey = `${year}-${month}-${day}`
            }
          }
          if (!acc[dateKey]) acc[dateKey] = []
          acc[dateKey].push(item)
          return acc
        }, {})
        
        const tabs = Object.entries(groupedByDate).map(([date, items]) => ({
          label: date,
          sections: items.map((item) => ({
            title: item.timeLabel || (item.timeRange?.start && item.timeRange?.end 
              ? `${item.timeRange.start} - ${item.timeRange.end}`
              : item.timeRange?.start || ''),
            details: [item.descriptionZh, item.descriptionEn].filter(Boolean),
          })),
        }))
        
        return (
          <ItineraryDialog
            open={isItineraryOpen}
            onClose={() => setIsItineraryOpen(false)}
            tabs={tabs}
          />
        )
      })()}
      <DinnerDialog open={isDinnerOpen} onClose={() => setIsDinnerOpen(false)} />
      <TravelGuideDialog open={isTravelOpen} onClose={() => setIsTravelOpen(false)} />
      <FlightHotelDialog open={isFlightHotelOpen} onClose={() => setIsFlightHotelOpen(false)} />
      <InformationDialog
        open={isInformationOpen}
        onClose={() => {
          setIsInformationOpen(false)
          setCurrentInformationTile(null)
        }}
        tile={currentInformationTile}
      />

      <Box className="sr-only" aria-live="polite">
        {footerLabel}
      </Box>
    </Box>
  )
}

export default EventPage

