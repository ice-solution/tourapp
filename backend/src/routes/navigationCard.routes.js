import express from 'express'
import { authenticate, requireAdminOrEditor } from '../middleware/auth.js'
import {
  getNavigationCards,
  createNavigationCard,
  updateNavigationCard,
  deleteNavigationCard,
  reorderNavigationCards,
} from '../controllers/navigationCard.controller.js'

const router = express.Router()

// 所有路由都需要認證，並且需要 admin 或 editor role
router.use(authenticate)
router.use(requireAdminOrEditor)

// 獲取 event 的所有 navigationCards
router.get('/event/:eventId', getNavigationCards)

// 創建 navigationCard
router.post('/event/:eventId', createNavigationCard)

// 更新 navigationCard
router.put('/event/:eventId/:cardId', updateNavigationCard)

// 刪除 navigationCard
router.delete('/event/:eventId/:cardId', deleteNavigationCard)

// 重新排序 navigationCards
router.post('/event/:eventId/reorder', reorderNavigationCards)

export default router


