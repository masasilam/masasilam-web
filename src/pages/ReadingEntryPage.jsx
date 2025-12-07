// ============================================
// src/pages/ReadingEntryPage.jsx - FIXED
// ============================================
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import bookService from '../services/bookService'

/**
 * ✅ Smart entry point untuk mulai membaca
 * Redirect ke chapter terakhir yang dibaca atau chapter pertama
 * Menggunakan HIERARCHICAL SLUG PATHS, bukan /bab/number
 */
const ReadingEntryPage = () => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    redirectToReading()
  }, [bookSlug])

  const redirectToReading = async () => {
    try {
      setLoading(true)

      // 1. Cek last read chapter dari localStorage
      const lastReadSlug = localStorage.getItem(`lastChapter_${bookSlug}`)
      
      if (lastReadSlug) {
        console.log('📖 Continuing from last read:', lastReadSlug)
        navigate(`/buku/${bookSlug}/${lastReadSlug}`, { replace: true })
        return
      }

      // 2. Fetch table of contents untuk mendapatkan chapter pertama
      const bookData = await bookService.getBookBySlug(bookSlug)
      const toc = await bookService.getTableOfContents(bookSlug)
      
      if (!toc || toc.length === 0) {
        console.error('❌ No chapters found')
        navigate(`/buku/${bookSlug}`, { replace: true })
        return
      }

      // 3. Cari chapter pertama (bisa level 1 atau level 2 jika ada parent)
      const firstChapter = findFirstReadableChapter(toc)
      
      if (!firstChapter) {
        console.error('❌ No readable chapter found')
        navigate(`/buku/${bookSlug}`, { replace: true })
        return
      }

      // 4. Build hierarchical path
      const chapterPath = buildChapterPath(firstChapter, toc)
      console.log('📖 Starting from first chapter:', chapterPath)
      
      navigate(`/buku/${bookSlug}/${chapterPath}`, { replace: true })

    } catch (error) {
      console.error('❌ Error redirecting to reading:', error)
      // Fallback ke halaman book detail
      navigate(`/buku/${bookSlug}`, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cari chapter pertama yang bisa dibaca (yang punya content)
   * Returns: { chapter, parent }
   */
  const findFirstReadableChapter = (chapters) => {
    // Fungsi rekursif untuk mencari chapter terdalam
    const findDeepest = (chapterList, parent = null) => {
      for (const chapter of chapterList) {
        // Jika punya subChapters, cari lebih dalam
        if (chapter.subChapters && chapter.subChapters.length > 0) {
          const result = findDeepest(chapter.subChapters, chapter)
          if (result.chapter) return result
        }
      }
      // Jika tidak ada subChapter, return chapter pertama di level ini
      return { chapter: chapterList[0], parent }
    }
    
    return findDeepest(chapters)
  }

  /**
   * Build hierarchical path - SIMPLIFIED
   * Use parent.slug + chapter.slug
   */
  const buildChapterPath = (chapter, parent) => {
    if (!chapter) return ''
    
    // If has parent, build parentSlug/chapterSlug
    if (parent) {
      return `${parent.slug}/${chapter.slug}`
    }
    
    // No parent, just use slug
    return chapter.slug
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">Memuat buku...</p>
    </div>
  )
}

export default ReadingEntryPage