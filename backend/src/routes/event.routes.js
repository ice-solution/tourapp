import { Router } from 'express'
import {
  listEvents,
  createEvent,
  getEvent,
  updateEventMeta,
  updateTheme,
  updateBanners,
  createTile,
  updateTile,
  reorderTiles,
  deleteTile,
  updateWeatherPreference,
  updateRegistrationFormConfig,
} from '../controllers/event.controller.js'
import {
  listEventUsers,
  createEventUser,
  updateEventUser,
  resetEventUserPassword,
  deleteEventUser,
} from '../controllers/eventUser.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 公開端點：獲取 event 資訊（不需要認證）
router.get('/:eventId', getEvent)

// 需要認證的路由
router.use(authenticate)

router.route('/').get(listEvents).post(createEvent)
router.patch('/:eventId', updateEventMeta)
router.patch('/:eventId/theme', updateTheme)
router.put('/:eventId/banners', updateBanners)
router.post('/:eventId/tiles', createTile)
router.put('/:eventId/tiles/:tileId', updateTile)
router.patch('/:eventId/tiles/reorder', reorderTiles)
router.delete('/:eventId/tiles/:tileId', deleteTile)
router.put('/:eventId/weather', updateWeatherPreference)
router.put('/:eventId/registration-form-config', updateRegistrationFormConfig)
router.route('/:eventId/users').get(listEventUsers).post(createEventUser)
router
  .route('/:eventId/users/:userId')
  .put(updateEventUser)
  .patch(updateEventUser)
  .delete(deleteEventUser)
router.patch('/:eventId/users/:userId/reset-password', resetEventUserPassword)

export default router

