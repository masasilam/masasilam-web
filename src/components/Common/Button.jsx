// ============================================
// src/components/Common/Button.jsx
// ============================================

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Memproses...
        </span>
      ) : children}
    </button>
  )
}

export default Button