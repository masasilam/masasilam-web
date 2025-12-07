// ============================================
// src/pages/NotFoundPage.jsx
// ============================================

import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
          <Link to="/buku" className="btn-secondary">
            <Search className="w-5 h-5 mr-2" />
            Jelajahi Buku
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage