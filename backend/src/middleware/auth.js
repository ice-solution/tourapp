import { verifyToken } from '../utils/token.js'
import { failure } from '../utils/apiResponse.js'
import { AdminUser } from '../models/AdminUser.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

    if (!token) {
      return failure(res, 'Unauthorized', 401)
    }

    const decoded = verifyToken(token)
    const admin = await AdminUser.findById(decoded.id)

    if (!admin) {
      return failure(res, 'Unauthorized', 401)
    }

    req.admin = admin
    next()
  } catch (error) {
    return failure(res, 'Unauthorized', 401)
  }
}

// 檢查是否為 admin role
export const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return failure(res, 'Unauthorized', 401)
  }

  if (req.admin.role !== 'admin') {
    return failure(res, 'Forbidden: Admin access required', 403)
  }

  next()
}

// 檢查是否為 admin 或 editor
export const requireAdminOrEditor = (req, res, next) => {
  if (!req.admin) {
    return failure(res, 'Unauthorized', 401)
  }

  if (!['admin', 'editor'].includes(req.admin.role)) {
    return failure(res, 'Forbidden: Admin or Editor access required', 403)
  }

  next()
}


