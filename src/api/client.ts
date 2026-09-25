import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si un request falla con 401 (token expirado), intenta renovarlo
// UNA vez con el refresh token, y si funciona, reintenta el request
// original de forma transparente. Si el refresh también falla
// (refresh token vencido o inválido), cierra la sesión.
let isRefreshing = false
let refreshQueue: Array<() => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/token/refresh/')) {
      // El refresh mismo falló: la sesión ya no es válida
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      // Ya hay un refresh en curso: espera a que termine y reintenta
      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(apiClient(originalRequest)))
      })
    }

    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      })
      const newAccessToken = response.data.access
      localStorage.setItem('access_token', newAccessToken)

      refreshQueue.forEach((cb) => cb())
      refreshQueue = []

      return apiClient(originalRequest)
    } catch (refreshError) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)