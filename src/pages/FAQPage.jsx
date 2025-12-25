import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Semua', icon: '📚' },
    { id: 'general', name: 'Umum', icon: '❓' },
    { id: 'account', name: 'Akun', icon: '👤' },
    { id: 'reading', name: 'Membaca', icon: '📖' },
    { id: 'features', name: 'Fitur', icon: '⚙️' },
    { id: 'technical', name: 'Teknis', icon: '🔧' }
  ]

  const faqs = [
    {
      category: 'general',
      question: 'Apa itu MasasilaM?',
      answer: 'MasasilaM adalah platform membaca digital yang menyediakan koleksi buku elektronik gratis dengan fitur-fitur canggih seperti anotasi, tracking progress, analytics mendalam, dan komunitas pembaca. Kami fokus pada buku-buku domain publik dan karya dengan lisensi terbuka.'
    },
    {
      category: 'general',
      question: 'Apakah MasasilaM benar-benar gratis?',
      answer: 'Ya! MasasilaM 100% gratis tanpa biaya langganan. Semua buku dapat diakses dan diunduh tanpa batasan. Tidak ada biaya tersembunyi, tidak ada iklan yang mengganggu, dan tidak ada paywall.'
    },
    {
      category: 'general',
      question: 'Apakah buku-bukunya legal?',
      answer: 'Ya, semua buku di MasasilaM adalah buku dengan hak cipta yang sudah habis masa berlakunya (domain publik) atau memiliki lisensi distribusi gratis. Kami sangat menghormati hak kekayaan intelektual.'
    },
    {
      category: 'account',
      question: 'Apakah saya perlu mendaftar?',
      answer: 'Tidak wajib untuk membaca buku, tetapi sangat disarankan untuk mendaftar agar Anda dapat: menyimpan progress membaca, membuat anotasi (bookmark, highlight, notes), mendapatkan rekomendasi personal, mengakses statistik dan analytics, berpartisipasi dalam diskusi komunitas.'
    },
    {
      category: 'account',
      question: 'Bagaimana cara membuat akun?',
      answer: 'Klik tombol "Daftar" di pojok kanan atas, isi formulir dengan Username, Email, Password, dan Nama lengkap. Lalu verifikasi email Anda melalui link yang dikirimkan. Anda juga bisa login dengan Google Account untuk kemudahan.'
    },
    {
      category: 'account',
      question: 'Saya tidak menerima email verifikasi, bagaimana?',
      answer: 'Coba langkah berikut: (1) Cek folder Spam/Junk, (2) Gunakan fitur "Kirim Ulang Email Verifikasi", (3) Pastikan email Anda benar, (4) Hubungi support jika masih bermasalah.'
    },
    {
      category: 'account',
      question: 'Bagaimana cara reset password?',
      answer: 'Klik "Lupa Password" di halaman login, masukkan email terdaftar, cek email untuk link reset, buat password baru (link berlaku 1 jam).'
    },
    {
      category: 'account',
      question: 'Apakah data saya aman?',
      answer: 'Sangat aman. Kami menggunakan: Enkripsi SSL/TLS untuk semua koneksi, Hashing bcrypt untuk password, Token JWT untuk autentikasi, Compliance dengan standar keamanan data. Baca lebih lanjut di Kebijakan Privasi kami.'
    },
    {
      category: 'reading',
      question: 'Format buku apa yang didukung?',
      answer: 'Saat ini kami mendukung format EPUB. Buku ditampilkan dalam format HTML responsif untuk pengalaman membaca optimal di semua perangkat.'
    },
    {
      category: 'reading',
      question: 'Bagaimana cara mencari buku?',
      answer: 'Gunakan search bar di header, atau gunakan filter lanjutan untuk mencari berdasarkan: Genre, Penulis, Tahun publikasi, Bahasa, Tingkat kesulitan, Rating pembaca.'
    },
    {
      category: 'reading',
      question: 'Apakah saya bisa download buku?',
      answer: 'Ya! Klik tombol "Download" di halaman detail buku untuk download dalam format EPUB original. File dapat dibuka di aplikasi pembaca seperti Google Play Books, Apple Books, atau Calibre.'
    },
    {
      category: 'reading',
      question: 'Apakah progress membaca saya tersimpan?',
      answer: 'Ya, otomatis! Sistem kami menyimpan: Posisi terakhir membaca, Bab yang sudah selesai, Persentase penyelesaian, Total waktu membaca. Progress tersinkron real-time di semua perangkat Anda.'
    },
    {
      category: 'reading',
      question: 'Bisakah saya membaca offline?',
      answer: 'Untuk membaca offline, download buku dalam format EPUB dan buka dengan aplikasi pembaca favorit. Platform web kami memerlukan koneksi internet.'
    },
    {
      category: 'features',
      question: 'Apa perbedaan Bookmark, Highlight, dan Notes?',
      answer: 'Bookmark: Tandai halaman/posisi tertentu untuk referensi cepat. Highlight: Sorot teks spesifik yang penting/menarik dengan warna. Notes: Tulis catatan lengkap dengan pemikiran Anda di posisi manapun.'
    },
    {
      category: 'features',
      question: 'Berapa banyak anotasi yang bisa saya buat?',
      answer: 'Tidak ada batasan! Buat sebanyak yang Anda butuhkan. Semua anotasi Anda bersifat private dan hanya Anda yang bisa melihatnya.'
    },
    {
      category: 'features',
      question: 'Bagaimana cara mengekspor anotasi?',
      answer: 'Buka halaman "Anotasi Saya" di Dashboard, klik "Ekspor Anotasi", pilih format (PDF, DOCX, JSON, TXT), pilih filter (jenis anotasi, range bab, tanggal), tunggu processing selesai, download file (link berlaku 7 hari).'
    },
    {
      category: 'features',
      question: 'Apa itu Reading Streak?',
      answer: 'Jumlah hari berturut-turut Anda membaca. Jaga streak untuk unlock achievement! Streak membantu membangun kebiasaan membaca yang konsisten.'
    },
    {
      category: 'features',
      question: 'Bagaimana cara menulis review?',
      answer: 'Buka halaman buku, scroll ke section "Review", klik "Tulis Review", beri rating (0.5-5.0 bintang) dan tulis review, lalu submit. Anda bisa edit atau hapus review kapan saja.'
    },
    {
      category: 'features',
      question: 'Bagaimana sistem rekomendasi bekerja?',
      answer: 'Kami menganalisis: Genre yang sering Anda baca, Rating yang Anda berikan, Buku yang diselesaikan, Pattern membaca Anda. Lalu merekomendasikan buku serupa dengan match score tinggi.'
    },
    {
      category: 'technical',
      question: 'Perangkat apa saja yang didukung?',
      answer: 'MasasilaM dapat diakses melalui: Browser desktop (Chrome, Firefox, Safari, Edge), Browser mobile (iOS Safari, Android Chrome), Tablet, Semua perangkat dengan koneksi internet. Platform kami fully responsive.'
    },
    {
      category: 'technical',
      question: 'Browser apa yang paling direkomendasikan?',
      answer: 'Chrome, Firefox, atau Safari versi terbaru untuk pengalaman optimal dengan performa terbaik.'
    },
    {
      category: 'technical',
      question: 'Kenapa buku tidak loading?',
      answer: 'Coba: (1) Refresh halaman, (2) Clear browser cache, (3) Cek koneksi internet, (4) Coba browser lain, (5) Lapor ke support jika masih error.'
    },
    {
      category: 'technical',
      question: 'Apakah ada aplikasi mobile?',
      answer: 'Belum, tetapi website kami fully responsive dan bekerja sempurna di mobile browser. Aplikasi native sedang dalam roadmap development.'
    },
    {
      category: 'technical',
      question: 'Bagaimana cara memberikan feedback?',
      answer: 'Gunakan tombol feedback di pojok kanan bawah setiap halaman, atau email ke support@masasilam.com. Kami sangat menghargai feedback Anda!'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300">
            Temukan jawaban untuk pertanyaan umum tentang MasasilaM
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-xs sm:text-base ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-1 sm:mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="text-center mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Menampilkan {filteredFAQs.length} dari {faqs.length} pertanyaan
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                Tidak ada hasil ditemukan
              </p>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mt-2">
                Coba kata kunci lain atau pilih kategori berbeda
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left gap-4"
                >
                  <span className="font-semibold text-sm sm:text-lg text-gray-900 dark:text-white pr-4 flex-1">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 mt-0.5">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {openIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
                    <div className="pl-0 border-l-4 border-primary pl-4">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-10 border-2 border-amber-200 dark:border-amber-700 shadow-2xl text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Masih Ada Pertanyaan?
          </h2>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="mailto:support@masasilam.com"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-amber-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
            >
              📧 Email: support@masasilam.com
            </a>
            <a
              href="/kontak"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
            >
              💬 Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage