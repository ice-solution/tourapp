import 'dotenv/config'

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5111,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tourapp',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  weatherApiBase: process.env.WEATHER_API_BASE || 'https://api.open-meteo.com/v1/forecast',
}

export const isProd = env.nodeEnv === 'production'


