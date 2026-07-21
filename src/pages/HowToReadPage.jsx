import { BookOpen, Download, Search, Bookmark, MessageSquare, TrendingUp, FileText, Eye, Clock, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import SEO from '../components/Common/SEO'

const features = [
  {
    icon: Search,
    number: '01',
    title: 'Mencari & Menemukan',
    description: 'Gunakan fitur pencarian untuk menemukan buku berdasarkan judul, penulis, atau konten dalam buku.',
    accent: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40', badge: 'bg-amber-500' },
  },
  {
    icon: BookOpen,
    number: '02',
    title: 'Membaca Buku',
    description: 'Nikmati pengalaman membaca optimal dengan navigasi bab hierarki, mode membaca responsif, dan estimasi waktu baca. Progress tersimpan otomatis.',
    tips: ['Gunakan breadcrumb untuk tracking posisi Anda', 'Akses daftar isi interaktif dengan mudah', 'Lanjutkan dari posisi terakhir kapan saja'],
    accent: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', badge: 'bg-emerald-500' },
  },
  {
    icon: Bookmark,
    number: '03',
    title: 'Bookmark & Anotasi',
    description: 'Tandai halaman favorit, sorot teks penting, dan tulis catatan pribadi. Semua anotasi tersimpan dengan posisi tepat dan bisa diekspor kapan saja.',
    tips: ['Setiap bookmark menyimpan konteks bab', 'Highlight mencatat teks dan posisi lengkap'],
    accent: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/40', badge: 'bg-blue-500' },
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Progress Tracking',
    description: 'Sistem mencatat progress membaca Anda secara real-time. Lihat persentase penyelesaian, waktu membaca, kecepatan (WPM), dan estimasi waktu tersisa.',
    tips: ['Cek statistik detail di Dashboard', 'Pantau streak membaca Anda'],
    accent: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800/40', badge: 'bg-violet-500' },
  },
  {
    icon: MessageSquare,
    number: '05',
    title: 'Review & Diskusi',
    description: 'Beri rating dan review buku, diskusikan bab tertentu dengan pembaca lain, dan bagikan insight Anda. Like komentar menarik dan tandai spoiler.',
    tips: ['Review membantu pembaca lain menemukan buku bagus', 'Diskusi per bab lebih fokus dan kontekstual', 'Apresiasi review berkualitas dengan helpful vote'],
    accent: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800/40', badge: 'bg-rose-500' },
  },
  {
    icon: FileText,
    number: '06',
    title: 'Search in Book',
    description: 'Cari kata atau frasa dalam seluruh buku dengan hasil kontekstual. Lihat konteks sebelum dan sesudah hasil pencarian dengan highlighting otomatis.',
    tips: ['Gunakan untuk riset cepat tanpa scroll panjang', 'Jump langsung ke halaman hasil'],
    accent: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40', badge: 'bg-amber-500' },
  },
  {
    icon: Download,
    number: '07',
    title: 'Download EPUB',
    description: 'Download buku dalam format EPUB untuk membaca offline di aplikasi favorit Anda. Cocok untuk dibaca di Calibre, Lithium, atau aplikasi e-reader lainnya.',
    tips: ['Download untuk dibaca di aplikasi favorit', 'Format EPUB kompatibel dengan semua e-reader', 'Untuk Android, rekomendasikan aplikasi Lithium'],
    accent: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', badge: 'bg-emerald-500' },
  },
  {
    icon: Eye,
    number: '08',
    title: 'Analytics',
    description: 'Lihat statistik membaca Anda: grafik harian/mingguan, breakdown genre, peak reading times, dan trend analysis. Visualisasi lengkap kebiasaan membaca Anda.',
    tips: ['Grafik visualisasi membantu tracking kebiasaan', 'Lihat kalender rutinitas membaca', 'Temukan pola waktu membaca terbaik Anda'],
    accent: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/40', badge: 'bg-blue-500' },
  },
]

const stats = [
  { value: '∞', label: 'Buku, Majalah & Film Gratis' },
  { value: '20+', label: 'Fitur Lengkap' },
  { value: '100%', label: 'Gratis & Legal' },
  { value: '24/7', label: 'Akses Penuh' },
]

const steps = [
  { num: '1', title: 'Daftar Gratis', desc: 'Buat akun untuk akses penuh semua fitur' },
  { num: '2', title: 'Pilih Buku', desc: 'Jelajahi karya-karya klasik berkualitas' },
  { num: '3', title: 'Mulai Baca', desc: 'Nikmati pengalaman membaca terbaik' },
  { num: '4', title: 'Bagikan', desc: 'Review dan diskusi dengan komunitas' },
]

const HowToReadPage = () => (
  <>
    <SEO
      title="Panduan Membaca — MasasilaM"
      description="Pelajari cara menggunakan semua fitur MasasilaM: baca buku, buat anotasi, tracking progress, diskusi komunitas, dan banyak lagi."
      url="/cara-membaca"
      type="website"
      keywords="panduan membaca, cara membaca, fitur masasilam, tutorial, anotasi, bookmark, progress tracking"
    />

    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300 motion-reduce:transition-none flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div className="w-[700px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60 dark:opacity-80" />

        <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mb-6 border border-amber-200 dark:border-amber-800/40">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Panduan Platform
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
            Cara Membaca di<br />
            <span className="text-amber-500 dark:text-amber-400">MasasilaM</span>
          </h1>
          <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Platform perpustakaan digital dengan fitur-fitur modern untuk pengalaman membaca yang produktif, menyenangkan, dan bermakna.
          </p>
          <a
            href="/daftar"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-900 rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/30 dark:hover:shadow-amber-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            Mulai Sekarang — Gratis
          </a>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      <div className="bg-stone-100 dark:bg-slate-900 border-y border-stone-200 dark:border-slate-800">
        <div className="container mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 dark:divide-white/5 divide-y sm:divide-y-0">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center py-6 px-3 text-center">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 leading-none mb-1">{value}</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-stone-500 dark:text-white/40 mt-1 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section className="mt-14 sm:mt-20">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full w-fit mb-6 border border-transparent dark:border-amber-800/40">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" /> Fitur Lengkap
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-10">
            Semua yang kamu butuhkan
          </h2>

          <div className="space-y-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden transition-all duration-300 motion-reduce:transition-none hover:shadow-lg dark:hover:shadow-black/30 ${f.accent.border}`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Left — number + icon */}
                    <div className={`flex-shrink-0 sm:w-48 flex sm:flex-col items-center sm:items-center justify-start sm:justify-center gap-4 sm:gap-3 px-6 sm:px-8 py-6 sm:py-8 ${f.accent.bg}`}>
                      <span className={`font-serif text-4xl sm:text-5xl font-black opacity-20 dark:opacity-30 ${f.accent.text}`}>{f.number}</span>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${f.accent.bg} border ${f.accent.border}`}>
                        <Icon className={`w-6 h-6 ${f.accent.text}`} aria-hidden="true" />
                      </div>
                    </div>

                    {/* Right — content */}
                    <div className="flex-1 px-6 sm:px-8 py-6 sm:py-8 border-t sm:border-t-0 sm:border-l border-stone-100 dark:border-slate-800">
                      <h3 className={`font-serif text-xl sm:text-2xl font-bold mb-2 ${f.accent.text}`}>{f.title}</h3>
                      <p className="text-sm sm:text-base text-stone-600 dark:text-slate-400 leading-relaxed mb-5">{f.description}</p>
                      {f.tips && f.tips.length > 0 && (
                        <div className="space-y-2">
                          {f.tips.map((tip, j) => (
                            <div key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-500 dark:text-slate-400">
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${f.accent.text}`} aria-hidden="true" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── GETTING STARTED ──────────────────────────────────────── */}
        <section className="mt-14 sm:mt-20">
          <div className="bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400/70 mb-4">
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> Mulai Perjalanan
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-10">
                Mulai dalam 4 langkah mudah
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {steps.map(({ num, title, desc }, i) => (
                  <div key={i} className="relative">
                    {i < steps.length - 1 && (
                      <div className="hidden sm:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-stone-300 dark:bg-white/10" aria-hidden="true" />
                    )}
                    <div className="relative bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl p-5 text-center hover:bg-stone-50 dark:hover:bg-white/10 transition-colors motion-reduce:transition-none h-full">
                      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-4">
                        <span className="text-stone-900 font-bold text-lg">{num}</span>
                      </div>
                      <h3 className="font-semibold text-stone-900 dark:text-white text-sm mb-1.5">{title}</h3>
                      <p className="text-[11px] text-stone-500 dark:text-white/40 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SUPPORT ──────────────────────────────────────────────── */}
        <section className="mt-8 mb-16">
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:info@masa-silam.com"
              className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl hover:border-amber-400 dark:hover:border-amber-500 transition-all motion-reduce:transition-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors motion-reduce:transition-none">
                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white text-sm">Email Support</p>
                <p className="text-xs text-stone-500 dark:text-slate-400">info@masa-silam.com</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 dark:text-slate-600 ml-auto group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all motion-reduce:transition-none flex-shrink-0" aria-hidden="true" />
            </a>
            <a
              href="/faq"
              className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl hover:border-amber-400 dark:hover:border-amber-500 transition-all motion-reduce:transition-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors motion-reduce:transition-none">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white text-sm">Lihat FAQ</p>
                <p className="text-xs text-stone-500 dark:text-slate-400">Jawaban untuk pertanyaan umum</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 dark:text-slate-600 ml-auto group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all motion-reduce:transition-none flex-shrink-0" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  </>
)

export default HowToReadPage