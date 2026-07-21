import { useState, useEffect, useRef } from 'react'
import { BookOpen, X, BarChart2 } from 'lucide-react'

const THEME = {
  light: {
    wrapper:    { background: '#ffffff', borderColor: '#fde68a' },
    title:      { color: '#111827' },
    body:       { color: '#4b5563' },
    benefit:    { color: '#6b7280' },
    bookIcon:   { background: '#fffbeb', borderColor: '#fef3c7', color: '#f59e0b' },
    headerIcon: { background: '#fef3c7', color: '#d97706' },
    loginBtn:   { color: '#374151', borderColor: '#e5e7eb', hoverBg: '#f9fafb' },
    closeBtn:   { color: '#d1d5db' },
    dismissBtn: { color: '#9ca3af' },
  },
  dark: {
    wrapper:    { background: '#111827', borderColor: '#92400e' },
    title:      { color: '#f9fafb' },
    body:       { color: '#9ca3af' },
    benefit:    { color: '#9ca3af' },
    bookIcon:   { background: 'rgba(120,53,15,0.2)', borderColor: 'rgba(120,53,15,0.4)', color: '#fbbf24' },
    headerIcon: { background: 'rgba(120,53,15,0.4)', color: '#fbbf24' },
    loginBtn:   { color: '#d1d5db', borderColor: '#374151', hoverBg: '#1f2937' },
    closeBtn:   { color: '#4b5563' },
    dismissBtn: { color: '#6b7280' },
  },
  cream: {
    wrapper:    { background: '#f5ead6', borderColor: '#d6b896' },
    title:      { color: '#3b2f1e' },
    body:       { color: '#7a6a55' },
    benefit:    { color: '#7a6a55' },
    bookIcon:   { background: '#ede0c8', borderColor: '#d6c5aa', color: '#b45309' },
    headerIcon: { background: '#ede0c8', color: '#b45309' },
    loginBtn:   { color: '#5c4a30', borderColor: '#c4aa88', hoverBg: '#ede0c8' },
    closeBtn:   { color: '#c4aa88' },
    dismissBtn: { color: '#a08060' },
  },
}

const ReadingActivityBanner = ({
  bookTitle,
  onLogin,
  onRegister,
  delayMs = 3 * 60 * 1000,
  colorMode = 'light',
}) => {
  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, delayMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [delayMs, dismissed])

  const handleDismiss = () => { setVisible(false); setDismissed(true) }

  if (!visible || dismissed) return null

  const t = THEME[colorMode] ?? THEME.light

  return (
    <div
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl shadow-2xl md:bottom-6"
      style={{ background: t.wrapper.background, border: `1px solid ${t.wrapper.borderColor}` }}
      role="complementary"
      aria-label="Informasi sinkronisasi aktivitas membaca"
    >
      {/* Accent bar */}
      <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-amber-400 to-amber-500" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: t.headerIcon.background }}
            >
              <BarChart2 size={15} style={{ color: t.headerIcon.color }} />
            </div>
            <p className="text-sm font-semibold leading-tight" style={{ color: t.title.color }}>
              Aktivitas bacaanmu tidak tersimpan
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 transition hover:opacity-70 mt-0.5"
            style={{ color: t.closeBtn.color }}
            aria-label="Tutup"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-3 mb-4">
          <div
            className="flex-shrink-0 w-10 h-14 rounded flex items-center justify-center"
            style={{
              background:   t.bookIcon.background,
              border:       `1px solid ${t.bookIcon.borderColor}`,
            }}
          >
            <BookOpen size={18} style={{ color: t.bookIcon.color }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: t.body.color }}>
            Progres membaca{bookTitle ? ` "${bookTitle}"` : ''}, highlight, dan penanda
            hanya tersimpan di browser ini. Masuk untuk sync ke semua perangkat dan
            lacak statistik bacaanmu.
          </p>
        </div>

        {/* Benefit list */}
        <ul className="space-y-1 mb-4">
          {['Progres tersimpan otomatis', 'Statistik & riwayat membaca', 'Highlight & catatan tersinkron'].map(item => (
            <li key={item} className="flex items-center gap-2 text-xs" style={{ color: t.benefit.color }}>
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
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition hover:opacity-90"
            style={{
              color:        t.loginBtn.color,
              border:       `1px solid ${t.loginBtn.borderColor}`,
              background:   'transparent',
            }}
          >
            Masuk
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs transition hover:opacity-70"
            style={{ color: t.dismissBtn.color }}
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingActivityBanner