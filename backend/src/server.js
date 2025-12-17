import http from 'http'
import app from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

const startServer = async () => {
  try {
    await connectDatabase()
    const server = http.createServer(app)
    server.listen(env.port, () => {
      console.log(`Backend service listening on port ${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()


