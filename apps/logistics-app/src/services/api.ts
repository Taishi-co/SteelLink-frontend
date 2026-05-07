import axios from 'axios'
import { clearLogisticsSession, getLogisticsToken, saveLogisticsToken } from './auth'

const defaultBaseURL = import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getLogisticsToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-token-refreshed']
    if (refreshedToken) {
      saveLogisticsToken(refreshedToken)
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      clearLogisticsSession()
      const currentPath = window.location.pathname + window.location.search
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
    }
    return Promise.reject(error)
  }
)

export default api
