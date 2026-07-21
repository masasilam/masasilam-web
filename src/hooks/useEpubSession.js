import { useEffect, useRef } from 'react'
import { chapterService } from '../services/chapterService'
import { getDeviceType } from '../utils/epubUtils'

export const useEpubSession = ({ slug, isAuthenticated, isZineMode, refs }) => {
  const {
    sessionIdRef,
    sessionStartRef,
    latestProgressRef,
    locationsReadyRef,
    sessionSentRef,
    spineIndexRef,
    totalSpineItemsRef,
    currentChapterLabelRef,
    currentChapterIndexRef,
    totalChaptersRef,
    currentCfiRef,
  } = refs

  useEffect(() => {
    if (!isAuthenticated) return

    const sessionId  = sessionIdRef.current
    const deviceType = getDeviceType()

    const buildPayload = () => ({
      sessionId,
      durationSeconds:    Math.round((Date.now() - sessionStartRef.current) / 1000),
      progressPercent:    latestProgressRef.current,
      progressIsAccurate: locationsReadyRef.current,
      deviceType,
      spineIndex:      spineIndexRef.current,
      totalSpineItems: totalSpineItemsRef.current,
      chapterLabel:    currentChapterLabelRef.current,
      chapterIndex:    currentChapterIndexRef.current,
      totalChapters:   totalChaptersRef.current,
      lastCfi:         currentCfiRef.current,
    })

    const handleBeforeUnload = () => {
      if (sessionSentRef.current) return
      sessionSentRef.current = true

      const payload = buildPayload()
      if (payload.durationSeconds < 5) return

      const apiBase       = import.meta.env.VITE_API_BASE_URL || '/api'
      const token         = localStorage.getItem('token')
      const contentPrefix = isZineMode ? 'zines' : 'books'
      fetch(`${apiBase}/${contentPrefix}/${slug}/reading/epub-session`, {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)

      if (sessionSentRef.current) return
      sessionSentRef.current = true

      const payload = buildPayload()
      if (payload.durationSeconds < 5) return

      chapterService.recordEpubSession(slug, payload, isZineMode)
        .catch(err => console.warn('[EpubReader] Gagal merekam sesi:', err.message))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated])
}