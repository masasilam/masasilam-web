// ============================================
// FILE: src/pages/dashboard/DashboardLayout.jsx
// ============================================
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Library, History, BarChart3, Calendar, Award, Settings,
  Target, Highlighter, Home, LogOut, User, Menu, X, Moon, Sun, BookOpen,
  Database, PenSquare, Newspaper, AlertTriangle, Layers, Clock, TrendingUp,
  Rss, UserPen, Bell,
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

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const isAdmin = user?.roles?.includes('ADMIN')

  // ── Menu sections ──────────────────────────────────────────────────────────
  const mainMenuItems = useMemo(() => [
    { path: '/dasbor',              icon: LayoutDashboard, label: 'Dashboard',    exact: true },
    { path: '/dasbor/perpustakaan', icon: Library,         label: 'Perpustakaan'              },
    { path: '/dasbor/riwayat',      icon: History,         label: 'Riwayat'                   },
    { path: '/dasbor/anotasi',      icon: Highlighter,     label: 'Anotasi'                   },
    { path: '/dasbor/statistik',    icon: BarChart3,       label: 'Statistik'                 },
    { path: '/dasbor/kalender',     icon: Calendar,        label: 'Kalender'                  },
    { path: '/dasbor/pencapaian',   icon: Award,           label: 'Pencapaian'                },
    { path: '/dasbor/target',       icon: Target,          label: 'Target'                    },
  ], [])

  // Zine menu group — visible to all logged-in users
  const zineMenuItems = useMemo(() => [
    { path: '/dasbor/zine',           icon: Layers,     label: 'Perpustakaan Zine' },
    { path: '/dasbor/zine/riwayat',   icon: Clock,      label: 'Riwayat Zine'      },
    { path: '/dasbor/zine/statistik', icon: TrendingUp, label: 'Statistik Zine'    },
  ], [])

  // Social menu group — visible to all logged-in users
  const socialMenuItems = useMemo(() => [
    { path: '/dasbor/profil-sosial', icon: UserPen, label: 'Profil Sosial' },
    { path: '/sosial/notifikasi',    icon: Bell,    label: 'Notifikasi'    },
    { path: '/sosial/feed',          icon: Rss,     label: 'Feed Sosial'   },
  ], [])

  // Admin menu items
  const adminMenuItems = useMemo(() => {
    if (!isAdmin) return []
    return [
      { path: '/dasbor/koreksi', icon: AlertTriangle, label: 'Koreksi Teks',       adminOnly: true, badge: 'Admin' },
      { path: '/dasbor/blog',    icon: PenSquare,     label: 'Posting Blog',        adminOnly: true, badge: 'Admin' },
      { path: '/dasbor/koran',   icon: Newspaper,     label: 'Kelola Koran',        adminOnly: true, badge: 'Admin' },
      { path: '/dasbor/kelola',  icon: Database,      label: 'Kelola Perpustakaan', adminOnly: true, badge: 'Admin' },
    ]
  }, [isAdmin])

  const bottomMenuItems = useMemo(() => [
    { path: '/',                   icon: Home,     label: 'Beranda',      external: true },
    { path: '/buku',               icon: BookOpen, label: 'Koleksi Buku', external: true },
    { path: '/zine',               icon: Layers,   label: 'Koleksi Zine', external: true },
    { path: '/sosial',             icon: Rss,      label: 'Sosial',       external: true },
    { path: '/dasbor/pengaturan',  icon: Settings, label: 'Pengaturan'                   },
  ], [])

  const isActive = useCallback((path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }, [location.pathname])

  const handleLogout  = useCallback(async () => { await logout(); navigate('/') }, [logout, navigate])
  const navigateTo    = useCallback((path) => { setSidebarOpen(false); navigate(path) }, [navigate])
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])

  const getInitial = useCallback(() => {
    const name = user?.fullName || user?.name || user?.username || 'U'
    return name.charAt(0).toUpperCase()
  }, [user])

  // ── Reusable menu link ──────────────────────────────────────────────────────
  const MenuLink = ({ item }) => {
    const Icon    = item.icon
    const active  = isActive(item.path, item.exact)
    const isZineItem   = item.path.startsWith('/dasbor/zine')
    const isSocialItem = item.path.startsWith('/dasbor/profil-sosial')
                      || item.path.startsWith('/sosial')

    const activeClass = item.adminOnly
      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100'
      : isZineItem
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100'
        : isSocialItem
          ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-100'
          : 'bg-primary text-white'

    const hoverClass = item.adminOnly
      ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
      : isZineItem
        ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
        : isSocialItem
          ? 'hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-700 dark:text-sky-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'

    const badgeBg = active
      ? (isZineItem
          ? 'bg-emerald-200/50 dark:bg-emerald-800/50'
          : isSocialItem
            ? 'bg-sky-200/50 dark:bg-sky-800/50'
            : item.adminOnly ? 'bg-white/20' : 'bg-white/20')
      : (isZineItem
          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
          : isSocialItem
            ? 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200'
            : item.adminOnly
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              : '')

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          active ? activeClass : hoverClass
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm flex-1">{item.label}</span>
        {item.badge && (
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${badgeBg}`}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
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
              {user?.profilePictureUrl ? (
                <img
                  key={user.profilePictureUrl}
                  src={user.profilePictureUrl}
                  alt={user.username || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/50 flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {getInitial()}
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm">Dashboard</h1>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  Halo, {user?.fullName || user?.name || user?.username || 'Pengguna'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Menu utama">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigateTo('/sosial')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Rss className="w-4 h-4 text-sky-500" />
              <span className="text-sm hidden lg:inline">Sosial</span>
            </button>
            <button
              onClick={() => navigateTo('/zine')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className="text-sm hidden lg:inline">Zine</span>
            </button>
            <button
              onClick={() => navigateTo('/buku')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm hidden lg:inline">Koleksi</span>
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm hidden lg:inline">Beranda</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Keluar</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside
          className={`fixed lg:static top-14 sm:top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}
          aria-label="Menu navigasi dashboard"
        >
          <div className="p-3 sm:p-4">
            <nav className="space-y-5">

              {/* ── Buku & Bacaan ───────────────────────────────────────── */}
              <div>
                <h3 className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Buku & Bacaan
                </h3>
                <div className="space-y-0.5">
                  {mainMenuItems.map(item => <MenuLink key={item.path} item={item} />)}
                </div>
              </div>

              {/* ── Zine & Majalah ──────────────────────────────────────── */}
              <div>
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                  <Layers className="w-3 h-3" /> Zine & Majalah
                </h3>
                <div className="space-y-0.5">
                  {zineMenuItems.map(item => <MenuLink key={item.path} item={item} />)}
                </div>
              </div>

              {/* ── Sosial ──────────────────────────────────────────────── */}
              <div>
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-sky-600 dark:text-sky-500">
                  <Rss className="w-3 h-3" /> Sosial
                </h3>
                <div className="space-y-0.5">
                  {socialMenuItems.map(item => <MenuLink key={item.path} item={item} />)}
                </div>
              </div>

              {/* ── Admin ───────────────────────────────────────────────── */}
              {adminMenuItems.length > 0 && (
                <div>
                  <h3 className="px-3 text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1.5">
                    Admin
                  </h3>
                  <div className="space-y-0.5">
                    {adminMenuItems.map(item => <MenuLink key={item.path} item={item} />)}
                  </div>
                </div>
              )}

              {/* ── Navigasi ────────────────────────────────────────────── */}
              <div>
                <h3 className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Navigasi
                </h3>
                <div className="space-y-0.5">
                  {bottomMenuItems.map((item) => {
                    const Icon     = item.icon
                    const active   = isActive(item.path)
                    const isZine   = item.path === '/zine'
                    const isSocial = item.path === '/sosial'

                    if (item.external) {
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigateTo(item.path)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left touch-manipulation ${
                            isZine   ? 'text-emerald-600 dark:text-emerald-400' :
                            isSocial ? 'text-sky-600 dark:text-sky-400' : ''
                          }`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${
                            isZine   ? 'text-emerald-500' :
                            isSocial ? 'text-sky-500' : ''
                          }`} />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      )
                    }
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          active ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 sm:py-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                <span className="relative inline-block">
                  <span>©</span>
                  <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.15em] border-red-500 dark:border-red-400 transform rotate-[-45deg]" />
                </span>
                {' '}{new Date().getFullYear()} MasasilaM
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button onClick={() => navigateTo('/syarat-ketentuan')} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Syarat & Ketentuan</button>
                <button onClick={() => navigateTo('/privasi')}          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privasi</button>
                <button onClick={() => navigateTo('/kontak')}           className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kontak</button>
              </nav>
            </div>
          </footer>
        </div>

      </div>
    </div>
  )
}

export default DashboardLayout