import { failure } from '../utils/apiResponse.js'

export const notFoundHandler = (_req, res) => {
  failure(res, 'Resource not found', 404)
}

export const errorHandler = (err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  failure(res, message, status, err.errors)
}


