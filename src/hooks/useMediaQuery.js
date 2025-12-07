// ============================================
// src/hooks/useMediaQuery.js
// ============================================

import { useState, useEffect } from 'react'

/**
 * Hook untuk check media query
 * 
 * @param {string} query - Media query string
 * @returns {boolean} - Whether query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    } 
    // Fallback for older browsers
    else {
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [matches, query])

  return matches
}

// Helper hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 640px)')
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')