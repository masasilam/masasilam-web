import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react'
import SEO from '../components/Common/SEO'

const categories = [
  { id: 'all',       name: 'Semua',    emoji: '📚' },
  { id: 'general',   name: 'Umum',     emoji: '❓' },
  { id: 'account',   name: 'Akun',     emoji: '👤' },
  { id: 'reading',   name: 'Membaca',  emoji: '📖' },
  { id: 'features',  name: 'Fitur',    emoji: '⚙️' },
  { id: 'technical', name: 'Teknis',   emoji: '🔧' },
]

const faqs = [
  { category: 'general',   question: 'Apa itu MasasilaM?',                        answer: 'MasasilaM adalah platform digital yang menyediakan koleksi buku, zine, film, dan koran secara gratis. Kami fokus pada karya-karya tentang Indonesia yang terbengkalai, terdegradasi, dan yang telah masuk ke domain publik.' },
  { category: 'general',   question: 'Apakah MasasilaM benar-benar gratis?',       answer: 'Ya, MasasilaM tidak memungut biaya berlangganan, tidak ada biaya tersembunyi, dan tanpa iklan.' },
  { category: 'general',   question: 'Apakah kontennya legal?',                    answer: 'Semua buku, majalah, zine, koran, dan film di MasasilaM adalah karya dengan hak cipta yang sudah habis masa berlakunya (domain publik) atau memiliki lisensi distribusi terbuka.' },
  { category: 'general',   question: 'Apakah saya dapat berkontribusi?',           answer: 'Ya! Kami bersedia menerima kontribusi dalam bentuk apapun, seperti konten atau saran karya-karya yang terlupakan. Kontak kami lewat media sosial atau info@masa-silam.com.' },
  { category: 'account',   question: 'Apakah saya perlu mendaftar?',               answer: 'Tidak wajib, tetapi sangat disarankan agar Anda dapat menyimpan progress membaca, membuat anotasi, mendapatkan rekomendasi personal, mengakses statistik, dan berpartisipasi dalam diskusi komunitas.' },
  { category: 'account',   question: 'Bagaimana cara membuat akun?',               answer: 'Klik tombol "Daftar" di pojok kanan atas, isi formulir dengan Username, Email, dan Password. Lalu verifikasi email Anda melalui link yang dikirimkan. Proses ini hanya membutuhkan waktu kurang dari 2 menit.' },
  { category: 'account',   question: 'Saya tidak menerima email verifikasi, bagaimana?', answer: 'Coba langkah berikut: (1) Cek folder Spam/Junk, (2) Gunakan fitur "Kirim Ulang Email Verifikasi", (3) Pastikan email Anda benar, (4) Hubungi info@masa-silam.com jika masih bermasalah.' },
  { category: 'account',   question: 'Bagaimana cara reset password?',             answer: 'Klik "Lupa Password" di halaman login, masukkan email terdaftar, cek email untuk link reset, lalu buat password baru. Link reset berlaku selama 1 jam.' },
  { category: 'account',   question: 'Apakah data saya aman?',                    answer: 'Sangat aman. Kami menggunakan enkripsi SSL/TLS untuk semua koneksi, hashing bcrypt untuk password, dan token JWT untuk autentikasi. Data Anda tidak dijual ke pihak ketiga dalam bentuk apapun.' },
  { category: 'reading',   question: 'Format buku apa yang didukung?',             answer: 'Saat ini kami mendukung format EPUB dan HTML. Buku ditampilkan dalam format responsif untuk pengalaman membaca optimal di semua perangkat.' },
  { category: 'reading',   question: 'Bagaimana cara mencari buku?',               answer: 'Gunakan search bar di header, atau gunakan filter lanjutan untuk mencari berdasarkan genre, penulis, tahun publikasi, bahasa, tingkat kesulitan, dan rating pembaca.' },
  { category: 'reading',   question: 'Apakah saya bisa download buku?',            answer: 'Ya! Klik tombol "Download" di halaman detail buku untuk mengunduh dalam format EPUB original. Untuk membaca di Android, kami sangat merekomendasikan aplikasi Lithium.' },
  { category: 'reading',   question: 'Apakah progress membaca saya tersimpan?',    answer: 'Ya, secara otomatis! Sistem kami menyimpan posisi terakhir membaca, bab yang sudah selesai, persentase penyelesaian, dan total waktu membaca — tersinkron real-time di semua perangkat Anda.' },
  { category: 'reading',   question: 'Bisakah saya membaca offline?',              answer: 'Untuk membaca offline, download buku dalam format EPUB dan buka dengan aplikasi pembaca favorit seperti Calibre atau Lithium. Platform web kami memerlukan koneksi internet.' },
  { category: 'features',  question: 'Apa perbedaan Bookmark, Highlight, dan Notes?', answer: 'Bookmark: Tandai halaman/posisi tertentu untuk referensi cepat. Highlight: Sorot teks spesifik yang penting dengan berbagai warna. Notes: Tulis catatan lengkap dengan pemikiran Anda di posisi manapun dalam buku.' },
  { category: 'features',  question: 'Berapa banyak anotasi yang bisa saya buat?', answer: 'Tidak ada batasan! Buat sebanyak yang Anda butuhkan. Semua anotasi Anda bersifat private dan hanya Anda yang bisa melihatnya, kecuali Anda memilih untuk membagikannya.' },
  { category: 'features',  question: 'Apa itu Reading Streak?',                    answer: 'Reading Streak adalah jumlah hari berturut-turut Anda membaca. Jaga streak untuk unlock achievement! Fitur ini membantu membangun kebiasaan membaca yang konsisten dan menyenangkan.' },
  { category: 'features',  question: 'Bagaimana cara menulis review?',             answer: 'Buka halaman buku, scroll ke section "Review", klik "Tulis Review", beri rating bintang (0.5–5.0) dan tulis ulasan Anda, lalu submit. Review dapat diedit atau dihapus kapan saja.' },
  { category: 'technical', question: 'Perangkat apa saja yang didukung?',          answer: 'MasasilaM dapat diakses melalui browser desktop (Chrome, Firefox, Safari, Edge) dan browser mobile (iOS Safari, Android Chrome). Platform kami sepenuhnya responsif di semua ukuran layar.' },
  { category: 'technical', question: 'Browser apa yang paling direkomendasikan?',  answer: 'Chrome, Firefox, atau Safari versi terbaru untuk pengalaman optimal. Kami secara rutin menguji kompatibilitas di semua browser modern.' },
  { category: 'technical', question: 'Kenapa buku tidak loading?',                 answer: 'Coba: (1) Refresh halaman, (2) Clear browser cache dan cookies, (3) Cek koneksi internet, (4) Coba browser lain, (5) Lapor ke info@masa-silam.com jika masih terjadi.' },
  { category: 'technical', question: 'Apakah ada aplikasi mobile?',                answer: 'Belum tersedia aplikasi native, tetapi website kami fully responsive dan bekerja sempurna di mobile browser. Aplikasi native sedang dalam roadmap pengembangan kami.' },
]

const AccordionItem = ({ faq, isOpen, onToggle, index }) => {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 motion-reduce:transition-none ${isOpen ? 'border-amber-300 dark:border-amber-700/60 shadow-sm shadow-amber-100/50 dark:shadow-amber-900/20' : 'border-stone-200 dark:border-slate-800'} bg-white dark:bg-slate-900`}>
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-stone-50 dark:hover:bg-slate-800/60 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
        >
          <span className="flex items-start gap-4 pr-4 min-w-0">
            <span className={`flex-shrink-0 text-[11px] font-black tabular-nums mt-0.5 ${isOpen ? 'text-amber-500' : 'text-stone-300 dark:text-slate-600'}`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`font-semibold text-sm sm:text-base leading-snug ${isOpen ? 'text-amber-700 dark:text-amber-300' : 'text-stone-800 dark:text-slate-200'}`}>
              {faq.question}
            </span>
          </span>
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors motion-reduce:transition-none ${isOpen ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-stone-100 dark:bg-slate-800'}`}>
            {isOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              : <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" aria-hidden="true" />}
          </span>
        </button>
      </h3>
      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="px-6 pb-5 border-t border-stone-100 dark:border-slate-800">
          <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-slate-400 pt-4 sm:pl-8">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  )
}

const FAQPage = () => {
  const [openIndex, setOpenIndex]         = useState(null)
  const [searchQuery, setSearchQuery]     = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => faqs.filter(f => {
    const matchCat    = activeCategory === 'all' || f.category === activeCategory
    const q           = searchQuery.toLowerCase()
    const matchSearch = f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    return matchCat && matchSearch
  }), [activeCategory, searchQuery])

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <>
      <SEO
        title="FAQ — Pertanyaan yang Sering Diajukan — MasasilaM"
        description="Temukan jawaban untuk pertanyaan umum seputar MasasilaM: akun, membaca, fitur, teknis, dan lainnya."
        url="/faq"
        type="website"
        keywords="faq, pertanyaan, bantuan, help, masasilam, cara penggunaan"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300 motion-reduce:transition-none flex flex-col">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60 dark:opacity-80" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mb-6 border border-amber-200 dark:border-amber-800/40">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Bantuan
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
              Pertanyaan Umum
            </h1>
            <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
              Temukan jawaban untuk pertanyaan umum tentang MasasilaM.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                placeholder="Cari pertanyaan..."
                aria-label="Cari pertanyaan"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setOpenIndex(null) }}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 text-sm transition-all motion-reduce:transition-none"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">

          {/* ── CATEGORIES ────────────────────────────────────────── */}
          <section className="mt-8 sm:mt-10">
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Filter kategori">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenIndex(null) }}
                  aria-pressed={activeCategory === cat.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-200/60 dark:shadow-amber-900/30'
                      : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600'
                  }`}
                >
                  <span aria-hidden="true">{cat.emoji}</span> {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* ── COUNT ─────────────────────────────────────────────── */}
          <div className="mt-6 text-center text-xs text-stone-400 dark:text-slate-500" role="status" aria-live="polite">
            Menampilkan <span className="font-semibold text-stone-600 dark:text-slate-300">{filtered.length}</span> dari {faqs.length} pertanyaan
          </div>

          {/* ── FAQ LIST ──────────────────────────────────────────── */}
          <section className="mt-4 mb-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-stone-300 dark:text-slate-600" aria-hidden="true" />
                </div>
                <p className="font-semibold text-stone-600 dark:text-slate-400 mb-1">Tidak ada hasil</p>
                <p className="text-sm text-stone-400 dark:text-slate-500">Coba kata kunci lain atau pilih kategori berbeda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((faq, i) => (
                  <AccordionItem
                    key={`${faq.category}-${faq.question}`}
                    index={i}
                    faq={faq}
                    isOpen={openIndex === i}
                    onToggle={() => toggle(i)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── CTA ───────────────────────────────────────────────── */}
          <section className="mb-16">
            <div className="bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden text-center">
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center mx-auto mb-5">
                  <MessageCircle className="w-7 h-7 text-amber-400" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-3">Masih Ada Pertanyaan?</h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
                  Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="mailto:info@masa-silam.com"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-900 rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> Email Kami
                  </a>
                  <a
                    href="/kontak"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-stone-900/5 hover:bg-stone-900/10 active:bg-stone-900/15 dark:bg-white/10 dark:hover:bg-white/15 dark:active:bg-white/20 border border-stone-300 dark:border-white/20 text-stone-900 dark:text-white rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                  >
                    Formulir Kontak <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default FAQPage