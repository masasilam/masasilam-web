import { Link } from 'react-router-dom'
import { X, Instagram, Mail, Heart, BookOpen, Film, Newspaper, Layers, Rss } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: X,
      label: 'X (Twitter)',
      url: 'https://x.com/masasilamdotcom',
      hoverBg:     'hover:bg-stone-200 dark:hover:bg-slate-700',
      hoverText:   'hover:text-stone-900 dark:hover:text-white',
      hoverBorder: 'hover:border-stone-400 dark:hover:border-slate-500',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      url: 'https://instagram.com/masasilamdotcom',
      hoverBg:     'hover:bg-pink-50 dark:hover:bg-pink-900/30',
      hoverText:   'hover:text-pink-600 dark:hover:text-pink-400',
      hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
    },
    {
      icon: Mail,
      label: 'Email',
      url: 'mailto:info@masa-silam.com',
      hoverBg:     'hover:bg-amber-50 dark:hover:bg-amber-900/30',
      hoverText:   'hover:text-amber-600 dark:hover:text-amber-400',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
//     {
//       icon: Rss,
//       label: 'RSS Feed',
//       url: '/rss.xml',
//       hoverBg:     'hover:bg-orange-50 dark:hover:bg-orange-900/30',
//       hoverText:   'hover:text-orange-600 dark:hover:text-orange-400',
//       hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
//     },
  ]

  // Kolom navigasi — ditambahkan Zine
  const navColumns = [
    {
      title: 'Jelajahi',
      links: [
        { to: '/buku',  label: 'Buku',          icon: BookOpen,  accent: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'   },
        { to: '/zine',  label: 'Zine & Magazine', icon: Layers,   accent: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' },
        { to: '/film',  label: 'Film',           icon: Film,     accent: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'      },
        { to: '/koran', label: 'Koran',          icon: Newspaper, accent: 'group-hover:text-violet-600 dark:group-hover:text-violet-400' },
        { to: '/blog',  label: 'Blog',           icon: null,     accent: 'group-hover:text-stone-700 dark:group-hover:text-slate-200'    },
      ],
    },
    {
      title: 'Panduan',
      links: [
        { to: '/cara-membaca', label: 'Cara Membaca', icon: null },
        { to: '/faq',          label: 'FAQ',          icon: null },
        { to: '/kontak',       label: 'Kontak',       icon: null },
        { to: '/tentang',      label: 'Tentang Kami', icon: null },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/syarat-ketentuan', label: 'Syarat & Ketentuan', icon: null },
        { to: '/privasi',          label: 'Kebijakan Privasi',  icon: null },
        { to: '/dmca',             label: 'DMCA',               icon: null },
      ],
    },
  ]


  return (
    <footer
      className="relative mt-auto overflow-hidden
                 bg-white dark:bg-slate-950
                 border-t border-stone-200 dark:border-slate-800
                 transition-colors duration-300"
    >
      {/* ── Subtle top accent line ───────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 via-blue-400 to-violet-400 opacity-60" />

      {/* ── Grain texture overlay ────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.018] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px',
        }}
      />


      {/* ── Main content ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── MOBILE layout ──────────────────────────────────── */}
        <div className="sm:hidden">

          {/* Brand block */}
          <div className="flex flex-col items-center mb-8 text-center">
            <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
              <img
                src="/masasilam-logo.svg"
                alt="MasasilaM"
                className="h-9 w-auto object-contain dark:invert transition-[filter] duration-300
                           group-hover:opacity-80"
              />
            </Link>
            <p className="text-xs leading-relaxed text-stone-500 dark:text-slate-500 max-w-xs mb-5">
              Perpustakaan digital untuk karya domain publik dan yang terbengkalai dan yang terdegradasi.
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-200
                                bg-stone-50 border-stone-200 text-stone-400
                                hover:scale-110 active:scale-95
                                dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500
                                ${s.hoverBg} ${s.hoverText} ${s.hoverBorder}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Nav columns — 3 col */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {navColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[9px] font-black uppercase tracking-[0.15em] mb-3
                               text-stone-400 dark:text-slate-600">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map(({ to, label, icon: Icon, accent }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`group flex items-center gap-1 text-xs leading-tight
                                   text-stone-500 dark:text-slate-500 transition-colors
                                   ${accent || 'hover:text-stone-800 dark:hover:text-slate-200'}`}
                      >
                        {Icon && <Icon className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />}
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP layout ─────────────────────────────────── */}
        <div className="hidden sm:grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-14">

          {/* Brand column */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <img
                src="/masasilam-logo.svg"
                alt="MasasilaM"
                className="h-8 w-auto object-contain dark:invert transition-[filter] duration-300
                           group-hover:opacity-80"
              />
            </Link>

            <p className="text-xs text-stone-500 dark:text-slate-500 leading-relaxed mb-5 max-w-[220px]">
              Perpustakaan digital untuk karya domain publik dan yang terbengkalai dan yang terdegradasi.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-200
                                bg-stone-50 border-stone-200 text-stone-400
                                hover:scale-110 active:scale-95
                                dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500
                                ${s.hoverBg} ${s.hoverText} ${s.hoverBorder}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] mb-5
                             text-stone-400 dark:text-slate-600">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map(({ to, label, icon: Icon, accent }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`group flex items-center gap-2 text-sm transition-colors duration-200
                                 text-stone-500 dark:text-slate-500
                                 ${accent || 'hover:text-stone-800 dark:hover:text-slate-200'}`}
                    >
                      {Icon && (
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                      )}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="border-t border-stone-100 dark:border-slate-800/60">
        <div className="container mx-auto px-4 sm:px-6 py-4
                        flex flex-row items-center justify-between gap-3">
          {/* Copyright dengan coret — filosofi domain publik */}
          <p className="text-xs text-stone-400 dark:text-slate-600 flex items-center gap-1.5">
            <span className="relative inline-block">
              ©
              <span className="absolute top-[45%] left-[-6%] w-[112%] h-0
                               border-t-[0.11em] border-red-400/70 dark:border-red-500/60
                               rotate-[-38deg]" />
            </span>
            <span>{currentYear}</span>
            <span className="font-semibold text-stone-600 dark:text-slate-400">MasasilaM</span>
          </p>

          <p className="text-xs text-stone-300 dark:text-slate-700 flex items-center gap-1">
            Dibikin dengan <Heart className="w-3 h-3 text-red-400 fill-red-400 mx-0.5" />
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer