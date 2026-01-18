import { Shield, FileText, AlertCircle, Heart, BookOpen, Users, Code } from 'lucide-react'

const TermsOfServicePage = () => {
  const principles = [
    "Kebebasan Akses: Semua konten bersifat domain publik atau berlisensi terbuka",
    "Kebebasan Berkontribusi: Platform terbuka untuk semua kalangan",
    "Kebebasan Berbagi: Pengetahuan adalah milik bersama"
  ]

  const sections = [
    {
      title: "1. Filosofi Platform",
      icon: Heart,
      color: "from-red-600 to-red-700",
      content: [
        "MasasilaM adalah perpustakaan digital kolaboratif yang dibangun di atas prinsip:",
        "• Semua buku di platform ini adalah karya domain publik atau memiliki lisensi terbuka (Creative Commons, Public Domain, dll.)",
        "• Platform ini bebas diakses dan digunakan untuk tujuan apapun",
        "• Setiap pengguna dapat berkontribusi dalam pelestarian dan distribusi pengetahuan"
      ]
    },
    {
      title: "2. Akun & Kontribusi",
      icon: Users,
      color: "from-blue-600 to-blue-700",
      content: [
        "Pendaftaran terbuka untuk semua usia (anak di bawah 13 tahun disarankan dengan pengawasan)",
        "Anda dapat menggunakan nama asli atau pseudonim",
        "Setiap akun memiliki kemampuan untuk:",
        "• Membaca seluruh koleksi",
        "• Mengunduh buku untuk keperluan pribadi maupun distribusi",
        "• Berkontribusi dengan menambahkan buku domain publik",
        "• Melakukan koreksi dan perbaikan teks",
        "• Membuat anotasi dan terjemahan"
      ]
    },
    {
      title: "3. Penggunaan Platform",
      icon: BookOpen,
      color: "from-green-600 to-green-700",
      content: [
        "Anda BEBAS untuk:",
        "• Mengakses, membaca, dan mengunduh semua konten tanpa batasan",
        "• Membagikan, menyalin, dan mendistribusikan kembali konten",
        "• Memodifikasi, menerjemahkan, atau membuat turunan dari karya-karya domain publik",
        "• Menggunakan platform untuk tujuan komersial maupun non-komersial",
        "• Mengotomatisasi akses melalui API (tersedia untuk umum)",
        "",
        "Dengan semangat komunitas, kami harap Anda:",
        "• Menghormati kontribusi pengguna lain",
        "• Melaporkan kesalahan atau masalah teknis",
        "• Berkontribusi kembali ke komunitas jika memungkinkan"
      ]
    },
    {
      title: "4. Kontribusi Pengguna",
      icon: Heart,
      color: "from-purple-600 to-purple-700",
      content: [
        "Dengan berkontribusi, Anda setuju untuk melepaskan kontribusi Anda ke domain publik (kecuali ditentukan lain)",
        "Pastikan kontribusi Anda memang bebas hak cipta atau Anda memiliki hak untuk membagikannya",
        "Konten yang dilarang: materi ilegal (sesuai hukum setempat), kebencian, spam berlebihan",
        "Platform mengadopsi prinsip \"asumsi baik\" - kami percaya setiap kontribusi diberikan dengan niat baik"
      ]
    },
    {
      title: "5. Hak Kekayaan Intelektual",
      icon: Shield,
      color: "from-orange-600 to-orange-700",
      content: [
        "TIDAK ADA klaim hak kekayaan intelektual atas karya domain publik di platform ini",
        "Platform hanya menyediakan akses, bukan mengklaim kepemilikan",
        "Kode platform tersedia sebagai open source (lisensi MIT)",
        "Logo dan merek MasasilaM dilindungi untuk menjaga identitas komunitas"
      ]
    },
    {
      title: "6. Privasi & Data",
      icon: Shield,
      color: "from-cyan-600 to-cyan-700",
      content: [
        "Kami mengumpulkan minimal data:",
        "• Informasi akun (yang Anda berikan)",
        "• Data membaca (untuk rekomendasi)",
        "• Kontribusi Anda (untuk dokumentasi)",
        "",
        "Prinsip kami:",
        "• Data tidak dijual kepada pihak ketiga",
        "• Anda dapat menghapus akun kapan saja",
        "• Data kontribusi tetap menjadi bagian arsip publik",
        "• Enkripsi digunakan untuk keamanan, bukan pembatasan"
      ]
    },
    {
      title: "7. Batas Tanggung Jawab",
      icon: AlertCircle,
      color: "from-amber-600 to-amber-700",
      content: [
        "Platform disediakan \"SEBAGAIMANA ADANYA\"",
        "Tidak ada jaminan ketersediaan 100%",
        "Komunitas bertanggung jawab bersama untuk menjaga platform",
        "Kontributor bertanggung jawab atas kontribusinya sendiri"
      ]
    },
    {
      title: "8. Penyelesaian Sengketa",
      icon: Users,
      color: "from-indigo-600 to-indigo-700",
      content: [
        "Berdasarkan prinsip gotong royong dan musyawarah",
        "Konflik diselesaikan melalui diskusi komunitas",
        "Jika diperlukan, hukum Republik Indonesia berlaku"
      ]
    },
    {
      title: "9. Kelangsungan Platform",
      icon: BookOpen,
      color: "from-pink-600 to-pink-700",
      content: [
        "Anda dapat menghapus akun kapan saja",
        "Kontribusi Anda tetap menjadi bagian arsip publik",
        "Platform dapat berkembang atau berubah sesuai kebutuhan komunitas"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Syarat & Ketentuan
          </h1>
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Dengan menggunakan MasasilaM, Anda setuju untuk terikat dengan syarat dan ketentuan ini
          </p>
        </div>

        {/* Prinsip Dasar */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 border-2 border-amber-200 dark:border-amber-700 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
            Prinsip Dasar MasasilaM
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 text-center">
            Dengan menggunakan MasasilaM, Anda bergabung dalam komunitas yang mendedikasikan diri untuk:
          </p>
          <ul className="space-y-3">
            {principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-amber-600 dark:text-amber-400 text-lg flex-shrink-0">✓</span>
                <span className="leading-relaxed text-justify">{principle}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`bg-gradient-to-r ${section.color} p-4 sm:p-6 flex items-center gap-3 sm:gap-4`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="p-6 sm:p-8 space-y-3 sm:space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bergabunglah dalam Gerakan */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-10 border-2 border-green-200 dark:border-green-700 shadow-2xl">
          <div className="text-center">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Bergabunglah dalam Gerakan
            </h2>
            <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              MasasilaM bukan hanya platform, tapi gerakan untuk:
            </p>
            <ul className="space-y-2 mb-6 sm:mb-8 text-left max-w-2xl mx-auto">
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0">•</span>
                <span>Menyelamatkan karya-karya domain publik yang terdegradasi</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0">•</span>
                <span>Mendemokratisasikan akses pengetahuan</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0">•</span>
                <span>Membangun warisan digital bersama</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="mailto:support@masasilam.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
              >
                💬 Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage