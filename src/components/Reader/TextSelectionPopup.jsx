import { X, Highlighter, Check, Lock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

const TextSelectionPopup = ({
  selectedText,
  coords,
  isAuthenticated,
  onClose,
  onHighlight,
  onAddNote,
  onReportTypo,       // ← BARU: dipanggil saat user klik "Laporkan Typo"
  onNavigateToLogin,
  onMouseDown,
  onTouchStart
}) => {
  const [highlightColor, setHighlightColor] = useState('#FFF9C4')
  const [noteContent, setNoteContent] = useState('')

  const highlightColors = [
    { display: '#FFEB3B', store: '#FFF9C4', name: 'Kuning' },
    { display: '#4CAF50', store: '#C8E6C9', name: 'Hijau' },
    { display: '#2196F3', store: '#BBDEFB', name: 'Biru' },
    { display: '#FF9800', store: '#FFE0B2', name: 'Oranye' },
    { display: '#F44336', store: '#FFCDD2', name: 'Merah' }
  ]

  const handleAddNote = () => {
    onAddNote(noteContent)
    setNoteContent('')
  }

  return (
    <div
      className="fixed z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
        maxWidth: '90vw',
        width: '320px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Teks Terpilih</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs italic max-h-20 overflow-y-auto">
          "{selectedText.substring(0, 150)}{selectedText.length > 150 ? '...' : ''}"
        </div>

        {isAuthenticated ? (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-2">Warna Highlight</label>
              <div className="flex gap-2 justify-center">
                {highlightColors.map(({ display, store, name }) => (
                  <button
                    key={store}
                    onClick={() => setHighlightColor(store)}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: display,
                      borderColor: highlightColor === store ? '#000' : 'transparent',
                      boxShadow: highlightColor === store ? '0 0 0 2px white, 0 0 0 4px ' + display : 'none'
                    }}
                    title={name}
                    aria-label={`Pilih warna ${name}`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => onHighlight(highlightColor)}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm mb-3 hover:bg-primary/90 transition-colors"
            >
              <Highlighter className="w-4 h-4 inline mr-1" /> Highlight
            </button>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Tambahkan catatan..."
                className="w-full p-2 border rounded text-sm mb-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
                rows="2"
              />
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                <Check className="w-4 h-4 inline mr-1" /> Simpan Catatan
              </button>
            </div>

            {/* ── TOMBOL BARU: Laporkan Typo ── */}
            {onReportTypo && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onReportTypo}
                  className="w-full py-2 flex items-center justify-center gap-2
                    bg-amber-50 dark:bg-amber-900/20
                    hover:bg-amber-100 dark:hover:bg-amber-900/30
                    border border-amber-200 dark:border-amber-700
                    text-amber-700 dark:text-amber-400
                    rounded-lg text-xs font-medium transition-colors"
                  title="Laporkan kesalahan ketik di teks ini"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Laporkan Typo
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Login untuk menyimpan highlight dan catatan
            </p>
            <button
              onClick={onNavigateToLogin}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors mb-3"
            >
              Masuk Sekarang
            </button>

            {/* Guest juga bisa laporkan typo tanpa login */}
            {onReportTypo && (
              <button
                onClick={onReportTypo}
                className="w-full py-2 flex items-center justify-center gap-2
                  bg-amber-50 dark:bg-amber-900/20
                  hover:bg-amber-100 dark:hover:bg-amber-900/30
                  border border-amber-200 dark:border-amber-700
                  text-amber-700 dark:text-amber-400
                  rounded-lg text-xs font-medium transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Laporkan Typo (tanpa login)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TextSelectionPopup