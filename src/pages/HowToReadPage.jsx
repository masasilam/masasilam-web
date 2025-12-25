import { BookOpen, Download, Search, Smartphone, Bookmark, MessageSquare, TrendingUp, FileText, Eye, Clock } from 'lucide-react'

const HowToReadPage = () => {
  const features = [
    {
      icon: Search,
      title: "Mencari & Menemukan Buku",
      description: "Gunakan fitur pencarian cerdas untuk menemukan buku berdasarkan judul, penulis, atau konten dalam buku. Saring buku berdasarkan genre, tahun publikasi, rating, dan bahasa.",
      tips: ["Gunakan filter lanjutan untuk hasil lebih spesifik", "Cek rekomendasi personal di dashboard Anda", "Eksplorasi kategori untuk menemukan genre favorit"]
    },
    {
      icon: BookOpen,
      title: "Membaca Buku",
      description: "Nikmati pengalaman membaca optimal dengan navigasi bab hierarki, mode membaca responsif, dan estimasi waktu baca per bab. Progress Anda tersimpan otomatis.",
      tips: ["Gunakan breadcrumb untuk tracking posisi Anda", "Akses daftar isi interaktif dengan mudah", "Lanjutkan dari posisi terakhir kapan saja"]
    },
    {
      icon: Bookmark,
      title: "Bookmark & Anotasi",
      description: "Tandai halaman favorit, sorot teks penting, dan tulis catatan pribadi. Semua anotasi tersimpan dengan posisi tepat dan dapat diekspor dalam berbagai format.",
      tips: ["Setiap bookmark menyimpan konteks bab", "Highlight mencatat teks dan posisi lengkap", "Ekspor anotasi ke PDF, DOCX, JSON, atau TXT"]
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Sistem mencatat progress membaca Anda secara real-time. Lihat persentase penyelesaian, waktu membaca, kecepatan (WPM), dan estimasi waktu tersisa.",
      tips: ["Cek statistik detail di Dashboard", "Lihat reading heatmap dan pattern", "Pantau streak membaca Anda"]
    },
    {
      icon: MessageSquare,
      title: "Review & Diskusi",
      description: "Beri rating dan review buku, diskusikan bab tertentu dengan pembaca lain, dan bagikan insight Anda. Like komentar menarik dan tandai spoiler.",
      tips: ["Review membantu pembaca lain", "Diskusi per bab lebih fokus", "Apresiasi review berkualitas dengan helpful vote"]
    },
    {
      icon: FileText,
      title: "Search in Book",
      description: "Cari kata atau frasa dalam seluruh buku dengan hasil kontekstual. Lihat konteks sebelum dan sesudah hasil pencarian dengan highlighting otomatis.",
      tips: ["Gunakan untuk riset cepat", "Hasil pencarian menyimpan riwayat", "Jump langsung ke halaman hasil"]
    },
    {
      icon: Download,
      title: "Download & Ekspor",
      description: "Download buku dalam format EPUB untuk membaca offline. Ekspor anotasi Anda dalam berbagai format dengan filter kustomisasi.",
      tips: ["Download untuk dibaca di aplikasi favorit", "Ekspor anotasi secara berkala untuk backup", "Link download berlaku 7 hari"]
    },
    {
      icon: Eye,
      title: "Analytics Mendalam",
      description: "Lihat statistik reading Anda: grafik harian/mingguan, breakdown genre, peak reading times, dan trend analysis. Untuk penulis: analytics lengkap reader behavior.",
      tips: ["Grafik visualisasi membantu tracking habit", "Reading calendar seperti GitHub contribution", "Penulis dapat melihat engagement heatmap"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 text-gray-900 dark:text-white">
            Panduan Lengkap Membaca di MasasilaM
          </h1>
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Platform membaca digital yang intuitif dengan fitur-fitur canggih untuk pengalaman membaca yang produktif dan menyenangkan
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">∞</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Buku Gratis</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">20+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Fitur Canggih</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">100%</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gratis Legal</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Akses Penuh</div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-3 bg-gradient-to-br from-primary to-amber-600 p-6 sm:p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-3 sm:mb-4">
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">{String(index + 1).padStart(2, '0')}</div>
                    </div>
                  </div>

                  <div className="lg:col-span-9 p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                      {feature.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="space-y-2">
                      <div className="text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3">💡 Pro Tips:</div>
                      <ul className="space-y-2">
                        {feature.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-10 border-2 border-amber-200 dark:border-amber-700 shadow-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">
            Memulai Perjalanan Membaca
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white font-bold text-lg sm:text-xl">1</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900 dark:text-white">Daftar Gratis</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Buat akun untuk akses penuh semua fitur</p>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white font-bold text-lg sm:text-xl">2</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900 dark:text-white">Pilih Buku</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Jelajahi ribuan karya klasik berkualitas</p>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white font-bold text-lg sm:text-xl">3</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900 dark:text-white">Mulai Baca</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Nikmati pengalaman membaca terbaik</p>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white font-bold text-lg sm:text-xl">4</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900 dark:text-white">Bagikan</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Review dan diskusi dengan komunitas</p>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4 sm:mb-6">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Butuh Bantuan Lebih Lanjut?
          </h2>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Tim support kami siap membantu Anda 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a
              href="mailto:support@masasilam.com"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-amber-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              📧 Email Support
            </a>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center text-gray-900 dark:text-white"
            >
              💬 Lihat FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToReadPage