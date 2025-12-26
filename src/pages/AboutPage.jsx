import { useState, useEffect } from 'react'
import { Book, Heart, Users, Globe, Target, Zap, Award, TrendingUp, Lock, Mail, Github } from 'lucide-react'
import bookService from '../services/bookService'
import userService from '../services/userService'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const AboutPage = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalGenres: 0,
    totalAuthors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, genresRes, usersRes, authorsRes] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 1 }),
          bookService.getGenres(true),
          userService.getAllUsers(),
          bookService.getAuthors(1, 1)
        ])

        const totalBooks = booksRes.data?.total || 0
        const genresWithBooks = (genresRes.data || []).filter(g => (g.bookCount || 0) >= 1)
        const totalUsers = usersRes.data?.length || 0
        const totalAuthors = authorsRes.data?.total || 0

        setStats({
          totalBooks,
          totalUsers,
          totalGenres: genresWithBooks.length,
          totalAuthors
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  const displayStats = [
    { icon: Book, value: stats.totalBooks.toLocaleString('id-ID'), label: "Koleksi Buku", color: "text-blue-600" },
    { icon: Users, value: stats.totalUsers.toLocaleString('id-ID'), label: "Pengguna Terdaftar", color: "text-green-600" },
    { icon: Globe, value: stats.totalGenres.toString(), label: "Genre Berbeda", color: "text-purple-600" },
    { icon: Heart, value: stats.totalAuthors.toLocaleString('id-ID'), label: "Penulis", color: "text-red-600" }
  ]

  const values = [
    { icon: Target, title: "User-Centric", description: "Keputusan produk berdasarkan kebutuhan user" },
    { icon: Award, title: "Quality Over Quantity", description: "Fokus pada kualitas fitur dan konten" },
    { icon: Lock, title: "Privacy & Security", description: "Data user adalah prioritas tertinggi" },
    { icon: Users, title: "Inclusivity", description: "Platform untuk semua orang tanpa diskriminasi" },
    { icon: TrendingUp, title: "Continuous Improvement", description: "Selalu belajar dan berkembang" },
    { icon: Heart, title: "Community-Driven", description: "Mendengarkan dan kolaborasi dengan komunitas" }
  ]

  const features = [
    "✅ Unlimited reading dengan 0 ads",
    "✅ Smart bookmark, highlight, dan notes",
    "✅ Reading analytics & pattern recognition",
    "✅ Achievement & gamification",
    "✅ Personalized recommendations",
    "✅ Reading calendar & streak tracking",
    "✅ Export annotations dalam berbagai format",
    "✅ Search in book dengan context preview",
    "✅ Social features (review, rating, diskusi)"
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-primary rounded-full flex items-center justify-center">
              <Book className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            MasasilaM
          </h1>
          <p className="text-lg sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Perpustakaan digital untuk buku-buku domain publik yang terbengkalai dan terdegradasi
          </p>
        </div>

        {/* Manifesto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl px-6 py-6 sm:px-8 sm:py-10 mb-12 sm:mb-16 border-l-4 border-primary">
          <div>
            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify">
              <strong className="text-primary text-xl">Bukan Kuil Budaya</strong>, lantaran memang tak sebanding dengan perpustakaan Alexandria yang pernah kesohor itu. Tapi di sini, siapa pun juga dapat menemukan buku-buku keren—<em className="text-primary">gratis!</em>
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify">
              Meski didirikan dengan semen selundupan, <strong className="text-primary">MasasilaM</strong> diharapkan dapat menjadi perpustakaan umum dengan ruang baca nyaman.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify">
              Kami merakit dan mengembangkan sistem untuk berbagi file, mengedarkan pamflet-pamflet yang kami pungut dari segara internet, menyuntingnya, sambil menyanyikan lagu-lagu rohani dan himne Indonesia Raya.
            </p>

            <p className="text-lg sm:text-xl leading-relaxed text-primary font-semibold italic mb-6 text-justify">
              Pelaku vandalisme yang menggorok leher sendiri—meneror dengan hukuman yang patut dicontoh.
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-center mt-8 text-gray-900 dark:text-white">
              Selamat menikmati! 📚
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className={`w-14 h-14 sm:w-20 sm:h-20 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 sm:w-10 sm:h-10 ${stat.color}`} />
                </div>
                <h3 className="font-bold text-2xl sm:text-4xl mb-2 text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Visi Kami</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
              Menjadikan literasi digital <strong>accessible</strong>, <strong>engaging</strong>, dan <strong>bermakna</strong> untuk semua orang di Indonesia dan dunia.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Misi Kami</h2>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2 text-justify">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>Menyediakan buku-buku berkualitas secara gratis</span>
              </li>
              <li className="flex items-start gap-2 text-justify">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>Menghadirkan pengalaman membaca digital superior</span>
              </li>
              <li className="flex items-start gap-2 text-justify">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>Membangun ekosistem pembaca yang aktif</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 mb-12 sm:mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Nilai-Nilai Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{value.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-justify">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Uncopyright Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-10 mb-12 sm:mb-16 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Pernyataan Uncopyright
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="text-justify">
              Halaman hak cipta biasanya hadir untuk memberitahu apa yang tidak boleh dilakukan. Sebaliknya, pernyataan uncopyright ini hadir untuk <strong className="text-green-600 dark:text-green-400">menegaskan kebebasan</strong>.
            </p>

            <p className="text-justify">
              Teks dan karya seni di dalam ebook ini diyakini telah berada dalam <strong>domain publik</strong>. Kami meyakini bahwa segala aktivitas non-penulisan yang dilakukan atas karya domain publik—seperti digitalisasi, penyuntingan, atau penataan tipografi—tidak menciptakan hak cipta baru. Tidak seorang pun dapat mengklaim hak milik atas pekerjaan semacam itu.
            </p>

            <p className="text-justify">
              Tak sampai di situ. Seluruh <strong>kode sumber</strong> yang membangun MasasilaM—setiap baris kode, setiap desain antarmuka, setiap skrip dan alat bantu—juga dibagikan dengan prinsip yang sama. Platform ini dibangun dengan keyakinan bahwa pengetahuan dapat dikembangkan bersama.
            </p>

            <p className="text-justify">
              Meskipun demikian, para kontributor MasasilaM—baik yang menyumbangkan teks, koreksi, kode, atau desain—secara sadar melepaskan hasil kerja mereka di bawah ketentuan{' '}
              <a
                href="https://creativecommons.org/publicdomain/zero/1.0/deed.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 font-semibold hover:underline transition-all"
              >
                CC0 1.0 Universal Public Domain Dedication
              </a>
              . Ini adalah penyerahan sepenuhnya segala upaya mereka ke ranah publik.
            </p>

            <p className="text-justify">
              Pernyataan ini adalah perwujudan dari <em>produksi nonpasar</em>, sebuah langkah yang menolak &quot;hasrat bergelora untuk menyimpan dan mempertahankan&quot; kepemilikan. Kami percaya bahwa baik konten literer maupun kode teknologi adalah <strong className="text-green-600 dark:text-green-400">warisan bersama umat manusia</strong>.
            </p>

            <p className="text-justify font-semibold text-gray-900 dark:text-white">
              Upaya ini dilakukan demi memperkaya khazanah literasi dan teknologi, untuk menumbuhkan kebudayaan bebas dan merdeka, serta mengembalikan privilese pengetahuan kepada ruang kebebasan yang telah memberi kami begitu banyak.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 sm:p-12 border-2 border-amber-200 dark:border-amber-700 shadow-2xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Bergabunglah dengan Kami
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-justify">
            Membaca adalah hak. Pengetahuan adalah kekuatan. Dan keduanya harus gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/buku"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-amber-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-base"
            >
              <Book className="w-5 h-5" />
              Mulai Membaca
            </a>
            <a
              href="https://github.com/masasilam"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-base"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg text-base"
            >
              <Mail className="w-5 h-5" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage