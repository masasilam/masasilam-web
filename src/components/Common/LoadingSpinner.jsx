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
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-t-blue-500 border-r-transparent border-b-blue-700 border-l-transparent rounded-full`}
        style={{
          animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-50">
        <div className="flex flex-col items-center justify-center">
          {spinner}
          <p className="mt-4 text-white font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner