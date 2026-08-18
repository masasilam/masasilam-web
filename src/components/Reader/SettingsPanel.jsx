import { X, Minus, Plus, Type } from 'lucide-react'
import { COLOR_MODES, FONT_OPTIONS } from '../../constants/readerConstants'

const SettingsPanel = ({
  fontSize, onFontSizeChange,
  colorMode, onColorModeChange,
  fontFamily, onFontChange,
  onClose,
}) => {
  const cfg     = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark  = colorMode === 'dark'
  const isCream = colorMode === 'cream'

  const borderClr = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr  = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const controlBg = isDark ? '#1F2937' : isCream ? '#e8dcc8' : '#F3F4F6'

  return (
    <div className="flex flex-col h-full" style={{ background: cfg.bg, color: cfg.color }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${borderClr}` }}
      >
        <span className="font-semibold text-sm" style={{ color: cfg.color }}>
          Pengaturan Tampilan
        </span>
        <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: mutedClr }}>
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Font size */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: mutedClr }}>
            Ukuran Font
          </label>
          <div className="flex items-center gap-3 rounded-xl p-1" style={{ background: controlBg }}>
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="flex-1 flex items-center justify-center h-8 rounded-lg transition hover:opacity-70"
              style={{ color: cfg.color }}
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium min-w-[3ch] text-center" style={{ color: cfg.color }}>
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
              className="flex-1 flex items-center justify-center h-8 rounded-lg transition hover:opacity-70"
              style={{ color: cfg.color }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Font family */}
        <div>
          <label
            className="block text-xs font-medium mb-2 uppercase tracking-wide flex items-center gap-1"
            style={{ color: mutedClr }}
          >
            <Type size={11} /> Font
          </label>
          <div className="space-y-1">
            {FONT_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => onFontChange(f.value)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
                style={{
                  fontFamily: f.value,
                  background: fontFamily === f.value ? '#F59E0B' : controlBg,
                  color:      fontFamily === f.value ? '#FFFFFF'  : cfg.color,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color mode */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: mutedClr }}>
            Tema
          </label>
          <div className="flex gap-2">
            {Object.entries(COLOR_MODES).map(([key, modeCfg]) => {
              const Icon = modeCfg.icon
              return (
                <button
                  key={key}
                  onClick={() => onColorModeChange(key)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: modeCfg.bg,
                    color:      modeCfg.color,
                    border:     colorMode === key ? '2px solid #F59E0B' : `2px solid ${borderClr}`,
                    boxShadow:  colorMode === key ? '0 0 0 1px #F59E0B33' : 'none',
                  }}
                >
                  <Icon size={14} />{modeCfg.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel