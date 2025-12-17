import { Event } from '../models/Event.js'
import { success, failure } from '../utils/apiResponse.js'

// 獲取 event 的所有 navigationCards
export const getNavigationCards = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findOne({ eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const navigationCards = event.navigationCards || []
    return success(res, { navigationCards })
  } catch (error) {
    return failure(res, error.message || '獲取 navigationCards 失敗', 500)
  }
}

// 創建 navigationCard
export const createNavigationCard = async (req, res) => {
  try {
    const { eventId } = req.params
    const cardData = req.body

    const event = await Event.findOne({ eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    // 驗證必填欄位
    if (!cardData.id || !cardData.titleZh || !cardData.titleEn || !cardData.iconKey || !cardData.type) {
      return failure(res, '請提供 id, titleZh, titleEn, iconKey 和 type', 422)
    }

    // 驗證 type
    const validTypes = ['link', 'dialog', 'travel-dialog', 'flight-hotel-dialog', 'dinner-dialog']
    if (!validTypes.includes(cardData.type)) {
      return failure(res, `type 必須是以下之一: ${validTypes.join(', ')}`, 422)
    }

    // 如果是 link 類型，必須有 href
    if (cardData.type === 'link' && !cardData.href) {
      return failure(res, 'link 類型必須提供 href', 422)
    }

    // 檢查 id 是否已存在
    const existingCard = event.navigationCards.find((card) => card.id === cardData.id)
    if (existingCard) {
      return failure(res, '此 id 已被使用', 409)
    }

    // 設置 order（如果沒有提供）
    if (cardData.order === undefined) {
      const maxOrder = event.navigationCards.reduce((max, card) => Math.max(max, card.order || 0), -1)
      cardData.order = maxOrder + 1
    }

    event.navigationCards.push(cardData)
    event.updatedBy = req.admin._id
    await event.save()

    const newCard = event.navigationCards[event.navigationCards.length - 1]
    return success(res, { navigationCard: newCard }, 201)
  } catch (error) {
    return failure(res, error.message || '創建 navigationCard 失敗', 500)
  }
}

// 更新 navigationCard
export const updateNavigationCard = async (req, res) => {
  try {
    const { eventId, cardId } = req.params
    const updateData = req.body

    const event = await Event.findOne({ eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const cardIndex = event.navigationCards.findIndex((card) => card.id === cardId)
    if (cardIndex === -1) {
      return failure(res, 'NavigationCard 不存在', 404)
    }

    // 如果更新 id，檢查新 id 是否已被使用
    if (updateData.id && updateData.id !== cardId) {
      const existingCard = event.navigationCards.find((card) => card.id === updateData.id)
      if (existingCard) {
        return failure(res, '此 id 已被使用', 409)
      }
    }

    // 更新欄位
    Object.keys(updateData).forEach((key) => {
      if (key === 'dialogData' && updateData.dialogData) {
        // 合併 dialogData 對象
        event.navigationCards[cardIndex].dialogData = {
          ...event.navigationCards[cardIndex].dialogData,
          ...updateData.dialogData,
        }
      } else if (key === 'dialogConfig' && updateData.dialogConfig) {
        // 合併 dialogConfig 對象
        event.navigationCards[cardIndex].dialogConfig = {
          ...event.navigationCards[cardIndex].dialogConfig,
          ...updateData.dialogConfig,
        }
      } else if (updateData[key] !== undefined) {
        event.navigationCards[cardIndex][key] = updateData[key]
      }
    })

    event.updatedBy = req.admin._id
    await event.save()

    return success(res, { navigationCard: event.navigationCards[cardIndex] })
  } catch (error) {
    return failure(res, error.message || '更新 navigationCard 失敗', 500)
  }
}

// 刪除 navigationCard
export const deleteNavigationCard = async (req, res) => {
  try {
    const { eventId, cardId } = req.params

    const event = await Event.findOne({ eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    const cardIndex = event.navigationCards.findIndex((card) => card.id === cardId)
    if (cardIndex === -1) {
      return failure(res, 'NavigationCard 不存在', 404)
    }

    event.navigationCards.splice(cardIndex, 1)
    event.updatedBy = req.admin._id
    await event.save()

    return success(res, { message: 'NavigationCard 已刪除' })
  } catch (error) {
    return failure(res, error.message || '刪除 navigationCard 失敗', 500)
  }
}

// 重新排序 navigationCards
export const reorderNavigationCards = async (req, res) => {
  try {
    const { eventId } = req.params
    const { cardIds } = req.body // 新的順序 id 數組

    if (!Array.isArray(cardIds)) {
      return failure(res, 'cardIds 必須是數組', 422)
    }

    const event = await Event.findOne({ eventId })
    if (!event) {
      return failure(res, 'Event 不存在', 404)
    }

    // 創建 id 到 order 的映射
    const orderMap = {}
    cardIds.forEach((id, index) => {
      orderMap[id] = index
    })

    // 更新每個 card 的 order
    event.navigationCards.forEach((card) => {
      if (orderMap.hasOwnProperty(card.id)) {
        card.order = orderMap[card.id]
      }
    })

    // 按 order 排序
    event.navigationCards.sort((a, b) => (a.order || 0) - (b.order || 0))

    event.updatedBy = req.admin._id
    await event.save()

    return success(res, { navigationCards: event.navigationCards })
  } catch (error) {
    return failure(res, error.message || '重新排序失敗', 500)
  }
}


