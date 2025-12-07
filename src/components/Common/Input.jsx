// ============================================
// src/components/Common/Input.jsx
// ============================================

const Input = ({ 
  label, 
  error, 
  helperText,
  required = false,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-4 py-2.5 border rounded-lg 
          bg-white dark:bg-gray-800 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition-all
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
        `}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input