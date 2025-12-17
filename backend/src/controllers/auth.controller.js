import { AdminUser } from '../models/AdminUser.js'
import { comparePassword } from '../utils/password.js'
import { signToken } from '../utils/token.js'
import { failure, success } from '../utils/apiResponse.js'

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return failure(res, '請輸入電郵與密碼', 422)
  }

  const admin = await AdminUser.findOne({ email: email.toLowerCase() })
  if (!admin) {
    return failure(res, '帳號或密碼錯誤', 401)
  }

  const isValid = await comparePassword(password, admin.passwordHash)
  if (!isValid) {
    return failure(res, '帳號或密碼錯誤', 401)
  }

  const token = signToken({ id: admin.id })

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 12,
  })

  return success(res, { admin })
}

export const logout = async (_req, res) => {
  res.clearCookie('accessToken')
  return success(res, { message: '登出成功' })
}

export const currentAdmin = async (req, res) => {
  return success(res, { admin: req.admin })
}


