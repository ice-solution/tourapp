import GuideDialog from '../components/GuideDialog'
import RestaurantIcon from '@mui/icons-material/Restaurant'

const dinnerOptions = [
  {
    id: 'welcome',
    titleZh: '歡迎晚宴',
    titleEn: 'Welcome Dinner',
  },
  {
    id: 'celebration',
    titleZh: '慶祝晚宴',
    titleEn: 'Celebration Dinner',
  },
]

const backgroundUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'

const DinnerDialog = ({ open, onClose }) => {
  return (
    <GuideDialog
      open={open}
      onClose={onClose}
      title="晚宴資料"
      subtitle="Dinner"
      backgroundImage={backgroundUrl}
      options={dinnerOptions}
      icon={RestaurantIcon}
    />
  )
}

export default DinnerDialog


