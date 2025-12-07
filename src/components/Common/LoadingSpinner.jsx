// ============================================
// src/components/Common/LoadingSpinner.jsx
// ============================================

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner