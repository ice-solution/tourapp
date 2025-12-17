import { AdminUser } from '../models/AdminUser.js'
import { hashPassword } from '../utils/password.js'
import { success, failure } from '../utils/apiResponse.js'

// 創建用戶（只有 admin 可以）
export const createUser = async (req, res) => {
  try {
    const { email, name, password, role = 'editor' } = req.body

    if (!email || !name || !password) {
      return failure(res, '請提供 email, name 和 password', 422)
    }

    // 檢查 email 是否已存在
    const existingUser = await AdminUser.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return failure(res, '此 email 已被使用', 409)
    }

    // 只有 admin 可以創建 admin 用戶
    if (role === 'admin' && req.admin.role !== 'admin') {
      return failure(res, '只有 admin 可以創建 admin 用戶', 403)
    }

    const passwordHash = await hashPassword(password)

    const newUser = new AdminUser({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
    })

    await newUser.save()

    return success(res, { user: newUser }, 201)
  } catch (error) {
    return failure(res, error.message || '創建用戶失敗', 500)
  }
}

// 獲取所有用戶（只有 admin）
export const getAllUsers = async (req, res) => {
  try {
    const users = await AdminUser.find({}).select('-passwordHash').sort({ createdAt: -1 })
    return success(res, { users })
  } catch (error) {
    return failure(res, error.message || '獲取用戶列表失敗', 500)
  }
}

// 更新用戶
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, role, password } = req.body

    const user = await AdminUser.findById(id)
    if (!user) {
      return failure(res, '用戶不存在', 404)
    }

    // 只有 admin 可以修改 role
    if (role && role !== user.role && req.admin.role !== 'admin') {
      return failure(res, '只有 admin 可以修改用戶 role', 403)
    }

    // 只有 admin 可以將其他用戶設為 admin
    if (role === 'admin' && req.admin.role !== 'admin') {
      return failure(res, '只有 admin 可以創建 admin 用戶', 403)
    }

    if (name) user.name = name
    if (role && req.admin.role === 'admin') user.role = role
    if (password) {
      user.passwordHash = await hashPassword(password)
    }

    await user.save()

    return success(res, { user })
  } catch (error) {
    return failure(res, error.message || '更新用戶失敗', 500)
  }
}

// 刪除用戶
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // 不能刪除自己
    if (id === req.admin._id.toString()) {
      return failure(res, '不能刪除自己的帳戶', 400)
    }

    const user = await AdminUser.findByIdAndDelete(id)
    if (!user) {
      return failure(res, '用戶不存在', 404)
    }

    return success(res, { message: '用戶已刪除' })
  } catch (error) {
    return failure(res, error.message || '刪除用戶失敗', 500)
  }
}


