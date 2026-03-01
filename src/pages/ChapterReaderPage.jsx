// ============================================
// FILE: src/pages/ChapterReaderPage.jsx - REMOVED CHAPTER STATS
// ============================================
import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import { useTTS } from '../hooks/useTTS'
import { useReadingTracker } from '../hooks/useReadingTracker'
import useChapterNavigation from '../hooks/useChapterNavigation'
import useFootnoteHandler from '../hooks/useFootnoteHandler'
import useTextSelection from '../hooks/useTextSelection'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { buildChapterUrl } from '../hooks/useChapterNavigation'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import {
  generateChapterStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData,
  generateMetaDescription
} from '../utils/seoHelpers'
import TTSControlPanel from '../components/Reader/TTSControlPanel'
import TTSVoiceSetupBanner from '../components/Reader/TTSVoiceSetupBanner'
import ChapterRating from '../components/Reader/ChapterRating'
import SearchInBook from '../components/Reader/SearchInBook'
import ExportAnnotations from '../components/Reader/ExportAnnotations'
import LoginPromptModal from '../components/Reader/LoginPromptModal'
import FootnotePopup from '../components/Reader/FootnotePopup'
// ✅ REMOVED: import ChapterStatsWidget
import ChapterContent from '../components/Reader/ChapterContent'
import TextSelectionPopup from '../components/Reader/TextSelectionPopup'
import BottomToolbar from '../components/Reader/BottomToolbar'
import AnnotationPanel from '../components/Reader/AnnotationPanel'
import ReviewsSection from '../components/Reader/ReviewsSection'
import { Volume2, Highlighter, Bookmark, Search, CheckCircle, Circle } from 'lucide-react'
import '../styles/epub-styles.css'

