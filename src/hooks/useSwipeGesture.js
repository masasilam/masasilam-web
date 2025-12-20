// ============================================
// FILE 11: src/hooks/useSwipeGesture.js
// ============================================
import { useState, useEffect } from 'react'

const useSwipeGesture = (contentRef, chapter, onNextChapter, onPrevChapter) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)

  useEffect(() => {
    const minSwipeDistance = 50

    const handleTouchStart = (e) => {
      const target = e.target
      if (target.closest('button') || target.closest('a') || target.closest('input') ||
          target.closest('textarea') || target.closest('[role="button"]')) {
        return
      }
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
      setSwipeDirection(null)
    }

    const handleTouchMove = (e) => {
      if (touchStart === null) return
      const currentTouch = e.targetTouches[0].clientX
      const distance = touchStart - currentTouch
      setTouchEnd(currentTouch)
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? 'left' : 'right')
      }
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setSwipeDirection(null)
        return
      }
      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance

      if (isLeftSwipe && chapter?.nextChapter) onNextChapter()
      if (isRightSwipe && chapter?.previousChapter) onPrevChapter()

      setTouchStart(null)
      setTouchEnd(null)
      setSwipeDirection(null)
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('touchstart', handleTouchStart, { passive: true })
      contentElement.addEventListener('touchmove', handleTouchMove, { passive: true })
      contentElement.addEventListener('touchend', handleTouchEnd)
      return () => {
        contentElement.removeEventListener('touchstart', handleTouchStart)
        contentElement.removeEventListener('touchmove', handleTouchMove)
        contentElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [touchStart, touchEnd, chapter, contentRef, onNextChapter, onPrevChapter])

  return { swipeDirection }
}

export default useSwipeGesture