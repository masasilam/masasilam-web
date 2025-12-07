// ============================================
// src/context/AuthContext.jsx
// ============================================

import { createContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from "../utils/constants";
import authService from "../services/authService";

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  })
  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}')
      
      if (userData && Object.keys(userData).length > 0) {
        setUser(userData)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (userData, authToken, authRefreshToken) => {
    setToken(authToken)
    if (authRefreshToken) {
      setRefreshToken(authRefreshToken)
    }
    
    setUser(userData)
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken)
    if (authRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authRefreshToken)
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      if (token) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setRefreshToken(null)
      setUser(null)
      
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  }

  const updateToken = (newToken) => {
    setToken(newToken)
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
  }

  const value = {
    user,
    token,
    refreshToken,
    login,
    logout,
    updateUser,
    updateToken,
    loading,
    isAuthenticated: !!token && !!user,
    isGuest: !token || !user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}