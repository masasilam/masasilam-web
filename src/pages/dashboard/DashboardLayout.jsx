// ============================================
// src/pages/dashboard/DashboardLayout.jsx - FIXED NAVIGATION
// ============================================

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Library, 
  History, 
  FileText,
  BarChart3,
  Calendar,
  Award,
  Settings,
  Target,
  Bookmark,
  Highlighter,
  StickyNote,
  Star,
  Home,
  LogOut,
  User,
  Menu,
  X,
  Moon,
  Sun,
  BookOpen
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/dasbor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/dasbor/perpustakaan', icon: Library, label: 'Perpustakaan' },
    { path: '/dasbor/riwayat', icon: History, label: 'Riwayat' },
    { path: '/dasbor/penanda', icon: Bookmark, label: 'Penanda' },
    { path: '/dasbor/sorotan', icon: Highlighter, label: 'Sorotan' },
    { path: '/dasbor/catatan', icon: StickyNote, label: 'Catatan' },
    { path: '/dasbor/ulasan-saya', icon: Star, label: 'Ulasan Saya' },
    { path: '/dasbor/statistik', icon: BarChart3, label: 'Statistik' },
    { path: '/dasbor/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/dasbor/pencapaian', icon: Award, label: 'Pencapaian' },
    { path: '/dasbor/target', icon: Target, label: 'Target' },
  ]

  const bottomMenuItems = [
    { path: '/', icon: Home, label: 'Kembali ke Beranda', external: true },
    { path: '/buku', icon: BookOpen, label: 'Koleksi Buku', external: true },
    { path: '/dasbor/pengaturan', icon: Settings, label: 'Pengaturan' },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // ✅ FIXED: Navigasi ke halaman publik dengan force reload
  const navigateToPublicPage = (path) => {
    // Tutup sidebar mobile
    setSidebarOpen(false)
    
    // Navigate tanpa replace, biarkan user bisa back
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Khusus Dashboard */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Left: Menu Toggle & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Dashboard</h1>
                <p className="text-xs text-gray-500">Halo, {user?.name || user?.username || 'Pengguna'}</p>
              </div>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-4">
            {/* Toggle Theme Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            
            {/* Link to Book Collection */}
            <button
              onClick={() => navigateToPublicPage('/buku')}
              className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Koleksi Buku"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Koleksi</span>
            </button>
            
            <button
              onClick={() => navigateToPublicPage('/')}
              className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Beranda</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:static top-16 left-0 bottom-0 
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:translate-x-0
        `}>
          <div className="p-4">
            <nav className="space-y-1">
              {/* Main Navigation - HANYA untuk dashboard routes */}
              <div className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Menu Utama
                </h3>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path, item.exact)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Bottom Navigation - Untuk keluar dashboard */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Navigasi
                </h3>
                {bottomMenuItems.map((item) => {
                  const Icon = item.icon
                  
                  // ✅ FIXED: Jika external link, gunakan navigate biasa
                  if (item.external) {
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigateToPublicPage(item.path)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  }
                  
                  // Jika internal link (tetap di dashboard)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area with Footer */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>

          {/* Dashboard Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright dengan simbol © dicoret diagonal merah */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="relative inline-block">
                  <span>©</span>
                  <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500 dark:bg-red-400 transform -rotate-12 -translate-y-1/2"></span>
                </span>
                {' '}
                {new Date().getFullYear()} masasilam • Dashboard v1.0
              </div>
              
              {/* Footer Links - Gunakan navigate untuk keluar dashboard */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateToPublicPage('/syarat-ketentuan')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Syarat & Ketentuan
                </button>
                <button
                  onClick={() => navigateToPublicPage('/privasi')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Privasi
                </button>
                <button
                  onClick={() => navigateToPublicPage('/kontak')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Kontak
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout