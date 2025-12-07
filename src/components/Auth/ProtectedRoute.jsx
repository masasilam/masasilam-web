// ============================================
// src/components/Auth/ProtectedRoute.jsx
// ============================================

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/masuk" replace />
  }

  return children
}

export default ProtectedRoute