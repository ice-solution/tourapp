import GuideDialog from '../components/GuideDialog'
import MenuBookIcon from '@mui/icons-material/MenuBook'

const guideOptions = [
  { id: 'shopping', titleZh: '樂在購物', titleEn: 'Shopping At Melbourne' },
  { id: 'tasting', titleZh: '食在墨爾本', titleEn: 'Taste Of Melbourne' },
  { id: 'exploring', titleZh: '探索墨爾本', titleEn: 'Exploring Melbourne' },
]

const backgroundUrl =
  'https://images.unsplash.com/photo-1433360405326-e50f909805b3?auto=format&fit=crop&w=1200&q=60'

const TravelGuideDialog = ({ open, onClose }) => {
  return (
    <GuideDialog
      open={open}
      onClose={onClose}
      title="漫遊指南"
      subtitle="Guide"
      backgroundImage={backgroundUrl}
      options={guideOptions}
      icon={MenuBookIcon}
    />
  )
}

export default TravelGuideDialog

