import axios from 'axios'
import { authState, clearAuth } from './store/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 30000
})

http.interceptors.request.use((config) => {
  if (authState.token) {
    config.headers.Authorization = `Bearer ${authState.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function unwrap(response) {
  if (response.code !== 0) {
    throw new Error(response.message || '请求失败')
  }
  return response.data
}

export default http
