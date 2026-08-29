import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Moon, Search, Sun, User, X,
  BookOpen, Layers, Film, Newspaper, PenLine,
  Rss, Tag, Users, ChevronDown, Archive
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import Button from '../Common/Button'

const NAV_COLORS = {
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    chipBg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    chipBg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    chipBg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  violet: {
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
    chipBg: 'bg-violet-50 dark:bg-violet-500/10',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    chipBg: 'bg-rose-50 dark:bg-rose-500/10',
  },
  sky: {
    text: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500',
    chipBg: 'bg-sky-50 dark:bg-sky-500/10',
  },
  stone: {
    text: 'text-stone-700 dark:text-slate-300',
    dot: 'bg-stone-400 dark:bg-slate-500',
    chipBg: 'bg-stone-100 dark:bg-slate-800',
  },
}

const PRIMARY_NAV = [
  { to: '/buku', label: 'Buku', icon: BookOpen, color: 'amber' },
  { to: '/zine', label: 'Zine', icon: Layers, color: 'emerald' },
  { to: '/film', label: 'Film', icon: Film, color: 'blue' },
  { to: '/koran', label: 'Koran', icon: Newspaper, color: 'violet' },
  { to: '/blog', label: 'Blog', icon: PenLine, color: 'rose' },
  { to: '/sosial', label: 'Sosial', icon: Rss, color: 'sky' },
]

// PERBAIKAN: entri "Monograf" ditambahkan di sini (bukan di PRIMARY_NAV) karena secara
// logis ini sub-fitur kurasi dari Koran, bukan kategori konten setara level-atas —
// menambahkannya ke PRIMARY_NAV akan membuat header terlalu ramai.
const SECONDARY_NAV = [
  { to: '/penulis', label: 'Penulis', icon: Users, color: 'stone' },
  { to: '/kategori', label: 'Kategori', icon: Tag, color: 'stone' },
  { to: '/koran/monograf', label: 'Monograf', icon: Archive, color: 'rose' },
]

const SEARCH_PLACEHOLDER = 'Cari buku, zine, koran, film...'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const moreRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMoreMenuOpen(false)
  }, [location.pathname])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-stone-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          <Link to="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-80">
            <img
              src="/masasilam-logo.svg"
              alt="masasilam Logo"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain dark:invert"
            />
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500 pointer-events-none z-10 transition-colors group-focus-within:text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder={SEARCH_PLACEHOLDER}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 dark:focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {PRIMARY_NAV.map(({ to, label, color }) => {
              const active = isActive(to)
              const c = NAV_COLORS[color]
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? c.text : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-opacity ${c.dot} ${active ? 'opacity-100' : 'opacity-0'}`} />
                  {label}
                </Link>
              )
            })}

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreMenuOpen((v) => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${moreMenuOpen ? 'text-stone-900 dark:text-slate-100' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100'
                  }`}
                aria-expanded={moreMenuOpen}
                aria-haspopup="true"
              >
                Lainnya
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 py-1.5 z-50">
                  {SECONDARY_NAV.map(({ to, label, icon: Icon, color }) => {
                    const active = isActive(to)
                    const c = NAV_COLORS[color]
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active ? `${c.text} font-semibold ${c.chipBg}` : 'text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800'
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

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-stone-900 dark:hover:text-slate-100 transition-colors"
              aria-label="Ganti tema"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dasbor"
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-stone-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                      {user?.username?.charAt(0)?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-sm font-medium text-stone-700 dark:text-slate-200 max-w-[100px] truncate">
                      {user?.username}
                    </span>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/masuk">
                    <Button variant="secondary" size="sm">Masuk</Button>
                  </Link>
                  <Link to="/daftar">
                    <Button variant="primary" size="sm">Daftar</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Buka menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder={SEARCH_PLACEHOLDER}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 dark:focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t border-stone-200 dark:border-slate-800 pt-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PRIMARY_NAV.map(({ to, label, icon: Icon, color }) => {
                const active = isActive(to)
                const c = NAV_COLORS[color]
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors ${active
                        ? `${c.chipBg} ${c.text} border-transparent font-semibold`
                        : 'border-stone-200 dark:border-slate-800 text-stone-700 dark:text-slate-300'
                      }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${c.chipBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                    </span>
                    <span className="text-sm">{label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex flex-col gap-1 mb-4 pt-3 border-t border-stone-100 dark:border-slate-800">
              {SECONDARY_NAV.map(({ to, label, icon: Icon, color }) => {
                const active = isActive(to)
                const c = NAV_COLORS[color]
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active ? `${c.text} font-semibold` : 'text-stone-600 dark:text-slate-400'
                      }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
                <Link
                  to="/dasbor"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700"
                >
                  <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user?.username?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                  </span>
                  <span className="text-sm font-medium text-stone-800 dark:text-slate-200 truncate">
                    {user?.username}
                  </span>
                </Link>
                <Button variant="secondary" onClick={handleLogout} fullWidth>
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 pt-3 border-t border-stone-100 dark:border-slate-800">
                <Link to="/masuk" className="flex-1">
                  <Button variant="secondary" fullWidth>Masuk</Button>
                </Link>
                <Link to="/daftar" className="flex-1">
                  <Button variant="primary" fullWidth>Daftar</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>

    </header>
  )
}

export default Header