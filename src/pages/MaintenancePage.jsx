// ============================================
// src/pages/MaintenancePage.jsx
// ============================================

import { Wrench } from 'lucide-react'

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Sedang Maintenance</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kami sedang melakukan perbaikan untuk meningkatkan layanan. 
          Mohon kembali lagi nanti.
        </p>
        <p className="text-sm text-gray-500">
          Estimasi selesai: 2 jam
        </p>
      </div>
    </div>
  )
}

export default MaintenancePage