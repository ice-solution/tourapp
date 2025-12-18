import mongoose from 'mongoose'
import { Registration } from '../models/Registration.js'
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

export const listRegistrations = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const registrations = await Registration.find({ event: event._id })
      .sort({ createdAt: -1 })
      .lean()

    return success(res, { registrations })
  } catch (error) {
    return failure(res, error.message, 404)
  }
}

export const createRegistration = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const registrationData = {
      ...req.body,
      event: event._id,
    }

    const registration = await Registration.create(registrationData)
    
    // 自動創建 EventUser 帳戶（方案2 + 方案C）
    try {
      // 檢查是否已存在 EventUser
      const existingUser = await EventUser.findOne({
        event: event._id,
        email: registration.email.toLowerCase(),
      })

      if (!existingUser) {
        // 生成初始密碼：使用護照號碼後6位，如果沒有護照號碼或不足6位，使用默認密碼
        let initialPassword = '123456' // 默認密碼
        if (registration.passportNumber && registration.passportNumber.length >= 6) {
          initialPassword = registration.passportNumber.slice(-6)
        } else if (registration.passportNumber && registration.passportNumber.length > 0) {
          // 如果護照號碼不足6位，用0補齊
          initialPassword = registration.passportNumber.padStart(6, '0').slice(-6)
        }

        const passwordHash = await hashPassword(initialPassword)
        const displayName = registration.nameZh || registration.nameEn || registration.email

        await EventUser.create({
          event: event._id,
          email: registration.email.toLowerCase(),
          displayName: displayName,
          passwordHash: passwordHash,
          locale: 'zh-HK',
          status: 'active',
        })
      }
      // 如果用戶已存在，不創建新帳戶（可能是重複登記）
    } catch (userError) {
      // 如果創建用戶失敗，記錄錯誤但不影響登記流程
      console.error('Failed to create event user:', userError)
      // 繼續執行，登記仍然成功
    }

    return success(res, { registration }, 201)
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return failure(res, error.message, 422)
    }
    if (error.code === 11000) {
      return failure(res, '此電郵已登記', 409)
    }
    return failure(res, error.message, 500)
  }
}

export const updateRegistration = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const registration = await Registration.findOne({
      _id: req.params.registrationId,
      event: event._id,
    })

    if (!registration) {
      return failure(res, '登記不存在', 404)
    }

    Object.assign(registration, req.body)
    await registration.save()

    return success(res, { registration })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

export const deleteRegistration = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const registration = await Registration.findOne({
      _id: req.params.registrationId,
      event: event._id,
    })

    if (!registration) {
      return failure(res, '登記不存在', 404)
    }

    await registration.deleteOne()
    return success(res, { message: '已刪除登記' })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

// 獲取當前 event user 的登記資料
export const getMyRegistration = async (req, res) => {
  try {
    const event = await ensureEvent(req.params.eventId)
    const eventUser = req.eventUser

    if (!eventUser || !eventUser.email) {
      return failure(res, '未登入', 401)
    }

    const registration = await Registration.findOne({
      event: event._id,
      email: eventUser.email.toLowerCase(),
    }).lean()

    if (!registration) {
      return failure(res, '未找到登記資料', 404)
    }

    return success(res, { registration })
  } catch (error) {
    return failure(res, error.message, 500)
  }
}


