// ============================================
// src/pages/AboutPage.jsx
// ============================================

import { Book, Heart, Users, Globe } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <img 
              src="/masasilam-logo.svg"
              alt="masasilam Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain dark:invert"
            />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Tentang masasilam
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
            Perpustakaan online untuk buku-buku domain publik yang terbengkalai dan terdegradasi
          </p>
        </div>

        {/* Manifesto */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mb-12 border-l-4 border-primary">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              <strong className="text-primary">Bukan Kuil Budaya</strong>, lantaran memang tak sebanding dengan perpustakaan Alexandria yang pernah kesohor itu. Tapi di sini, siapa pun juga dapat menemukan buku-buku keren—<em>gratis!</em>
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Dorongan kekecewaan yang amat sangat di kalangan mahasiswa yang bangkrut, para pelajar melarat, dan orang-orang kalah—maka daripada itu—<strong className="text-primary">masasilam</strong> didirikan sebagai perpustakaan umum dengan semen selundupan.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Kami berbagi file, mengedarkan pamflet-pamflet buatan sendiri yang kami pungut dari segara internet. Kami menyuntingnya, sambil menyanyikan lagu-lagu rohani dan himne Indonesia Raya.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed text-primary font-semibold italic">
              Pelaku vandalisme yang menggorok leher sendiri—meneror dengan hukuman yang patut dicontoh.
            </p>
            
            <p className="text-xl sm:text-2xl font-bold text-center mt-8 text-gray-900 dark:text-white">
              Selamat menikmati!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-12">
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Book className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-2xl sm:text-3xl mb-2 text-gray-900 dark:text-white">10,000+</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Koleksi Buku</p>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-2xl sm:text-3xl mb-2 text-gray-900 dark:text-white">∞</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pembaca</p>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-2xl sm:text-3xl mb-2 text-gray-900 dark:text-white">24/7</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Akses Gratis</p>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-2xl sm:text-3xl mb-2 text-gray-900 dark:text-white">100%</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gratis Selamanya</p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
            Misi Kami
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-base sm:text-lg leading-relaxed">
              <strong className="text-primary">masasilam</strong> adalah upaya memberdayakan akses terhadap pengetahuan dan sastra klasik yang telah menjadi domain publik. Kami percaya bahwa literatur adalah hak semua orang, bukan hanya mereka yang mampu membeli.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Dengan koleksi yang terus bertambah, kami menyelamatkan karya-karya yang terlupakan, memperbaiki kualitas digitalnya, dan menyebarkannya secara bebas kepada siapa saja yang haus akan ilmu dan cerita.
            </p>
            <p className="text-base sm:text-lg leading-relaxed font-semibold text-primary">
              Membaca adalah hak. Pengetahuan adalah kekuatan. Dan keduanya harus gratis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage