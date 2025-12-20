// ============================================
// FILE 10: src/hooks/useChapterNavigation.js
// ============================================
import { useNavigate } from 'react-router-dom'

export const buildChapterUrl = (bookSlug, chapterInfo) => {
  if (!chapterInfo) return ''
  const { slug, chapterLevel, parentSlug } = chapterInfo
  if (chapterLevel === 1) return `/buku/${bookSlug}/${slug}`
  if (!parentSlug) return `/buku/${bookSlug}/${slug}`
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