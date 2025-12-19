// ============================================
// src/components/Layout/Footer.jsx
// ============================================

import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t-2 border-primary mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Desktop Layout: Brand + 3 columns */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Brand - Desktop Only */}
          <div className="flex flex-col">
            <img 
              src="/masasilam-logo.svg"
              alt="masasilam Logo" 
              className="w-16 h-16 object-contain dark:invert mb-2"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Perpustakaan online untuk buku-buku domain publik yang terbengkalai dan terdegradasi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Jelajahi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buku" className="footer-link">Buku</Link></li>
              <li><Link to="/kategori" className="footer-link">Kategori</Link></li>
              <li><Link to="/penulis" className="footer-link">Penulis</Link></li>
              <li><Link to="/buku/terpopuler" className="footer-link">Terpopuler</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Bantuan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cara-membaca" className="footer-link">Cara Membaca</Link></li>
              <li><Link to="/faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/kontak" className="footer-link">Kontak</Link></li>
              <li><Link to="/tentang" className="footer-link">Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/syarat-ketentuan" className="footer-link">Syarat & Ketentuan</Link></li>
              <li><Link to="/privasi" className="footer-link">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        {/* Mobile Layout: Brand on top + 3 columns below */}
        <div className="sm:hidden">
          {/* Brand - Mobile */}
          <div className="mb-6 flex flex-col items-center">
            <img 
              src="/masasilam-logo.svg"
              alt="masasilam Logo" 
              className="w-24 h-24 object-contain dark:invert mb-2"
            />
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center px-4">
              Perpustakaan online untuk buku-buku domain publik yang terbengkalai dan terdegradasi.
            </p>
          </div>

          {/* 3 Columns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Jelajahi</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/buku" className="footer-link">Buku</Link></li>
                <li><Link to="/kategori" className="footer-link">Kategori</Link></li>
                <li><Link to="/penulis" className="footer-link">Penulis</Link></li>
                <li><Link to="/buku/terpopuler" className="footer-link">Terpopuler</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Bantuan</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cara-membaca" className="footer-link">Cara Membaca</Link></li>
                <li><Link to="/faq" className="footer-link">FAQ</Link></li>
                <li><Link to="/kontak" className="footer-link">Kontak</Link></li>
                <li><Link to="/tentang" className="footer-link">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/syarat-ketentuan" className="footer-link">Syarat & Ketentuan</Link></li>
                <li><Link to="/privasi" className="footer-link">Kebijakan Privasi</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer