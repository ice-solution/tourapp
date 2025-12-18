import mongoose from 'mongoose'

const scheduleItemSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
    },
    timeLabel: {
      type: String,
    },
    timeRange: {
      start: String,
      end: String,
    },
    descriptionZh: String,
    descriptionEn: String,
  },
  { _id: true }, // 啟用 _id，讓每個 schedule item 都有唯一的 MongoDB _id
)


const tileSchema = new mongoose.Schema(
  {
    titleZh: { type: String, required: false },
    titleEn: { type: String, required: false },
    iconKey: { type: String, required: true },
    type: { type: String, enum: ['schedule', 'external', 'information', 'registration'], required: true },
    // For external type
    externalUrl: String,
    // For schedule type
    scheduleItems: [scheduleItemSchema],
    // For information type
    informationData: {
      category: { type: String, default: '' }, // 資訊類別：hotel, travel, event 等
      backgroundImage: { type: String, default: '' },
      titles: [
        {
          id: { type: String, default: '' }, // 標題 ID
          titleZh: { type: String, default: '' }, // 標題（中文）
          titleEn: { type: String, default: '' }, // 標題（英文）
          details: [
            {
              subtitleZh: { type: String, default: '' },
              subtitleEn: { type: String, default: '' },
              contentZh: { type: String, default: '' }, // WYSIWYG 內容（中文）
              contentEn: { type: String, default: '' }, // WYSIWYG 內容（英文）
            },
          ],
        },
      ],
      // 向後兼容：保留舊的 items 結構
      items: [
        {
          subtitleZh: { type: String, default: '' },
          subtitleEn: { type: String, default: '' },
          contentZh: { type: String, default: '' },
          contentEn: { type: String, default: '' },
        },
      ],
    },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    imageUrl: { type: String, required: true },
    actionLabel: String,
    actionUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const themeSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String, default: '#c4d971' },
    primaryColor: { type: String, default: '#c9503d' },
    secondaryColor: { type: String, default: '#ef7b20' },
    accentColor: { type: String, default: '#ffffff' },
    iconStyle: { type: String, default: 'default' },
    bannerHeight: { type: Number, default: 220 },
  },
  { _id: false },
)

const weatherPreferenceSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, default: 'auto' },
  },
  { _id: false },
)

const mapPinSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true },
)

// Dialog subitem schema (用於 travel-dialog, flight-hotel-dialog, dinner-dialog)
const dialogSubitemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    titleZh: { type: String, required: true },
    titleEn: { type: String, required: true },
    descriptionZh: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
  },
  { _id: false },
)

// NavigationCard schema
const navigationCardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    titleZh: { type: String, required: true },
    titleEn: { type: String, required: true },
    iconKey: { type: String, required: true }, // MUI icon key
    type: {
      type: String,
      enum: ['link', 'dialog', 'travel-dialog', 'flight-hotel-dialog', 'dinner-dialog'],
      required: true,
    },
    // 用於 link 類型
    href: { type: String },
    // 用於 dialog 類型（行程對話框）- 使用現有的 tiles 結構
    dialogConfig: {
      tabs: [
        {
          label: String,
          sections: [
            {
              title: String,
              details: [String],
            },
          ],
        },
      ],
    },
    // 用於 travel-dialog, flight-hotel-dialog, dinner-dialog
    dialogData: {
      title: { type: String },
      subtitle: { type: String },
      backgroundImage: { type: String },
      iconKey: { type: String },
      subitems: [dialogSubitemSchema],
    },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    theme: {
      type: themeSchema,
      default: () => ({}),
    },
    banners: [bannerSchema],
    tiles: [tileSchema],
    navigationCards: [navigationCardSchema],
    weatherPreference: weatherPreferenceSchema,
    mapPins: [mapPinSchema],
    registrationFormConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        flights: [
          {
            id: 'A',
            labelEn: 'Group Flight (Recommended)',
            labelZh: '團體航班 (推薦)',
            descriptionEn: 'CX105 HKG-MEL / CX104 MEL-HKG',
            descriptionZh: 'CX105 HKG-MEL / CX104 MEL-HKG',
          },
          {
            id: 'B',
            labelEn: 'Self Arrangement',
            labelZh: '自行安排',
            descriptionEn: 'Flight allowance will be reimbursed',
            descriptionZh: '航班津貼將獲退還',
          },
        ],
        hotels: [
          {
            id: 'Hyatt',
            labelEn: 'Grand Hyatt Melbourne',
            labelZh: '墨爾本君悅酒店',
          },
          {
            id: 'Langham',
            labelEn: 'The Langham Melbourne',
            labelZh: '墨爾本朗廷酒店',
          },
        ],
        roomTypes: [
          {
            id: 'Single',
            labelEn: 'Single Room',
            labelZh: '單人房',
          },
          {
            id: 'Twin',
            labelEn: 'Twin Share',
            labelZh: '雙人房',
          },
        ],
        dietaryOptions: [
          { id: 'None', labelEn: 'None', labelZh: '無' },
          { id: 'Vegetarian', labelEn: 'Vegetarian', labelZh: '素食' },
          { id: 'No Beef', labelEn: 'No Beef', labelZh: '不吃牛肉' },
          { id: 'No Pork', labelEn: 'No Pork', labelZh: '不吃豬肉' },
          { id: 'Halal', labelEn: 'Halal', labelZh: '清真' },
          { id: 'Gluten Free', labelEn: 'Gluten Free', labelZh: '無麩質' },
        ],
      }),
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  { timestamps: true },
)

eventSchema.index({ eventId: 1 }, { unique: true })

export const Event = mongoose.model('Event', eventSchema)


