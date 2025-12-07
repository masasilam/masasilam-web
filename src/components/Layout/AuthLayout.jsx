// ============================================
// src/components/Layout/AuthLayout.jsx
// ============================================

import { Link } from 'react-router-dom'
import MasasilamLogo from '/masasilam-logo.svg'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Simple header dengan logo di tengah */}
      <div className="py-8 px-4 flex justify-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-24 h-24 md:w-32 md:h-32">
            <img 
              src={MasasilamLogo} 
              alt="Masasilam Logo" 
              className="w-full h-full object-contain dark:invert"
            />
          </div>
        </Link>
      </div>
      
      <main className="flex-1 flex items-center justify-center px-4">
        {children}
      </main>
      
      <div className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Masasilam</p>
      </div>
    </div>
  )
}

export default AuthLayout