// ============================================
// src/components/Auth/GuestRoute.jsx
// ============================================

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dasbor" replace />
  }

  return children
}

export default GuestRoute