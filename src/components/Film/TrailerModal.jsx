// ============================================
// src/components/Film/TrailerModal.jsx - Trailer Modal dengan UI/UX Terbaik
// ============================================

import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

const TrailerModal = ({ isOpen, onClose, trailerUrl, filmTitle }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef(null)
  const hideControlsTimeout = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Auto-play when modal opens
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Auto-play might be blocked, user needs to click play
          })
        }
      }, 300)
    } else {
      document.body.style.overflow = 'unset'
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Auto-hide controls when playing
  useEffect(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }

    if (isPlaying && showControls) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000) // Hide after 3 seconds of inactivity
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
    }
  }, [isPlaying, showControls])

  const handleMouseMove = () => {
    setShowControls(true)
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Close Button - Top Right */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 z-[10000] p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all hover:scale-110 group ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Close trailer"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal Content */}
      <div
        className="relative w-full max-w-6xl mx-4 animate-in zoom-in-95 duration-300"
        onMouseMove={handleMouseMove}
      >
        {/* Title */}
        <div className={`mb-4 text-center transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Trailer - {filmTitle}
          </h2>
          <p className="text-gray-400 text-sm">Tekan ESC untuk menutup</p>
        </div>

        {/* Video Container */}
        <div
          ref={containerRef}
          className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${
            !showControls && isPlaying ? 'cursor-none' : ''
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src={trailerUrl}
            className="w-full aspect-video object-contain"
            onClick={togglePlay}
            playsInline
            crossOrigin="anonymous"
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
              <button
                onClick={togglePlay}
                className="p-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all hover:scale-110"
              >
                <Play className="w-16 h-16 text-white" fill="currentColor" />
              </button>
            </div>
          )}

          {/* Controls - Bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-6 h-6 text-white" />
                  ) : (
                    <Maximize className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`mt-4 flex justify-center gap-3 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Tutup Trailer
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}

export default TrailerModal