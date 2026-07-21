import { X, Highlighter } from 'lucide-react'

const THEME = {
  light: {
    wrapper:     { background: '#ffffff', borderColor: '#fde68a', color: '#1f2937' },
    icon:        { background: '#fef3c7', color: '#d97706' },
    title:       { color: '#1f2937' },
    desc:        { color: '#6b7280' },
    loginBtn:    { color: '#4b5563' },
    closeBtn:    { color: '#d1d5db' },
  },
  dark: {
    wrapper:     { background: '#1f2937', borderColor: '#92400e', color: '#f3f4f6' },
    icon:        { background: 'rgba(120,53,15,0.4)', color: '#fbbf24' },
    title:       { color: '#f3f4f6' },
    desc:        { color: '#9ca3af' },
    loginBtn:    { color: '#d1d5db' },
    closeBtn:    { color: '#4b5563' },
  },
  cream: {
    wrapper:     { background: '#f5ead6', borderColor: '#d6b896', color: '#3b2f1e' },
    icon:        { background: '#ede0c8', color: '#b45309' },
    title:       { color: '#3b2f1e' },
    desc:        { color: '#7a6a55' },
    loginBtn:    { color: '#5c4a30' },
    closeBtn:    { color: '#c4aa88' },
  },
}

const GuestNoticeBanner = ({ onDismiss, onRegister, onLogin, colorMode = 'light' }) => {
  const t = THEME[colorMode] ?? THEME.light

  return (
    <div
      className="fixed bottom-12 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-6 md:w-80 rounded-xl shadow-lg p-3 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
      style={{ ...t.wrapper, border: `1px solid ${t.wrapper.borderColor}` }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
        style={t.icon}
      >
        <Highlighter size={15} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={t.title}>
          Highlight tersimpan di browser ini saja
        </p>
        <p className="text-xs mb-2 leading-relaxed" style={t.desc}>
          Daftar gratis untuk menyimpan permanen dan sync di semua perangkat.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegister}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition"
          >
            Daftar gratis
          </button>
          <button
            onClick={onLogin}
            className="px-3 py-1 text-xs font-medium transition hover:opacity-80"
            style={t.loginBtn}
          >
            Masuk
          </button>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 transition hover:opacity-70 mt-0.5"
        style={t.closeBtn}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default GuestNoticeBanner