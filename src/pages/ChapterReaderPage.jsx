// ============================================
// FILE 3: src/pages/ChapterReaderPage.jsx
// ============================================
import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import { useTTS } from '../hooks/useTTS'
import { useReadingTracker } from '../hooks/useReadingTracker'
import useChapterNavigation from '../hooks/useChapterNavigation'
import useSwipeGesture from '../hooks/useSwipeGesture'
import useFootnoteHandler from '../hooks/useFootnoteHandler'
import useTextSelection from '../hooks/useTextSelection'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { buildChapterUrl } from '../hooks/useChapterNavigation'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import TTSControlPanel from '../components/Reader/TTSControlPanel'
import TTSVoiceSetupBanner from '../components/Reader/TTSVoiceSetupBanner'
import ChapterRating from '../components/Reader/ChapterRating'
import SearchInBook from '../components/Reader/SearchInBook'
import ExportAnnotations from '../components/Reader/ExportAnnotations'
import LoginPromptModal from '../components/Reader/LoginPromptModal'
import FootnotePopup from '../components/Reader/FootnotePopup'
import ChapterStatsWidget from '../components/Reader/ChapterStatsWidget'
import ChapterContent from '../components/Reader/ChapterContent'
import SwipeIndicator from '../components/Reader/SwipeIndicator'
import TextSelectionPopup from '../components/Reader/TextSelectionPopup'
import BottomToolbar from '../components/Reader/BottomToolbar'
import AnnotationPanel from '../components/Reader/AnnotationPanel'
import ReviewsSection from '../components/Reader/ReviewsSection'
import { Volume2, Highlighter, Bookmark, Search } from 'lucide-react'
import '../styles/epub-styles.css'

const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }`

const ChapterReaderPage = ({ fontSize, setReadingProgress, chapterPath }) => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef(null)

  const isAuthenticated = !!localStorage.getItem('token')
  const tts = useTTS()

  const { isTracking } = useReadingTracker(bookSlug, chapterPath?.split('/').pop(), isAuthenticated)

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

  const { swipeDirection } = useSwipeGesture(
    contentRef,
    chapter,
    handleNextChapter,
    handlePrevChapter
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

  const handleTTSToggle = () => {
    if (!isAuthenticated) {
      setShowTTSLoginPrompt(true)
      return
    }
    if (!chapter?.htmlContent) return
    stopTTSOnUnmount.current = false
    tts.toggle(chapter.htmlContent)
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

      setProgressData(prev => ({
        ...prev,
        startTime: currentTime,
        readingTimeSeconds: 0
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, chapter, bookSlug, progressData.startTime])

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
    } catch (error) {
      // Error handling
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
    try {
      await chapterService.addNote(bookSlug, parseInt(chapter.chapterNumber), {
        content: noteContent,
        selectedText: selectedText || '',
        position: window.scrollY
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
      // Error handling
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
      if (annotation.highlightedText && contentRef.current) {
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
      }

      const position = parseInt(annotation.position) || 0
      window.scrollTo({ top: position, behavior: 'smooth' })

    } else {
      if (annotation.chapterSlug) {
        const targetUrl = buildChapterUrl(bookSlug, annotation.chapterSlug)

        if (annotation.highlightedText) {
          navigate(targetUrl, { state: { highlightId: annotation.id } })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bab tidak ditemukan</h2>
          <Link to={`/buku/${bookSlug}`} className="btn-primary">
            Kembali ke Buku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pb-20">
      <style>{hideScrollbarStyle}</style>

      {isTracking && isAuthenticated && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-50 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Tracking
        </div>
      )}

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

      <SwipeIndicator direction={swipeDirection} />

      {chapter.breadcrumbs && chapter.breadcrumbs.length > 0 && (
        <nav className="mb-6 text-sm">
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

      {isAuthenticated && tts.isEnabled && (
        <TTSControlPanel
          isPlaying={tts.isPlaying}
          progress={tts.progress}
          rate={tts.rate}
          pitch={tts.pitch}
          voiceIndex={tts.voiceIndex}
          availableVoices={tts.availableVoices}
          showSettings={tts.showSettings}
          onTogglePlay={handleTTSToggle}
          onStop={() => {
            stopTTSOnUnmount.current = true
            tts.stop()
          }}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onToggleSettings={tts.toggleSettings}
          onRateChange={(val) => tts.updateSettings({ rate: val })}
          onPitchChange={(val) => tts.updateSettings({ pitch: val })}
          onVoiceChange={(val) => tts.updateSettings({ voiceIndex: val })}
          onApplySettings={handleTTSApplySettings}
          hasPrevChapter={!!chapter?.previousChapter}
          hasNextChapter={!!chapter?.nextChapter}
        />
      )}

      <BottomToolbar
        chapter={chapter}
        isAuthenticated={isAuthenticated}
        isTTSPlaying={tts.isPlaying}
        readingMode={readingMode}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onTTSToggle={handleTTSToggle}
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
          onClose={clearSelection}
          onHighlight={handleAddHighlight}
          onAddNote={handleAddNote}
          onNavigateToLogin={() => {
            clearSelection()
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

      <article ref={contentRef}>
        <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {chapter.chapterTitle || `Bab ${chapter.chapterNumber}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{chapter.bookTitle}</p>
        </header>

        {isAuthenticated && (
          <ChapterStatsWidget
            bookSlug={bookSlug}
            chapterNumber={parseInt(chapter.chapterNumber)}
          />
        )}

        <div className={`transition-colors duration-300 rounded-lg my-8 ${
          readingMode
            ? 'bg-[#FFF8DC] px-8 py-12 shadow-inner border-t border-b border-gray-300'
            : 'border-t border-b border-gray-200 dark:border-gray-800 py-8'
        }`}>
          <ChapterContent
            htmlContent={memoizedContent}
            fontSize={fontSize}
            readingMode={readingMode}
            highlights={currentChapterHighlights}
          />
        </div>

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
  )
}

export default ChapterReaderPage