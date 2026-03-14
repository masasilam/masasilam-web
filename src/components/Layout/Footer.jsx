// src/components/Layout/Footer.jsx

import { Link } from 'react-router-dom'
import { X, Instagram, Mail } from 'lucide-react'

const Footer = () => {
  const socialLinks = [
    { icon: X,         label: 'X',         url: 'https://x.com/masasilamdotcom',         color: 'hover:text-gray-900 dark:hover:text-white' },
    { icon: Instagram, label: 'Instagram',  url: 'https://instagram.com/masasilamdotcom', color: 'hover:text-pink-600' },
    { icon: Mail,      label: 'Email',      url: 'mailto:support@masasilam.com',           color: 'hover:text-primary' },
  ]

  return (
    <footer className="border-t-2 border-primary mt-auto bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">

        {/* ── Desktop: 4 kolom ────────────────────────────────────────────── */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6 lg:gap-8 items-start mb-8">

          {/* Jelajahi — ✅ tambah Blog & Koran */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Jelajahi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buku"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Buku</Link></li>
              <li><Link to="/film"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Film</Link></li>
              <li><Link to="/blog"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/koran"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Koran</Link></li>
              <li><Link to="/penulis"        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Penulis</Link></li>
              <li><Link to="/kategori"       className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kategori</Link></li>
              <li><Link to="/buku/terpopuler"className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terpopuler</Link></li>
            </ul>
          </div>

          {/* Panduan */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Panduan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cara-membaca" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cara Membaca</Link></li>
              <li><Link to="/faq"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/kontak"       className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kontak</Link></li>
              <li><Link to="/tentang"      className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/syarat-ketentuan" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Syarat &amp; Ketentuan</Link></li>
              <li><Link to="/privasi"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Sosial */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Ikuti Kami</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${s.color} transition-all hover:scale-110 hover:shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              Tetap terhubung untuk update terbaru
            </p>
          </div>
        </div>

        {/* ── Mobile: 3 kolom + sosial di bawah ──────────────────────────── */}
        <div className="sm:hidden">
          <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">

            {/* Jelajahi — ✅ tambah Blog & Koran */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Jelajahi</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/buku"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Buku</Link></li>
                <li><Link to="/film"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Film</Link></li>
                <li><Link to="/blog"           className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/koran"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Koran</Link></li>
                <li><Link to="/penulis"        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Penulis</Link></li>
                <li><Link to="/kategori"       className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kategori</Link></li>
                <li><Link to="/buku/terpopuler"className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terpopuler</Link></li>
              </ul>
            </div>

            {/* Panduan */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Panduan</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cara-membaca" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cara Membaca</Link></li>
                <li><Link to="/faq"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/kontak"       className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kontak</Link></li>
                <li><Link to="/tentang"      className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/syarat-ketentuan" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">S&amp;K</Link></li>
                <li><Link to="/privasi"          className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privasi</Link></li>
              </ul>
            </div>
          </div>

          {/* Sosial - Mobile */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm text-center">Ikuti Kami</h3>
            <div className="flex justify-center flex-wrap gap-3">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${s.color} transition-all hover:scale-110 hover:shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              <span className="relative inline-block">
                ©
                <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.15em] border-red-500 dark:border-red-400 transform rotate-[-45deg]" />
              </span>
              {' '}
              {new Date().getFullYear()} <span className="font-semibold text-primary">MasasilaM</span>. Perpustakaan digital untuk buku-buku domain publik yang terbengkalai dan terdegradasi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer