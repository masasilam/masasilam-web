import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Library, History, BarChart3, Calendar, Award, Settings,
  Target, Highlighter, Home, LogOut, Menu, X, Moon, Sun, BookOpen,
  Database, PenSquare, Newspaper, AlertTriangle, Layers, Clock, TrendingUp,
  Rss, UserPen, Bell, ChevronRight, Film,
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

// ── Menu data ─────────────────────────────────────────────────────────────────
const MAIN_MENU = [
  { path: '/dasbor',              icon: LayoutDashboard, label: 'Dashboard',    exact: true },
  { path: '/dasbor/perpustakaan', icon: Library,         label: 'Perpustakaan'              },
  { path: '/dasbor/riwayat',      icon: History,         label: 'Riwayat'                   },
  { path: '/dasbor/anotasi',      icon: Highlighter,     label: 'Anotasi'                   },
  { path: '/dasbor/statistik',    icon: BarChart3,       label: 'Statistik'                 },
  { path: '/dasbor/kalender',     icon: Calendar,        label: 'Kalender'                  },
  { path: '/dasbor/pencapaian',   icon: Award,           label: 'Pencapaian'                },
  { path: '/dasbor/target',       icon: Target,          label: 'Target'                    },
]
const ZINE_MENU = [
  { path: '/dasbor/zine',           icon: Layers,     label: 'Perpustakaan Zine' },
  { path: '/dasbor/zine/riwayat',   icon: Clock,      label: 'Riwayat Zine'      },
  { path: '/dasbor/zine/statistik', icon: TrendingUp, label: 'Statistik Zine'    },
]
const SOCIAL_MENU = [
  { path: '/dasbor/profil-sosial', icon: UserPen, label: 'Profil Sosial' },
  { path: '/sosial/notifikasi',    icon: Bell,    label: 'Notifikasi'    },
  { path: '/sosial/feed',          icon: Rss,     label: 'Feed Sosial'   },
]
const ADMIN_MENU = [
  { path: '/dasbor/koreksi', icon: AlertTriangle, label: 'Koreksi Teks',       badge: 'Admin' },
  { path: '/dasbor/blog',    icon: PenSquare,     label: 'Posting Blog',        badge: 'Admin' },
  { path: '/dasbor/koran',   icon: Newspaper,     label: 'Kelola Koran',        badge: 'Admin' },
  { path: '/dasbor/kelola',  icon: Database,      label: 'Kelola Perpustakaan', badge: 'Admin' },
]

// ── Top-right navigation (moved from sidebar BOTTOM_MENU) ────────────────────
const TOP_NAV = [
  { path: '/',       icon: Home,     label: 'Beranda',      accent: 'hover:text-amber-500'   },
  { path: '/buku',   icon: BookOpen, label: 'Buku', accent: 'hover:text-amber-500'   },
  { path: '/zine',   icon: Layers,   label: 'Zine', accent: 'hover:text-emerald-500' },
  { path: '/film',   icon: Film,     label: 'Film',         accent: 'hover:text-blue-500'    },
  { path: '/koran',  icon: Newspaper,label: 'Koran',        accent: 'hover:text-violet-500'  },
  { path: '/blog',   icon: PenSquare,label: 'Blog',         accent: 'hover:text-rose-500'    },
  { path: '/sosial', icon: Rss,      label: 'Sosial',       accent: 'hover:text-sky-500'     },
]

// ── Accent config ─────────────────────────────────────────────────────────────
const ACCENT = {
  main:   { active: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',     hover: 'hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400'    },
  zine:   { active: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30', hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400' },
  social: { active: 'bg-sky-500 text-white shadow-sm shadow-sky-500/30',         hover: 'hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-400'            },
  admin:  { active: 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/30',   hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-700 dark:hover:text-yellow-400'  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color = 'text-stone-400 dark:text-slate-500' }) => (
  <p className={`px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>{children}</p>
)

const MenuItem = ({ item, isActive, accent }) => {
  const Icon   = item.icon
  const active = isActive(item.path, item.exact)
  return (
    <Link
      to={item.path}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                  ${active ? accent.active : `text-stone-600 dark:text-slate-400 ${accent.hover}`}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          active
            ? 'bg-white/20 text-white'
            : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
        }`}>{item.badge}</span>
      )}
    </Link>
  )
}

