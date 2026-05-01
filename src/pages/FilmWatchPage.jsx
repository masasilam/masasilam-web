import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { filmService } from '../services/filmService'
import config from '../config/env'

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Icons = {
  Play: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  ),
  Replay10: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fontFamily="sans-serif">10</text>
    </svg>
  ),
  Forward10: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M18.01 5L13 1v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5z"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fontFamily="sans-serif">10</text>
    </svg>
  ),
  VolumeOff: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  ),
  VolumeLow: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
    </svg>
  ),
  VolumeHigh: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  ),
  Fullscreen: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  ),
  ExitFullscreen: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.477.477 0 00-.59.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.47.47 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ),
  CC: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-3a2 2 0 012-2h2a2 2 0 012 2v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3a2 2 0 012-2h2a2 2 0 012 2v1z"/>
    </svg>
  ),
  PiP: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18c1.1 0 2-.9 2-2zm-2 .02H3V5h18v14.02z"/>
    </svg>
  ),
  ArrowBack: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  ),
}

// ─── Format time ──────────────────────────────────────────────────────────────
const fmt = (s) => {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
const Tip = ({ label, children }) => (
  <div className="relative group/t">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded
                    bg-[#222] text-white text-[11px] font-medium whitespace-nowrap
                    pointer-events-none opacity-0 group-hover/t:opacity-100 transition-opacity
                    border border-white/10 z-[60]">
      {label}
    </div>
  </div>
)

// ─── Double-tap seek ripple ───────────────────────────────────────────────────
const TapRipple = ({ dir, show }) => (
  <div className={`absolute inset-y-0 ${dir === 'left' ? 'left-0' : 'right-0'} w-[35%]
                   flex items-center ${dir === 'left' ? 'justify-start pl-6' : 'justify-end pr-6'}
                   pointer-events-none z-20 transition-opacity duration-300
                   ${show ? 'opacity-100' : 'opacity-0'}`}>
    <div className={`flex flex-col items-center gap-1 text-white
                     ${show ? 'animate-bounce' : ''}`}
      style={{animationDuration: '0.3s', animationIterationCount: 1}}>
      <div className="text-2xl">{dir === 'left' ? '⟪' : '⟫'}</div>
      <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
        {dir === 'left' ? '−10s' : '+10s'}
      </span>
    </div>
  </div>
)

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

// ─────────────────────────────────────────────────────────────────────────────
export default function FilmWatchPage() {
  const { filmSlug } = useParams()
  const navigate     = useNavigate()

  const videoRef     = useRef(null)
  const containerRef = useRef(null)
  const progressRef  = useRef(null)
  const volumeRef    = useRef(null)
  const hideTimer    = useRef(null)
  const trackUrlRef  = useRef(null)
  const lastTap      = useRef(0)
  const dblTimer     = useRef(null)
  const volTimer     = useRef(null)
  const durationRef  = useRef(0)   // FIX: selalu up-to-date, aman untuk closure touch handler

  // ── Video state ────────────────────────────────────────────────────────────
  const [playing,      setPlaying]      = useState(false)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [buffered,     setBuffered]     = useState(0)
  const [buffering,    setBuffering]    = useState(false)
  const [volume,       setVolume]       = useState(1)
  const [muted,        setMuted]        = useState(false)
  const [fullscreen,   setFullscreen]   = useState(false)
  const [pip,          setPip]          = useState(false)
  const [showCtrl,     setShowCtrl]     = useState(true)

  // ── Interaction state ──────────────────────────────────────────────────────
  const [seeking,      setSeeking]      = useState(false)
  const seekingRef     = useRef(false)  // FIX: ref untuk cek di passive event handler
  const [volDrag,      setVolDrag]      = useState(false)
  const [hoverT,       setHoverT]       = useState({ on: false, t: 0, pct: 0 })
  const [centerFlash,  setCenterFlash]  = useState(null)  // 'play'|'pause'
  const [leftRipple,   setLeftRipple]   = useState(false)
  const [rightRipple,  setRightRipple]  = useState(false)
  const [volOSD,       setVolOSD]       = useState(false)

  // ── Settings state ─────────────────────────────────────────────────────────
  const [speed,        setSpeed]        = useState(1)
  const [quality,      setQuality]      = useState(null)
  const [showSpeedM,   setShowSpeedM]   = useState(false)
  const [showQualM,    setShowQualM]    = useState(false)
  const [showSubM,     setShowSubM]     = useState(false)
  const [subOn,        setSubOn]        = useState(true)
  const [subLang,      setSubLang]      = useState('en')
  const [translating,  setTranslating]  = useState(false)
  const [transP,       setTransP]       = useState(0)
  const [subErr,       setSubErr]       = useState(null)

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: film, isLoading } = useQuery({
    queryKey: ['film', filmSlug],
    queryFn: async () => {
      const res = await filmService.getFilmBySlug(filmSlug)
      return res.data || res
    }
  })

  const { data: videoInfo } = useQuery({
    queryKey: ['videoInfo', filmSlug],
    queryFn: async () => {
      try {
        const r = await fetch(`${config.apiBaseUrl}/films/${filmSlug}/video-info`)
        return r.ok ? r.json() : null
      } catch { return null }
    },
    enabled: !!film?.videoUrl
  })

  const subtitleUrl = useMemo(() =>
    film?.subtitleUrl ? `${config.apiBaseUrl}/films/${filmSlug}/subtitle` : null,
  [film?.subtitleUrl, filmSlug])

  const videoSrc  = quality?.src || film?.videoUrl || ''
  const progress  = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufPct    = duration > 0 ? (buffered / duration) * 100 : 0

  // ── Auto-select best quality ───────────────────────────────────────────────
  useEffect(() => {
    if (videoInfo?.qualities?.length && !quality) {
      const best = [...videoInfo.qualities].sort((a,b) => (b.width||0)-(a.width||0))[0]
      setQuality(best)
    }
  }, [videoInfo, quality])

  // ── Video events ───────────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay    = () => { setPlaying(true);  setBuffering(false) }
    const onPause   = () => { setPlaying(false); setBuffering(false) }
    const onPlaying = () => { setPlaying(true);  setBuffering(false) }
    const onWait    = () => setBuffering(true)
    const onEnded   = () => { setPlaying(false); setShowCtrl(true) }
    const onUpdate  = () => {
      setCurrentTime(v.currentTime)
      setPlaying(!v.paused)
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length-1))
    }
    const onMeta   = () => { setDuration(v.duration); durationRef.current = v.duration }
    const onVol    = () => { setVolume(v.volume); setMuted(v.muted) }
    const onPipIn  = () => setPip(true)
    const onPipOut = () => setPip(false)

    v.addEventListener('play',                  onPlay)
    v.addEventListener('pause',                 onPause)
    v.addEventListener('playing',               onPlaying)
    v.addEventListener('waiting',               onWait)
    v.addEventListener('ended',                 onEnded)
    v.addEventListener('timeupdate',            onUpdate)
    v.addEventListener('durationchange',        onMeta)
    v.addEventListener('loadedmetadata',        onMeta)
    v.addEventListener('volumechange',          onVol)
    v.addEventListener('enterpictureinpicture', onPipIn)
    v.addEventListener('leavepictureinpicture', onPipOut)

    setPlaying(!v.paused); setMuted(v.muted); setVolume(v.volume)

    return () => {
      v.removeEventListener('play',                  onPlay)
      v.removeEventListener('pause',                 onPause)
      v.removeEventListener('playing',               onPlaying)
      v.removeEventListener('waiting',               onWait)
      v.removeEventListener('ended',                 onEnded)
      v.removeEventListener('timeupdate',            onUpdate)
      v.removeEventListener('durationchange',        onMeta)
      v.removeEventListener('loadedmetadata',        onMeta)
      v.removeEventListener('volumechange',          onVol)
      v.removeEventListener('enterpictureinpicture', onPipIn)
      v.removeEventListener('leavepictureinpicture', onPipOut)
    }
  }, [])

  // ── Subtitle visibility ────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (v?.textTracks?.[0]) v.textTracks[0].mode = subOn ? 'showing' : 'hidden'
  }, [subOn])

  // ── Playback speed ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed
  }, [speed])

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  // ── Initial subtitle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (subtitleUrl && !trackUrlRef.current) loadTrack(subtitleUrl, 'en')
  }, [subtitleUrl]) // eslint-disable-line

  // ── Auto-hide controls ─────────────────────────────────────────────────────
  const bumpControls = useCallback(() => {
    setShowCtrl(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      // FIX: cek langsung dari video element, bukan state
      const v = videoRef.current
      if (v && !v.paused) setShowCtrl(false)
    }, 3000)
  }, [])

  // ── Seeking ────────────────────────────────────────────────────────────────
  // FIX: baca dari durationRef bukan state, agar closure touch handler selalu fresh
  const seekTo = useCallback((clientX) => {
    const el = progressRef.current, v = videoRef.current
    const dur = durationRef.current
    if (!el || !v || !dur) return
    const r = el.getBoundingClientRect()
    v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * dur
  }, []) // tidak perlu [duration] lagi — baca dari ref

  const onProgDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    setSeeking(true)
    seekingRef.current = true
    seekTo(e.clientX)
  }, [seekTo])

  // FIX: touch event dipasang via useEffect dengan { passive: false }
  // agar bisa memanggil preventDefault() tanpa error
  useEffect(() => {
    const el = progressRef.current
    if (!el) return

    const onTouchStart = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setSeeking(true)
      seekingRef.current = true
      if (e.touches[0]) seekTo(e.touches[0].clientX)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    return () => el.removeEventListener('touchstart', onTouchStart)
  }, [seekTo])

  const onProgHover = useCallback((e) => {
    const el = progressRef.current
    const dur = durationRef.current
    if (!el || !dur) return
    const r = el.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width))
    setHoverT({ on: true, t: pct*dur, pct: pct*100 })
  }, [])

  // ── Volume drag ────────────────────────────────────────────────────────────
  const applyVol = useCallback((clientX) => {
    const el = volumeRef.current, v = videoRef.current
    if (!el || !v) return
    const r = el.getBoundingClientRect()
    const vol = Math.max(0, Math.min(1, (clientX-r.left)/r.width))
    v.volume = vol; v.muted = vol === 0
  }, [])

  // ── Global drag listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!seeking && !volDrag) return
    const mm = (e) => {
      if (seeking) seekTo(e.clientX)
      if (volDrag) applyVol(e.clientX)
    }
    const tm = (e) => {
      if (!e.touches[0]) return
      if (seeking) seekTo(e.touches[0].clientX)
      if (volDrag) applyVol(e.touches[0].clientX)
    }
    const up = () => {
      setSeeking(false)
      seekingRef.current = false
      setVolDrag(false)
    }
    window.addEventListener('mousemove', mm)
    window.addEventListener('touchmove', tm, { passive: false })
    window.addEventListener('mouseup',   up)
    window.addEventListener('touchend',  up)
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('mouseup',   up)
      window.removeEventListener('touchend',  up)
    }
  }, [seeking, volDrag, seekTo, applyVol])

  // ── Toggle play ────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return
    if (v.paused) { v.play(); flashC('play') } else { v.pause(); flashC('pause') }
    bumpControls()
  }, [bumpControls])

  const flashC = (type) => {
    setCenterFlash(type)
    setTimeout(() => setCenterFlash(null), 600)
  }

  const showVolOSD = useCallback(() => {
    setVolOSD(true)
    clearTimeout(volTimer.current)
    volTimer.current = setTimeout(() => setVolOSD(false), 1500)
  }, [])

  // ── Click handler (single vs double) ──────────────────────────────────────
  const onVideoClick = useCallback((e) => {
    if (seekingRef.current) return
    const now = Date.now()
    const gap = now - lastTap.current
    lastTap.current = now

    if (gap < 280) {
      clearTimeout(dblTimer.current)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const v = videoRef.current
      if (!v) return
      if (e.clientX - rect.left < rect.width / 2) {
        v.currentTime = Math.max(0, v.currentTime - 10)
        setLeftRipple(true); setTimeout(() => setLeftRipple(false), 600)
      } else {
        v.currentTime = Math.min(v.duration, v.currentTime + 10)
        setRightRipple(true); setTimeout(() => setRightRipple(false), 600)
      }
    } else {
      dblTimer.current = setTimeout(() => {
        if (!showCtrl) { bumpControls(); return }
        togglePlay()
      }, 220)
    }
  }, [showCtrl, togglePlay, bumpControls])

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current; if (!v) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowLeft':
          e.preventDefault(); v.currentTime = Math.max(0, v.currentTime-10)
          setLeftRipple(true); setTimeout(()=>setLeftRipple(false),600); bumpControls(); break
        case 'ArrowRight':
          e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime+10)
          setRightRipple(true); setTimeout(()=>setRightRipple(false),600); bumpControls(); break
        case 'ArrowUp':
          e.preventDefault(); v.volume = Math.min(1, v.volume+0.1); showVolOSD(); bumpControls(); break
        case 'ArrowDown':
          e.preventDefault(); v.volume = Math.max(0, v.volume-0.1); showVolOSD(); bumpControls(); break
        case 'm': case 'M': e.preventDefault(); v.muted = !v.muted; break
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break
        case 'c': case 'C': e.preventDefault(); setSubOn(s=>!s); break
        case '>': e.preventDefault(); setSpeed(s => SPEEDS[Math.min(SPEEDS.indexOf(s)+1, SPEEDS.length-1)]); break
        case '<': e.preventDefault(); setSpeed(s => SPEEDS[Math.max(SPEEDS.indexOf(s)-1, 0)]); break
        default: break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, bumpControls, showVolOSD]) // eslint-disable-line

  // ── Subtitle track loader ──────────────────────────────────────────────────
  const loadTrack = (url, lang) => {
    const v = videoRef.current; if (!v) return
    if (trackUrlRef.current?.startsWith('blob:')) URL.revokeObjectURL(trackUrlRef.current)
    trackUrlRef.current = url
    while (v.firstChild) v.removeChild(v.firstChild)
    const t = document.createElement('track')
    t.kind='subtitles'; t.src=url; t.srclang=lang
    t.label = lang==='id'?'Indonesian':'English'; t.default=true; v.appendChild(t)
    const apply = () => { if (v.textTracks[0]) v.textTracks[0].mode = subOn ? 'showing' : 'hidden' }
    t.addEventListener('load', apply); setTimeout(apply, 200)
  }

  // ── Subtitle translate ─────────────────────────────────────────────────────
  const doTranslate = async () => {
    if (!subtitleUrl || translating) return
    setTranslating(true); setSubErr(null); setTransP(5)
    try {
      const vtt = await fetch(subtitleUrl).then(r=>r.text())
      const lines = vtt.split('\n'); const texts=[]; const structure=[]
      let i=0
      while (i<lines.length) {
        const l=lines[i].trim()
        if (!l) { structure.push({t:'e'}); i++; continue }
        if (l.startsWith('WEBVTT')||l.startsWith('NOTE')) { structure.push({t:'h',c:l}); i++; continue }
        if (l.match(/^\d+$/)) { structure.push({t:'n',c:l}); i++; continue }
        if (l.includes('-->')) {
          structure.push({t:'ts',c:l}); i++
          const seg=[]
          while (i<lines.length && lines[i].trim() && !lines[i].includes('-->')) { seg.push(lines[i].trim()); texts.push(lines[i].trim()); i++ }
          structure.push({t:'txt', count:seg.length}); continue
        }
        i++
      }
      setTransP(20)
      const r = await fetch(`${config.apiBaseUrl}/translate/batch`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({texts, targetLang:'id'})
      })
      if (!r.ok) throw new Error()
      const {translatedTexts} = await r.json()
      setTransP(85)
      let ti=0
      const out = structure.map(s=>{
        if (s.t==='e') return ''
        if (s.t==='h'||s.t==='ts'||s.t==='n') return s.c
        return Array.from({length:s.count},()=>translatedTexts[ti++]||'').join('\n')
      })
      const blob = new Blob([out.join('\n')],{type:'text/vtt;charset=utf-8'})
      loadTrack(URL.createObjectURL(blob),'id'); setSubLang('id')
      setTransP(100)
    } catch { setSubErr('Gagal menerjemahkan. Coba lagi.') }
    finally { setTranslating(false); setTransP(0) }
  }

  const switchToEn = () => { setSubLang('en'); if (subtitleUrl) loadTrack(subtitleUrl,'en') }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else if (videoRef.current) await videoRef.current.requestPictureInPicture()
    } catch {}
  }

  const changeQuality = (q) => {
    const v=videoRef.current; if (!v) return
    const t=v.currentTime, wasPlaying=!v.paused
    setQuality(q); setShowQualM(false)
    setTimeout(()=>{ v.currentTime=t; if(wasPlaying) v.play() },120)
  }

  const closeMenus = () => { setShowSpeedM(false); setShowQualM(false); setShowSubM(false) }

  // ── Helper skip ────────────────────────────────────────────────────────────
  // FIX: skip helper yang tidak bergantung pada state duration
  const skipBack = useCallback((e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, v.currentTime - 10)
    setLeftRipple(true)
    setTimeout(() => setLeftRipple(false), 600)
    bumpControls()
  }, [bumpControls])

  const skipForward = useCallback((e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(v.duration, v.currentTime + 10)
    setRightRipple(true)
    setTimeout(() => setRightRipple(false), 600)
    bumpControls()
  }, [bumpControls])

  // ── Volume icon ────────────────────────────────────────────────────────────
  const VolIcon = muted || volume===0 ? Icons.VolumeOff : volume<0.5 ? Icons.VolumeLow : Icons.VolumeHigh

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!film?.videoUrl) return (
    <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-center space-y-4 px-8">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="text-white/30" viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
          </svg>
        </div>
        <p className="text-white/50 text-base">Video tidak tersedia</p>
        <button onClick={() => navigate(`/film/${filmSlug}`)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10
                     hover:bg-white/20 text-white text-sm font-medium transition-colors">
          <Icons.ArrowBack /> Kembali
        </button>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet><title>{film.judul} — Tonton</title></Helmet>

      <div
        ref={containerRef}
        className="relative w-full h-screen bg-black overflow-hidden"
        style={{ cursor: showCtrl ? 'default' : 'none' }}
        onMouseMove={bumpControls}
        onMouseLeave={() => { if (playing) setShowCtrl(false) }}
      >

        {/* ── VIDEO ─────────────────────────────────────────────────── */}
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          playsInline
          preload="metadata"
          onClick={onVideoClick}
        />

        {/* ── BUFFERING ─────────────────────────────────────────────── */}
        {buffering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {/* ── CENTER FLASH (play/pause feedback) ────────────────────── */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none
                         transition-all duration-500
                         ${centerFlash ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`w-[72px] h-[72px] rounded-full bg-black/60 backdrop-blur-sm
                           border border-white/20 flex items-center justify-center text-white
                           transition-transform duration-300
                           ${centerFlash ? 'scale-100' : 'scale-75'}`}>
            {centerFlash === 'play' ? <Icons.Play /> : <Icons.Pause />}
          </div>
        </div>

        {/* ── SEEK RIPPLES (double tap) ─────────────────────────────── */}
        <TapRipple dir="left"  show={leftRipple} />
        <TapRipple dir="right" show={rightRipple} />

        {/* ── VOLUME OSD ────────────────────────────────────────────── */}
        <div className={`absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none
                         flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
                         bg-black/80 backdrop-blur-md border border-white/10
                         transition-all duration-300
                         ${volOSD ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
          <div className="text-white"><VolIcon /></div>
          <div className="w-24 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-75"
              style={{ width: `${muted ? 0 : volume * 100}%` }} />
          </div>
          <span className="text-white/70 text-xs font-mono w-7 text-right">
            {muted ? '0' : Math.round(volume * 100)}
          </span>
        </div>

        {/* ── SPEED BADGE ───────────────────────────────────────────── */}
        {speed !== 1 && (
          <div className={`absolute top-5 right-5 z-30 pointer-events-none
                           px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10
                           text-white text-sm font-bold tabular-nums
                           transition-opacity duration-300
                           ${showCtrl ? 'opacity-100' : 'opacity-60'}`}>
            {speed}×
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            CONTROLS LAYER
        ══════════════════════════════════════════════════════════ */}
        <div className={`absolute inset-0 z-40 flex flex-col justify-between
                         transition-opacity duration-300
                         ${showCtrl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

          {/* ── TOP GRADIENT + HEADER ──────────────────────────────── */}
          <div className="px-4 pt-4 pb-20 bg-gradient-to-b from-black/85 via-black/20 to-transparent">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/film/${filmSlug}`)}
                className="w-9 h-9 rounded-full text-white flex items-center justify-center
                           hover:bg-white/15 active:bg-white/25 transition-colors">
                <Icons.ArrowBack />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-semibold text-[15px] tracking-[-0.01em] truncate leading-tight">
                  {film.judul}
                </h1>
                {film.tahunRilis && (
                  <p className="text-white/45 text-xs mt-0.5">
                    {typeof film.tahunRilis === 'string' && film.tahunRilis.length === 4
                      ? film.tahunRilis : new Date(film.tahunRilis).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM GRADIENT + ALL CONTROLS ───────────────────────── */}
          <div className="pt-12 bg-gradient-to-t from-black/95 via-black/50 to-transparent">

            {/* Sub error */}
            {subErr && (
              <div className="mx-4 mb-2 flex items-center justify-between gap-2
                              px-3 py-2 rounded-xl bg-red-600/20 border border-red-500/30
                              text-red-300 text-xs">
                <span>{subErr}</span>
                <button onClick={()=>setSubErr(null)} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
              </div>
            )}

            {/* Translation progress */}
            {translating && (
              <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-white/8 border border-white/10">
                <div className="flex justify-between text-white/60 text-[11px] mb-1.5">
                  <span>Menerjemahkan subtitle…</span><span>{transP}%</span>
                </div>
                <div className="h-[3px] rounded-full bg-white/10">
                  <div className="h-full bg-[#f00] rounded-full transition-all" style={{width:`${transP}%`}} />
                </div>
              </div>
            )}

            {/* ── PROGRESS BAR ─────────────────────────────────────────── */}
            <div className="px-4 mb-1">
              {/* Time stamps */}
              <div className="flex items-center justify-between mb-1.5 px-px">
                <span className="text-white/80 text-[12px] font-medium tabular-nums">{fmt(currentTime)}</span>
                <span className="text-white/40 text-[12px] tabular-nums">{duration > 0 ? fmt(duration) : ''}</span>
              </div>

              {/* Scrubber */}
              <div
                ref={progressRef}
                className="relative cursor-pointer group/bar"
                style={{ height: '20px' }}
                onMouseDown={onProgDown}
                onMouseMove={onProgHover}
                onMouseLeave={() => !seeking && setHoverT(h=>({...h,on:false}))}
                // onTouchStart dipasang via useEffect dengan passive: false
              >
                {/* Track */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-full overflow-hidden"
                  style={{ height: seeking ? '5px' : '3px', transition: 'height 0.12s' }}>
                  {/* BG */}
                  <div className="absolute inset-0 bg-white/25" />
                  {/* Buffered */}
                  <div className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all"
                    style={{width:`${bufPct}%`}} />
                  {/* Played */}
                  <div className="absolute top-0 left-0 h-full bg-[#f00] rounded-full transition-none"
                    style={{width:`${progress}%`}} />
                </div>

                {/* Thumb */}
                <div className={`absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-white shadow-md
                                 transition-opacity duration-100
                                 ${seeking ? 'opacity-100 scale-[1.4]' : 'opacity-0 group-hover/bar:opacity-100 group-hover/bar:scale-125'}`}
                  style={{left:`calc(${progress}% - 7px)`, transitionProperty:'opacity,transform'}} />

                {/* Hover tooltip */}
                {(hoverT.on || seeking) && (
                  <div className="absolute bottom-6 pointer-events-none -translate-x-1/2 z-50"
                    style={{left:`${hoverT.pct}%`}}>
                    <div className="px-2 py-1 rounded-lg bg-[#161616] border border-white/10
                                    text-white text-[11px] font-medium tabular-nums whitespace-nowrap shadow-xl">
                      {fmt(hoverT.t)}
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full
                                    w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px]
                                    border-l-transparent border-r-transparent border-t-[#161616]" />
                  </div>
                )}
              </div>
            </div>

            {/* ── CONTROL ROW ─────────────────────────────────────────────── */}
            {/* FIX: hapus onClick={closeMenus} dari wrapper — ini yang memblokir child clicks */}
            <div className="px-2 pb-4 sm:pb-5 flex items-center gap-0.5">

              {/* Play/Pause */}
              <Tip label={playing ? 'Jeda (K)' : 'Putar (K)'}>
                <button
                  onClick={(e) => { e.stopPropagation(); closeMenus(); togglePlay() }}
                  className="w-11 h-11 flex items-center justify-center text-white
                             rounded-full hover:bg-white/10 active:scale-90 transition-all">
                  {playing ? <Icons.Pause /> : <Icons.Play />}
                </button>
              </Tip>

              {/* Skip back — FIX: gunakan skipBack helper */}
              <Tip label="−10 detik (←)">
                <button onClick={skipBack}
                  className="w-10 h-10 flex items-center justify-center text-white
                             rounded-full hover:bg-white/10 active:scale-90 transition-all">
                  <Icons.Replay10 />
                </button>
              </Tip>

              {/* Skip fwd — FIX: gunakan skipForward helper */}
              <Tip label="+10 detik (→)">
                <button onClick={skipForward}
                  className="w-10 h-10 flex items-center justify-center text-white
                             rounded-full hover:bg-white/10 active:scale-90 transition-all">
                  <Icons.Forward10 />
                </button>
              </Tip>

              {/* Volume */}
              <div className="flex items-center group/vol ml-0.5" onClick={e=>e.stopPropagation()}>
                <Tip label={muted ? 'Suarakan (M)' : 'Bisukan (M)'}>
                  <button onClick={()=>{ if(videoRef.current) videoRef.current.muted=!videoRef.current.muted }}
                    className="w-10 h-10 flex items-center justify-center text-white
                               rounded-full hover:bg-white/10 active:scale-90 transition-all">
                    <VolIcon />
                  </button>
                </Tip>
                {/* Slider — expands on hover */}
                <div className="overflow-hidden transition-all duration-200 w-0 group-hover/vol:w-[90px]">
                  <div ref={volumeRef}
                    className="relative w-[90px] h-4 flex items-center cursor-pointer ml-1"
                    style={{touchAction:'none'}}
                    onMouseDown={(e)=>{e.preventDefault();setVolDrag(true);applyVol(e.clientX)}}>
                    <div className="absolute inset-y-0 left-0 right-0 my-auto h-[3px] rounded-full bg-white/20 overflow-hidden"
                      style={{height:'3px'}}>
                      <div className="h-full bg-white rounded-full transition-none"
                        style={{width:`${muted?0:volume*100}%`}} />
                    </div>
                    <div className="absolute w-3 h-3 rounded-full bg-white shadow -translate-x-1/2
                                    opacity-0 group-hover/vol:opacity-100 transition-opacity"
                      style={{left:`${muted?0:volume*100}%`}} />
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Subtitle toggle */}
              {subtitleUrl && (
                <div className="relative" onClick={e=>e.stopPropagation()}>
                  <Tip label="Subtitle (C)">
                    <button onClick={()=>{closeMenus(); setShowSubM(s=>!s)}}
                      className={`w-10 h-10 flex items-center justify-center rounded-full
                                 hover:bg-white/10 active:scale-95 transition-all
                                 ${subOn ? 'text-white' : 'text-white/30'}`}>
                      <Icons.CC />
                    </button>
                  </Tip>
                  {showSubM && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={()=>setShowSubM(false)} />
                      <div className="absolute right-0 bottom-14 z-50 w-48 rounded-2xl overflow-hidden
                                      bg-[#1a1a1a] border border-white/10 shadow-2xl py-1.5">
                        <div className="px-3 pt-0.5 pb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Subtitle</p>
                          <button onClick={()=>setSubOn(s=>!s)}
                            className="w-full flex items-center justify-between py-1.5 px-1 rounded-lg
                                       hover:bg-white/5 text-white text-sm transition-colors">
                            <span className="text-white/80">{subOn ? 'Aktif' : 'Nonaktif'}</span>
                            <div className={`w-9 h-5 rounded-full relative transition-colors ${subOn?'bg-[#f00]':'bg-white/20'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                                              ${subOn?'left-4':'left-0.5'}`} />
                            </div>
                          </button>
                        </div>
                        <div className="h-px bg-white/8 mx-3 mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-1.5">Bahasa</p>
                        <button onClick={switchToEn}
                          className={`w-full flex items-center justify-between px-4 py-2
                                      hover:bg-white/8 transition-colors text-sm
                                      ${subLang==='en'?'text-white font-medium':'text-white/50'}`}>
                          English {subLang==='en' && <Icons.Check />}
                        </button>
                        <button onClick={doTranslate} disabled={translating}
                          className={`w-full flex items-center justify-between px-4 py-2
                                      hover:bg-white/8 transition-colors text-sm
                                      ${subLang==='id'?'text-white font-medium':'text-white/50'}
                                      ${translating?'opacity-50 cursor-not-allowed':''}`}>
                          <span className="flex items-center gap-2">
                            Indonesia
                            {translating && <span className="text-[#f00] text-xs">{transP}%</span>}
                          </span>
                          {subLang==='id' && !translating && <Icons.Check />}
                          {translating && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Speed */}
              <div className="relative" onClick={e=>e.stopPropagation()}>
                <Tip label={`Kecepatan (< >)`}>
                  <button onClick={()=>{closeMenus(); setShowSpeedM(s=>!s)}}
                    className={`h-10 px-2.5 rounded-full text-[13px] font-bold
                               hover:bg-white/10 active:scale-95 transition-all
                               ${speed!==1?'text-[#f00]':'text-white'}`}>
                    {speed===1?'1×':`${speed}×`}
                  </button>
                </Tip>
                {showSpeedM && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={()=>setShowSpeedM(false)} />
                    <div className="absolute right-0 bottom-14 z-50 w-36 rounded-2xl overflow-hidden
                                    bg-[#1a1a1a] border border-white/10 shadow-2xl py-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-1.5">
                        Kecepatan
                      </p>
                      {SPEEDS.map(s => (
                        <button key={s} onClick={()=>{setSpeed(s);setShowSpeedM(false)}}
                          className={`w-full flex items-center justify-between px-4 py-2
                                      text-sm hover:bg-white/8 transition-colors
                                      ${speed===s?'text-white font-semibold':'text-white/50'}`}>
                          {s===1?'Normal':`${s}×`}
                          {speed===s && <Icons.Check />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quality */}
              {videoInfo?.qualities?.length > 1 && (
                <div className="relative" onClick={e=>e.stopPropagation()}>
                  <Tip label="Kualitas Video">
                    <button onClick={()=>{closeMenus(); setShowQualM(s=>!s)}}
                      className="h-10 px-2.5 rounded-full text-[12px] font-bold text-white/70
                                 hover:bg-white/10 hover:text-white active:scale-95 transition-all">
                      {quality?.label || 'HD'}
                    </button>
                  </Tip>
                  {showQualM && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={()=>setShowQualM(false)} />
                      <div className="absolute right-0 bottom-14 z-50 w-44 rounded-2xl overflow-hidden
                                      bg-[#1a1a1a] border border-white/10 shadow-2xl py-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-1.5">
                          Kualitas
                        </p>
                        {[...videoInfo.qualities].sort((a,b)=>(b.width||0)-(a.width||0)).map((q,i)=>(
                          <button key={i} onClick={()=>changeQuality(q)}
                            className={`w-full flex items-center justify-between px-4 py-2
                                        text-sm hover:bg-white/8 transition-colors
                                        ${quality?.label===q.label?'text-white font-semibold':'text-white/50'}`}>
                            <div>
                              <div>{q.label}</div>
                              <div className="text-[10px] text-white/30">{q.width}×{q.height}</div>
                            </div>
                            {quality?.label===q.label && <Icons.Check />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PiP */}
              {document.pictureInPictureEnabled && (
                <Tip label="Picture-in-Picture">
                  <button onClick={(e)=>{e.stopPropagation();togglePiP()}}
                    className={`w-10 h-10 flex items-center justify-center rounded-full
                               hover:bg-white/10 active:scale-95 transition-all
                               ${pip?'text-[#f00]':'text-white/60 hover:text-white'}`}>
                    <Icons.PiP />
                  </button>
                </Tip>
              )}

              {/* Fullscreen */}
              <Tip label={fullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}>
                <button onClick={(e)=>{e.stopPropagation();toggleFullscreen()}}
                  className="w-10 h-10 flex items-center justify-center text-white
                             rounded-full hover:bg-white/10 active:scale-90 transition-all">
                  {fullscreen ? <Icons.ExitFullscreen /> : <Icons.Fullscreen />}
                </button>
              </Tip>
            </div>
          </div>
        </div>

        {/* ── BIG CENTER PLAY (paused, no animation active) ──────────── */}
        {/* FIX: cek langsung dari video element via ref, bukan state */}
        {!playing && !buffering && !centerFlash && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className={`transition-all duration-300
                            ${showCtrl ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="w-[72px] h-[72px] rounded-full bg-black/60 backdrop-blur-sm
                              border border-white/20 flex items-center justify-center text-white shadow-2xl
                              hover:bg-black/80 transition-colors">
                <Icons.Play />
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}