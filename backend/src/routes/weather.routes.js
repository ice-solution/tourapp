import { Router } from 'express'
import { getEventWeather } from '../controllers/weather.controller.js'

const router = Router()

// 公開端點：獲取 event 天氣資訊（不需要認證）
router.get('/:eventId/weather', getEventWeather)

export default router


