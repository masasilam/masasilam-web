// src/pages/dashboard/DashboardLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Library, History, BarChart3, Calendar, Award, Settings,
  Target, Highlighter, Home, LogOut, User, Menu, X, Moon, Sun, BookOpen
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const menuItems = useMemo(() => [
    { path: '/dasbor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/dasbor/perpustakaan', icon: Library, label: 'Perpustakaan' },
    { path: '/dasbor/riwayat', icon: History, label: 'Riwayat' },
    { path: '/dasbor/anotasi', icon: Highlighter, label: 'Anotasi' },
    { path: '/dasbor/statistik', icon: BarChart3, label: 'Statistik' },
    { path: '/dasbor/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/dasbor/pencapaian', icon: Award, label: 'Pencapaian' },
    { path: '/dasbor/target', icon: Target, label: 'Target' },
  ], [])

  const bottomMenuItems = useMemo(() => [
    { path: '/', icon: Home, label: 'Beranda', external: true },
    { path: '/buku', icon: BookOpen, label: 'Koleksi Buku', external: true },
    { path: '/dasbor/pengaturan', icon: Settings, label: 'Pengaturan' },
  ], [])

  const isActive = useCallback((path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }, [location.pathname])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  const navigateToPublicPage = useCallback((path) => {
    setSidebarOpen(false)
    navigate(path)
  }, [navigate])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm">Dashboard</h1>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  Halo, {user?.name || user?.username || 'Pengguna'}
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Menu utama">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Sun className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            <button
              onClick={() => navigateToPublicPage('/buku')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              title="Koleksi Buku"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm hidden lg:inline">Koleksi</span>
            </button>

            <button
              onClick={() => navigateToPublicPage('/')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm hidden lg:inline">Beranda</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden md:inline text-sm">Keluar</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-14 sm:top-16 left-0 bottom-0
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transform transition-transform duration-200 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
          aria-label="Menu navigasi dashboard"
        >
          <div className="p-3 sm:p-4">
            <nav className="space-y-1">
              {/* Main Navigation */}
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        active
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Bottom Navigation */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Navigasi
                </h3>
                {bottomMenuItems.map((item) => {
                  const Icon = item.icon

                  if (item.external) {
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigateToPublicPage(item.path)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 sm:py-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                <span className="relative inline-block">
                  <span>©</span>
                  <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.15em] border-red-500 dark:border-red-400 transform rotate-[-45deg]"></span>
                </span>
                {' '}
                {new Date().getFullYear()} MasasilaM
              </div>

              <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4" aria-label="Footer links">
                <button
                  onClick={() => navigateToPublicPage('/syarat-ketentuan')}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Syarat & Ketentuan
                </button>
                <button
                  onClick={() => navigateToPublicPage('/privasi')}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Privasi
                </button>
                <button
                  onClick={() => navigateToPublicPage('/kontak')}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Kontak
                </button>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout