// Environment configuration
export const config = {
  // API Configuration
  serverAddress: import.meta.env.VITE_SERVER_ADDRESS || 'localhost:8000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Doculazer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
}

// API endpoints helper
export const apiEndpoints = {
  // Auth endpoints
  login: `${config.apiBaseUrl}/v1/token`,
  // register: `${config.apiBaseUrl}/auth/register`,
  // logout: `${config.apiBaseUrl}/auth/logout`,
  
  // User endpoints
  // profile: `${config.apiBaseUrl}/user/profile`,
  // updateProfile: `${config.apiBaseUrl}/user/profile`,
  // changePassword: `${config.apiBaseUrl}/user/change-password`,
  
  // Document endpoints
  // documents: `${config.apiBaseUrl}/documents`,
  // uploadDocument: `${config.apiBaseUrl}/documents/upload`,
  // summarizeDocument: `${config.apiBaseUrl}/documents/summarize`,
  
  // Chat endpoints
  // chat: `${config.apiBaseUrl}/chat`,
  // chatHistory: `${config.apiBaseUrl}/chat/history`,
}

export default config