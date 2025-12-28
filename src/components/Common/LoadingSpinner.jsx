//============================================
// src/components/Common/LoadingSpinner.jsx
// ============================================

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-amber-500/20 border-t-amber-500 rounded-full`}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center z-50">
        <div className="flex flex-col items-center justify-center">
          {spinner}
          <p className="mt-4 text-white font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner