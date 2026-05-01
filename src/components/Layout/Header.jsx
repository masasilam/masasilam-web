// ============================================
// FILE: src/components/Layout/Header.jsx
// ============================================
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Moon, Search, Sun, X,
  BookOpen, Film, Newspaper, PenLine,
  Tag, ChevronDown, Layers, Users, Rss,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../Social/NotificationBell'

const PRIMARY_NAV = [
  { to: '/buku',   label: 'Buku',   icon: BookOpen  },
  { to: '/zine',   label: 'Zine',   icon: Layers    },
  { to: '/film',   label: 'Film',   icon: Film      },
  { to: '/koran',  label: 'Koran',  icon: Newspaper },
  { to: '/blog',   label: 'Blog',   icon: PenLine   },
  { to: '/sosial', label: 'Sosial', icon: Rss       },
]

const SECONDARY_NAV = [
  { to: '/penulis',  label: 'Penulis',  icon: Users },
  { to: '/kategori', label: 'Kategori', icon: Tag   },
]

const Header = () => {
  const { theme, toggleTheme }            = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate                          = useNavigate()
  const location                          = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen,   setMoreMenuOpen]   = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const moreRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }
  const onKey        = (e) => { if (e.key === 'Enter') handleSearch() }
  const handleLogout = async () => { await logout(); navigate('/') }
  const getInitial   = () => (user?.fullName || user?.name || user?.username || 'U').charAt(0).toUpperCase()
  const isActive     = (path) => location.pathname.startsWith(path)

  // Per-link color logic (Zine = emerald, Sosial = sky, others = amber)
  const navLinkClass = (to) => {
    const active  = isActive(to)
    const isZine   = to === '/zine'
    const isSosial = to === '/sosial'

    if (active) {
      if (isZine)   return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
      if (isSosial) return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
    }

    if (isZine)   return 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10'
    if (isSosial) return 'text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-sky-500/10'
    return 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-2.5">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" aria-label="MasasilaM Home">
            <img src="/masasilam-logo.svg" alt="MasasilaM"
              className="h-8 w-auto object-contain dark:invert transition-[filter] duration-300" />
          </Link>

          {/* Search — Desktop */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={onKey}
                placeholder="Cari buku, zine, film, penulis..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 dark:focus:border-amber-500/60 transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0">
            {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${navLinkClass(to)}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}

            {/* Lainnya dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  moreMenuOpen
                    ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Lainnya
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl dark:shadow-black/40 overflow-hidden py-1.5 z-50">
                  {SECONDARY_NAV.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive(to)
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification Bell — Desktop */}
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dasbor"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
                >
                  {user?.profilePictureUrl ? (
                    <img
                      key={user.profilePictureUrl}
                      src={user.profilePictureUrl}
                      alt={user.username || 'User'}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitial()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/masuk"
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Masuk
                </Link>
                <Link
                  to="/daftar"
                  className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-1.5 rounded-full transition-all hover:scale-105"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme + notification + hamburger */}
          <div className="md:hidden flex items-center gap-1.5 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification Bell — Mobile */}
            {isAuthenticated && <NotificationBell />}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={onKey}
              placeholder="Cari buku, zine, film..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex flex-col gap-0.5 mb-4">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map(({ to, label, icon: Icon }) => {
                const isZine   = to === '/zine'
                const isSosial = to === '/sosial'
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(to)
                        ? isZine
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                          : isSosial
                            ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'
                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isZine ? 'text-emerald-500' : isSosial ? 'text-sky-500' : ''
                      }`}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/dasbor"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all"
                  >
                    {user?.profilePictureUrl ? (
                      <img
                        key={user.profilePictureUrl}
                        src={user.profilePictureUrl}
                        alt={user.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-base font-bold">
                        {getInitial()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</div>
                      <div className="text-xs text-gray-500">Lihat Dashboard</div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/masuk" className="flex-1">
                    <button className="w-full py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all">
                      Masuk
                    </button>
                  </Link>
                  <Link to="/daftar" className="flex-1">
                    <button className="w-full py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl transition-all">
                      Daftar
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header