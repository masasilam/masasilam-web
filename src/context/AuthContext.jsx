// ============================================
// src/context/AuthContext.jsx - FINAL FIX
// ============================================

import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    console.log('🔵 AuthContext: Initializing...')

    try {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      console.log('🔵 AuthContext: Stored data found:', {
        hasToken: !!storedToken,
        hasRefreshToken: !!storedRefreshToken,
        hasUser: !!storedUser
      })

      if (storedToken && storedUser) {
        setToken(storedToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
        console.log('✅ AuthContext: User restored from localStorage')
      } else {
        console.log('⚠️ AuthContext: No stored session found')
      }
    } catch (error) {
      console.error('❌ AuthContext: Error loading stored data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Login function
  const login = (userData, authToken, authRefreshToken) => {
    console.log('🔵 AuthContext.login() called with:', {
      userData,
      hasToken: !!authToken,
      hasRefreshToken: !!authRefreshToken
    })

    try {
      // Save to state
      setUser(userData)
      setToken(authToken)
      setRefreshToken(authRefreshToken)

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', authToken)
      localStorage.setItem('refreshToken', authRefreshToken)

      console.log('✅ AuthContext: Login successful, data saved')
      console.log('✅ Current user:', userData)
      console.log('✅ Token length:', authToken?.length)
    } catch (error) {
      console.error('❌ AuthContext: Error during login:', error)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    console.log('🔵 AuthContext.logout() called')

    try {
      setUser(null)
      setToken(null)
      setRefreshToken(null)

      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')

      console.log('✅ AuthContext: Logout successful')
    } catch (error) {
      console.error('❌ AuthContext: Error during logout:', error)
    }
  }

  // ✅ FIXED: Update user dengan proper field handling
  const updateUser = (updatedUserData) => {
    console.log('🔵 AuthContext.updateUser() called')
    console.log('🔵 Current user:', user)
    console.log('🔵 Update data:', updatedUserData)

    try {
      // 🔥 CRITICAL FIX: Merge dengan benar, prioritaskan data baru
      const newUserData = {
        ...user,
        ...updatedUserData,
        // 🔥 Jika ada fullName di update, hapus name lama
        ...(updatedUserData.fullName && { name: undefined }),
      }

      // 🔥 Clean undefined values
      Object.keys(newUserData).forEach(key => {
        if (newUserData[key] === undefined) {
          delete newUserData[key]
        }
      })

      console.log('🔥 New user data (cleaned):', newUserData)

      setUser(newUserData)
      localStorage.setItem('user', JSON.stringify(newUserData))

      console.log('✅ AuthContext: User updated')
      console.log('✅ localStorage updated:', JSON.parse(localStorage.getItem('user')))
    } catch (error) {
      console.error('❌ AuthContext: Error updating user:', error)
    }
  }

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token
  }

  console.log('🔵 AuthContext: Current state:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: value.isAuthenticated,
    loading
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider