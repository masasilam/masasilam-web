import { X, StickyNote, Share2 as Share, AlertTriangle } from 'lucide-react'
import { HIGHLIGHT_COLORS } from '../../constants/readerConstants'

const SelectionPopup = ({ position, onHighlight, onNote, onShare, onClose, onReport, canCorrect }) => {
  if (!position) return null

  const isMobile    = window.innerWidth < 480
  // Di mobile, biarkan popup wrap — jangan paksa lebar fixed besar
  const popupWidth  = isMobile ? Math.min(window.innerWidth - 16, 300) : (canCorrect ? 320 : 260)
  const popupHeight = isMobile ? 80 : 44
  const margin      = 8

  const left = Math.min(
    Math.max(margin, position.x - popupWidth / 2),
    window.innerWidth - popupWidth - margin
  )
  const top = Math.max(margin, position.y - popupHeight - 12)

  return (
    <div
      className="fixed z-40 bg-gray-900 dark:bg-gray-700 rounded-xl shadow-2xl px-2 py-1.5 border border-gray-700 dark:border-gray-500"
      style={{ top, left, width: popupWidth }}
    >
      {/* Baris 1: warna highlight + catatan + bagikan */}
      <div className="flex items-center gap-1 flex-wrap">
        {HIGHLIGHT_COLORS.slice(0, 3).map(c => (
          <button
            key={c.value}
            onClick={() => onHighlight(c.value)}
            className="w-6 h-6 rounded-full border-2 border-white/30 hover:scale-125 transition-transform flex-shrink-0"
            style={{ backgroundColor: c.value }}
            title={`Highlight ${c.name}`}
          />
        ))}
        <div className="w-px h-5 bg-white/20 mx-1 flex-shrink-0" />
        <button
          onClick={onNote}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition flex-shrink-0"
        >
          <StickyNote size={14} /><span>Catatan</span>
        </button>
        <div className="w-px h-5 bg-white/20 mx-1 flex-shrink-0" />
        <button
          onClick={onShare}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition flex-shrink-0"
        >
          <Share size={14} /><span>Bagikan</span>
        </button>

        {/* Di desktop, typo & close tetap sebaris */}
        {!isMobile && canCorrect && onReport && (
          <>
            <div className="w-px h-5 bg-white/20 mx-1 flex-shrink-0" />
            <button
              onClick={onReport}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-400 text-xs hover:bg-white/10 transition flex-shrink-0"
              title="Laporkan typo"
            >
              <AlertTriangle size={14} /><span>Typo</span>
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition flex-shrink-0 ml-auto"
        >
          <X size={14} />
        </button>
      </div>

      {/* Baris 2 (mobile only): typo button full width agar mudah di-tap */}
      {isMobile && canCorrect && onReport && (
        <div className="flex items-center mt-1 pt-1 border-t border-white/10">
          <button
            onClick={onReport}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-amber-400 text-xs hover:bg-white/10 transition"
            title="Laporkan typo"
          >
            <AlertTriangle size={14} />
            <span>Laporkan Typo / Kesalahan Ketik</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SelectionPopup