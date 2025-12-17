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


