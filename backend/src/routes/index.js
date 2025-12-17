import { Router } from 'express'
import authRoutes from './auth.routes.js'
import eventRoutes from './event.routes.js'
import weatherRoutes from './weather.routes.js'
import registrationRoutes from './registration.routes.js'
import adminUserRoutes from './adminUser.routes.js'
import navigationCardRoutes from './navigationCard.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/events', eventRoutes)
router.use('/events', weatherRoutes)
router.use('/events', registrationRoutes)
router.use('/admin/users', adminUserRoutes)
router.use('/navigation-cards', navigationCardRoutes)

export default router


