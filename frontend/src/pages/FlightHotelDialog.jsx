import GuideDialog from '../components/GuideDialog'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'

const flightHotelOptions = [
  { id: 'flight', titleZh: '墨爾本航班', titleEn: 'Melbourne Flight' },
  { id: 'hotel', titleZh: '墨爾本酒店', titleEn: 'Melbourne Hotel' },
]

const backgroundUrl =
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=60'

const FlightHotelDialog = ({ open, onClose }) => {
  return (
    <GuideDialog
      open={open}
      onClose={onClose}
      title="航班酒店"
      subtitle="Flight & Hotel"
      backgroundImage={backgroundUrl}
      options={flightHotelOptions}
      icon={FlightTakeoffIcon}
    />
  )
}

export default FlightHotelDialog


