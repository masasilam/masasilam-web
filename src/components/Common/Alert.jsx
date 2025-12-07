// ============================================
// src/components/Common/Alert.jsx
// ============================================

import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

const Alert = ({ type = 'info', message, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    },
  }

  const { icon: Icon, className } = config[type]

  return (
    <div className={`p-4 border rounded-lg flex items-center gap-3 ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0">
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default Alert