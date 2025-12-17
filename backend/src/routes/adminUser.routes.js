import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminUser.controller.js'

const router = express.Router()

// 所有路由都需要認證
router.use(authenticate)

// 創建用戶（只有 admin）
router.post('/', requireAdmin, createUser)

// 獲取所有用戶（只有 admin）
router.get('/', requireAdmin, getAllUsers)

// 更新用戶
router.put('/:id', requireAdmin, updateUser)

// 刪除用戶（只有 admin）
router.delete('/:id', requireAdmin, deleteUser)

export default router


