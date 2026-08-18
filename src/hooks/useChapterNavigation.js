import { useNavigate } from 'react-router-dom'

export const buildChapterUrl = (bookSlug, chapterInfo) => {
  if (!chapterInfo) return ''

  // ✅ Jika string (backward compatibility)
  if (typeof chapterInfo === 'string') {
    return `/buku/${bookSlug}/${chapterInfo}`
  }

  // ✅ PRIORITAS UTAMA: Gunakan fullPath jika ada
  if (chapterInfo.fullPath) {
    return `/buku/${bookSlug}/${chapterInfo.fullPath}`
  }

  // ✅ FALLBACK: Build manual (untuk backward compatibility)
  const { slug, chapterLevel, parentSlug } = chapterInfo
  if (!slug) return ''

  if (chapterLevel === 1 || !parentSlug) {
    return `/buku/${bookSlug}/${slug}`
  }

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