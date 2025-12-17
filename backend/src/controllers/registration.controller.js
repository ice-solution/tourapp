import mongoose from 'mongoose'
import { Registration } from '../models/Registration.js'
import { Event } from '../models/Event.js'
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


