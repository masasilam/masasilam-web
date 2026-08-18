import axios from 'axios'
import config from '../config/env'

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — pasang token ke setiap request
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }
    if (config.isDevelopment) {
      console.log('📤 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        hasAuth: !!token,
      })
    }
    return requestConfig
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ─── State untuk mengelola proses refresh ────────────────────────────────────
// isRefreshing: flag agar hanya 1 request refresh yang berjalan sekaligus
// failedQueue: antrian request yang gagal 401, dijalankan ulang setelah refresh berhasil
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// Fungsi untuk memaksa logout — dipanggil hanya jika refresh juga gagal
const forceLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  // Dispatch event agar AuthContext tahu dan reset state-nya
  window.dispatchEvent(new Event('auth:logout'))
  window.location.href = '/masuk'
}

// Response interceptor — tangkap 401, coba refresh, ulangi request asli
api.interceptors.response.use(
  (response) => {
    if (config.isDevelopment) {
      console.log('📥 API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
      })
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Hanya tangani 401 dan hanya jika belum pernah di-retry
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Jangan coba refresh untuk endpoint auth itu sendiri
      // (menghindari infinite loop jika /auth/refresh-token juga 401)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/')
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      // Jika sedang refresh, masukkan request ini ke antrian
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }

      // Mulai proses refresh
      originalRequest._retry = true
      isRefreshing = true

      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (!storedRefreshToken) {
        isRefreshing = false
        forceLogout()
        return Promise.reject(error)
      }

      try {
        // Panggil endpoint refresh — gunakan axios langsung (bukan instance api)
        // agar tidak masuk loop interceptor lagi
        const refreshResponse = await axios.post(
          `${config.apiBaseUrl}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { token: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data

        // Simpan token baru
        localStorage.setItem('token', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Beritahu AuthContext bahwa token sudah diperbarui
        window.dispatchEvent(new CustomEvent('auth:tokenRefreshed', {
          detail: { token: newAccessToken, refreshToken: newRefreshToken }
        }))

        // Set token baru ke semua request yang sedang antri
        processQueue(null, newAccessToken)

        // Ulangi request asli yang gagal dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh gagal — berarti sesi benar-benar berakhir (user logout di device lain, dll)
        processQueue(refreshError, null)
        forceLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Error selain 401 — log dan teruskan
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    })

    return Promise.reject(error)
  }
)

export default api