// ============================================
// FILE 10: src/hooks/useChapterNavigation.js - FIXED
// ============================================
import { useNavigate } from 'react-router-dom'

/**
 * Build chapter URL with support for both object and string input
 * @param {string} bookSlug - The book slug
 * @param {Object|string} chapterInfo - Chapter info object or just slug string
 * @returns {string} Full chapter URL
 */
export const buildChapterUrl = (bookSlug, chapterInfo) => {
  if (!chapterInfo) return ''

  // ✅ FIX: Support both string slug and object
  if (typeof chapterInfo === 'string') {
    // Simple string slug - just append it
    return `/buku/${bookSlug}/${chapterInfo}`
  }

  // Object with full chapter info
  const { slug, chapterLevel, parentSlug } = chapterInfo
  if (!slug) return ''

  // Level 1 chapters (no parent)
  if (chapterLevel === 1 || !parentSlug) {
    return `/buku/${bookSlug}/${slug}`
  }

  // Nested chapters (with parent)
  return `/buku/${bookSlug}/${parentSlug}/${slug}`
}

const useChapterNavigation = (bookSlug, chapter, onNavigate) => {
  const navigate = useNavigate()

  const handleNextChapter = () => {
    if (!chapter?.nextChapter) return
    if (onNavigate) onNavigate()
    const nextUrl = buildChapterUrl(bookSlug, chapter.nextChapter)
    navigate(nextUrl)
  }

  const handlePrevChapter = () => {
    if (!chapter?.previousChapter) return
    if (onNavigate) onNavigate()
    const prevUrl = buildChapterUrl(bookSlug, chapter.previousChapter)
    navigate(prevUrl)
  }

  return { handleNextChapter, handlePrevChapter }
}

export default useChapterNavigation