// src/components/Layout/Footer.jsx — with full light/dark theme support

import { Link } from 'react-router-dom'
import { X, Instagram, Mail, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: X, label: 'X (Twitter)', url: 'https://x.com/masasilamdotcom',
      cls: 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
    },
    {
      icon: Instagram, label: 'Instagram', url: 'https://instagram.com/masasilamdotcom',
      cls: 'hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-700',
    },
    {
      icon: Mail, label: 'Email', url: 'mailto:support@masasilam.com',
      cls: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700',
    },
  ]

  const navColumns = [
    {
      title: 'Jelajahi',
      links: [
        { to: '/buku',            label: 'Buku'       },
        { to: '/film',            label: 'Film'       },
        { to: '/blog',            label: 'Blog'       },
        { to: '/koran',           label: 'Koran'      },
      ],
    },
    {
      title: 'Panduan',
      links: [
        { to: '/cara-membaca', label: 'Cara Membaca' },
        { to: '/faq',          label: 'FAQ'          },
        { to: '/kontak',       label: 'Kontak'       },
        { to: '/tentang',      label: 'Tentang Kami' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/syarat-ketentuan', label: 'Syarat & Ketentuan'  },
        { to: '/privasi',          label: 'Kebijakan Privasi'   },
      ],
    },
  ]

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Mobile: brand centered on top */}
        <div className="flex flex-col items-center mb-8 sm:hidden">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
            <img
              src="/masasilam-logo.svg"
              alt="MasasilaM"
              className="h-9 w-auto object-contain dark:invert transition-[filter] duration-300"
            />
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed text-center max-w-xs mb-4">
            Taman digital untuk karya-karya domain publik yang terbengkalai dan terdegradasi — buku, film, arsip koran dan majalah bersejarah.
          </p>
          {/* Social */}
          <div className="flex gap-2">
            {socialLinks.map((s, i) => {
              const Icon = s.icon
              return (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-500 transition-all hover:scale-110 ${s.cls}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Mobile: 3-column nav (Jelajahi, Panduan, Legal) side by side */}
        <div className="grid grid-cols-3 gap-4 sm:hidden mb-6">
          {navColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-tight block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Desktop: original 4-col grid (brand + 3 nav columns) */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <img
                src="/masasilam-logo.svg"
                alt="MasasilaM"
                className="h-8 w-auto object-contain dark:invert transition-[filter] duration-300"
              />
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed mb-5 max-w-xs">
              Taman digital untuk karya-karya domain publik yang terbengkalai dan terdegradasi — buku, film, arsip koran dan majalah bersejarah.
            </p>

            {/* Social */}
            <div className="flex gap-2">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-500 transition-all hover:scale-110 ${s.cls}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center sm:text-left">
            {/* Crossed-out © = public domain philosophy */}
            <span className="relative inline-block mr-1">
              ©
              <span className="absolute top-[45%] left-[-5%] w-[110%] h-0 border-t-[0.12em] border-red-400/70 dark:border-red-500/70 transform rotate-[-40deg]" />
            </span>
            {currentYear}{' '}
            <span className="font-semibold text-gray-600 dark:text-gray-400">MasasilaM</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-700 flex items-center gap-1">
            Dibikin dengan <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer