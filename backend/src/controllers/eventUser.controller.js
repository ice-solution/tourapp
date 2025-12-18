import mongoose from 'mongoose'
import { Event } from '../models/Event.js'
import { EventUser } from '../models/EventUser.js'
import { hashPassword } from '../utils/password.js'
import { success, failure } from '../utils/apiResponse.js'

const ensureEvent = async (eventId) => {
  const event = await Event.findOne({ eventId })
  if (!event) {
    throw new Error('Event 不存在')
  }
  return event
}

export const listEventUsers = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const users = await EventUser.find({ event: event._id }).sort({ createdAt: -1 })
    return success(res, { users })
  } catch (error) {
    return failure(res, error.message, 404)
  }
}

export const createEventUser = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const { email, displayName, password, locale } = req.body

    if (!email || !displayName || !password) {
      return failure(res, '請填寫電郵、顯示名稱與暫存密碼', 422)
    }

    const passwordHash = await hashPassword(password)

    const user = await EventUser.create({
      event: event._id,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      locale: locale || 'zh-HK',
    })

    return success(res, { user }, 201)
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error.code === 11000) {
      return failure(res, '電郵已經存在', 409)
    }
    return failure(res, error.message, 500)
  }
}

export const updateEventUser = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const user = await EventUser.findOne({ _id: req.params.userId, event: event._id })
    if (!user) {
      return failure(res, '用戶不存在', 404)
    }

    const { displayName, status, locale } = req.body
    if (displayName) user.displayName = displayName
    if (status) user.status = status
    if (locale) user.locale = locale

    await user.save()
    return success(res, { user })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

export const resetEventUserPassword = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const { password } = req.body
    if (!password) {
      return failure(res, '請提供新密碼', 422)
    }

    const user = await EventUser.findOne({ _id: req.params.userId, event: event._id })
    if (!user) {
      return failure(res, '用戶不存在', 404)
    }

    user.passwordHash = await hashPassword(password)
    await user.save()

    return success(res, { user })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

export const deleteEventUser = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const user = await EventUser.findOneAndDelete({ _id: req.params.userId, event: event._id })
    if (!user) {
      return failure(res, '用戶不存在', 404)
    }

    return success(res, { deleted: true })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

// Event User 登入
export const loginEventUser = async (req, res) => {
  try {
    const { eventId, email, password } = req.body

    if (!eventId || !email || !password) {
      return failure(res, '請提供活動 ID、電郵與密碼', 422)
    }

    const event = await ensureEvent(eventId)
    const user = await EventUser.findOne({ 
      event: event._id, 
      email: email.toLowerCase() 
    })

    if (!user) {
      return failure(res, '帳號或密碼錯誤', 401)
    }

    if (user.status !== 'active') {
      return failure(res, '帳號已被停用', 403)
    }

    const { comparePassword } = await import('../utils/password.js')
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return failure(res, '帳號或密碼錯誤', 401)
    }

    // 更新最後登入時間
    user.lastLoginAt = new Date()
    await user.save()

    const { signToken } = await import('../utils/token.js')
    const token = signToken({ 
      id: user._id.toString(), 
      eventId: eventId,
      type: 'eventUser' 
    })

    res.cookie('eventAccessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return success(res, { 
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        locale: user.locale,
      },
      eventId: eventId,
    })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

// Event User 登出
export const logoutEventUser = async (_req, res) => {
  res.clearCookie('eventAccessToken')
  return success(res, { message: '登出成功' })
}

// 獲取當前 Event User
export const getCurrentEventUser = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const user = await EventUser.findById(req.eventUser?.id)
    
    if (!user || user.event.toString() !== event._id.toString()) {
      return failure(res, '用戶不存在', 404)
    }

    return success(res, { 
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        locale: user.locale,
      }
    })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}


