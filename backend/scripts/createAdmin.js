#!/usr/bin/env node
import mongoose from 'mongoose'
import minimist from 'minimist'
import { connectDatabase, closeDatabase } from '../src/config/database.js'
import { AdminUser } from '../src/models/AdminUser.js'
import { hashPassword } from '../src/utils/password.js'

const run = async () => {
  const argv = minimist(process.argv.slice(2))
  const { email, password, name, role = 'admin' } = argv

  if (!email || !password || !name) {
    console.error('Usage: node scripts/createAdmin.js --email= --password= --name=')
    process.exit(1)
  }

  try {
    await connectDatabase()
    const existing = await AdminUser.findOne({ email: email.toLowerCase() })
    if (existing) {
      console.error('Admin 已存在')
      process.exit(1)
    }

    const passwordHash = await hashPassword(password)
    const admin = await AdminUser.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
    })

    console.log('Admin 創建成功:', admin.email)
  } catch (error) {
    console.error('建立 Admin 失敗:', error.message)
  } finally {
    await closeDatabase()
    mongoose.connection.close()
  }
}

run()


