// 直接導入組件
import NavBar from './NavBar'
import Banner from './Banner'
import GreetingCard from './GreetingCard'
import NavigationCard from './NavigationCard'
import ItineraryDialog from './ItineraryDialog'
import Footer from './Footer'
import GuideDialog from './GuideDialog'
import WeatherPage from '../pages/WeatherPage'
import MapPage from '../pages/MapPage'

// 組件映射表
const componentMap = {
  navbar: NavBar,
  banner: Banner,
  greetingCard: GreetingCard,
  navigationCard: NavigationCard,
  itineraryDialog: ItineraryDialog,
  footer: Footer,
  guideDialog: GuideDialog,
  weatherPage: WeatherPage,
  mapPage: MapPage,
}

const ComponentRenderer = ({ type, props = {}, ...restProps }) => {
  const Component = componentMap[type]

  if (!Component) {
    console.warn(`Component type "${type}" not found`)
    return null
  }

  return <Component {...props} {...restProps} />
}

export default ComponentRenderer

// 導出組件映射表，供外部使用
export { componentMap }

