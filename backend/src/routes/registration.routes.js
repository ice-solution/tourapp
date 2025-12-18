import { Router } from 'express'
import {
  listRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getMyRegistration,
} from '../controllers/registration.controller.js'
import { authenticate, authenticateEventUser } from '../middleware/auth.js'

const router = Router()

// 公開端點：創建登記（不需要認證）
router.post('/:eventId/registrations', createRegistration)

// Event User 端點：獲取自己的登記資料
router.get('/:eventId/registrations/me', authenticateEventUser, getMyRegistration)

// 需要管理員認證的路由
router.use(authenticate)

router.get('/:eventId/registrations', listRegistrations)
router.put('/:eventId/registrations/:registrationId', updateRegistration)
router.delete('/:eventId/registrations/:registrationId', deleteRegistration)

export default router


