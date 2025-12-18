import mongoose from 'mongoose'
import { Event } from '../models/Event.js'
import { success, failure } from '../utils/apiResponse.js'

export const listEvents = async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 })
  return success(res, { events })
}

export const createEvent = async (req, res) => {
  try {
    const { eventId, title, description } = req.body

    if (!eventId || !title) {
      return failure(res, '請提供 eventId 與標題', 422)
    }

    const existing = await Event.findOne({ eventId })
    if (existing) {
      return failure(res, 'EventId 已存在', 409)
    }

    const event = await Event.create({
      eventId,
      title,
      description,
      createdBy: req.admin?._id,
    })

    return success(res, { event }, 201)
  } catch (error) {
    return failure(res, error.message, 500)
  }
}

export const getEvent = async (req, res) => {
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }
  return success(res, { event })
}

export const updateEventMeta = async (req, res) => {
  const { title, description, isPublished } = req.body
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  if (title) event.title = title
  if (description !== undefined) event.description = description
  if (typeof isPublished === 'boolean') {
    event.isPublished = isPublished
    event.publishedAt = isPublished ? new Date() : null
  }
  event.updatedBy = req.admin?._id
  await event.save()
  return success(res, { event })
}

export const updateTheme = async (req, res) => {
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  event.theme = {
    ...event.theme?.toObject?.(),
    ...req.body,
  }
  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { theme: event.theme })
}

export const updateBanners = async (req, res) => {
  const { banners = [] } = req.body
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  event.banners = banners.map((banner) => ({
    ...banner,
    _id: banner._id ? new mongoose.Types.ObjectId(banner._id) : new mongoose.Types.ObjectId(),
  }))
  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { banners: event.banners })
}

const validateTilePayload = (payload, strict = true) => {
  if (strict && (!payload.titleZh || !payload.titleEn)) {
    throw new Error('請填寫中文與英文標題')
  }
  if (!payload.iconKey) {
    throw new Error('請選擇 icon')
  }
  if (!['schedule', 'external', 'information', 'registration'].includes(payload.type)) {
    throw new Error('類別需為 schedule、external、information 或 registration')
  }
  if (payload.type === 'external' && strict && !payload.externalUrl) {
    throw new Error('External 類別需要提供 URL')
  }
  if (payload.type === 'schedule' && strict && (!Array.isArray(payload.scheduleItems) || payload.scheduleItems.length === 0)) {
    throw new Error('Schedule 類別需要至少一項行程內容')
  }
  if (payload.type === 'information' && strict && (!payload.informationData || !Array.isArray(payload.informationData.items) || payload.informationData.items.length === 0)) {
    throw new Error('Information 類別需要至少一個項目')
  }
}

export const createTile = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    // 新增時允許空標題，讓用戶可以先建立再填寫
    validateTilePayload(req.body, false)

    const tile = {
      ...req.body,
      _id: new mongoose.Types.ObjectId(),
      order: typeof req.body.order === 'number' ? req.body.order : event.tiles.length,
    }

    event.tiles.push(tile)
    event.updatedBy = req.admin?._id
    await event.save()

    return success(res, { tile }, 201)
  } catch (error) {
    return failure(res, error.message, 422)
  }
}

export const updateTile = async (req, res) => {
  try {
    // 更新時允許部分填寫，不進行嚴格驗證
    validateTilePayload(req.body, false)
    const event = await Event.findOne({ eventId: req.params.eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const tile = event.tiles.id(req.params.tileId)
    if (!tile) {
      return failure(res, 'Tile 不存在', 404)
    }

    Object.assign(tile, req.body)

    if (typeof req.body.order === 'number') {
      tile.order = req.body.order
    }

    event.updatedBy = req.admin?._id
    await event.save()

    return success(res, { tile })
  } catch (error) {
    return failure(res, error.message, 422)
  }
}

export const reorderTiles = async (req, res) => {
  const { order = [] } = req.body
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  const orderMap = new Map(order.map((id, index) => [id, index]))
  event.tiles.forEach((tile) => {
    if (orderMap.has(tile.id)) {
      tile.order = orderMap.get(tile.id)
    }
  })
  event.markModified('tiles')
  event.updatedBy = req.admin?._id
  await event.save()

  event.tiles.sort((a, b) => a.order - b.order)

  return success(res, { tiles: event.tiles })
}

export const deleteTile = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const tile = event.tiles.id(req.params.tileId)
    if (!tile) {
      return failure(res, 'Tile 不存在', 404)
    }

    // 使用 pull 方法移除子文檔（最可靠的方法）
    event.tiles.pull(req.params.tileId)
    
    event.updatedBy = req.admin?._id
    await event.save()

    return success(res, { tiles: event.tiles })
  } catch (error) {
    console.error('Delete tile error:', error)
    return failure(res, error.message || '刪除 tile 失敗', 500)
  }
}

export const updateWeatherPreference = async (req, res) => {
  const { locationName, latitude, longitude, timezone } = req.body
  if (!locationName || latitude === undefined || longitude === undefined) {
    return failure(res, '請提供地點名稱與座標', 422)
  }

  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  event.weatherPreference = { locationName, latitude, longitude, timezone }
  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { weatherPreference: event.weatherPreference })
}

export const updateRegistrationFormConfig = async (req, res) => {
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  event.registrationFormConfig = req.body
  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { registrationFormConfig: event.registrationFormConfig })
}

// 地圖 Pin 管理
export const getMapPins = async (req, res) => {
  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }
  return success(res, { mapPins: event.mapPins || [] })
}

export const createMapPin = async (req, res) => {
  const { name, nameEn, lat, lng, description } = req.body
  if (!name || !nameEn || lat === undefined || lng === undefined) {
    return failure(res, '請提供名稱與座標', 422)
  }

  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  if (!event.mapPins) {
    event.mapPins = []
  }

  const maxOrder = event.mapPins.length > 0 
    ? Math.max(...event.mapPins.map(pin => pin.order || 0))
    : -1

  const newPin = {
    name,
    nameEn,
    lat,
    lng,
    description: description || '',
    order: maxOrder + 1,
  }

  event.mapPins.push(newPin)
  event.updatedBy = req.admin?._id
  await event.save()

  const createdPin = event.mapPins[event.mapPins.length - 1]
  return success(res, { mapPin: createdPin }, 201)
}

export const updateMapPin = async (req, res) => {
  const { name, nameEn, lat, lng, description, order } = req.body
  const { pinId } = req.params

  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  const pin = event.mapPins.id(pinId)
  if (!pin) {
    return failure(res, 'Map Pin 不存在', 404)
  }

  if (name !== undefined) pin.name = name
  if (nameEn !== undefined) pin.nameEn = nameEn
  if (lat !== undefined) pin.lat = lat
  if (lng !== undefined) pin.lng = lng
  if (description !== undefined) pin.description = description
  if (order !== undefined) pin.order = order

  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { mapPin: pin })
}

export const deleteMapPin = async (req, res) => {
  const { pinId } = req.params

  const event = await Event.findOne({ eventId: req.params.eventId })
  if (!event) {
    return failure(res, 'Event 不存在', 404)
  }

  const pin = event.mapPins.id(pinId)
  if (!pin) {
    return failure(res, 'Map Pin 不存在', 404)
  }

  pin.remove()
  event.updatedBy = req.admin?._id
  await event.save()

  return success(res, { mapPins: event.mapPins })
}