// ── UserAvatar ────────────────────────────────────────────────────────────────
const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false)
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size] || 'w-10 h-10 text-sm'
  const photoUrl = !imgError && (
    user?.profilePictureUrl || user?.avatarUrl || user?.photoUrl || user?.avatar || user?.photo || null
  )
  const initial = (user?.fullName || user?.name || user?.username || 'U').charAt(0).toUpperCase()

  if (photoUrl) {
    return (
      <img
        key={photoUrl}
        src={photoUrl}
        alt={user?.username || 'Foto profil'}
        className={`${sz.split(' ')[0]} ${sz.split(' ')[1]} rounded-full object-cover flex-shrink-0 ring-2 ring-amber-400/30 ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-amber-400 to-amber-600
                     flex items-center justify-center flex-shrink-0
                     font-bold text-white shadow-md shadow-amber-500/20 select-none ${className}`}>
      {initial}
    </div>
  )
}

// ── SidebarNav ────────────────────────────────────────────────────────────────
// hideBrand selalu true sekarang — brand tidak perlu di sidebar karena sudah ada di header
const SidebarNav = ({ isActive, navigate, handleLogout, user, adminMenuItems }) => (
  <div className="flex flex-col h-full">
    {/* Scrollable nav */}
    <nav
      className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
      style={{ scrollbarWidth: 'none' }}
      aria-label="Menu navigasi dashboard"
    >
      <div>
        <SectionLabel>Buku &amp; Bacaan</SectionLabel>
        <div className="space-y-0.5">
          {MAIN_MENU.map(item => <MenuItem key={item.path} item={item} isActive={isActive} accent={ACCENT.main} />)}
        </div>
      </div>

      <div>
        <SectionLabel color="text-emerald-500 dark:text-emerald-500">▸ Zine &amp; Majalah</SectionLabel>
        <div className="space-y-0.5">
          {ZINE_MENU.map(item => <MenuItem key={item.path} item={item} isActive={isActive} accent={ACCENT.zine} />)}
        </div>
      </div>

      <div>
        <SectionLabel color="text-sky-500 dark:text-sky-500">▸ Sosial</SectionLabel>
        <div className="space-y-0.5">
          {SOCIAL_MENU.map(item => <MenuItem key={item.path} item={item} isActive={isActive} accent={ACCENT.social} />)}
        </div>
      </div>

      {adminMenuItems.length > 0 && (
        <div>
          <SectionLabel color="text-yellow-500 dark:text-yellow-500">▸ Admin</SectionLabel>
          <div className="space-y-0.5">
            {adminMenuItems.map(item => <MenuItem key={item.path} item={item} isActive={isActive} accent={ACCENT.admin} />)}
          </div>
        </div>
      )}

      {/* Pengaturan tetap di sidebar */}
      <div>
        <SectionLabel>Akun</SectionLabel>
        <div className="space-y-0.5">
          <Link
            to="/dasbor/pengaturan"
            aria-current={isActive('/dasbor/pengaturan') ? 'page' : undefined}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                        ${isActive('/dasbor/pengaturan')
                          ? ACCENT.main.active
                          : `text-stone-600 dark:text-slate-400 ${ACCENT.main.hover}`}`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Pengaturan</span>
          </Link>
        </div>
      </div>
    </nav>

    {/* User card — bawah sidebar */}
    <div className="px-3 pb-4 pt-3 flex-shrink-0 border-t border-stone-100 dark:border-slate-800">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60">
        <UserAvatar user={user} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 dark:text-slate-100 truncate">
            {user?.fullName || user?.name || user?.username || 'Pengguna'}
          </p>
          <Link to="/dasbor/pengaturan"
            className="text-[11px] text-stone-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            Lihat profil →
          </Link>
        </div>
        <button onClick={handleLogout} title="Keluar"
          className="p-1.5 rounded-lg text-stone-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout
// ─────────────────────────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout }       = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  // Ambil nama tampilan — fullName > name > username
  const displayName = user?.fullName || user?.name || user?.username || 'Pengguna'

  const isAdmin        = user?.roles?.includes('ADMIN')
  const adminMenuItems = useMemo(() => isAdmin ? ADMIN_MENU : [], [isAdmin])

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])
  useEffect(() => {
    const el = document.querySelector('.dashboard-main')
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 4)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isActive      = useCallback((path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }, [location.pathname])
  const handleLogout  = useCallback(async () => { await logout(); navigate('/') }, [logout, navigate])
  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), [])

  const navProps = { isActive, navigate, handleLogout, user, adminMenuItems }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col">

      {/* ══════════ HEADER ══════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-200 border-b overflow-visible
        ${scrolled
          ? 'bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-stone-200/80 dark:border-slate-700/80 shadow-sm shadow-black/5'
          : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800'
        }`}>
        <div className="h-14 px-3 sm:px-5 flex items-center gap-2">

          {/* ── Hamburger (mobile) ── */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={sidebarOpen}
            className="lg:hidden p-2 rounded-xl text-stone-500 dark:text-slate-400
                       hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* ── Brand (single, hanya di header) ── */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600
                            flex items-center justify-center flex-shrink-0
                            shadow-sm shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-bold text-sm text-stone-900 dark:text-slate-50 leading-tight">Dashboard</p>
              <p className="text-[11px] text-stone-400 dark:text-slate-500 leading-tight truncate max-w-[160px]">
                Halo, {displayName} 👋
              </p>
            </div>
          </Link>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ════════════════════════════════════════════════════════════
              TOP-RIGHT NAVIGATION
              Beranda · Koleksi Buku · Koleksi Zine · Film · Koran · Blog · Sosial
              Desktop: label + ikon, Tablet: ikon saja, Mobile: disembunyikan
          ════════════════════════════════════════════════════════════ */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-0.5 mr-1"
          >
            {TOP_NAV.map(({ path, icon: Icon, label, accent }) => {
              const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
              return (
                <Link
                  key={path}
                  to={path}
                  title={label}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                              ${active
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                : `text-stone-500 dark:text-slate-400 ${accent} hover:bg-stone-100 dark:hover:bg-slate-800`
                              }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xl:inline whitespace-nowrap">{label}</span>
                </Link>
              )
            })}
            <div className="w-px h-5 bg-stone-200 dark:bg-slate-700 mx-1.5" />
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
              className="p-2 rounded-xl text-stone-500 dark:text-slate-400
                         hover:text-stone-800 dark:hover:text-slate-100
                         hover:bg-stone-100 dark:hover:bg-slate-800 transition-all
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User pill — sm+ */}
            <div className="hidden sm:flex items-center gap-1 ml-0.5">
              <Link
                to="/dasbor/pengaturan"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                           border border-stone-200 dark:border-slate-700
                           bg-stone-50 dark:bg-slate-800
                           hover:border-amber-400 dark:hover:border-amber-500/60
                           transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <UserAvatar user={user} size="sm" />
                <span className="hidden md:block text-xs font-semibold text-stone-700 dark:text-slate-300
                                 group-hover:text-stone-900 dark:group-hover:text-slate-100
                                 max-w-[100px] truncate transition-colors">
                  {user?.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-xl text-stone-400 dark:text-slate-500
                           hover:text-red-500 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition-all
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Logout mobile (xs only) */}
            <button
              onClick={handleLogout}
              aria-label="Keluar"
              className="sm:hidden p-2 rounded-xl text-stone-400 dark:text-slate-500
                         hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Mobile: condensed top nav row (scroll horizontal) ── */}
        <div className="md:hidden border-t border-stone-100 dark:border-slate-800 overflow-x-auto"
             style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-1 px-3 py-2 min-w-max">
            {TOP_NAV.map(({ path, icon: Icon, label, accent }) => {
              const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                              ${active
                                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                                : `text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 ${accent}`
                              }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ══════════ BODY ════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Desktop sidebar ── */}
        {/* Tidak ada brand strip di sini — sudah ada di header */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800 flex-shrink-0 overflow-hidden">
          <SidebarNav {...navProps} />
        </aside>

        {/* ── Mobile drawer ── */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-200 ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <aside
            className={`absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900
                        shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col
                        transform transition-transform duration-200 ease-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            aria-modal="true" role="dialog" aria-label="Menu navigasi"
          >
            {/* Drawer header: foto profil user */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-100 dark:border-slate-800 flex-shrink-0
                            bg-gradient-to-r from-amber-50/60 to-transparent dark:from-amber-500/5 dark:to-transparent">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 dark:text-slate-50 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-stone-400 dark:text-slate-500 truncate">
                  @{user?.username || 'masasilam'}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Tutup menu"
                className="p-2 rounded-xl text-stone-400 dark:text-slate-500
                           hover:text-stone-700 dark:hover:text-slate-200
                           hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav — tidak ada brand/ikon buku duplikat */}
            <div className="flex-1 overflow-hidden">
              <SidebarNav {...navProps} />
            </div>
          </aside>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto dashboard-main">
          <main className="flex-1 p-3 sm:p-5 lg:p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-5 mt-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-400 dark:text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="relative inline-block leading-none">
                  <span>©</span>
                  <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.12em] border-red-500 dark:border-red-400 transform rotate-[-45deg]" />
                </span>
                <span>{new Date().getFullYear()} MasasilaM</span>
              </div>
              <nav className="flex items-center gap-4">
                {[
                  { path: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
                  { path: '/privasi',          label: 'Privasi'            },
                  { path: '/kontak',           label: 'Kontak'             },
                ].map(({ path, label }) => (
                  <button key={path} onClick={() => navigate(path)}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout