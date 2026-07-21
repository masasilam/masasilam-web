import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

const TrailerModal = ({ isOpen, onClose, trailerUrl, filmTitle }) => {
  const videoRef        = useRef(null)
  const iframeRef       = useRef(null)
  const containerRef    = useRef(null)
  const hideCtrlTimeout = useRef(null)

  const [isPlaying,    setIsPlaying]    = useState(false)
  const [isMuted,      setIsMuted]      = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)

  // Deteksi apakah URL adalah embed YouTube atau video langsung
  const isEmbed = trailerUrl?.includes('youtube') || trailerUrl?.includes('youtu.be')
    || trailerUrl?.includes('embed') || trailerUrl?.includes('vimeo')
    || trailerUrl?.includes('dailymotion')

  // ── Body scroll lock ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setShowControls(true)
      setCurrentTime(0)
      setIsPlaying(false)

      if (!isEmbed) {
        setTimeout(() => {
          videoRef.current?.play().catch(() => {})
        }, 300)
      }
    } else {
      document.body.style.overflow = 'unset'
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, isEmbed])

  // ── Auto-hide controls ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(hideCtrlTimeout.current)
    if (isPlaying && showControls && !isEmbed) {
      hideCtrlTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(hideCtrlTimeout.current)
  }, [isPlaying, showControls, isEmbed])

  // ── Video events ────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || isEmbed) return

    const onPlay     = () => setIsPlaying(true)
    const onPause    = () => { setIsPlaying(false); setShowControls(true) }
    const onUpdate   = () => setCurrentTime(video.currentTime)
    const onMeta     = () => setDuration(video.duration)

    video.addEventListener('play',            onPlay)
    video.addEventListener('pause',           onPause)
    video.addEventListener('timeupdate',      onUpdate)
    video.addEventListener('loadedmetadata',  onMeta)

    return () => {
      video.removeEventListener('play',           onPlay)
      video.removeEventListener('pause',          onPause)
      video.removeEventListener('timeupdate',     onUpdate)
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [isEmbed])

  // ── Fullscreen change ───────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  // ── Keyboard ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') { onClose(); return }
      if (isEmbed) return
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isEmbed]) // eslint-disable-line

  const bumpControls = () => setShowControls(true)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleProgressClick = (e) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const handleVideoClick = () => {
    if (!showControls && isPlaying) { bumpControls(); return }
    togglePlay()
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm">

      {/* Close button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 z-[10000] p-3 rounded-full transition-all
                    bg-black/60 hover:bg-black/80 text-white hover:scale-110 group
                    ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div
        className="relative w-full max-w-6xl mx-4"
        onMouseMove={bumpControls}
        onTouchStart={bumpControls}
      >

        {/* Title */}
        <div className={`mb-4 text-center transition-all duration-300
                         ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Trailer — {filmTitle}
          </h2>
          {!isEmbed && (
            <p className="text-gray-400 text-sm mt-1">Tekan ESC untuk tutup, Spasi untuk play/pause</p>
          )}
          {isEmbed && (
            <p className="text-gray-400 text-sm mt-1">Tekan ESC untuk tutup</p>
          )}
        </div>

        {/* Video container */}
        <div
          ref={containerRef}
          className="relative bg-black rounded-xl overflow-hidden shadow-2xl aspect-video"
          onMouseMove={bumpControls}
          onTouchStart={bumpControls}
        >

          {/* ── EMBED (YouTube, Vimeo, dll) ── */}
          {isEmbed ? (
            <iframe
              ref={iframeRef}
              src={trailerUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`Trailer ${filmTitle}`}
            />
          ) : (
            /* ── DIRECT VIDEO ── */
            <>
              <video
                ref={videoRef}
                src={trailerUrl}
                className="w-full h-full object-contain"
                onClick={handleVideoClick}
                playsInline
                crossOrigin="anonymous"
                style={{ cursor: !showControls && isPlaying ? 'none' : 'pointer' }}
              />

              {/* Big play button — saat pause */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
                  onClick={togglePlay}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay() }}
                    className="p-6 rounded-full transition-all hover:scale-110
                               bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    <Play className="w-14 h-14 text-white" fill="currentColor" />
                  </button>
                </div>
              )}

              {/* Controls bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 z-30
                             bg-gradient-to-t from-black/90 via-black/50 to-transparent
                             transition-all duration-300
                             ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
              >
                {/* Progress bar */}
                <div className="px-4 pb-2">
                  <div
                    className="relative h-1.5 rounded-full cursor-pointer
                               bg-white/20 hover:h-2 transition-all group"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute h-full bg-red-600 rounded-full"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2
                                      w-3 h-3 rounded-full bg-red-600
                                      opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Control row */}
                <div className="px-4 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">

                    {/* Play/Pause */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePlay() }}
                      className="p-2 rounded-full transition-colors hover:bg-white/10 text-white"
                    >
                      {isPlaying
                        ? <Pause  className="w-5 h-5" />
                        : <Play   className="w-5 h-5" />
                      }
                    </button>

                    {/* Mute */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMute() }}
                      className="p-2 rounded-full transition-colors hover:bg-white/10 text-white"
                    >
                      {isMuted
                        ? <VolumeX className="w-5 h-5" />
                        : <Volume2 className="w-5 h-5" />
                      }
                    </button>

                    {/* Time */}
                    <span className="text-white text-sm tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
                    className="p-2 rounded-full transition-colors hover:bg-white/10 text-white"
                  >
                    {isFullscreen
                      ? <Minimize className="w-5 h-5" />
                      : <Maximize className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer button */}
        <div className={`mt-4 flex justify-center transition-all duration-300
                         ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium transition-colors text-white
                       bg-gray-700 hover:bg-gray-600"
          >
            Tutup Trailer
          </button>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

export default TrailerModal