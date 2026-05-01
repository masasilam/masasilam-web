import { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize dari localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('AuthContext: Error loading stored data:', error)
      // Data localStorage corrupt — bersihkan
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  // Dengarkan event dari api.js:
  // 1. auth:tokenRefreshed — token baru sudah disimpan di localStorage oleh interceptor,
  //    sync ke React state agar komponen yang pakai useAuth() ikut terupdate
  // 2. auth:logout — refresh gagal, paksa reset state
  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { token: newToken, refreshToken: newRefreshToken } = event.detail
      setToken(newToken)
      setRefreshToken(newRefreshToken)
    }

    const handleForceLogout = () => {
      setUser(null)
      setToken(null)
      setRefreshToken(null)
    }

    window.addEventListener('auth:tokenRefreshed', handleTokenRefreshed)
    window.addEventListener('auth:logout', handleForceLogout)

    return () => {
      window.removeEventListener('auth:tokenRefreshed', handleTokenRefreshed)
      window.removeEventListener('auth:logout', handleForceLogout)
    }
  }, [])

  const login = useCallback((userData, authToken, authRefreshToken) => {
    try {
      setUser(userData)
      setToken(authToken)
      setRefreshToken(authRefreshToken)

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', authToken)
      localStorage.setItem('refreshToken', authRefreshToken)
    } catch (error) {
      console.error('AuthContext: Error during login:', error)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    try {
      setUser(null)
      setToken(null)
      setRefreshToken(null)

      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } catch (error) {
      console.error('AuthContext: Error during logout:', error)
    }
  }, [])

  const updateUser = useCallback((updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData }

      // Hapus key dengan nilai undefined
      Object.keys(newUserData).forEach(key => {
        if (newUserData[key] === undefined) delete newUserData[key]
      })

      setUser(newUserData)
      localStorage.setItem('user', JSON.stringify(newUserData))
    } catch (error) {
      console.error('AuthContext: Error updating user:', error)
    }
  }, [user])

  // Dipanggil oleh komponen lain jika perlu sync token secara manual
  const updateTokens = useCallback((newToken, newRefreshToken) => {
    setToken(newToken)
    if (newRefreshToken) setRefreshToken(newRefreshToken)
    localStorage.setItem('token', newToken)
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
  }, [])

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    logout,
    updateUser,
    updateTokens,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider