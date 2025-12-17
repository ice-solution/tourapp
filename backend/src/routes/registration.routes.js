import { Router } from 'express'
import {
  listRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from '../controllers/registration.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 公開端點：創建登記（不需要認證）
router.post('/:eventId/registrations', createRegistration)

// 需要認證的路由
router.use(authenticate)

router.get('/:eventId/registrations', listRegistrations)
router.put('/:eventId/registrations/:registrationId', updateRegistration)
router.delete('/:eventId/registrations/:registrationId', deleteRegistration)

export default router


