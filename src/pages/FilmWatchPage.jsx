import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { filmService } from '../services/filmService'
import {
  ArrowLeft,
  Film,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Loader2,
  Check,
  Subtitles
} from 'lucide-react'
import config from '../config/env'

export default function FilmWatchPage() {
  const { filmSlug } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const hideTimeout = useRef(null)
  const currentTrackUrl = useRef(null)
  const progressBarRef = useRef(null)

  const [state, setState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    showControls: true,
    fullscreen: false,
    buffering: false,
    subtitles: true,
    selectedQuality: null,
    showQualityMenu: false
  })

  const [hoverState, setHoverState] = useState({
    isHovering: false,
    time: 0,
    position: 0
  })

  const [dragState, setDragState] = useState({
    isDragging: false
  })

  const [subtitleState, setSubtitleState] = useState({
    language: 'en',
    translating: false,
    translatedUrl: null,
    error: null,
    progress: 0
  })

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
      const res = await fetch(`${config.apiBaseUrl}/films/${filmSlug}/video-info`)
      return res.json()
    },
    enabled: !!film
  })

  useEffect(() => {
    if (videoInfo?.qualities?.length && !state.selectedQuality) {
      const best = [...videoInfo.qualities].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
      setState(s => ({ ...s, selectedQuality: best }))
    }
  }, [videoInfo, state.selectedQuality])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setState(s => ({ ...s, playing: true }))
    const handlePause = () => setState(s => ({ ...s, playing: false }))
    const handleTimeUpdate = () => setState(s => ({ ...s, currentTime: video.currentTime }))
    const handleDurationChange = () => setState(s => ({ ...s, duration: video.duration }))
    const handleVolumeChange = () => setState(s => ({ ...s, volume: video.volume, muted: video.muted }))
    const handleWaiting = () => setState(s => ({ ...s, buffering: true }))
    const handlePlaying = () => setState(s => ({ ...s, buffering: false }))

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('loadedmetadata', handleDurationChange)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('canplay', handlePlaying)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('loadedmetadata', handleDurationChange)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('canplay', handlePlaying)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video?.textTracks?.[0]) return
    video.textTracks[0].mode = state.subtitles ? 'showing' : 'hidden'
  }, [state.subtitles])

  useEffect(() => {
    const handleFullscreen = () => setState(s => ({ ...s, fullscreen: !!document.fullscreenElement }))
    document.addEventListener('fullscreenchange', handleFullscreen)
    return () => document.removeEventListener('fullscreenchange', handleFullscreen)
  }, [])

  useEffect(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)

    if (state.playing && state.showControls && !dragState.isDragging) {
      hideTimeout.current = setTimeout(() => {
        setState(s => ({ ...s, showControls: false }))
      }, 3000)
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [state.playing, state.showControls, dragState.isDragging])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current
      if (!video) return

      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          video.paused ? video.play() : video.pause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case 'ArrowRight':
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          video.volume = Math.min(1, video.volume + 0.1)
          break
        case 'ArrowDown':
          e.preventDefault()
          video.volume = Math.max(0, video.volume - 0.1)
          break
        case 'm':
          e.preventDefault()
          video.muted = !video.muted
          break
        case 'f':
          e.preventDefault()
          if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
          } else {
            document.exitFullscreen()
          }
          break
        case 'c':
          e.preventDefault()
          setState(s => ({ ...s, subtitles: !s.subtitles }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // FIXED: Improved global drag handling
  useEffect(() => {
    const updatePosition = (clientX) => {
      if (!progressBarRef.current || !videoRef.current || !state.duration) return

      const rect = progressBarRef.current.getBoundingClientRect()
      const x = Math.max(rect.left, Math.min(clientX, rect.right))
      const percent = (x - rect.left) / rect.width
      const time = percent * state.duration

      // Update video time
      videoRef.current.currentTime = time

      // Update hover state for tooltip
      setHoverState({
        isHovering: true,
        time: time,
        position: percent * 100
      })
    }

    const handleGlobalMouseMove = (e) => {
      if (dragState.isDragging) {
        e.preventDefault()
        updatePosition(e.clientX)
      }
    }

    const handleGlobalTouchMove = (e) => {
      if (dragState.isDragging && e.touches[0]) {
        e.preventDefault()
        updatePosition(e.touches[0].clientX)
      }
    }

    const handleGlobalUp = () => {
      if (dragState.isDragging) {
        setDragState({ isDragging: false })
      }
    }

    if (dragState.isDragging) {
      // Use capture phase to ensure we get the events
      window.addEventListener('mousemove', handleGlobalMouseMove, true)
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false, capture: true })
      window.addEventListener('mouseup', handleGlobalUp, true)
      window.addEventListener('touchend', handleGlobalUp, true)
      window.addEventListener('touchcancel', handleGlobalUp, true)

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove, true)
        window.removeEventListener('touchmove', handleGlobalTouchMove, true)
        window.removeEventListener('mouseup', handleGlobalUp, true)
        window.removeEventListener('touchend', handleGlobalUp, true)
        window.removeEventListener('touchcancel', handleGlobalUp, true)
      }
    }
  }, [dragState.isDragging, state.duration])

  const handleMouseMove = () => {
    if (!dragState.isDragging) {
      setState(s => ({ ...s, showControls: true }))
    }
  }

  const togglePlay = (e) => {
    // Don't toggle play when dragging
    if (dragState.isDragging) {
      e.stopPropagation()
      return
    }

    if (!state.showControls) {
      setState(s => ({ ...s, showControls: true }))
      return
    }

    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }

  const seekToPosition = (clientX) => {
    if (!progressBarRef.current || !videoRef.current || !state.duration) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const x = Math.max(rect.left, Math.min(clientX, rect.right))
    const percent = (x - rect.left) / rect.width
    videoRef.current.currentTime = percent * state.duration
  }

  const handleProgressMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragState({ isDragging: true })
    seekToPosition(e.clientX)
  }

  const handleProgressTouchStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragState({ isDragging: true })
    if (e.touches[0]) {
      seekToPosition(e.touches[0].clientX)
    }
  }

  const handleProgressHover = (e) => {
    if (dragState.isDragging || !state.duration || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, hoverX / rect.width))
    const time = percent * state.duration
    const position = percent * 100

    setHoverState({
      isHovering: true,
      time: time,
      position: position
    })
  }

  const handleProgressLeave = () => {
    if (!dragState.isDragging) {
      setHoverState({
        isHovering: false,
        time: 0,
        position: 0
      })
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const changeQuality = (q) => {
    const video = videoRef.current
    if (!video) return

    const time = video.currentTime
    const playing = !video.paused

    setState(s => ({ ...s, selectedQuality: q, showQualityMenu: false }))

    setTimeout(() => {
      if (video) {
        video.currentTime = time
        if (playing) video.play()
      }
    }, 100)
  }

  const translateSubtitle = async () => {
    if (!subtitleUrl) return

    setSubtitleState(s => ({ ...s, translating: true, error: null }))

    try {
      const response = await fetch(subtitleUrl)
      const vttText = await response.text()

      console.log('Original VTT preview:', vttText.substring(0, 300))

      const lines = vttText.split('\n')
      const textToTranslate = []
      const vttStructure = []

      let i = 0
      while (i < lines.length) {
        const line = lines[i].trim()

        if (line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
          vttStructure.push({ type: 'header', content: line })
          i++
          continue
        }

        if (line === '') {
          vttStructure.push({ type: 'empty', content: '' })
          i++
          continue
        }

        if (line.includes('-->')) {
          vttStructure.push({ type: 'timestamp', content: line })
          i++

          const subtitleLines = []
          while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
            const textLine = lines[i].trim()
            if (textLine) {
              subtitleLines.push(textLine)
              textToTranslate.push(textLine)
            }
            i++
          }

          vttStructure.push({
            type: 'text',
            content: subtitleLines.join('\n'),
            textIndex: textToTranslate.length - subtitleLines.length
          })
          continue
        }

        if (line.match(/^\d+$/)) {
          vttStructure.push({ type: 'cue', content: line })
          i++
          continue
        }

        i++
      }

      console.log(`Found ${textToTranslate.length} subtitle lines to translate`)

      setSubtitleState(s => ({ ...s, progress: 10 }))

      const translatedTexts = await translateBatch(textToTranslate)

      console.log(`Received ${translatedTexts.length} translated lines`)

      if (translatedTexts.length !== textToTranslate.length) {
        console.warn(`⚠️ MISMATCH: Expected ${textToTranslate.length} translations, got ${translatedTexts.length}`)
      }

      setSubtitleState(s => ({ ...s, progress: 90 }))

      const rebuiltLines = []
      let translationIndex = 0

      for (const entry of vttStructure) {
        if (entry.type === 'header' || entry.type === 'timestamp' || entry.type === 'cue') {
          rebuiltLines.push(entry.content)
        } else if (entry.type === 'empty') {
          rebuiltLines.push('')
        } else if (entry.type === 'text') {
          const originalLines = entry.content.split('\n')
          const originalLineCount = originalLines.length

          const translatedLines = []
          for (let j = 0; j < originalLineCount; j++) {
            if (translationIndex < translatedTexts.length) {
              translatedLines.push(translatedTexts[translationIndex])
              translationIndex++
            } else {
              console.warn(`Missing translation for line ${translationIndex}, using original`)
              translatedLines.push(originalLines[j] || '')
            }
          }

          rebuiltLines.push(translatedLines.join('\n'))
        }
      }

      const finalVtt = rebuiltLines.join('\n')

      console.log('Translated VTT preview:', finalVtt.substring(0, 500))

      const blob = new Blob([finalVtt], { type: 'text/vtt; charset=utf-8' })
      const url = URL.createObjectURL(blob)

      setSubtitleState({
        language: 'id',
        translating: false,
        translatedUrl: url,
        error: null,
        progress: 0
      })

      reloadSubtitleTrack(url)

      console.log('Translation complete!')

    } catch (error) {
      console.error('Translation error:', error)
      setSubtitleState(s => ({
        ...s,
        translating: false,
        error: 'Gagal menerjemahkan subtitle. Coba lagi.',
        progress: 0
      }))
    }
  }

  const translateBatch = async (texts) => {
    try {
      console.log('Sending to translation API:', texts.length, 'lines')

      const response = await fetch(`${config.apiBaseUrl}/translate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: texts,
          targetLang: 'id'
        })
      })

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`)
      }

      const data = await response.json()

      console.log('Translation API response:', data)

      if (data.translatedTexts && Array.isArray(data.translatedTexts)) {
        console.log(`Successfully translated ${data.translatedCount} lines`)
        return data.translatedTexts
      }

      throw new Error('Invalid response from translation API')

    } catch (error) {
      console.error('Translation batch failed:', error)
      return texts
    }
  }

  const reloadSubtitleTrack = (newUrl) => {
    const video = videoRef.current
    if (!video) return

    console.log('Reloading subtitle track with new URL:', newUrl)

    if (currentTrackUrl.current && currentTrackUrl.current.startsWith('blob:')) {
      URL.revokeObjectURL(currentTrackUrl.current)
    }
    currentTrackUrl.current = newUrl

    while (video.firstChild) {
      video.removeChild(video.firstChild)
    }

    const track = document.createElement('track')
    track.kind = 'subtitles'
    track.src = newUrl
    track.srclang = subtitleState.language === 'id' ? 'id' : 'en'
    track.label = subtitleState.language === 'id' ? 'Indonesian' : 'English'
    track.default = true

    video.appendChild(track)

    console.log('New track added:', track.src)

    track.addEventListener('load', () => {
      console.log('Track loaded successfully')
      if (video.textTracks[0]) {
        video.textTracks[0].mode = state.subtitles ? 'showing' : 'hidden'
        console.log('Track mode set to:', video.textTracks[0].mode)
      }
    })

    setTimeout(() => {
      if (video.textTracks[0]) {
        video.textTracks[0].mode = state.subtitles ? 'showing' : 'hidden'
        console.log('Track mode forced to:', video.textTracks[0].mode)
      }
    }, 200)
  }

  const switchToOriginalSubtitle = () => {
    console.log('Switching back to original subtitle')

    setSubtitleState({
      language: 'en',
      translating: false,
      translatedUrl: null,
      error: null,
      progress: 0
    })

    if (subtitleUrl) {
      reloadSubtitleTrack(subtitleUrl)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    )
  }

  if (!film?.videoUrl) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Video tidak tersedia</p>
        </div>
      </div>
    )
  }

  const videoSrc = state.selectedQuality?.src || film.videoUrl
  const subtitleUrl = film.subtitleUrl ? `${config.apiBaseUrl}/films/${filmSlug}/subtitle` : null
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

  useEffect(() => {
    if (subtitleUrl && videoRef.current && !currentTrackUrl.current) {
      console.log('Loading initial subtitle:', subtitleUrl)
      reloadSubtitleTrack(subtitleUrl)
    }
  }, [subtitleUrl])

  return (
    <>
      <Helmet>
        <title>Watch {film.judul}</title>
      </Helmet>

      <div
        ref={containerRef}
        className={`relative w-full h-screen bg-black overflow-hidden ${!state.showControls && state.playing ? 'cursor-none' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={videoSrc}
          crossOrigin="anonymous"
          onClick={togglePlay}
          playsInline
          preload="metadata"
        />

        {/* Buffering */}
        {state.buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        )}

        {/* Center Play Button */}
        {!state.playing && !state.buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/60 rounded-full p-8">
              <Play className="w-20 h-20 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div
          className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${
            state.showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="bg-gradient-to-b from-black/90 to-transparent p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/film/${filmSlug}`)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-white text-xl font-bold">{film.judul}</h1>
                {film.tahunRilis && (
                  <p className="text-gray-300 text-sm">
                    {new Date(film.tahunRilis).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
            state.showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Translation Error */}
          {subtitleState.error && (
            <div className="px-4 sm:px-6 pb-2">
              <div className="bg-red-900/90 backdrop-blur-sm text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center justify-between">
                <span>{subtitleState.error}</span>
                <button
                  onClick={() => setSubtitleState(s => ({ ...s, error: null }))}
                  className="ml-3 hover:bg-white/10 rounded p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar - IMPROVED WITH BETTER TOUCH */}
          <div className="px-4 sm:px-6 pb-3">
            <div
              ref={progressBarRef}
              className="relative h-2 sm:h-2.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 sm:hover:h-3 transition-all group select-none"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressLeave}
              onTouchStart={handleProgressTouchStart}
              style={{ touchAction: 'none' }}
            >
              <div
                className="absolute h-full bg-red-600 rounded-full pointer-events-none transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full shadow-lg transition-all ${
                  dragState.isDragging ? 'opacity-100 scale-150' : 'opacity-0 group-hover:opacity-100 group-hover:scale-125'
                }`} />
              </div>

              {/* Hover Time Tooltip */}
              {(hoverState.isHovering || dragState.isDragging) && (
                <div
                  className="absolute bottom-full mb-3 -translate-x-1/2 pointer-events-none z-50"
                  style={{ left: `${hoverState.position}%` }}
                >
                  <div className="bg-black/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-xl border border-white/10 whitespace-nowrap">
                    {formatTime(hoverState.time)}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90" />
                </div>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-gradient-to-t from-black/90 to-transparent px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {state.playing ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>

              {/* Skip Back */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(
                      state.duration,
                      videoRef.current.currentTime + 10
                    )
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Volume */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {state.muted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Time */}
              <div className="text-white text-xs sm:text-sm font-medium tabular-nums">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>

              <div className="hidden sm:flex flex-1 min-w-0" />

              {/* Subtitles */}
              {subtitleUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setState(s => ({ ...s, subtitles: !s.subtitles }))}
                    className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                      state.subtitles ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Subtitles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm hidden md:inline">{state.subtitles ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="flex items-center bg-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={switchToOriginalSubtitle}
                      disabled={subtitleState.translating}
                      className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        subtitleState.language === 'en'
                          ? 'bg-white/20 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      } ${subtitleState.translating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={translateSubtitle}
                      disabled={subtitleState.translating}
                      className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        subtitleState.language === 'id'
                          ? 'bg-white/20 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      } ${subtitleState.translating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {subtitleState.translating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="hidden md:inline text-xs">{subtitleState.progress}%</span>
                        </>
                      ) : (
                        'ID'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Quality */}
              {videoInfo?.qualities?.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setState(s => ({ ...s, showQualityMenu: !s.showQualityMenu }))}
                    className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm hidden md:inline">{state.selectedQuality?.label || 'HD'}</span>
                  </button>

                  {state.showQualityMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setState(s => ({ ...s, showQualityMenu: false }))}
                      />
                      <div className="absolute right-0 bottom-full mb-2 bg-black/95 backdrop-blur-sm rounded-lg min-w-[200px] border border-white/10 z-50">
                        <div className="py-1">
                          {videoInfo.qualities
                            .sort((a, b) => (b.width || 0) - (a.width || 0))
                            .map((q, i) => (
                              <button
                                key={i}
                                onClick={() => changeQuality(q)}
                                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                                  state.selectedQuality?.label === q.label ? 'text-red-400' : 'text-white'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold text-sm">{q.label}</div>
                                  <div className="text-xs text-gray-400">{q.width}×{q.height}</div>
                                </div>
                                {state.selectedQuality?.label === q.label && <Check className="w-5 h-5" />}
                              </button>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    containerRef.current?.requestFullscreen()
                  } else {
                    document.exitFullscreen()
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {state.fullscreen ? <Minimize className="w-5 h-5 sm:w-6 sm:h-6" /> : <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}