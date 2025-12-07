// ============================================
// src/pages/dashboard/DashboardLayout.jsx
// ============================================

import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Library, 
  History, 
  Bookmark, 
  Highlighter, 
  FileText, 
  MessageSquare, 
  Settings 
} from 'lucide-react'

const DashboardLayout = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/dasbor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/dasbor/perpustakaan', icon: Library, label: 'Perpustakaan Saya' },
    { path: '/dasbor/riwayat', icon: History, label: 'Riwayat Baca' },
    { path: '/dasbor/penanda', icon: Bookmark, label: 'Penanda Buku' },
    { path: '/dasbor/sorotan', icon: Highlighter, label: 'Sorotan' },
    { path: '/dasbor/catatan', icon: FileText, label: 'Catatan' },
    { path: '/dasbor/ulasan', icon: MessageSquare, label: 'Ulasan Saya' },
    { path: '/dasbor/pengaturan', icon: Settings, label: 'Pengaturan' },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="font-bold text-xl mb-6">Menu Dashboard</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path, item.exact)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout