// Environment configuration
// Vite uses import.meta.env for environment variables
// Variables must be prefixed with VITE_ to be exposed to the client

const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue
}

export const environment = {
  // API Base URL (Backend server)
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5111/api'),
  
  // Client URL (Frontend URL)
  CLIENT_URL: getEnvVar('VITE_CLIENT_URL', 'http://localhost:5173'),
  
  // Environment
  NODE_ENV: getEnvVar('MODE', 'development'),
  IS_PRODUCTION: getEnvVar('MODE') === 'production',
  IS_DEVELOPMENT: getEnvVar('MODE') === 'development',
}

export default environment

