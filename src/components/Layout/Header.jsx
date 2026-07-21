import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Moon, Search, Sun, X,
  BookOpen, Film, Newspaper, PenLine,
  Tag, ChevronDown, Layers, Users, Rss,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../Social/NotificationBell'

// ─────────────────────────────────────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Accent map
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ACCENT = {
  '/buku':     { text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',     hover: 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-500/10'     },
  '/zine':     { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', hover: 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10' },
  '/film':     { text: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-500/10',       hover: 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-500/10'       },
  '/koran':    { text: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-500/10',   hover: 'hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/60 dark:hover:bg-violet-500/10'   },
  '/blog':     { text: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-500/10',       hover: 'hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-500/10'       },
  '/sosial':   { text: 'text-pink-600 dark:text-pink-400',       bg: 'bg-pink-50 dark:bg-pink-500/10',       hover: 'hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/60 dark:hover:bg-pink-500/10'       },
  '/penulis':  { text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',     hover: 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-500/10'     },
  '/kategori': { text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',     hover: 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-500/10'     },
}

const getAccent = (to) => NAV_ACCENT[to] || NAV_ACCENT['/buku']

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = () => {
  const { theme, toggleTheme }            = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate                          = useNavigate()
  const location                          = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen,   setMoreMenuOpen]   = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [scrolled,       setScrolled]       = useState(false)

  const moreRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMoreMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setMobileMenuOpen(false); setMoreMenuOpen(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim()
    if (q) {
      navigate(`/cari?q=${encodeURIComponent(q)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }, [searchQuery, navigate])

  const onKey        = useCallback((e) => { if (e.key === 'Enter') handleSearch() }, [handleSearch])
  const handleLogout = useCallback(async () => { await logout(); navigate('/') }, [logout, navigate])
  const getInitial   = () => (user?.fullName || user?.name || user?.username || 'U').charAt(0).toUpperCase()
  const isActive     = useCallback((path) => location.pathname.startsWith(path), [location.pathname])

  const navLinkClass = (to) => {
    const accent = getAccent(to)
    return isActive(to)
      ? `${accent.text} ${accent.bg} font-semibold`
      : `text-gray-600 dark:text-gray-400 ${accent.hover}`
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl shadow-sm shadow-black/5 dark:shadow-black/30'
            : 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80'
          }`}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">

          {/* ════════════════════════════════════════════════════════
              TOPBAR ROW
          ════════════════════════════════════════════════════════ */}
          <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? 'py-2' : 'py-2.5'}`}>

            {/* ── Logo ─────────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
              aria-label="Perpustakaan Digital MasasilaM— Beranda"
            >
              <img
                src="/masasilam-logo.svg"
                alt="Perpustakaan Digital MasasilaM"
                className={`w-auto object-contain dark:invert transition-all duration-300 ${scrolled ? 'h-7' : 'h-8'}`}
              />
            </Link>

            {/* ── Search — Desktop only ─────────────────────────────── */}
            <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={onKey}
                  placeholder="Cari buku, zine, film, penulis..."
                  aria-label="Cari konten"
                  className="w-full pl-9 pr-9 py-2 text-sm rounded-full
                             bg-gray-100 dark:bg-gray-800/80
                             border border-gray-200 dark:border-gray-700
                             text-gray-900 dark:text-gray-100
                             placeholder-gray-400 dark:placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-amber-500/40
                             focus:border-amber-500/60 dark:focus:border-amber-500/60 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Desktop Nav ───────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0" aria-label="Navigasi utama">
              {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-2.5 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all
                              flex items-center gap-1 lg:gap-1.5 whitespace-nowrap
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                              ${navLinkClass(to)}`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden lg:inline">{label}</span>
                  <span className="lg:hidden sr-only">{label}</span>
                </Link>
              ))}

              {/* Lainnya dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreMenuOpen(v => !v)}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 px-2.5 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                              ${moreMenuOpen
                                ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                >
                  <span className="hidden lg:inline">Lainnya</span>
                  <span className="lg:hidden font-bold tracking-wider">···</span>
                  <ChevronDown className={`hidden lg:block w-3 h-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <div
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl dark:shadow-black/40 overflow-hidden py-1.5 z-50
                               bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    {SECONDARY_NAV.map(({ to, label, icon: Icon }) => {
                      const accent = getAccent(to)
                      return (
                        <Link
                          key={to}
                          to={to}
                          role="menuitem"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                      ${isActive(to)
                                        ? `${accent.text} ${accent.bg}`
                                        : `text-gray-600 dark:text-gray-400 ${accent.hover}`
                                      }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* ── Desktop right controls ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1.5 ml-auto flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                           hover:text-gray-800 dark:hover:text-gray-100
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {isAuthenticated && <NotificationBell />}

              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/dasbor"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full
                               bg-gray-100 dark:bg-gray-800
                               border border-gray-200 dark:border-gray-700
                               hover:border-amber-400 dark:hover:border-amber-500 transition-all group
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitial()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors max-w-[96px] truncate">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                               px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/masuk"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400
                               hover:text-gray-900 dark:hover:text-white
                               px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/daftar"
                    className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 active:bg-amber-600
                               text-gray-950 px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════
                MOBILE TOPBAR ICONS
                Tampil hanya di layar < md.
                Urutan: [Sosial] [Tema] [Notif] [Burger]
                Sosial selalu visible — tidak perlu buka drawer.
            ════════════════════════════════════════════════════════ */}
            <div className="md:hidden flex items-center gap-0.5 ml-auto">

              {/* Sosial — selalu tampil di topbar mobile */}
              <Link
                to="/sosial"
                aria-label="Sosial"
                className={`p-2 rounded-lg transition-all
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500
                            ${isActive('/sosial')
                              ? 'text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10'
                              : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10'
                            }`}
              >
                <Rss className="w-[18px] h-[18px]" />
              </Link>

              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
              >
                {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
              </button>

              {/* Notifikasi */}
              {isAuthenticated && <NotificationBell />}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Search bar ─────────────────────────────────────── */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={onKey}
                placeholder="Cari buku, zine, film..."
                aria-label="Cari konten"
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-full
                           bg-gray-100 dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-gray-100
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="md:hidden border-t border-gray-200 dark:border-gray-800
                       bg-white dark:bg-gray-950 max-h-[calc(100dvh-120px)] overflow-y-auto"
          >
            <nav aria-label="Navigasi mobile" className="container mx-auto px-3 py-4">

              {/* Grid 3 kolom — semua nav item */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-4">
                {[...PRIMARY_NAV, ...SECONDARY_NAV].map(({ to, label, icon: Icon }) => {
                  const accent = getAccent(to)
                  const active = isActive(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl
                                  text-xs font-medium transition-all text-center
                                  focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                                  ${active
                                    ? `${accent.text} ${accent.bg} border border-current/20`
                                    : `text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent`
                                  }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Auth */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/dasbor"
                      className="flex items-center gap-3 p-3 rounded-xl
                                 bg-gray-100 dark:bg-gray-800
                                 border border-gray-200 dark:border-gray-700
                                 hover:border-amber-400 dark:hover:border-amber-500 transition-all"
                    >
                      {user?.profilePictureUrl ? (
                        <img
                          key={user.profilePictureUrl}
                          src={user.profilePictureUrl}
                          alt={user.username || 'User'}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                          {getInitial()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lihat Dashboard</div>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-sm text-gray-500 dark:text-gray-400
                                 hover:text-gray-800 dark:hover:text-white py-2.5 rounded-xl
                                 border border-gray-200 dark:border-gray-800
                                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/masuk">
                      <button className="w-full py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400
                                         border border-gray-200 dark:border-gray-700 rounded-xl
                                         hover:bg-gray-100 dark:hover:bg-gray-800
                                         hover:text-gray-900 dark:hover:text-white transition-all">
                        Masuk
                      </button>
                    </Link>
                    <Link to="/daftar">
                      <button className="w-full py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl transition-all">
                        Daftar
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="pb-4" />
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default Header