const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-amber-500/20 border-t-amber-500 rounded-full animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]`}
    />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50 dark:bg-slate-950">
        <div className="flex flex-col items-center justify-center">
          {spinner}
          <p className="mt-4 text-stone-600 dark:text-slate-400 font-medium animate-pulse motion-reduce:animate-none">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center">
      {spinner}
    </div>
  )
}

export default LoadingSpinner