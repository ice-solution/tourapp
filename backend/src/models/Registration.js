import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // 個人資料
    nameEn: {
      type: String,
      required: true,
    },
    nameZh: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile: String,
    dob: Date,
    passportNumber: String,
    passportUrl: String,
    // 航班與住宿
    flight: {
      type: String,
      enum: ['Group Flight', 'Self'],
    },
    hotel: String,
    roomType: {
      type: String,
      enum: ['Single', 'Twin'],
    },
    roommate: String,
    // 活動選擇
    selectedEventIds: [String],
    // 特殊需求
    dietary: String,
    specialRemarks: String,
    // 狀態
    status: {
      type: String,
      enum: ['Registered', 'Confirmed', 'Cancelled'],
      default: 'Registered',
    },
  },
  { timestamps: true },
)

registrationSchema.index({ event: 1, email: 1 })
registrationSchema.index({ event: 1, createdAt: -1 })

export const Registration = mongoose.model('Registration', registrationSchema)


