// ============================================
// src/pages/HowToReadPage.jsx
// ============================================

import { BookOpen, Download, Search, Smartphone } from 'lucide-react'

const HowToReadPage = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-6 text-center">Cara Membaca</h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
          Panduan lengkap menggunakan MasasilaM
        </p>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Search className="w-6 h-6" />
                Cari Buku Favorit
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gunakan fitur pencarian atau jelajahi buku yang Anda inginkan.
                Anda bisa filter berdasarkan kategori, penulis, atau popularitas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Mulai Membaca Online
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Klik tombol "Mulai Membaca" untuk membaca langsung di browser. 
                Anda bisa mengatur ukuran font, tema gelap/terang, dan menyimpan progress pembacaan.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Download className="w-6 h-6" />
                Download untuk Offline
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Klik "Unduh EPUB" untuk menyimpan buku ke perangkat Anda. 
                Buka file EPUB dengan aplikasi pembaca favorit seperti Google Play Books, Apple Books, atau Calibre.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Akses di Mana Saja
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                MasasilaM dapat diakses dari smartphone, tablet, atau komputer. 
                Progress membaca Anda akan tersimpan otomatis jika login dengan akun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToReadPage