// src/components/Layout/Header.jsx

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import Button from '../Common/Button'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    console.group('🔵 Header: User State Changed')
    console.log('User object:', user)
    console.log('ProfilePictureUrl:', user?.profilePictureUrl)
    console.log('isAuthenticated:', isAuthenticated)
    console.groupEnd()
  }, [user, isAuthenticated])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getInitial = () => {
    const name = user?.fullName || user?.name || user?.username || 'U'
    return name.charAt(0).toUpperCase()
  }

  // ✅ Nav links lengkap — Blog + Koran
  const navLinks = [
    { to: '/buku',    label: 'Buku'    },
    { to: '/film',    label: 'Film'    },
    { to: '/blog',    label: 'Blog'    },
    { to: '/koran',   label: 'Koran'   },
    { to: '/penulis', label: 'Penulis' },
    { to: '/kategori',label: 'Kategori'},
  ]

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/masasilam-logo.svg"
              alt="masasilam Logo"
              className="h-10 w-auto object-contain dark:invert"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Cari buku, film, penulis, atau kategori..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-primary transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="nav-link text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dasbor"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {(() => {
                    const hasUrl = !!user?.profilePictureUrl
                    return hasUrl ? (
                      <img
                        key={user.profilePictureUrl}
                        src={user.profilePictureUrl}
                        alt={user.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary/50 hover:border-primary transition-colors"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform">
                        {getInitial()}
                      </div>
                    )
                  })()}
                  <span className="font-medium">{user?.username}</span>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/masuk">
                  <Button variant="secondary" size="sm">Masuk</Button>
                </Link>
                <Link to="/daftar">
                  <Button variant="primary" size="sm">Daftar</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile: Theme + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Cari buku atau film..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-primary transition-all"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dasbor"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user?.profilePictureUrl ? (
                      <img
                        key={user.profilePictureUrl}
                        src={user.profilePictureUrl}
                        alt={user.username || 'User'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/50"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-lg font-bold">
                        {getInitial()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user?.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Lihat Dashboard
                      </div>
                    </div>
                  </Link>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    fullWidth
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/masuk" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" fullWidth>Masuk</Button>
                  </Link>
                  <Link to="/daftar" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth>Daftar</Button>
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