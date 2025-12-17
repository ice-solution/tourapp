import mongoose from 'mongoose'
import { env } from './env.js'
import { AdminUser } from '../models/AdminUser.js'
import { hashPassword } from '../utils/password.js'

let isConnected = false

export const connectDatabase = async () => {
  if (isConnected) {
    return mongoose.connection
  }

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    
    // 初始化默認 admin 帳戶
    await initializeDefaultAdmin()
    
    return mongoose.connection
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// 初始化默認 admin 帳戶
const initializeDefaultAdmin = async () => {
  try {
    const defaultEmail = 'admin'
    const existingAdmin = await AdminUser.findOne({ email: defaultEmail })
    
    if (!existingAdmin) {
      const passwordHash = await hashPassword('admin123')
      const admin = await AdminUser.create({
        email: defaultEmail,
        name: 'Administrator',
        passwordHash,
        role: 'admin',
      })
      console.log('✅ Default admin account created:', admin.email)
    } else {
      console.log('ℹ️  Default admin account already exists')
    }
  } catch (error) {
    console.error('❌ Failed to initialize default admin:', error.message)
    // 不拋出錯誤，避免影響服務器啟動
  }
}

export const closeDatabase = async () => {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
}