const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* ✅ ENHANCED HYPHENATION - Applied globally */
  html {
    -webkit-hyphens: auto !important;
    -moz-hyphens: auto !important;
    -ms-hyphens: auto !important;
    hyphens: auto !important;
  }

  .chapter-content,
  .chapter-content p,
  .chapter-content blockquote,
  .chapter-content li,
  .chapter-content td,
  .chapter-content th {
    -webkit-hyphens: auto !important;
    -moz-hyphens: auto !important;
    -ms-hyphens: auto !important;
    hyphens: auto !important;

    /* Better word breaking for Indonesian */
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;

    /* Hyphenation limits - more aggressive for Indonesian */
    -webkit-hyphenate-limit-before: 2 !important;
    -webkit-hyphenate-limit-after: 2 !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-lines: 2 !important;

    /* Allow breaking long words */
    -webkit-hyphenate-limit-zone: 8% !important;
  }

  /* Ensure justified text works well with hyphens */
  .chapter-content.text-justify p,
  .chapter-content.text-justify blockquote {
    text-align: justify !important;
    text-justify: inter-word !important;
  }`

const ChapterReaderPage = ({ fontSize, setReadingProgress, chapterPath }) => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef(null)

  const isAuthenticated = !!localStorage.getItem('token')
  const tts = useTTS()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [annotations, setAnnotations] = useState({ bookmarks: [], highlights: [], notes: [] })
  const [reviews, setReviews] = useState([])

  const [showToolbar, setShowToolbar] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isInteractingWithPopup, setIsInteractingWithPopup] = useState(false)

  const [showTTSLoginPrompt, setShowTTSLoginPrompt] = useState(false)
  const [showAnnotationLoginPrompt, setShowAnnotationLoginPrompt] = useState(false)
  const [showBookmarkLoginPrompt, setShowBookmarkLoginPrompt] = useState(false)
  const [showSearchLoginPrompt, setShowSearchLoginPrompt] = useState(false)
  const [showExportLoginPrompt, setShowExportLoginPrompt] = useState(false)

  const [showTTSPanel, setShowTTSPanel] = useState(true)

  // ✅ NEW: State for marking chapter as complete
  const [isChapterCompleted, setIsChapterCompleted] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  const [readingMode, setReadingMode] = useState(() => {
    return localStorage.getItem('readingMode') === 'true'
  })

  const [progressData, setProgressData] = useState({
    position: 0,
    readingTimeSeconds: 0,
    startTime: Date.now()
  })

  const fullChapterPath = chapterPath || ''
  const stopTTSOnUnmount = useRef(true)

  const { isTracking } = useReadingTracker(bookSlug, chapter, isAuthenticated)

  const { handleNextChapter, handlePrevChapter } = useChapterNavigation(
    bookSlug,
    chapter,
    () => {
      if (isAuthenticated) {
        stopTTSOnUnmount.current = true
        tts.stop()
      }
    }
  )

  const { footnotePopup, setFootnotePopup, handleGoToFootnote } = useFootnoteHandler(
    contentRef,
    chapter,
    bookSlug
  )

  const {
    selectedText,
    selectionRange,
    selectionCoords,
    clearSelection
  } = useTextSelection(contentRef, isInteractingWithPopup)

  useEffect(() => {
    setIsInteractingWithPopup(false)
    clearSelection()
  }, [fullChapterPath, chapter?.chapterNumber])

  useEffect(() => {
    if (!selectedText) {
      setIsInteractingWithPopup(false)
    }
  }, [selectedText])

  const handleTTSToggle = () => {
    if (!isAuthenticated) {
      setShowTTSLoginPrompt(true)
      return
    }
    if (!chapter?.htmlContent) return

    stopTTSOnUnmount.current = false
    tts.toggle(chapter.htmlContent)

    if (!tts.isPlaying) {
      setShowTTSPanel(true)
    }
  }

  const handleTTSStop = () => {
    stopTTSOnUnmount.current = true
    tts.stop()
    setShowTTSPanel(false)
  }

  const handleToggleTTSPanel = () => {
    setShowTTSPanel(!showTTSPanel)
  }

  const handleSearchClick = () => {
    if (!isAuthenticated) {
      setShowSearchLoginPrompt(true)
      return
    }
    setShowSearchModal(true)
  }

  const handleExportClick = () => {
    if (!isAuthenticated) {
      setShowExportLoginPrompt(true)
      return
    }
    setShowExportModal(true)
  }

  // ✅ NEW: Handler to mark chapter as complete/incomplete
  const handleMarkComplete = async () => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    if (!chapter?.chapterNumber || isMarkingComplete) return

    setIsMarkingComplete(true)
    const newCompletedState = !isChapterCompleted

    try {
      await chapterService.saveProgress(bookSlug, parseInt(chapter.chapterNumber), {
        position: window.scrollY,
        readingTimeSeconds: 0,
        isCompleted: newCompletedState
      })
      setIsChapterCompleted(newCompletedState)
    } catch (error) {
      alert('✗ Gagal memperbarui status bab')
    } finally {
      setIsMarkingComplete(false)
    }
  }

  useKeyboardShortcuts({
    chapter,
    isAuthenticated,
    isTTSPlaying: tts.isPlaying,
    footnotePopup,
    showSearchModal,
    showExportModal,
    onPrevChapter: handlePrevChapter,
    onNextChapter: handleNextChapter,
    onTTSToggle: handleTTSToggle,
    onSearchOpen: handleSearchClick,
    onFootnoteClose: () => setFootnotePopup(null),
    onSearchClose: () => setShowSearchModal(false),
    onExportClose: () => setShowExportModal(false)
  })

  useEffect(() => {
    localStorage.setItem('readingMode', readingMode)
  }, [readingMode])

  useEffect(() => {
    if (!isAuthenticated || !chapter?.chapterNumber) return

    const interval = setInterval(() => {
      const currentTime = Date.now()
      const elapsedSeconds = Math.floor((currentTime - progressData.startTime) / 1000)

      const contentHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const scrollableHeight = contentHeight - viewportHeight
      const scrollProgress = scrollableHeight > 0
        ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100))
        : 100

      const isCompleted = scrollProgress >= 90

      chapterService.saveProgress(bookSlug, parseInt(chapter.chapterNumber), {
        position: window.scrollY,
        readingTimeSeconds: elapsedSeconds,
        isCompleted
      }).catch(() => {})

      // ✅ Auto-update completed state if scrolled past 90%
      if (isCompleted && !isChapterCompleted) {
        setIsChapterCompleted(true)
      }

      setProgressData(prev => ({
        ...prev,
        startTime: currentTime,
        readingTimeSeconds: 0
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, chapter, bookSlug, progressData.startTime, isChapterCompleted])

  useEffect(() => {
    return () => {
      if (isAuthenticated && stopTTSOnUnmount.current) {
        tts.stop()
      }
    }
  }, [fullChapterPath, isAuthenticated, tts])

  useEffect(() => {
    const initializeChapterData = async () => {
      if (!fullChapterPath) return
      await fetchChapter()
      if (isAuthenticated) {
        fetchAnnotations()
      }
    }
    initializeChapterData()
  }, [bookSlug, fullChapterPath, isAuthenticated])

  useEffect(() => {
    if (chapter?.chapterNumber && fullChapterPath) {
      fetchReviews()
      localStorage.setItem(`lastChapter_${bookSlug}`, fullChapterPath)
    }
  }, [chapter, fullChapterPath, bookSlug])

  useEffect(() => {
    if (!loading) {
      if (location.state?.highlightId && contentRef.current) {
        setTimeout(() => {
          const highlightElement = contentRef.current.querySelector(`mark[data-highlight-id="${location.state.highlightId}"]`)
          if (highlightElement) {
            highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            highlightElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)'
            setTimeout(() => {
              highlightElement.style.boxShadow = ''
            }, 2000)
          }
          window.history.replaceState({}, document.title)
        }, 800)
      } else if (location.state?.noteId && contentRef.current) {
        setTimeout(() => {
          const noteElement = contentRef.current.querySelector(`mark[data-note-id="${location.state.noteId}"]`)
          if (noteElement) {
            noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            noteElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)'
            setTimeout(() => {
              noteElement.style.boxShadow = ''
            }, 2000)
          }
          window.history.replaceState({}, document.title)
        }, 800)
      } else if (location.state?.scrollTo !== undefined) {
        setTimeout(() => {
          window.scrollTo({ top: location.state.scrollTo, behavior: 'smooth' })
          window.history.replaceState({}, document.title)
        }, 500)
      } else {
        window.scrollTo(0, 0)
      }
    }
  }, [loading, location.state])

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !setReadingProgress) return
      const scrollTop = window.scrollY
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapter, setReadingProgress])

  useEffect(() => {
    if (!contentRef.current) return
    const links = contentRef.current.querySelectorAll('.chapter-content a')
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    })
  }, [chapter])

  const fetchChapter = async () => {
    try {
      setLoading(true)
      const response = await chapterService.readChapterByPath(bookSlug, fullChapterPath)
      setChapter(response)
      // ✅ NEW: Initialize completed state from chapter data if available
      if (response?.isCompleted !== undefined) {
        setIsChapterCompleted(response.isCompleted)
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnotations = async () => {
    try {
      const data = await chapterService.getAllBookAnnotations(bookSlug)
      setAnnotations({
        bookmarks: data.bookmarks || [],
        highlights: data.highlights || [],
        notes: data.notes || []
      })
    } catch (error) {
      setAnnotations({ bookmarks: [], highlights: [], notes: [] })
    }
  }

  const fetchReviews = async () => {
    if (!chapter?.chapterNumber) return
    try {
      const response = await chapterService.getChapterReviews(bookSlug, parseInt(chapter.chapterNumber))
      const reviewsData = response.data?.data || response.data || []
      setReviews(reviewsData)
    } catch (error) {
      setReviews([])
    }
  }

  const handleAddBookmark = async () => {
    if (!isAuthenticated) {
      setShowBookmarkLoginPrompt(true)
      return
    }
    try {
      await chapterService.addBookmark(bookSlug, parseInt(chapter.chapterNumber), {
        position: String(window.scrollY)
      })
      setShowToolbar(false)
      fetchAnnotations()
      alert('✓ Penanda buku ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan penanda buku')
    }
  }

  const handleAddHighlight = async (color) => {
    if (!isAuthenticated) {
      setShowAnnotationLoginPrompt(true)
      clearSelection()
      return
    }
    if (!selectedText || !selectionRange) return

    try {
      await chapterService.addHighlight(bookSlug, parseInt(chapter.chapterNumber), {
        highlightedText: selectedText,
        color,
        startPosition: selectionRange.startOffset,
        endPosition: selectionRange.endOffset
      })
      clearSelection()
      fetchAnnotations()
      alert('✓ Highlight ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan highlight')
    }
  }

  const handleAddNote = async (noteContent) => {
    if (!isAuthenticated) {
      setShowAnnotationLoginPrompt(true)
      clearSelection()
      return
    }
    if (!noteContent.trim()) return
    if (!selectedText || !selectionRange) return

    try {
      await chapterService.addNote(bookSlug, parseInt(chapter.chapterNumber), {
        content: noteContent,
        selectedText: selectedText,
        startPosition: selectionRange.startOffset,
        endPosition: selectionRange.endOffset
      })
      clearSelection()
      setShowToolbar(false)
      fetchAnnotations()
      alert('✓ Catatan ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan catatan')
    }
  }

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!confirm('Hapus penanda buku ini?')) return
    try {
      await chapterService.deleteBookmark(bookSlug, parseInt(chapter.chapterNumber), bookmarkId)
      fetchAnnotations()
      alert('✓ Penanda buku dihapus!')
    } catch (error) {
      alert('✗ Gagal menghapus penanda buku')
    }
  }

  const handleDeleteHighlight = async (highlightId) => {
    if (!confirm('Hapus highlight ini?')) return
    try {
      await chapterService.deleteHighlight(bookSlug, parseInt(chapter.chapterNumber), highlightId)
      fetchAnnotations()
      alert('✓ Highlight dihapus!')
    } catch (error) {
      alert('✗ Gagal menghapus highlight')
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Hapus catatan ini?')) return
    try {
      await chapterService.deleteNote(bookSlug, parseInt(chapter.chapterNumber), noteId)
      fetchAnnotations()
      alert('✓ Catatan dihapus!')
    } catch (error) {
      alert('✗ Gagal menghapus catatan')
    }
  }

  const handleAddReview = async (reviewContent) => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    try {
      await chapterService.addChapterReview(bookSlug, parseInt(chapter.chapterNumber), {
        comment: reviewContent,
        isSpoiler: false
      })
      fetchReviews()
      alert('✓ Review ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan review: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLikeReview = async (reviewId, isLiked) => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    try {
      if (isLiked) {
        await chapterService.unlikeChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId)
      } else {
        await chapterService.likeChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId)
      }
      fetchReviews()
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const handleReplyToReview = async (reviewId, replyContent) => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    try {
      await chapterService.replyToChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId, {
        comment: replyContent
      })
      fetchReviews()
      alert('✓ Balasan ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan balasan: ' + (error.response?.data?.message || error.message))
    }
  }

  const buildChapterPath = (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return ''
    return breadcrumbs.map(b => b.slug).join('/')
  }

  const handleAnnotationClick = (e, annotation) => {
    e.preventDefault()
    e.stopPropagation()

    setShowToolbar(false)

    if (annotation.chapterNumber === parseInt(chapter?.chapterNumber)) {
      if (annotation.highlightedText && !annotation.content && contentRef.current) {
        setTimeout(() => {
          const highlightElement = contentRef.current.querySelector(`mark[data-highlight-id="${annotation.id}"]`)
          if (highlightElement) {
            highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            highlightElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)'
            setTimeout(() => {
              highlightElement.style.boxShadow = ''
            }, 2000)
            return
          }
        }, 100)
        return
      }

      if (annotation.content && annotation.selectedText && contentRef.current) {
        setTimeout(() => {
          const noteElement = contentRef.current.querySelector(`mark[data-note-id="${annotation.id}"]`)
          if (noteElement) {
            noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            noteElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)'
            setTimeout(() => {
              noteElement.style.boxShadow = ''
            }, 2000)
            return
          }
        }, 100)
        return
      }

      const position = parseInt(annotation.position) || 0
      window.scrollTo({ top: position, behavior: 'smooth' })

    } else {
      if (annotation.chapterSlug) {
        const targetUrl = buildChapterUrl(bookSlug, annotation.chapterSlug)

        if (annotation.highlightedText && !annotation.content) {
          navigate(targetUrl, { state: { highlightId: annotation.id } })
        } else if (annotation.content && annotation.selectedText) {
          navigate(targetUrl, { state: { noteId: annotation.id } })
        } else {
          const position = parseInt(annotation.position) || 0
          navigate(targetUrl, { state: { scrollTo: position } })
        }
      } else {
        const chapterName = annotation.chapterTitle || `Bab ${annotation.chapterNumber}`
        alert(`Anotasi ini berada di "${chapterName}". Navigasi ke bab tersebut untuk melihatnya.`)
      }
    }
  }

  const handleTTSApplySettings = () => {
    if (!isAuthenticated) return
    tts.applySettings({
      rate: tts.rate,
      pitch: tts.pitch,
      voiceIndex: tts.voiceIndex
    })
  }

  const memoizedContent = useMemo(() => {
    if (!chapter?.htmlContent) return ''
    return chapter.htmlContent
  }, [chapter?.htmlContent])

  const currentChapterHighlights = useMemo(() => {
    return annotations.highlights.filter(h => h.chapterNumber === parseInt(chapter?.chapterNumber))
  }, [annotations.highlights, chapter?.chapterNumber])

  const currentChapterNotes = useMemo(() => {
    return annotations.notes.filter(n => n.chapterNumber === parseInt(chapter?.chapterNumber))
  }, [annotations.notes, chapter?.chapterNumber])

  const buildFullChapterPath = (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return ''
    return breadcrumbs.map(b => b.slug).join('/')
  }

  const chapterUrl = chapter ? `/buku/${bookSlug}/${buildFullChapterPath(chapter.breadcrumbs)}` : ''

  const breadcrumbs = chapter ? [
    { name: 'Beranda', url: '/' },
    { name: chapter.bookTitle, url: `/buku/${bookSlug}` },
    ...(chapter.breadcrumbs || []).map((crumb, index) => ({
      name: crumb.title,
      url: index === chapter.breadcrumbs.length - 1
        ? '#'
        : `/buku/${bookSlug}/${buildFullChapterPath(chapter.breadcrumbs.slice(0, index + 1))}`
    }))
  ] : []

  const bookForSchema = chapter ? {
    title: chapter.bookTitle,
    slug: bookSlug,
    authorNames: chapter.authorNames || '',
    authorSlugs: chapter.authorSlugs || ''
  } : null

  const structuredData = chapter && bookForSchema ? combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateChapterStructuredData(chapter, bookForSchema)
  ) : null

  const metaDescription = chapter?.htmlContent
    ? generateMetaDescription(chapter.htmlContent, 160)
    : `Baca ${chapter?.chapterTitle || 'bab ini'} dari ${chapter?.bookTitle || 'buku'} secara gratis di MasasilaM.`

  const keywords = `${chapter?.bookTitle || ''}, ${chapter?.chapterTitle || ''}, ${chapter?.authorNames || ''}, baca online gratis, buku domain publik`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (!chapter) {
    return (
      <>
        <SEO
          title="Bab Tidak Ditemukan"
          description="Halaman bab yang Anda cari tidak tersedia"
          url={chapterUrl}
          noindex={true}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Bab tidak ditemukan</h2>
            <Link to={`/buku/${bookSlug}`} className="btn-primary">
              Kembali ke Buku
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title={`${chapter.chapterTitle || `Bab ${chapter.chapterNumber}`} - ${chapter.bookTitle}`}
        description={metaDescription}
        url={chapterUrl}
        type="article"
        keywords={keywords}
        author={chapter.authorNames}
        publishedTime={chapter.publishedAt}
        modifiedTime={chapter.updatedAt}
        structuredData={structuredData}
        canonical={`https://masasilam.com${chapterUrl}`}
      />

      <div className="relative pb-20" lang="id">
        <style>{hideScrollbarStyle}</style>

        {showTTSLoginPrompt && (
          <LoginPromptModal
            icon={Volume2}
            title="Fitur Text-to-Speech"
            description="Masuk sekarang untuk mendengarkan bab ini dibacakan!"
            onClose={() => setShowTTSLoginPrompt(false)}
            onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
            onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
          />
        )}

        {showAnnotationLoginPrompt && (
          <LoginPromptModal
            icon={Highlighter}
            title="Fitur Anotasi"
            description="Masuk sekarang untuk menyimpan anotasi Anda!"
            onClose={() => setShowAnnotationLoginPrompt(false)}
            onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
            onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
          />
        )}

        {showBookmarkLoginPrompt && (
          <LoginPromptModal
            icon={Bookmark}
            title="Fitur Penanda Buku"
            description="Masuk sekarang untuk menyimpan penanda Anda!"
            onClose={() => setShowBookmarkLoginPrompt(false)}
            onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
            onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
          />
        )}

        {showSearchLoginPrompt && (
          <LoginPromptModal
            icon={Search}
            title="Fitur Pencarian"
            description="Masuk sekarang untuk mencari kata atau frasa dalam buku ini!"
            onClose={() => setShowSearchLoginPrompt(false)}
            onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
            onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
          />
        )}

        {showExportLoginPrompt && (
          <LoginPromptModal
            icon={Search}
            title="Fitur Ekspor Anotasi"
            description="Masuk sekarang untuk mengekspor semua catatan dan highlight Anda!"
            onClose={() => setShowExportLoginPrompt(false)}
            onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
            onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
          />
        )}

        {showSearchModal && (
          <SearchInBook
            bookSlug={bookSlug}
            onClose={() => setShowSearchModal(false)}
          />
        )}

        {showExportModal && (
          <ExportAnnotations
            bookSlug={bookSlug}
            onClose={() => setShowExportModal(false)}
          />
        )}

        {footnotePopup && (
          <FootnotePopup
            content={footnotePopup.content}
            onClose={() => setFootnotePopup(null)}
            onGoToFootnote={handleGoToFootnote}
            isLocal={footnotePopup.isLocal}
            sourceChapter={footnotePopup.sourceChapter}
          />
        )}

        {chapter.breadcrumbs && chapter.breadcrumbs.length > 0 && (
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link to={`/buku/${bookSlug}`} className="text-primary hover:underline">
                  {chapter.bookTitle}
                </Link>
              </li>
              {chapter.breadcrumbs.map((crumb, index) => (
                <li key={crumb.chapterId} className="flex items-center gap-2">
                  <span className="text-gray-400">/</span>
                  {index === chapter.breadcrumbs.length - 1 ? (
                    <span className="font-semibold">{crumb.title}</span>
                  ) : (
                    <Link
                      to={`/buku/${bookSlug}/${buildChapterPath(chapter.breadcrumbs.slice(0, index + 1))}`}
                      className="text-primary hover:underline"
                    >
                      {crumb.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {isAuthenticated && tts.availableVoices.length > 0 && (
          <TTSVoiceSetupBanner availableVoices={tts.availableVoices} />
        )}

        {isAuthenticated && tts.isEnabled && showTTSPanel && (
          <TTSControlPanel
            isPlaying={tts.isPlaying}
            progress={tts.progress}
            rate={tts.rate}
            pitch={tts.pitch}
            voiceIndex={tts.voiceIndex}
            availableVoices={tts.availableVoices}
            showSettings={tts.showSettings}
            onTogglePlay={handleTTSToggle}
            onStop={handleTTSStop}
            onPrevChapter={handlePrevChapter}
            onNextChapter={handleNextChapter}
            onToggleSettings={tts.toggleSettings}
            onRateChange={(val) => tts.updateSettings({ rate: val })}
            onPitchChange={(val) => tts.updateSettings({ pitch: val })}
            onVoiceChange={(val) => tts.updateSettings({ voiceIndex: val })}
            onApplySettings={handleTTSApplySettings}
            hasPrevChapter={!!chapter?.previousChapter}
            hasNextChapter={!!chapter?.nextChapter}
            onMinimize={() => setShowTTSPanel(false)}
          />
        )}

        <BottomToolbar
          chapter={chapter}
          isAuthenticated={isAuthenticated}
          isTTSPlaying={tts.isPlaying}
          readingMode={readingMode}
          showTTSPanel={showTTSPanel}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onTTSToggle={handleTTSToggle}
          onToggleTTSPanel={handleToggleTTSPanel}
          onSearchClick={handleSearchClick}
          onToolbarToggle={() => {
            if (!isAuthenticated) {
              setShowAnnotationLoginPrompt(true)
              return
            }
            setShowToolbar(!showToolbar)
          }}
          onBookmarkClick={handleAddBookmark}
          onExportClick={handleExportClick}
          onReadingModeToggle={() => setReadingMode(!readingMode)}
        />

        {selectedText && selectionCoords && (
          <TextSelectionPopup
            selectedText={selectedText}
            coords={selectionCoords}
            isAuthenticated={isAuthenticated}
            onClose={() => {
              clearSelection()
              setIsInteractingWithPopup(false)
            }}
            onHighlight={(color) => {
              handleAddHighlight(color)
              setIsInteractingWithPopup(false)
            }}
            onAddNote={(noteContent) => {
              handleAddNote(noteContent)
              setIsInteractingWithPopup(false)
            }}
            onNavigateToLogin={() => {
              clearSelection()
              setIsInteractingWithPopup(false)
              navigate('/masuk', { state: { from: location.pathname } })
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsInteractingWithPopup(true)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              setIsInteractingWithPopup(true)
            }}
          />
        )}

        {isAuthenticated && showToolbar && (
          <AnnotationPanel
            annotations={annotations}
            currentChapterNumber={chapter.chapterNumber}
            onClose={() => setShowToolbar(false)}
            onAnnotationClick={handleAnnotationClick}
            onDeleteBookmark={handleDeleteBookmark}
            onDeleteHighlight={handleDeleteHighlight}
            onDeleteNote={handleDeleteNote}
          />
        )}

        <article ref={contentRef} lang="id">
          <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {chapter.chapterTitle || `Bab ${chapter.chapterNumber}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{chapter.bookTitle}</p>
            {chapter.bookSubtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                {chapter.bookSubtitle}
              </p>
            )}
          </header>

          <div
            lang="id"
            className={`transition-colors duration-300 rounded-lg my-8 mx-auto ${
              readingMode
                ? 'reading-mode-bg shadow-inner border border-gray-300'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
            }`}
            style={{
              maxWidth: '42em',
              padding: '1.25em'
            }}
          >
            <ChapterContent
              htmlContent={memoizedContent}
              fontSize={fontSize}
              readingMode={readingMode}
              highlights={currentChapterHighlights}
              notes={currentChapterNotes}
            />
          </div>

          {/* ✅ NEW: Mark as Complete Button */}
          {isAuthenticated && (
            <div className="flex justify-center my-6">
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isChapterCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
                aria-label={isChapterCompleted ? 'Tandai sebagai belum selesai' : 'Tandai sebagai selesai dibaca'}
              >
                {isChapterCompleted ? (
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Circle size={18} className="text-gray-400" />
                )}
                <span>
                  {isMarkingComplete
                    ? 'Menyimpan...'
                    : isChapterCompleted
                      ? 'Selesai Dibaca'
                      : 'Tandai Selesai'}
                </span>
              </button>
            </div>
          )}

          <div className="my-8">
            <ChapterRating
              bookSlug={bookSlug}
              chapterNumber={parseInt(chapter.chapterNumber)}
              chapterTitle={chapter.chapterTitle}
              isAuthenticated={isAuthenticated}
            />
          </div>

          <ReviewsSection
            reviews={reviews}
            isAuthenticated={isAuthenticated}
            onAddReview={handleAddReview}
            onLikeReview={handleLikeReview}
            onReplyToReview={handleReplyToReview}
            onNavigateToLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          />
        </article>
      </div>
    </>
  )
}

export default ChapterReaderPage