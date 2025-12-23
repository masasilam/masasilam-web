// src/hooks/useReadingTracker.js
import { useEffect, useRef, useState } from 'react'
import { chapterService } from '../services/chapterService'

// Simple UUID generator without external dependency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const useReadingTracker = (bookSlug, chapterData, isAuthenticated) => {
  const sessionIdRef = useRef(null)
  const startTimeRef = useRef(null)
  const heartbeatIntervalRef = useRef(null)
  const [isTracking, setIsTracking] = useState(false)

  // Generate or retrieve session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateUUID()
    }
  }, [])

  // Start tracking when chapter loads
  useEffect(() => {
    // ✅ FIXED: Validate chapterNumber properly
    if (!isAuthenticated || !bookSlug || !chapterData?.chapterNumber) return

    const chapterNumber = parseInt(chapterData.chapterNumber)
    if (isNaN(chapterNumber)) {
      console.warn('Invalid chapter number:', chapterData.chapterNumber)
      return
    }

    const startTracking = async () => {
      try {
        startTimeRef.current = Date.now()

        await chapterService.startReading(bookSlug, {
          sessionId: sessionIdRef.current,
          chapterNumber: chapterNumber,
          startPosition: window.scrollY,
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          source: 'web'
        })

        setIsTracking(true)

        // Send heartbeat every 30 seconds
        heartbeatIntervalRef.current = setInterval(async () => {
          try {
            await chapterService.sendHeartbeat(bookSlug, {
              sessionId: sessionIdRef.current,
              chapterNumber: chapterNumber,
              currentPosition: window.scrollY,
              timestamp: new Date().toISOString()
            })
          } catch (error) {
            console.error('Heartbeat error:', error)
          }
        }, 30000)

      } catch (error) {
        console.error('Error starting reading tracking:', error)
      }
    }

    startTracking()

    // Cleanup function
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [bookSlug, chapterData?.chapterNumber, isAuthenticated])

  // End tracking on unmount or page leave
  useEffect(() => {
    if (!isAuthenticated || !isTracking || !chapterData?.chapterNumber) return

    const chapterNumber = parseInt(chapterData.chapterNumber)
    if (isNaN(chapterNumber)) return

    const endTracking = async () => {
      try {
        const endTime = Date.now()
        const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000)

        const contentHeight = document.documentElement.scrollHeight
        const viewportHeight = window.innerHeight
        const scrollableHeight = contentHeight - viewportHeight
        const scrollDepth = scrollableHeight > 0
          ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100))
          : 100

        await chapterService.endReading(bookSlug, {
          sessionId: sessionIdRef.current,
          chapterNumber: chapterNumber,
          endPosition: window.scrollY,
          scrollDepthPercentage: scrollDepth,
          wordsRead: calculateWordsRead(),
          interactionCount: 0
        })

        setIsTracking(false)
      } catch (error) {
        console.error('Error ending reading tracking:', error)
      }
    }

    // End tracking before page unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable tracking on page close
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          sessionId: sessionIdRef.current,
          chapterNumber: chapterNumber,
          endPosition: window.scrollY,
          scrollDepthPercentage: Math.round((window.scrollY / document.documentElement.scrollHeight) * 100)
        })

        navigator.sendBeacon(
          `/api/books/${bookSlug}/chapters/reading/end`,
          new Blob([data], { type: 'application/json' })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      endTracking()
    }
  }, [bookSlug, chapterData?.chapterNumber, isAuthenticated, isTracking])

  const calculateWordsRead = () => {
    const chapterContent = document.querySelector('.chapter-content')
    if (!chapterContent) return 0
    
    const text = chapterContent.textContent || ''
    return text.trim().split(/\s+/).length
  }

  return {
    isTracking,
    sessionId: sessionIdRef.current
  }
}