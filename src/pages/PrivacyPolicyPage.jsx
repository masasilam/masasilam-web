import { Lock, Eye, Database, UserCheck, Shield, Download, Settings, Code, FileText, AlertCircle } from 'lucide-react'

const PrivacyPolicyPage = () => {
  const principles = [
    "Menyediakan layanan yang berfungsi",
    "Meningkatkan platform secara kolektif",
    "Menghormati otonomi dan kebebasan Anda"
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            Kebijakan Privasi
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Privasi Anda adalah hak fundamental
          </p>
          <div className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl px-6 py-4 shadow-sm">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Kami mengumpulkan sesedikit mungkin data
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 mb-12 border border-green-100 dark:border-green-900 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Apa yang kami kumpulkan adalah untuk:
          </h2>
          <ul className="space-y-4">
            {principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-gray-700 dark:text-gray-300">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold flex-shrink-0">✓</span>
                <span className="leading-relaxed pt-0.5">{principle}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 1. Data Collection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                1. Data yang Kami Kumpulkan
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Voluntary */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Data yang Anda Berikan Sukarela:
              </h3>
              <ul className="space-y-3">
                {["Username (bisa pseudonim)", "Alamat email (hanya untuk verifikasi dan reset password)", "Password (di-hash dengan bcrypt, kami tidak tahu password Anda)", "Anotasi pribadi (highlight, catatan, bookmark) - hanya untuk Anda", "Review dan komentar publik (jika Anda memilih untuk membagikan)"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Data yang Dikumpulkan Secara Teknis:
              </h3>
              <ul className="space-y-3">
                {["Data membaca (progress, waktu) - untuk melanjutkan dari tempat Anda berhenti", "Metadata penggunaan (halaman yang dikunjungi) - untuk perbaikan bug", "Log server anonim (tanpa identitas pribadi)"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NOT Collected */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-red-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Yang TIDAK Kami Kumpulkan:
              </h3>
              <ul className="space-y-3">
                {["Data lokasi spesifik", "Data perangkat detail", "Data perilaku untuk iklan", "Data dari pihak ketiga tentang Anda"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-red-800 dark:text-red-200">
                    <span className="mt-1 flex-shrink-0 font-bold">✗</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Why We Use Data */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                2. Mengapa Kami Menggunakan Data
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Untuk Layanan Dasar:</h3>
              <ul className="space-y-3">
                {["Menyimpan progress membaca Anda", "Menyinkronkan anotasi antar perangkat", "Mengotentikasi akses Anda"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Untuk Perbaikan Komunitas:</h3>
              <ul className="space-y-3">
                {["Melihat bagian mana dari platform yang paling banyak digunakan (anonim)", "Mendeteksi masalah teknis", "Memahami jenis buku yang paling dicari (untuk prioritas digitasi)"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-red-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                TIDAK PERNAH untuk:
              </h3>
              <ul className="space-y-3">
                {["Iklan bertarget", "Dijual ke pihak ketiga", "Manipulasi perilaku", "Surveillance"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-red-800 dark:text-red-200">
                    <span className="mt-1 flex-shrink-0 font-bold">✗</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Data Sharing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Berbagi Data</h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-red-100">Kami TIDAK:</h3>
              <ul className="space-y-3">
                {["Menjual data Anda", "Membagikan data pribadi Anda", "Memberikan data ke pemerintah tanpa proses hukum yang sah"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-red-800 dark:text-red-200">
                    <span className="mt-1 flex-shrink-0 font-bold">✗</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Kami BAGIKAN secara anonim & teragregasi:</h3>
              <ul className="space-y-3">
                {["Statistik penggunaan platform (misal: \"1000 orang membaca karya ini bulan lalu\")", "Data genre populer (untuk panduan kontributor)", "Metrik akses regional (untuk optimisasi server)"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default PrivacyPolicyPage