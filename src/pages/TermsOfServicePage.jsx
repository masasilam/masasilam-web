import { Shield, FileText, AlertCircle } from 'lucide-react'

const TermsOfServicePage = () => {
  const sections = [
    {
      title: "1. Penerimaan Syarat",
      content: [
        "Dengan mengakses atau menggunakan Platform, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini, Kebijakan Privasi kami, dan semua hukum dan regulasi yang berlaku.",
        "Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan efektif setelah dipublikasikan di Platform.",
        "Anda harus berusia minimal 13 tahun untuk menggunakan Platform. Jika di bawah 18 tahun, Anda harus memiliki izin orang tua/wali."
      ]
    },
    {
      title: "2. Akun Pengguna",
      content: [
        "Anda harus menyediakan informasi akurat, lengkap, dan terkini saat registrasi",
        "Anda bertanggung jawab menjaga kerahasiaan password dan semua aktivitas di akun Anda",
        "Anda harus segera memberitahu kami tentang penggunaan tidak sah",
        "Kami berhak menangguhkan atau menutup akun yang melanggar syarat atau terlibat dalam aktivitas ilegal"
      ]
    },
    {
      title: "3. Penggunaan Platform",
      content: [
        "Kami memberikan Anda lisensi terbatas, non-eksklusif, tidak dapat dialihkan untuk mengakses dan menggunakan Platform untuk keperluan pribadi, non-komersial.",
        "Anda TIDAK BOLEH: menyalin, memodifikasi, atau mendistribusikan Konten tanpa izin; menggunakan Platform untuk tujuan ilegal; mengganggu atau merusak Platform; menggunakan bot, scraper, atau automated tools tanpa izin.",
        "Buku tersedia untuk dibaca online melalui Platform. Download buku diizinkan untuk keperluan pribadi, non-komersial. Redistribusi buku tanpa izin dilarang keras."
      ]
    },
    {
      title: "4. Konten Pengguna",
      content: [
        "Dengan memposting konten (review, komentar, diskusi), Anda memberikan kami lisensi non-eksklusif, worldwide, royalty-free untuk menggunakan, mereproduksi, dan menampilkan konten tersebut.",
        "Anda menjamin bahwa konten tidak melanggar hak pihak ketiga dan bertanggung jawab atas konten yang Anda posting.",
        "Konten yang DILARANG: ilegal, melecehkan, mengandung kebencian, pornografi, menyesatkan, spam, atau melanggar privasi/hak kekayaan intelektual orang lain.",
        "Kami berhak menghapus konten yang melanggar syarat dan menangguhkan pengguna yang berulang kali melanggar."
      ]
    },
    {
      title: "5. Hak Kekayaan Intelektual",
      content: [
        "Semua hak kekayaan intelektual dalam Platform (termasuk desain, code, logo, trademarks) adalah milik MasasilaM atau licensor kami.",
        "Buku di Platform adalah karya domain publik atau memiliki lisensi terbuka. Copyright buku tetap dimiliki oleh penulis/pemegang hak asli.",
        "Anda mempertahankan kepemilikan konten yang Anda posting, namun memberikan kami lisensi untuk menggunakan konten tersebut di Platform."
      ]
    },
    {
      title: "6. Data Pengguna & Privasi",
      content: [
        "Kami mengumpulkan data seperti informasi akun, data membaca, anotasi, preferensi, device information, IP address, dan location data.",
        "Data digunakan untuk menyediakan dan meningkatkan layanan, personalisasi experience, analytics dan research, komunikasi dengan pengguna, dan keamanan.",
        "Kami mengimplementasikan measures keamanan termasuk Enkripsi SSL/TLS, Password hashing, Regular security audits, dan Access controls.",
        "Anda berhak: mengakses data pribadi, mengoreksi data yang tidak akurat, menghapus data, export data, dan opt-out dari marketing communications."
      ]
    },
    {
      title: "7. Disclaimer & Limitation of Liability",
      content: [
        "Platform disediakan 'AS IS' dan 'AS AVAILABLE' tanpa garansi apapun, baik tersurat maupun tersirat.",
        "Kami tidak menjamin Platform akan bebas error atau uninterrupted, defects akan diperbaiki, atau Platform bebas dari virus.",
        "Sejauh diizinkan hukum, kami TIDAK BERTANGGUNG JAWAB atas direct, indirect, incidental, atau consequential damages; loss of profits, data, atau goodwill.",
        "Jika kami dinyatakan liable, total liability kami tidak akan melebihi Rp 100,000."
      ]
    },
    {
      title: "8. Indemnification",
      content: [
        "Anda setuju untuk indemnify, defend, dan hold harmless MasasilaM, officers, directors, employees, dan agents dari semua claims, losses, damages, liabilities, dan expenses yang timbul dari:",
        "- Pelanggaran Anda terhadap Syarat dan Ketentuan",
        "- Pelanggaran Anda terhadap hak pihak ketiga",
        "- Konten yang Anda posting",
        "- Penggunaan Platform oleh Anda"
      ]
    },
    {
      title: "9. Hukum yang Berlaku",
      content: [
        "Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia.",
        "Sengketa akan diselesaikan melalui negosiasi, jika gagal melalui mediasi, dan jika masih gagal melalui Pengadilan yang berwenang."
      ]
    },
    {
      title: "10. Penghentian",
      content: [
        "Anda dapat menghentikan akun dengan email ke support@masasilam.com",
        "Kami dapat menghentikan atau suspend akses Anda jika melanggar syarat, required by law, untuk protect kami atau pengguna lain, atau jika akun inactive.",
        "Setelah penghentian: akses dihentikan, data di-retain sesuai Kebijakan Privasi, dan Anda masih terikat provisions yang survive termination."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Syarat & Ketentuan
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Terakhir diperbarui: 1 Desember 2024
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-left">
              Dengan menggunakan MasasilaM, Anda setuju untuk terikat dengan syarat dan ketentuan ini
            </p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <div className="space-y-3 sm:space-y-4 pl-0 sm:pl-13">
                {section.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-10 border-2 border-amber-200 dark:border-amber-700 shadow-2xl">
          <div className="text-center">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4 sm:mb-6" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Kontak Legal
            </h2>
            <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Untuk pertanyaan tentang Syarat dan Ketentuan, hubungi kami
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="mailto:legal@masasilam.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-amber-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
              >
                📧 legal@masasilam.com
              </a>
              <a
                href="mailto:support@masasilam.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
              >
                💬 support@masasilam.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage