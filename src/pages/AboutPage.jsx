import { useState, useEffect, useRef } from 'react'
import { Book, Heart, Users, Globe, Target, Zap, Award, TrendingUp, Lock, Mail, Instagram, X, BookOpen, CheckCircle2, Film, Layers, Newspaper } from 'lucide-react'
import bookService from '../services/bookService'
import userService from '../services/userService'
import { filmService } from '../services/filmService'
import zineService from '../services/zineService'
import api from '../services/api'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import { generateOrganizationStructuredData, generateFAQStructuredData, generateArticleStructuredData } from '../utils/seoHelpers'

// ─── StatCard — animasi counter sederhana, mirip kode asli ─────────────────
// Tidak perlu trigger/flag — cukup jalankan animasi saat value > 0 pertama kali
const StatCard = ({ icon: Icon, value, label, color }) => {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!value || started.current) return
    started.current = true
    const duration = 1600
    let startTs = null
    const tick = (ts) => {
      if (!startTs) startTs = ts
      const p = Math.min((ts - startTs) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color.bg}`}>
        <Icon className={`w-5 h-5 ${color.text}`} aria-hidden="true" />
      </div>
      <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400 leading-none mb-1 tabular-nums">
        {count.toLocaleString('id-ID')}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-stone-500 dark:text-white/40 mt-1 leading-tight">
        {label}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const AboutPage = () => {
  const [stats, setStats] = useState({
    totalBooks: 0, totalZines: 0, totalFilms: 0,
    totalArticles: 0, totalUsers: 0, totalAuthors: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          bookService.getBooks({ page: 1, limit: 1 }),          // [0] books
          bookService.getAuthors(1, 1),                          // [1] authors
          userService.getAllUsers(),                              // [2] users
          zineService.getZines({ page: 1, limit: 1 }),           // [3] zines
          filmService.getFilms({ page: 0, size: 1 }),            // [4] films
          api.get('/newspapers/stats'),                          // [5] newspaper stats
        ])

        const safe = (r, fn, fallback = 0) => {
          try { return r.status === 'fulfilled' ? fn(r.value) : fallback }
          catch { return fallback }
        }

        const totalBooks    = safe(results[0], r => r.data?.total || r.data?.data?.total || 0)
        const totalAuthors  = safe(results[1], r => r.data?.total || r.data?.data?.total || 0)
        const totalUsers    = safe(results[2], r => r.data?.length || r.data?.data?.length || 0)
        const totalZines    = safe(results[3], r => r.data?.total || r.data?.data?.total || 0)
        const totalFilms    = safe(results[4], r => r.data?.total || r.data?.data?.total || 0)
        // /newspapers/stats returns { data: { data: { totalArticles, totalSources, ... } } }
        const totalArticles = safe(results[5], r =>
          r.data?.data?.totalArticles || r.data?.totalArticles || 0
        )

        setStats({ totalBooks, totalZines, totalFilms, totalArticles, totalUsers, totalAuthors })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  const displayStats = [
    { icon: Book,      value: stats.totalBooks,    label: 'Buku',       color: { text: 'text-amber-400',   bg: 'bg-amber-400/10'   } },
    { icon: Layers,    value: stats.totalZines,    label: 'Zine & Magazine',     color: { text: 'text-emerald-400', bg: 'bg-emerald-400/10' } },
    { icon: Film,      value: stats.totalFilms,    label: 'Film',        color: { text: 'text-blue-400',    bg: 'bg-blue-400/10'    } },
    { icon: Newspaper, value: stats.totalArticles, label: 'Arsip Koran',        color: { text: 'text-violet-400',  bg: 'bg-violet-400/10'  } },
    { icon: Users,     value: stats.totalUsers,    label: 'Kawan yang Mendaftar', color: { text: 'text-pink-400',    bg: 'bg-pink-400/10'    } },
    { icon: Heart,     value: stats.totalAuthors,  label: 'Penulis',            color: { text: 'text-rose-400',    bg: 'bg-rose-400/10'    } },
  ]

  const values = [
    { icon: Target, title: 'User-Centric', description: 'Interface yang nyaman berdasarkan kebutuhan kawan-kawan' },
    { icon: Award, title: 'Quality Over Quantity', description: 'Fokus pada kualitas fitur dan konten' },
    { icon: Lock, title: 'Privacy & Security', description: 'Data kawan-kawan adalah prioritas tertinggi' },
    { icon: Users, title: 'Inclusivity', description: 'Platform untuk semua orang tanpa diskriminasi' },
    { icon: TrendingUp, title: 'Continuous Improvement', description: 'Selalu belajar dan berkembang' },
    { icon: Heart, title: 'Community-Driven', description: 'Mendengarkan dan kolaborasi dengan komunitas' },
  ]

  const missions = [
    'Preservasi: Merevitalisasi karya literasi dan sinema Indonesia masa lalu bebas hak cipta ke dalam format digital modern.',
    'Aksesibilitas: Menyajikan pengalaman eksplorasi media masa silam yang mulus, nyaman, dan ramah pengguna.',
    'Konektivitas: Membuka gerbang warisan masa lalu untuk audiens masa kini, melampaui batas ruang dan waktu.',
  ]

  const features = [
    'Baca tanpa batas tanpa iklan',
    'Bookmark, highlight, dan note',
    'Analisis dan pola membaca',
    'Pencapaian dan gamifikasi',
    'Rekomendasi yang dipersonalisasi',
    'Kalender membaca dan pelacakan streak',
    'Perbaikan typo pada teks buku',
    'Pencarian dalam buku dengan pratinjau konteks',
    'Fitur sosial (ulasan, penilaian, diskusi)',
  ]

  const socialLinks = [
    { icon: X, label: 'X', url: 'https://x.com/masasilamdotcom' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/masasilamdotcom' },
    { icon: Mail, label: 'Email', url: 'mailto:info@masa-silam.com' },
  ]

  const organizationSchema = generateOrganizationStructuredData()
  const faqData = [
    { question: 'Apa itu MasasilaM?', answer: 'MasasilaM adalah perpustakaan digital gratis untuk buku-buku domain publik. Kami menyediakan akses ke ribuan buku klasik dengan fitur smart reading, bookmark, highlight, dan banyak lagi.' },
    { question: 'Apakah semua buku gratis?', answer: 'Ya! Semua buku di MasasilaM adalah domain publik dan dapat diakses secara gratis tanpa batas.' },
    { question: 'Bagaimana cara menggunakan MasasilaM?', answer: 'Cukup daftar akun gratis, lalu Anda dapat mulai membaca, membuat bookmark, highlight, dan berinteraksi dengan komunitas pembaca lainnya.' },
    { question: 'Apa itu domain publik?', answer: 'Domain publik adalah karya yang tidak lagi dilindungi hak cipta dan dapat digunakan, dibagikan, dan dimodifikasi secara bebas oleh siapa saja.' },
  ]
  const faqSchema = generateFAQStructuredData(faqData)
  const articleSchema = generateArticleStructuredData({
    title: 'Tentang MasasilaM - Perpustakaan Digital Domain Publik dan Yang Terbengkalai dan Yang Terdegradasi',
    description: 'MasasilaM adalah perpustakaan digital gratis untuk buku-buku domain publik dan yang terbengkalai dan yang terdegradasi dengan fitur smart reading dan komunitas pembaca aktif.',
    url: '/tentang',
    publishedAt: '2025-01-01',
    modifiedAt: new Date().toISOString(),
  })

  return (
    <>
      <SEO
        title="Tentang Kami - MasasilaM"
        description="MasasilaM adalah perpustakaan digital gratis untuk buku, majalah, koran, zine dan film domain publik dan yang terbengkalai dan yang terdegradasi. Platform perpustakaan digital dengan fitur smart reading, komunitas aktif, dan komitmen pada literasi digital untuk semua."
        url="/tentang"
        type="website"
        keywords="tentang masasilam, perpustakaan digital, domain publik, literasi digital, buku gratis, majalah gratis, koran gratis, film, gratis, visi misi, uncopyright"
        structuredData={[organizationSchema, faqSchema, articleSchema]}
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 pb-20 transition-colors duration-300 motion-reduce:transition-none">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-20 sm:py-28 text-center px-4">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
            <div className="w-[700px] h-[400px] rounded-full bg-amber-100/60 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>

          {/* Logo */}
          <div className="relative inline-flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-amber-100/60 dark:bg-amber-900/15 blur-2xl" />
              <img
                src="/masasilam-logo.svg"
                alt="MasasilaM"
                className="relative h-24 sm:h-32 lg:h-40 w-auto object-contain dark:invert drop-shadow-sm"
              />
            </div>
            <span className="mt-3 bg-emerald-500 text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm tracking-wide">
              Domain Publik dan yang Terbengkalai dan yang Terdegradasi
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-5 text-stone-900 dark:text-white">
            Masa<span className="text-amber-500 dark:text-amber-400">silaM</span>
          </h1>

          <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-10 font-light">
            PERPUSTAKAAN DIGITAL<br/>Domain Publik<br/>dan yang Terbengkalai dan yang Terdegradasi
          </p>

          <a
            href="/buku"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full text-sm font-medium transition-all motion-reduce:transition-none hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/20 dark:hover:shadow-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Mulai Membaca Sekarang
          </a>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────────── */}
        <div className="bg-stone-100 dark:bg-slate-900 border-y border-stone-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-6 divide-x divide-stone-200 dark:divide-white/5 divide-y sm:divide-y-0">
            {displayStats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Manifesto */}
          <section className="mt-16 sm:mt-20">
            <div className="relative bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl overflow-hidden">
              {/* Decorative quote mark */}
              <span className="pointer-events-none absolute top-4 left-8 text-[140px] leading-none font-serif text-amber-400/10 select-none" aria-hidden="true">❝</span>
              {/* Glow */}
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative z-10 p-8 sm:p-12 space-y-5">
                <p className="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-white/75">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold text-xl">Bukan Kuil Budaya</span>, lantaran memang tak sebanding dengan perpustakaan Alexandria yang pernah kesohor itu. Tapi di sini, siapa pun juga dapat menemukan buku, film, majalah, zine, koran—<em className="text-amber-600 dark:text-amber-300">gratis!</em>
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-white/75">
                  Biarpun didirikan dengan semen selundupan, <span className="text-amber-600 dark:text-amber-400 font-semibold">MasasilaM</span> diharapkan dapat menjadi perpustakaan umum dan ruang pengarsipan dengan ruang baca yang nyaman.
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-white/75">
                  Di sini kami merakit, membikin, dan berbagi file; mengedarkan relik-relik yang kami pungut dari segara internet dan segala penjurunya, menyuntingnya, sambil menyanyikan lagu-lagu rohani dan himne Indonesia Raya.
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-center text-stone-900 dark:text-white pt-2">
                  Bersenang-senanglah!
                </p>
              </div>
            </div>
          </section>

          {/* Vision & Mission */}
          <section className="mt-16 sm:mt-20">
            <SectionLabel emoji="🎯" text="Visi & Misi" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-7 sm:p-8">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center mb-5">
                  <Target className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">Visi Kami</h2>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  Menjadi perpustakaan digital abadi bagi warisan literasi dan sinema Indonesia..
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-7 sm:p-8">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-5">
                  <Zap className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">Misi Kami</h2>
                <ul className="space-y-3">
                  {missions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>


          {/* Values */}
          <section className="mt-16 sm:mt-20">
            <SectionLabel emoji="💎" text="Nilai-Nilai Kami" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-8 text-center">
              Nilai-Nilai Kami
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {values.map((v, i) => {
                const Icon = v.icon
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-1 transition-all duration-200 motion-reduce:transition-none group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors motion-reduce:transition-none">
                      <Icon className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold text-stone-800 dark:text-slate-200 mb-1.5">{v.title}</h3>
                    <p className="text-xs text-stone-400 dark:text-slate-500 leading-relaxed">{v.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Manifesto / Uncopyright */}
          <section className="mt-16 sm:mt-20">
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 px-7 sm:px-10 py-6 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border-b border-stone-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-medium text-stone-400 dark:text-slate-500 mb-0.5">Pernyataan</p>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Manifesto</h2>
                </div>
              </div>
              {/* Body */}
              <div className="px-7 sm:px-10 py-8 space-y-4">
                {[
                  <>Hak cipta biasanya memberitahu apa yang tidak boleh dilakukan. Sebaliknya, pernyataan ini hadir untuk <strong className="text-emerald-600 dark:text-emerald-400 font-medium">menegaskan kebebasan</strong>.</>,
                  <>Teks dan karya seni yang termuat di MasasilaM diyakini telah berada dalam <strong className="font-medium text-stone-800 dark:text-slate-200">domain publik</strong> atau berlisensi <strong className="font-medium text-stone-800 dark:text-slate-200">Creative Commons</strong>. Kami meyakini bahwa segala aktivitas non-penulisan yang dilakukan atas karya domain publik—seperti digitalisasi, penyuntingan, atau penataan tipografi—tidak menciptakan hak cipta baru. Tidak seorang pun dapat mengklaim hak milik atas pekerjaan semacam itu.</>,
                  <>Para kontributor MasasilaM—baik yang menyumbangkan teks, koreksi, kode, atau desain—secara sadar melepaskan hasil kerja mereka di bawah ketentuan{' '}<a href="https://creativecommons.org/publicdomain/zero/1.0/deed.id" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">CC0 1.0 Universal Public Domain Dedication</a> dan/atau <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.id" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Creative Commons Atribusi-BerbagiSerupa 4.0 Internasional (CC BY-SA 4.0)</a>. Ini adalah penyerahan sepenuhnya segala upaya mereka ke ranah publik.</>,
                  <>Pernyataan ini adalah perwujudan dari <em>produksi nonpasar</em>, sebuah langkah yang menolak &quot;hasrat bergelora untuk menyimpan dan mempertahankan&quot; kepemilikan.</>,
                ].map((para, i) => (
                  <p key={i} className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-slate-400">{para}</p>
                ))}

                <div className="pt-4 border-t border-stone-200 dark:border-slate-800">
                  <p className="text-sm sm:text-base leading-relaxed font-medium text-stone-900 dark:text-white">
                    Upaya ini dilakukan demi memperkaya khazanah literasi, untuk menumbuhkan kebudayaan bebas dan merdeka, serta mengembalikan privilese kepada ruang kebebasan yang telah memberi kami begitu banyak.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Copyright Complaint */}
          <section className="mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border border-amber-200 dark:border-amber-800/40 rounded-3xl p-7 sm:p-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Pelanggaran Hak Cipta?
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-slate-400 mb-3">
                Meskipun kami berupaya memastikan seluruh konten di MasasilaM berada dalam domain publik atau berlisensi Creative Commons, kami menyadari kemungkinan adanya kekeliruan. Jika Anda meyakini bahwa suatu karya di sini melanggar hak cipta Anda atau pihak lain, mohon segera hubungi kami.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-slate-400 mb-6">
                Laporan akan kami tindaklanjuti sesegera mungkin, dan konten yang terbukti bermasalah akan segera diturunkan.
              </p>
              <a
                href="mailto:info@masa-silam.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full text-sm font-medium transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Kirim Laporan ke info@masa-silam.com
              </a>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-10">
            <div className="relative bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl overflow-hidden px-8 sm:px-14 py-14 sm:py-16 text-center">
              {/* Glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl" />
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white mb-8 relative">
                Bergabunglah dengan Kami
              </h2>

              <a
                href="/buku"
                className="inline-flex items-center gap-2.5 px-10 py-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-900 rounded-full font-semibold text-base transition-all motion-reduce:transition-none hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-400/30 mb-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
              >
                <Book className="w-5 h-5" aria-hidden="true" />
                Mulai Membaca Sekarang
              </a>

              <div className="border-t border-stone-200 dark:border-white/10 pt-8 relative">
                <p className="text-xs uppercase tracking-widest font-medium text-stone-500 dark:text-white/40 mb-5">
                  Ikuti kami di sosial media
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {socialLinks.map(({ icon: Icon, label, url }, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/8 border border-stone-300 dark:border-white/12 text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:bg-white/15 dark:hover:text-white text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

// ─── Small helper: section label pill ───────────────────────────────────────
const SectionLabel = ({ emoji, text }) => (
  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full w-fit mb-5">
    <span aria-hidden="true">{emoji}</span>
    <span>{text}</span>
  </div>
)

export default AboutPage