import { useMemo, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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

import {
  NavBar,
  Banner,
  GreetingCard,
  NavigationCard,
  ItineraryDialog,
  Footer,
} from '../components'
import TravelGuideDialog from './TravelGuideDialog'
import DinnerDialog from './DinnerDialog'
import FlightHotelDialog from './FlightHotelDialog'
import WeatherPage from './WeatherPage'
import MapPage from './MapPage'

const itineraryTabs = [
  {
    label: 'OCT 27 (MON)',
    sections: [
      {
        title: '早上 Morning',
        details: [
          '乘搭飛機前往福岡',
          'Depart from Hong Kong to Fukuoka',
        ],
      },
      {
        title: '17:00',
        details: ['辦理酒店入住手續', 'Hotel Check-in'],
      },
      {
        title: '下午 Afternoon',
        details: [
          '自行安排交通前往自訂酒店及辦理入住手續',
          'Self Arrange Transportation to Hotel and Check-in on Own Arrangement',
        ],
      },
      {
        title: '晚上 Evening',
        details: ['自行安排晚餐', 'Dinner on Own Arrangement'],
      },
    ],
  },
  {
    label: 'OCT 28 (TUE)',
    sections: [
      {
        title: '更新中',
        details: ['完整行程將稍後提供', 'Stay tuned for detailed schedule'],
      },
    ],
  },
  {
    label: 'OCT 29 (WED)',
    sections: [
      {
        title: '更新中',
        details: ['完整行程將稍後提供', 'Stay tuned for detailed schedule'],
      },
    ],
  },
]

const navigationCards = [
  {
    id: 'registration',
    primary: '登記',
    secondary: 'Registration',
    icon: AssignmentTurnedInIcon,
    type: 'link',
    href: '#registration',
  },
  {
    id: 'itinerary',
    primary: '會議行程',
    secondary: 'Itinerary',
    icon: EventNoteIcon,
    type: 'dialog',
  },
  {
    id: 'travel',
    primary: '旅遊熱點',
    secondary: 'Travel Attractions',
    icon: TravelExploreIcon,
    type: 'travel-dialog',
  },
  {
    id: 'flight-hotel',
    primary: '航班酒店',
    secondary: 'Flight & Hotel',
    icon: FlightTakeoffIcon,
    type: 'flight-hotel-dialog',
  },
  {
    id: 'conference-info',
    primary: '會議資訊',
    secondary: 'Conference Information',
    icon: InfoOutlinedIcon,
    type: 'link',
    href: '#conference-information',
  },
  {
    id: 'executives',
    primary: '出席之管理層及合資格精英',
    secondary: 'The Executives & Qualifiers',
    icon: EmojiEventsIcon,
    type: 'link',
    href: '#executives',
  },
  {
    id: 'gala-dinner',
    primary: '嘉許晚宴',
    secondary: 'Gala Dinner',
    icon: DinnerDiningIcon,
    type: 'dinner-dialog',
  },
  {
    id: 'visit-japan',
    primary: 'Visit Japan Web',
    secondary: '入境資料',
    icon: LanguageIcon,
    type: 'link',
    href: '#visit-japan',
  },
  {
    id: 'survey',
    primary: '問卷',
    secondary: 'Survey',
    icon: QuestionAnswerIcon,
    type: 'link',
    href: '#survey',
  },
  {
    id: 'gallery',
    primary: '相片集',
    secondary: 'Photo Gallery',
    icon: PhotoLibraryIcon,
    type: 'link',
    href: '#gallery',
  },
]

const footerActions = [
  { id: 'home', labelZh: '主頁', labelEn: 'Main Page', icon: HomeOutlinedIcon },
  { id: 'profile', labelZh: '個人檔案', labelEn: 'Profile', icon: PersonOutlineIcon },
  { id: 'weather', labelZh: '天氣', labelEn: 'Weather', icon: CloudOutlinedIcon },
  { id: 'map', labelZh: '實時地圖', labelEn: 'Map', icon: MapOutlinedIcon },
]

const HomePage = () => {
  const [isItineraryOpen, setIsItineraryOpen] = useState(false)
  const [isDinnerOpen, setIsDinnerOpen] = useState(false)
  const [isTravelOpen, setIsTravelOpen] = useState(false)
  const [isFlightHotelOpen, setIsFlightHotelOpen] = useState(false)
  const [bottomValue, setBottomValue] = useState(0)

  const handleCardAction = (card) => {
    if (card.type === 'dialog') {
      setIsItineraryOpen(true)
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

  const footerLabel = useMemo(
    () => `${footerActions[bottomValue].labelZh} ${footerActions[bottomValue].labelEn}`,
    [bottomValue],
  )

  const isWeatherPage = bottomValue === 2
  const isMapPage = bottomValue === 3

  return (
    <Box className="min-h-screen bg-[#c4d971] pb-24">
      <NavBar />

      {isMapPage ? (
        <MapPage />
      ) : isWeatherPage ? (
        <WeatherPage />
      ) : (
        <Container maxWidth="sm" className="space-y-6 py-6">
          <Banner />
          <GreetingCard />

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

      <ItineraryDialog
        open={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        tabs={itineraryTabs}
      />
      <DinnerDialog open={isDinnerOpen} onClose={() => setIsDinnerOpen(false)} />
      <TravelGuideDialog open={isTravelOpen} onClose={() => setIsTravelOpen(false)} />
      <FlightHotelDialog open={isFlightHotelOpen} onClose={() => setIsFlightHotelOpen(false)} />

      <Box className="sr-only" aria-live="polite">
        {footerLabel}
      </Box>
    </Box>
  )
}

export default HomePage
