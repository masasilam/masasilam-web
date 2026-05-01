// src/components/Reader/ReadingActivityBanner.jsx
//
// Banner login yang muncul di EpubReaderPage untuk pengguna yang belum login.
//
// Filosofi UX:
//   - TIDAK memblokir membaca — user bisa tetap baca tanpa login
//   - Muncul SETELAH 3 menit membaca, bukan langsung saat buka halaman
//   - Hanya muncul SATU KALI per sesi (setelah dismiss, tidak muncul lagi
//     sampai halaman di-refresh)
//   - Berbeda dari GuestNoticeBanner (yang muncul saat highlight/bookmark):
//     ini muncul berdasarkan waktu, bukan aksi
//   - Posisi: bottom center, tidak menghalangi teks yang sedang dibaca
//
// Cara pakai di EpubReaderPage:
//   import ReadingActivityBanner from '../components/Reader/ReadingActivityBanner'
//   ...
//   {!isAuthenticated && isReady && (
//     <ReadingActivityBanner
//       bookTitle={book.title}
//       onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
//       onRegister={() => navigate('/daftar')}
//       delayMs={3 * 60 * 1000}  // 3 menit, bisa diubah
//     />
//   )}

import { useState, useEffect, useRef } from 'react'
import { BookOpen, X, BarChart2 } from 'lucide-react'

const ReadingActivityBanner = ({
  bookTitle,
  onLogin,
  onRegister,
  delayMs = 3 * 60 * 1000,  // default 3 menit
}) => {
  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // Mulai hitung mundur setelah komponen mount (reader sudah siap)
    timerRef.current = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, delayMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [delayMs, dismissed])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
  }

  if (!visible || dismissed) return null

  return (
    // Posisi fixed bottom-center, di atas footer mobile (bottom-14 di mobile,
    // bottom-6 di desktop), lebar maksimal 400px agar tidak terlalu besar
    <div
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm
                 bg-white dark:bg-gray-900
                 border border-amber-200 dark:border-amber-700
                 rounded-2xl shadow-2xl
                 animate-in slide-in-from-bottom-3 duration-300
                 md:bottom-6"
      role="complementary"
      aria-label="Informasi sinkronisasi aktivitas membaca"
    >
      {/* Accent bar atas */}
      <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-amber-400 to-amber-500" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <BarChart2 size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              Aktivitas bacaanmu tidak tersimpan
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-300 transition mt-0.5"
            aria-label="Tutup"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-3 mb-4">
          {/* Ikon buku kecil sebagai ilustrasi */}
          <div className="flex-shrink-0 w-10 h-14 rounded bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-100 dark:border-amber-800">
            <BookOpen size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Progres membaca{bookTitle ? ` "${bookTitle}"` : ''}, highlight, dan penanda
              hanya tersimpan di browser ini. Masuk untuk sync ke semua perangkat dan
              lacak statistik bacaanmu.
            </p>
          </div>
        </div>

        {/* Benefit list — singkat */}
        <ul className="space-y-1 mb-4">
          {[
            'Progres tersimpan otomatis',
            'Statistik & riwayat membaca',
            'Highlight & catatan tersinkron',
          ].map(item => (
            <li key={item} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex gap-2">
          <button
            onClick={onRegister}
            className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition"
          >
            Daftar gratis
          </button>
          <button
            onClick={onLogin}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300
                       border border-gray-200 dark:border-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       rounded-lg transition"
          >
            Masuk
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingActivityBanner