// ============================================
// src/components/Layout/Header.jsx - REFACTORED VERSION
// Menggunakan CSS Variables seperti BooksPage
// ============================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Moon, Search, Sun, User, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import Button from '../Common/Button'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="masasilam-logo.svg"
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
                placeholder="Cari buku, penulis, atau kategori..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-primary transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/buku" className="nav-link">Katalog</Link>
            <Link to="/kategori" className="nav-link">Kategori</Link>
            <Link to="/penulis" className="nav-link">Penulis</Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dasbor" className="nav-link flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{user?.username}</span>
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

          {/* Mobile Theme Toggle & Menu Button */}
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
              placeholder="Cari buku..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-primary transition-all"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <Link to="/buku" className="nav-link">Katalog</Link>
              <Link to="/kategori" className="nav-link">Kategori</Link>
              <Link to="/penulis" className="nav-link">Penulis</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dasbor" className="nav-link">Dashboard</Link>
                  <Button variant="secondary" onClick={handleLogout} fullWidth>
                    Keluar
                  </Button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/masuk" className="flex-1">
                    <Button variant="secondary" fullWidth>Masuk</Button>
                  </Link>
                  <Link to="/daftar" className="flex-1">
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