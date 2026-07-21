import { useState } from 'react'
import { X, List, Bookmark, Highlighter, Trash2 } from 'lucide-react'
import { COLOR_MODES } from '../../constants/readerConstants'

const SidebarPanel = ({
  activeTab, toc, bookmarks, annotations,
  onTocClick, onBookmarkClick, onAnnotationClick,
  onDeleteBookmark, onDeleteAnnotation, onClose,
  colorMode,
}) => {
  const cfg     = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark  = colorMode === 'dark'
  const isCream = colorMode === 'cream'

  const borderClr  = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr   = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const hoverBgCls = isDark ? 'hover:bg-gray-800' : isCream ? 'hover:bg-[#e8dcc8]' : 'hover:bg-gray-100'

  const tabs = [
    { id: 'toc',         label: 'Daftar Isi', icon: List        },
    { id: 'bookmarks',   label: 'Penanda',    icon: Bookmark    },
    { id: 'annotations', label: 'Anotasi',    icon: Highlighter },
  ]
  const [tab, setTab] = useState(activeTab || 'toc')

  return (
    <div className="flex flex-col h-full" style={{ background: cfg.bg, color: cfg.color }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${borderClr}` }}
      >
        <span className="font-semibold text-sm" style={{ color: cfg.color }}>Panel</span>
        <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: mutedClr }}>
          <X size={18} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: `1px solid ${borderClr}` }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
            style={{
              color:        tab === t.id ? '#D97706' : mutedClr,
              borderBottom: tab === t.id ? '2px solid #F59E0B' : '2px solid transparent',
            }}
          >
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* TOC */}
        {tab === 'toc' && (
          <div className="py-2">
            {toc.length === 0
              ? <p className="text-center text-sm py-8" style={{ color: mutedClr }}>Tidak ada daftar isi</p>
              : toc.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onTocClick(item.href)}
                  className={`w-full text-left py-2.5 text-sm transition-colors ${hoverBgCls}`}
                  style={{
                    paddingLeft:  `${(item.depth || 0) * 12 + 16}px`,
                    paddingRight: '16px',
                    color:        item.depth === 0 ? cfg.color : mutedClr,
                    fontWeight:   item.depth === 0 ? 500 : 400,
                    fontSize:     item.depth === 0 ? '14px' : '12px',
                  }}
                >
                  {item.label}
                </button>
              ))}
          </div>
        )}

        {/* Bookmarks */}
        {tab === 'bookmarks' && (
          <div className="py-2">
            {bookmarks.length === 0
              ? (
                <div className="flex flex-col items-center py-10" style={{ color: mutedClr }}>
                  <Bookmark size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada penanda</p>
                </div>
              )
              : bookmarks.map((bm, idx) => (
                <div key={bm.id || idx} className={`flex items-start gap-2 px-4 py-3 group ${hoverBgCls}`}>
                  <button onClick={() => onBookmarkClick(bm.cfi)} className="flex-1 text-left">
                    <p className="text-xs font-medium mb-0.5" style={{ color: '#D97706' }}>Penanda {idx + 1}</p>
                    <p className="text-xs line-clamp-2" style={{ color: mutedClr }}>{bm.text || bm.label}</p>
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(idx)}
                    className="opacity-0 group-hover:opacity-100 transition"
                    style={{ color: '#F87171' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Annotations */}
        {/* Annotations */}
        {tab === 'annotations' && (
          <div className="py-2">
            {annotations.length === 0
              ? (
                <div className="flex flex-col items-center py-10" style={{ color: mutedClr }}>
                  <Highlighter size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada anotasi</p>
                </div>
              )
              : annotations.map((ann, idx) => {
                  console.log('[SidebarPanel] ann:', ann) // 👈 taruh di sini
                  return (
                    <div
                      key={ann.id || idx}
                      className={`px-4 py-3 group ${hoverBgCls}`}
                      style={{ borderBottom: `1px solid ${borderClr}` }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: ann.color }} />
                        <div className="flex-1 min-w-0">
                          <button onClick={() => {
                            console.log('[SidebarPanel] cfi diklik:', ann.cfi) // 👈 dan di sini
                            onAnnotationClick(ann.cfi)
                          }} className="text-left w-full">
                            <p className="text-xs line-clamp-2 italic" style={{ color: cfg.color }}>
                              "{ann.text || ann.selectedText}"
                            </p>
                            {ann.note && (
                              <p className="text-xs mt-1" style={{ color: mutedClr }}>{ann.note}</p>
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => onDeleteAnnotation(idx)}
                          className="opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                          style={{ color: '#F87171' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarPanel