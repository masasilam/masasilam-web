import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Github } from 'lucide-react'

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/masasilam', color: 'hover:text-blue-600' },
    { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/masasilam', color: 'hover:text-sky-500' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/masasilam', color: 'hover:text-pink-600' },
    { icon: Youtube, label: 'YouTube', url: 'https://youtube.com/@masasilam', color: 'hover:text-red-600' },
    { icon: Github, label: 'GitHub', url: 'https://github.com/masasilam', color: 'hover:text-gray-900 dark:hover:text-white' },
    { icon: Mail, label: 'Email', url: 'mailto:info@masasilam.com', color: 'hover:text-primary' }
  ]

  return (
    <footer className="border-t-2 border-primary mt-auto bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Desktop Layout: 4 columns */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6 lg:gap-8 items-start mb-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Jelajahi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buku" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Buku</Link></li>
              <li><Link to="/penulis" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Penulis</Link></li>
              <li><Link to="/kategori" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kategori</Link></li>
              <li><Link to="/buku/terpopuler" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terpopuler</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Panduan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cara-membaca" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cara Membaca</Link></li>
              <li><Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/kontak" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kontak</Link></li>
              <li><Link to="/tentang" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/syarat-ketentuan" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privasi" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Ikuti Kami</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:scale-110 hover:shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              Tetap terhubung dengan kami untuk update terbaru
            </p>
          </div>
        </div>

        {/* Mobile Layout: 3 columns + social media below */}
        <div className="sm:hidden">
          {/* 3 Columns */}
          <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Jelajahi</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/buku" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Buku</Link></li>
                <li><Link to="/penulis" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Penulis</Link></li>
                <li><Link to="/kategori" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kategori</Link></li>
                <li><Link to="/buku/terpopuler" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terpopuler</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Panduan</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cara-membaca" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cara Membaca</Link></li>
                <li><Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/kontak" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Kontak</Link></li>
                <li><Link to="/tentang" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/syarat-ketentuan" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">S&K</Link></li>
                <li><Link to="/privasi" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privasi</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Media - Mobile */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-sm text-center">Ikuti Kami</h3>
            <div className="flex justify-center flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:scale-110 hover:shadow-lg`}
                  >
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
                <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.15em] border-red-500 dark:border-red-400 transform rotate-[-45deg]"></span>
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