import { X, StickyNote } from 'lucide-react'
import { COLOR_MODES } from '../../constants/readerConstants'

const FootnotePopup = ({ popup, onClose, colorMode }) => {
  const cfg     = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark  = colorMode === 'dark'
  const isCream = colorMode === 'cream'

  const borderClr = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const bgClr     = isDark ? '#1F2937' : isCream ? '#f6eee3' : '#ffffff'
  const headerBg  = isDark ? '#111827' : isCream ? '#ede3d6' : '#f9fafb'
  const textClr   = cfg.color
  const mutedClr  = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'

  const popupWidth = 320
  const margin     = 12

  const left = Math.min(
    Math.max(margin, popup.x - popupWidth / 2),
    window.innerWidth - popupWidth - margin
  )
  const spaceBelow      = window.innerHeight - popup.y - 20
  const estimatedHeight = 180
  const top = spaceBelow > estimatedHeight
    ? popup.y + 8
    : Math.max(margin, popup.y - estimatedHeight - 8)

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={onClose}
      />
      <div
        className="fixed z-50 rounded-xl overflow-hidden"
        style={{
          top,
          left,
          width:     popupWidth,
          maxHeight: '240px',
          background: bgClr,
          border:    `1px solid ${borderClr}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.6)'
            : '0 8px 32px rgba(0,0,0,0.15)',
          display:       'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 flex-shrink-0"
          style={{ background: headerBg, borderBottom: `1px solid ${borderClr}` }}
        >
          <span
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide"
            style={{ color: mutedClr }}
          >
            <StickyNote size={12} style={{ color: '#F59E0B' }} />
            Catatan Kaki
          </span>
          <button
            onClick={onClose}
            className="hover:opacity-60 transition rounded-md p-0.5"
            style={{ color: mutedClr }}
            title="Tutup"
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-3 py-2.5 text-xs leading-relaxed"
          style={{ color: textClr }}
          dangerouslySetInnerHTML={{ __html: popup.html }}
        />
      </div>
    </>
  )
}

export default FootnotePopup