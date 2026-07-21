import { useState, useRef, useEffect } from 'react'
import {
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, ChevronUp, ChevronDown,
  Mic, X, AlertCircle, Gauge,
} from 'lucide-react'

// ─── Color mode helpers ────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:         '#ffffff',
    border:     '#e5e7eb',
    text:       '#111827',
    muted:      '#6b7280',
    trackBg:    '#e5e7eb',
    trackFill:  '#f59e0b',
    btnHover:   'rgba(0,0,0,0.06)',
    shadow:     '0 -4px 24px rgba(0,0,0,0.10)',
    pill:       '#f3f4f6',
    pillText:   '#374151',
  },
  dark: {
    bg:         '#1f2937',
    border:     '#374151',
    text:       '#f9fafb',
    muted:      '#9ca3af',
    trackBg:    '#374151',
    trackFill:  '#f59e0b',
    btnHover:   'rgba(255,255,255,0.08)',
    shadow:     '0 -4px 24px rgba(0,0,0,0.40)',
    pill:       '#374151',
    pillText:   '#d1d5db',
  },
  cream: {
    bg:         '#f5ede0',
    border:     '#d6c5aa',
    text:       '#3b2f1e',
    muted:      '#7a6a55',
    trackBg:    '#d6c5aa',
    trackFill:  '#b8860b',
    btnHover:   'rgba(0,0,0,0.06)',
    shadow:     '0 -4px 24px rgba(100,70,30,0.12)',
    pill:       '#e8d9c5',
    pillText:   '#5a4a35',
  },
}

// ─── Sub-component: IconButton ─────────────────────────────────────────────────
const IconButton = ({ onClick, disabled, title, children, color, size = 36, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width:          size,
      height:         size,
      borderRadius:   '50%',
      border:         'none',
      background:     'transparent',
      cursor:         disabled ? 'not-allowed' : 'pointer',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      opacity:        disabled ? 0.35 : 1,
      color:          color || 'inherit',
      transition:     'background 0.15s, transform 0.1s',
      flexShrink:     0,
      ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(0,0,0,0.08)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    onMouseDown={e  => { if (!disabled) e.currentTarget.style.transform   = 'scale(0.90)' }}
    onMouseUp={e    => { e.currentTarget.style.transform   = 'scale(1)' }}
  >
    {children}
  </button>
)

// ─── Sub-component: RangeSlider ────────────────────────────────────────────────
const RangeSlider = ({ value, min, max, step, onChange, label, displayValue, trackFill, trackBg }) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'inherit', opacity: 0.7 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {displayValue}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position:     'absolute',
          left:         0, right: 0,
          height:       4,
          borderRadius: 2,
          background:   trackBg,
          overflow:     'hidden',
        }}>
          <div style={{
            width:      `${pct}%`,
            height:     '100%',
            background: trackFill,
            borderRadius: 2,
            transition: 'width 0.1s',
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position:   'relative',
            zIndex:     1,
            width:      '100%',
            height:     20,
            opacity:    0,
            cursor:     'pointer',
            margin:     0,
          }}
        />
      </div>
    </div>
  )
}

// ─── Sub-component: ProgressBar ────────────────────────────────────────────────
const ProgressBar = ({ percent, trackBg, trackFill }) => (
  <div style={{
    width:      '100%',
    height:     3,
    background: trackBg,
    borderRadius: 2,
    overflow:   'hidden',
    margin:     '2px 0',
  }}>
    <div style={{
      width:        `${percent}%`,
      height:       '100%',
      background:   trackFill,
      borderRadius: 2,
      transition:   'width 0.3s ease',
    }} />
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main TTSPlayer Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {boolean}  props.isSupported
 * @param {boolean}  props.isPlaying
 * @param {boolean}  props.isPaused
 * @param {boolean}  props.isLoading
 * @param {boolean}  props.isActive
 * @param {string|null} props.error
 * @param {number}   props.chunkIndex
 * @param {number}   props.totalChunks
 * @param {number}   props.progressPercent
 * @param {SpeechSynthesisVoice[]} props.voices
 * @param {SpeechSynthesisVoice|null} props.selectedVoice
 * @param {number}   props.rate
 * @param {number}   props.pitch
 * @param {number}   props.volume
 * @param {Function} props.setRate
 * @param {Function} props.setPitch
 * @param {Function} props.setVolume
 * @param {Function} props.handlePlay
 * @param {Function} props.handlePauseResume
 * @param {Function} props.handleStop
 * @param {Function} props.handleSkipForward
 * @param {Function} props.handleSkipBackward
 * @param {Function} props.handleVoiceChange
 * @param {Function} props.onClose
 * @param {string}   props.colorMode
 */
const TTSPlayer = ({
  isSupported,
  isPlaying,
  isPaused,
  isLoading,
  isActive,
  error,
  chunkIndex,
  totalChunks,
  progressPercent,
  voices,
  selectedVoice,
  rate,
  pitch,
  volume,
  setRate,
  setPitch,
  setVolume,
  handlePlay,
  handlePauseResume,
  handleStop,
  handleSkipForward,
  handleSkipBackward,
  handleVoiceChange,
  onClose,
  colorMode = 'light',
}) => {
  const [expanded, setExpanded] = useState(false)
  const [muted,    setMuted]    = useState(false)
  const prevVolumeRef           = useRef(volume)

  const t = THEME[colorMode] || THEME.light

  const handleMuteToggle = () => {
    if (muted) {
      setVolume(prevVolumeRef.current || 1)
      setMuted(false)
    } else {
      prevVolumeRef.current = volume
      setVolume(0)
      setMuted(true)
    }
  }

  // Sync mute icon
  useEffect(() => {
    if (volume > 0 && muted) setMuted(false)
  }, [volume]) // eslint-disable-line

  if (!isSupported) {
    return (
      <div style={{
        position:   'fixed',
        bottom:     64,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     50,
        background: t.bg,
        border:     `1px solid ${t.border}`,
        borderRadius: 12,
        padding:    '12px 16px',
        display:    'flex',
        alignItems: 'center',
        gap:        10,
        color:      t.muted,
        fontSize:   13,
        boxShadow:  t.shadow,
      }}>
        <AlertCircle size={16} />
        <span>Browser ini tidak mendukung Text-to-Speech.</span>
        <IconButton onClick={onClose} size={28}>
          <X size={14} />
        </IconButton>
      </div>
    )
  }

  return (
    <div
      style={{
        position:     'fixed',
        bottom:       0,
        left:         0,
        right:        0,
        zIndex:       50,
        background:   t.bg,
        borderTop:    `1px solid ${t.border}`,
        boxShadow:    t.shadow,
        color:        t.text,
        userSelect:   'none',
        transition:   'box-shadow 0.2s',
      }}
      role="region"
      aria-label="Pemutar Text-to-Speech"
    >
      {/* ── Progress bar tipis di atas player ── */}
      <ProgressBar percent={progressPercent} trackBg={t.trackBg} trackFill={t.trackFill} />

      {/* ── Main bar ── */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        padding:     '8px 12px',
        gap:         6,
        minHeight:   56,
      }}>

        {/* Icon TTS */}
        <div style={{
          width:          34,
          height:         34,
          borderRadius:   '50%',
          background:     t.trackFill,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          <Mic size={15} color="#fff" />
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.2 }}>
            {isLoading ? 'Memproses...' : isActive ? 'Sedang dibaca' : 'Text-to-Speech'}
          </div>
          {isActive && totalChunks > 0 && (
            <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>
              {chunkIndex} / {totalChunks} kalimat · {progressPercent}%
            </div>
          )}
          {error && (
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
              <AlertCircle size={11} />
              {error}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Skip back */}
          <IconButton
            onClick={handleSkipBackward}
            disabled={!isActive}
            title="Kalimat sebelumnya"
            size={34}
            color={t.muted}
          >
            <SkipBack size={15} />
          </IconButton>

          {/* Play / Pause / Loading */}
          {!isActive ? (
            <button
              onClick={handlePlay}
              disabled={isLoading}
              title="Mulai membaca"
              style={{
                width:          42,
                height:         42,
                borderRadius:   '50%',
                border:         'none',
                background:     t.trackFill,
                color:          '#fff',
                cursor:         isLoading ? 'wait' : 'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                transition:     'transform 0.1s, opacity 0.15s',
                opacity:        isLoading ? 0.7 : 1,
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
              onMouseUp={e   => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isLoading
                ? <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'tts-spin 0.7s linear infinite' }} />
                : <Play size={18} fill="#fff" />
              }
            </button>
          ) : (
            <IconButton
              onClick={handlePauseResume}
              title={isPaused ? 'Lanjutkan' : 'Jeda'}
              size={42}
              color="#fff"
              style={{ background: t.trackFill }}
            >
              {isPaused ? <Play size={18} fill="#fff" /> : <Pause size={18} />}
            </IconButton>
          )}

          {/* Skip forward */}
          <IconButton
            onClick={handleSkipForward}
            disabled={!isActive}
            title="Kalimat berikutnya"
            size={34}
            color={t.muted}
          >
            <SkipForward size={15} />
          </IconButton>

          {/* Stop */}
          <IconButton
            onClick={handleStop}
            disabled={!isActive}
            title="Berhenti"
            size={32}
            color={t.muted}
          >
            <Square size={13} fill={isActive ? t.muted : 'none'} />
          </IconButton>

          {/* Volume toggle */}
          <IconButton
            onClick={handleMuteToggle}
            title={muted ? 'Aktifkan suara' : 'Senyapkan'}
            size={32}
            color={t.muted}
          >
            {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </IconButton>

          {/* Expand settings */}
          <IconButton
            onClick={() => setExpanded(v => !v)}
            title={expanded ? 'Tutup pengaturan' : 'Pengaturan suara'}
            size={32}
            color={t.muted}
          >
            {expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </IconButton>

          {/* Close player */}
          <IconButton
            onClick={() => { handleStop(); onClose() }}
            title="Tutup TTS"
            size={32}
            color={t.muted}
          >
            <X size={15} />
          </IconButton>
        </div>
      </div>

      {/* ── Expanded settings panel ── */}
      {expanded && (
        <div style={{
          padding:    '10px 16px 14px',
          borderTop:  `1px solid ${t.border}`,
          display:    'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap:        12,
          color:      t.text,
        }}>
          {/* Kecepatan */}
          <RangeSlider
            label="Kecepatan"
            value={rate}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={setRate}
            displayValue={`${rate.toFixed(1)}×`}
            trackFill={t.trackFill}
            trackBg={t.trackBg}
          />

          {/* Nada */}
          <RangeSlider
            label="Nada"
            value={pitch}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={setPitch}
            displayValue={pitch.toFixed(1)}
            trackFill={t.trackFill}
            trackBg={t.trackBg}
          />

          {/* Volume */}
          <RangeSlider
            label="Volume"
            value={volume}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => { setVolume(v); if (v > 0) setMuted(false) }}
            displayValue={`${Math.round(volume * 100)}%`}
            trackFill={t.trackFill}
            trackBg={t.trackBg}
          />

          {/* Pilih suara */}
          {voices.length > 0 && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, opacity: 0.7 }}>Suara</span>
              <select
                value={selectedVoice?.name || ''}
                onChange={e => {
                  const v = voices.find(vv => vv.name === e.target.value)
                  if (v) handleVoiceChange(v)
                }}
                style={{
                  background:   t.pill,
                  color:        t.pillText,
                  border:       `1px solid ${t.border}`,
                  borderRadius: 6,
                  padding:      '5px 8px',
                  fontSize:     12,
                  cursor:       'pointer',
                  width:        '100%',
                  maxWidth:     360,
                }}
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang}){v.localService ? ' ✓' : ''}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 10, color: t.muted }}>
                ✓ = suara lokal (lebih cepat, tersedia offline)
              </span>
            </div>
          )}
        </div>
      )}

      {/* CSS spinner animation (injeksi sekali) */}
      <style>{`
        @keyframes tts-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default TTSPlayer