import mongoose from 'mongoose'

const eventUserSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    locale: {
      type: String,
      default: 'zh-HK',
    },
    lastLoginAt: Date,
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: true },
)

eventUserSchema.index({ event: 1, email: 1 }, { unique: true })

eventUserSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

export const EventUser = mongoose.model('EventUser', eventUserSchema)


