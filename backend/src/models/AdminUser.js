import mongoose from 'mongoose'

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'editor',
    },
    activeEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  },
  { timestamps: true },
)

adminUserSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

export const AdminUser = mongoose.model('AdminUser', adminUserSchema)


