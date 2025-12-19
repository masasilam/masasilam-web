// src/pages/ChapterReaderPage.jsx - COMPLETE WITH ALL FEATURES
import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import TTSControlPanel from '../components/Reader/TTSControlPanel'
import ChapterRating from '../components/Reader/ChapterRating'
import SearchInBook from '../components/Reader/SearchInBook'
import ExportAnnotations from '../components/Reader/ExportAnnotations'
import { useTTS } from '../hooks/useTTS'
import { useReadingTracker } from '../hooks/useReadingTracker'
import {
  ChevronLeft, ChevronRight, Bookmark, Highlighter,
  StickyNote, MessageSquare, ThumbsUp, Send, X, Check, Menu,
  Volume2, Pause, Play, Lock, ExternalLink, Search, Download,
  Star, TrendingUp, Clock, BarChart3
} from 'lucide-react'
import '../styles/epub-styles.css'

// Helper: Build chapter URL from chapter navigation info
const buildChapterUrl = (bookSlug, chapterInfo) => {
  if (!chapterInfo) return ''
  const { slug, chapterLevel, parentSlug } = chapterInfo
  if (chapterLevel === 1) return `/buku/${bookSlug}/${slug}`
  if (!parentSlug) return `/buku/${bookSlug}/${slug}`
  return `/buku/${bookSlug}/${parentSlug}/${slug}`
}

// Login Prompt Modal Component
const LoginPromptModal = ({ icon: Icon, title, description, onClose, onLogin, onRegister }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="space-y-3">
        <button onClick={onLogin} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Icon className="w-5 h-5" />
          Masuk untuk Menggunakan Fitur
        </button>
        <button onClick={onClose} className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Nanti Saja
        </button>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Belum punya akun?{' '}
          <button onClick={onRegister} className="text-primary hover:underline font-semibold">
            Daftar gratis
          </button>
        </p>
      </div>
    </div>
  </div>
)

// Footnote Popup Component
const FootnotePopup = ({ content, onClose, onGoToFootnote, isLocal, sourceChapter }) => (
  <div className="footnote-popup">
    <button onClick={onClose} className="footnote-popup-close">
      <X className="w-5 h-5" />
    </button>
    {sourceChapter && (
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
          </svg>
          Dari bab: {sourceChapter}
        </p>
      </div>
    )}
    <div className="footnote-popup-content" dangerouslySetInnerHTML={{ __html: content }} />
    {isLocal && (
      <button onClick={onGoToFootnote} className="footnote-popup-goto flex items-center gap-2">
        <ExternalLink className="w-4 h-4" />
        Lihat Catatan Lengkap di Halaman
      </button>
    )}
  </div>
)

// Chapter Stats Widget
const ChapterStatsWidget = ({ bookSlug, chapterNumber }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await chapterService.getChapterStats(bookSlug, chapterNumber)
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [bookSlug, chapterNumber])

  if (loading || !stats) return null

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Statistik Bab</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.readerCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Pembaca</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completionRate?.toFixed(0) || 0}%</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Selesai</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.highlightCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Highlight</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.commentCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Komentar</div>
        </div>
      </div>
    </div>
  )
}

const ChapterContent = memo(({ htmlContent, fontSize, readingMode }) => {
  return (
    <div
      className={`chapter-content prose dark:prose-invert max-w-none ${
        readingMode ? 'reading-mode-active' : ''
      }`}
      style={{ 
        fontSize: `${fontSize}px`, 
        lineHeight: '1.8', 
        userSelect: 'text',
        color: readingMode ? '#2d2d2d' : undefined
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
})

const ChapterReaderPage = ({ fontSize, setReadingProgress, chapterPath }) => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef(null)

  const isAuthenticated = !!localStorage.getItem('token')
  const tts = useTTS()

  // Reading tracker - automatically tracks reading sessions
  const { isTracking } = useReadingTracker(bookSlug, chapterPath?.split('/').pop(), isAuthenticated)

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [annotations, setAnnotations] = useState({ bookmarks: [], highlights: [], notes: [] })
  const [reviews, setReviews] = useState([])

  const [showToolbar, setShowToolbar] = useState(false)
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [showReviewPanel, setShowReviewPanel] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [selectionCoords, setSelectionCoords] = useState(null)
  const [isInteractingWithPopup, setIsInteractingWithPopup] = useState(false)

  const [highlightColor, setHighlightColor] = useState('#FFEB3B')
  const [noteContent, setNoteContent] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [isMobile, setIsMobile] = useState(true)

  const [footnotePopup, setFootnotePopup] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)

  const [showTTSLoginPrompt, setShowTTSLoginPrompt] = useState(false)
  const [showAnnotationLoginPrompt, setShowAnnotationLoginPrompt] = useState(false)
  const [showBookmarkLoginPrompt, setShowBookmarkLoginPrompt] = useState(false)

  // Reading mode - cream background
  const [readingMode, setReadingMode] = useState(() => {
    return localStorage.getItem('readingMode') === 'true'
  })

  // Progress tracking
  const [progressData, setProgressData] = useState({
    position: 0,
    readingTimeSeconds: 0,
    startTime: Date.now()
  })

  // Save reading mode preference
  useEffect(() => {
    localStorage.setItem('readingMode', readingMode)
  }, [readingMode])

  const fullChapterPath = chapterPath || ''

  // Auto-save progress every 30 seconds
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
      }).catch(error => console.error('Error saving progress:', error))

      // Reset timer
      setProgressData(prev => ({
        ...prev,
        startTime: currentTime,
        readingTimeSeconds: 0
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, chapter, bookSlug, progressData.startTime])

  // Stop TTS when chapter changes
  useEffect(() => {
    return () => {
      if (isAuthenticated) {
        tts.stop()
      }
    }
  }, [fullChapterPath, isAuthenticated])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return
      }

      // Navigation
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') && chapter?.previousChapter) {
        e.preventDefault()
        handlePrevChapter()
      }
      if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') && chapter?.nextChapter) {
        e.preventDefault()
        handleNextChapter()
      }

      // TTS
      if ((e.key === ' ' || e.key.toLowerCase() === 'k') && chapter?.htmlContent) {
        e.preventDefault()
        handleTTSToggle()
      }

      // Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        if (isAuthenticated) {
          setShowSearchModal(true)
        }
      }

      // Close modals
      if (e.key === 'Escape') {
        if (footnotePopup) setFootnotePopup(null)
        if (showSearchModal) setShowSearchModal(false)
        if (showExportModal) setShowExportModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [chapter, tts.isPlaying, isAuthenticated, footnotePopup, showSearchModal, showExportModal])

  // Swipe gestures
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

      if (isLeftSwipe && chapter?.nextChapter) handleNextChapter()
      if (isRightSwipe && chapter?.previousChapter) handlePrevChapter()

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
  }, [touchStart, touchEnd, chapter])

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

  // Debug: Log reviews when they change
  useEffect(() => {
    console.log('Current reviews state:', reviews)
  }, [reviews])

  useEffect(() => {
    if (location.state?.scrollTo !== undefined && !loading) {
      setTimeout(() => {
        window.scrollTo({ top: location.state.scrollTo, behavior: 'smooth' })
        window.history.replaceState({}, document.title)
      }, 500)
    } else {
      window.scrollTo(0, 0)
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
    const handleSelection = () => {
      if (isInteractingWithPopup) return
      const selection = window.getSelection()
      const text = selection.toString().trim()
      const target = selection.anchorNode
      if (!target) return

      const isInForm = target.nodeType === Node.TEXT_NODE
        ? (target.parentElement?.closest('textarea, input, [contenteditable="true"]') !== null)
        : (target.closest?.('textarea, input, [contenteditable="true"]') !== null)
      if (isInForm) return

      const chapterContentDiv = contentRef.current?.querySelector('.chapter-content')
      const isInChapterContent = chapterContentDiv?.contains(selection.anchorNode)

      if (text && isInChapterContent) {
        setSelectedText(text)
        const range = selection.getRangeAt(0).cloneRange()
        setSelectionRange(range)
        const rect = range.getBoundingClientRect()
        const popupHeight = 400
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const showAbove = spaceAbove > spaceBelow || spaceBelow < popupHeight
        const top = showAbove
          ? rect.top + window.scrollY - popupHeight - 10
          : rect.bottom + window.scrollY + 10
        const left = rect.left + (rect.width / 2)
        setSelectionCoords({ top, left })
        setShowAnnotationPanel(true)
      } else if (!isInteractingWithPopup && !isInForm) {
        clearSelection()
      }
    }
    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('touchend', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('touchend', handleSelection)
    }
  }, [isInteractingWithPopup])

  // Footnote handler
  useEffect(() => {
    if (!contentRef.current) return

    const handleFootnoteClick = async (e) => {
      const target = e.target.closest('a[href*="#"]')
      if (!target) return

      const href = target.getAttribute('href')
      const hashMatch = href.match(/#(.+)$/)
      if (!hashMatch) return

      e.preventDefault()
      const footnoteId = hashMatch[1]
      
      let footnoteElement = contentRef.current.querySelector(`#${footnoteId}`)
      
      if (footnoteElement) {
        const content = footnoteElement.innerHTML
        setFootnotePopup({ id: footnoteId, content, isLocal: true })
        return
      }

      try {
        setFootnotePopup({ 
          id: footnoteId, 
          content: `<div class="text-center py-4">
            <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-primary" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <circle class="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32"></circle>
            </svg>
            <p class="text-gray-500 text-sm">Memuat catatan...</p>
          </div>`,
          isLocal: false
        })

        const possibleChapters = ['muka', 'kolofon', 'catatan-kaki', 'catatan', 'keterangan', 'pendahuluan', 'prakata', 'kata-pengantar', 'daftar-pustaka', 'lampiran']
        
        for (const slug of possibleChapters) {
          try {
            const chapterData = await chapterService.readChapterByPath(bookSlug, slug)
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = chapterData.htmlContent
            footnoteElement = tempDiv.querySelector(`#${footnoteId}`)
            
            if (footnoteElement) {
              const content = footnoteElement.innerHTML
              setFootnotePopup({ 
                id: footnoteId, 
                content,
                isLocal: false,
                sourceChapter: chapterData.chapterTitle,
                sourceSlug: slug
              })
              return
            }
          } catch (err) {
            continue
          }
        }

        setFootnotePopup({ 
          id: footnoteId, 
          content: `<div class="text-center py-6 px-4">
            <div class="text-5xl mb-3">📚</div>
            <p class="text-amber-600 font-semibold mb-2">Catatan referensi tidak ditemukan</p>
            <p class="text-sm text-gray-600 mb-4">Catatan ini mungkin ada di bab lain.</p>
            <p class="text-xs text-gray-500">ID: <code class="bg-gray-100 px-2 py-1 rounded">${footnoteId}</code></p>
          </div>`,
          isLocal: false
        })
      } catch (error) {
        console.error('Error fetching footnote:', error)
        setFootnotePopup({ 
          id: footnoteId, 
          content: `<div class="text-center py-6 px-4">
            <div class="text-5xl mb-3">❌</div>
            <p class="text-red-500 font-semibold mb-2">Gagal memuat catatan</p>
            <p class="text-sm text-gray-600">Terjadi kesalahan saat mengambil data catatan.</p>
          </div>`,
          isLocal: false
        })
      }
    }

    const contentElement = contentRef.current
    contentElement.addEventListener('click', handleFootnoteClick)
    return () => {
      contentElement.removeEventListener('click', handleFootnoteClick)
    }
  }, [chapter, bookSlug])

  const fetchChapter = async () => {
    try {
      setLoading(true)
      const response = await chapterService.readChapterByPath(bookSlug, fullChapterPath)
      setChapter(response)
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
      console.error('Error fetching annotations:', error)
      setAnnotations({ bookmarks: [], highlights: [], notes: [] })
    }
  }

  const fetchReviews = async () => {
    if (!chapter?.chapterNumber) return
    try {
      const response = await chapterService.getChapterReviews(bookSlug, parseInt(chapter.chapterNumber))
      console.log('Reviews response:', response) // Debug log
      
      // Handle different response structures
      const reviewsData = response.data?.data || response.data || []
      setReviews(reviewsData)
      
      console.log('Reviews set:', reviewsData) // Debug log
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    }
  }

  const handleAddBookmark = async () => {
    if (!isAuthenticated) {
      setShowBookmarkLoginPrompt(true)
      return
    }
    try {
      await chapterService.addBookmark(bookSlug, parseInt(chapter.chapterNumber), { position: window.scrollY, note: '' })
      setShowToolbar(false)
      fetchAnnotations()
      alert('✓ Penanda buku ditambahkan!')
    } catch (error) {
      console.error('Error adding bookmark:', error)
      alert('✗ Gagal menambahkan penanda buku')
    }
  }

  const handleAddHighlight = async () => {
    if (!isAuthenticated) {
      setShowAnnotationLoginPrompt(true)
      clearSelection()
      return
    }
    if (!selectedText || !selectionRange) return
    try {
      await chapterService.addHighlight(bookSlug, parseInt(chapter.chapterNumber), {
        selectedText, color: highlightColor,
        startOffset: selectionRange.startOffset,
        endOffset: selectionRange.endOffset
      })
      clearSelection()
      fetchAnnotations()
      alert('✓ Highlight ditambahkan!')
    } catch (error) {
      console.error('Error adding highlight:', error)
      alert('✗ Gagal menambahkan highlight')
    }
  }

  const handleAddNote = async () => {
    if (!isAuthenticated) {
      setShowAnnotationLoginPrompt(true)
      clearSelection()
      return
    }
    if (!noteContent.trim()) return
    try {
      await chapterService.addNote(bookSlug, parseInt(chapter.chapterNumber), {
        content: noteContent, selectedText: selectedText || '', position: window.scrollY
      })
      setNoteContent('')
      clearSelection()
      setShowToolbar(false)
      fetchAnnotations()
      alert('✓ Catatan ditambahkan!')
    } catch (error) {
      console.error('Error adding note:', error)
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

  const handleAddReview = async () => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    if (!reviewContent.trim()) {
      alert('⚠️ Silakan tulis review terlebih dahulu')
      return
    }
    try {
      await chapterService.addChapterReview(bookSlug, parseInt(chapter.chapterNumber), {
        comment: reviewContent,
        isSpoiler: false
      })
      setReviewContent('')
      setShowReviewPanel(false)
      fetchReviews()
      alert('✓ Review ditambahkan!')
    } catch (error) {
      console.error('Error adding review:', error)
      alert('✗ Gagal menambahkan review: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLikeReview = async (reviewId) => {
    try {
      await chapterService.likeChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId)
      fetchReviews()
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const clearSelection = () => {
    setSelectedText('')
    setSelectionRange(null)
    setSelectionCoords(null)
    setShowAnnotationPanel(false)
    setIsInteractingWithPopup(false)
    setNoteContent('')
  }

  const buildChapterPath = (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return ''
    return breadcrumbs.map(b => b.slug).join('/')
  }

  const handleNextChapter = () => {
    if (!chapter?.nextChapter) return
    if (isAuthenticated) tts.stop()
    const nextUrl = buildChapterUrl(bookSlug, chapter.nextChapter)
    navigate(nextUrl)
  }

  const handlePrevChapter = () => {
    if (!chapter?.previousChapter) return
    if (isAuthenticated) tts.stop()
    const prevUrl = buildChapterUrl(bookSlug, chapter.previousChapter)
    navigate(prevUrl)
  }

  const handleAnnotationClick = (e, annotation) => {
    e.preventDefault()
    e.stopPropagation()
    const position = parseInt(annotation.position) || 0
    setShowToolbar(false)
    if (annotation.page === parseInt(chapter?.chapterNumber)) {
      window.scrollTo({ top: position, behavior: 'smooth' })
    } else {
      if (annotation.chapter) {
        const targetUrl = buildChapterUrl(bookSlug, annotation.chapter)
        navigate(targetUrl, { state: { scrollTo: position } })
      }
    }
  }

  const handleGoToFootnote = () => {
    if (footnotePopup?.id) {
      const element = document.getElementById(footnotePopup.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setFootnotePopup(null)
      }
    }
  }

  const handleTTSToggle = () => {
    if (!isAuthenticated) {
      setShowTTSLoginPrompt(true)
      return
    }
    if (!chapter?.htmlContent) return
    tts.toggle(chapter.htmlContent)
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

  const currentChapterHighlights = annotations.highlights?.filter(
    h => (h.page || h.chapterNumber) === parseInt(chapter?.chapterNumber)
  ) || []

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
  if (!chapter) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Bab tidak ditemukan</h2>
        <Link to={`/buku/${bookSlug}`} className="btn-primary">Kembali ke Buku</Link>
      </div>
    </div>
  )

  return (
    <div className="relative pb-20">
      {/* Tracking Indicator */}
      {isTracking && isAuthenticated && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-50 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Tracking
        </div>
      )}

      {/* Login Modals */}
      {showTTSLoginPrompt && (
        <LoginPromptModal
          icon={Volume2}
          title="Fitur Text-to-Speech"
          description="Text-to-Speech adalah fitur khusus untuk pengguna yang sudah login. Masuk sekarang untuk mendengarkan bab ini dibacakan!"
          onClose={() => setShowTTSLoginPrompt(false)}
          onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
        />
      )}

      {showAnnotationLoginPrompt && (
        <LoginPromptModal
          icon={Highlighter}
          title="Fitur Anotasi"
          description="Highlight dan catatan adalah fitur khusus untuk pengguna yang sudah login. Masuk sekarang untuk menyimpan anotasi Anda!"
          onClose={() => setShowAnnotationLoginPrompt(false)}
          onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
        />
      )}

      {showBookmarkLoginPrompt && (
        <LoginPromptModal
          icon={Bookmark}
          title="Fitur Penanda Buku"
          description="Penanda buku adalah fitur khusus untuk pengguna yang sudah login. Masuk sekarang untuk menyimpan penanda Anda!"
          onClose={() => setShowBookmarkLoginPrompt(false)}
          onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          onRegister={() => navigate('/daftar', { state: { from: location.pathname } })}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchInBook
          bookSlug={bookSlug}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportAnnotations
          bookSlug={bookSlug}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footnote Popup */}
      {footnotePopup && (
        <FootnotePopup
          content={footnotePopup.content}
          onClose={() => setFootnotePopup(null)}
          onGoToFootnote={handleGoToFootnote}
          isLocal={footnotePopup.isLocal}
          sourceChapter={footnotePopup.sourceChapter}
        />
      )}

      {/* Swipe Indicator */}
      {swipeDirection && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
          <div className={`bg-black/50 text-white px-6 py-4 rounded-full flex items-center gap-3 animate-in fade-in zoom-in duration-200 ${
            swipeDirection === 'left' ? 'slide-in-from-right-10' : 'slide-in-from-left-10'
          }`}>
            {swipeDirection === 'right' ? (
              <>
                <ChevronLeft className="w-8 h-8" />
                <span className="text-lg font-semibold">Bab Sebelumnya</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold">Bab Selanjutnya</span>
                <ChevronRight className="w-8 h-8" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
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

      {/* TTS Control Panel */}
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
          onStop={tts.stop}
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

      {/* Bottom Toolbar - Always with its own background */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg">
        <div className="flex items-center justify-between py-3 px-3 sm:px-4 max-w-4xl mx-auto gap-1 sm:gap-2">
          <button
            onClick={handlePrevChapter}
            disabled={!chapter?.previousChapter}
            className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all min-w-[60px] sm:min-w-[70px] ${
              chapter?.previousChapter
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs">Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Reading Mode Toggle */}
            <button
              onClick={() => setReadingMode(!readingMode)}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all ${
                readingMode
                  ? 'bg-[#8B7355] text-white shadow-md scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
              title={readingMode ? 'Mode Normal' : 'Mode Baca'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[10px] sm:text-xs">
                {readingMode ? 'Normal' : 'Baca'}
              </span>
            </button>

            <button
              onClick={handleTTSToggle}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all relative ${
                isAuthenticated && tts.isPlaying
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              {isAuthenticated && tts.isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span className="text-[10px] sm:text-xs">{isAuthenticated && tts.isPlaying ? 'Pause' : 'Dengar'}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] sm:text-xs">Cari</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAnnotationLoginPrompt(true)
                  return
                }
                setShowToolbar(!showToolbar)
              }}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all relative ${
                showToolbar && isAuthenticated
                  ? 'bg-primary/10 text-primary scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <Menu className="w-5 h-5" />
              <span className="text-[10px] sm:text-xs">Anotasi</span>
            </button>

            <button
              onClick={handleAddBookmark}
              className="flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all hover:scale-105 relative hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] sm:text-xs">Penanda</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setShowExportModal(true)}
                className="flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="w-5 h-5" />
                <span className="text-[10px] sm:text-xs">Ekspor</span>
              </button>
            )}
          </div>

          <button
            onClick={handleNextChapter}
            disabled={!chapter?.nextChapter}
            className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all min-w-[60px] sm:min-w-[70px] ${
              chapter?.nextChapter
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs">Selanjutnya</span>
          </button>
        </div>
      </div>

      {/* Text Selection Popup */}
      {selectedText && selectionCoords && (
        <div
          className="fixed z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary"
          style={{
            top: `${selectionCoords.top}px`,
            left: `${selectionCoords.left}px`,
            transform: 'translateX(-50%)',
            maxWidth: '90vw',
            width: '320px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onMouseDown={(e) => { e.stopPropagation(); setIsInteractingWithPopup(true); }}
          onTouchStart={(e) => { e.stopPropagation(); setIsInteractingWithPopup(true); }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Teks Terpilih</h3>
              <button onClick={clearSelection}><X className="w-4 h-4" /></button>
            </div>
            <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs italic max-h-20 overflow-y-auto">
              "{selectedText.substring(0, 150)}{selectedText.length > 150 ? '...' : ''}"
            </div>

            {isAuthenticated ? (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-2">Warna Highlight</label>
                  <div className="flex gap-2 justify-center">
                    {['#FFEB3B', '#4CAF50', '#2196F3', '#FF9800', '#F44336'].map(color => (
                      <button key={color} onClick={() => setHighlightColor(color)} className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: color, borderColor: highlightColor === color ? '#000' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <button onClick={handleAddHighlight} className="w-full py-2 bg-primary text-white rounded-lg text-sm mb-3">
                  <Highlighter className="w-4 h-4 inline mr-1" /> Highlight
                </button>
                <div className="pt-3 border-t">
                  <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} onFocus={() => setIsInteractingWithPopup(true)}
                    placeholder="Tambahkan catatan..." className="w-full p-2 border rounded text-sm mb-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="2" />
                  <button onClick={handleAddNote} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm">
                    <Check className="w-4 h-4 inline mr-1" /> Simpan Catatan
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Login untuk menyimpan highlight dan catatan
                </p>
                <button
                  onClick={() => {
                    clearSelection()
                    navigate('/masuk', { state: { from: location.pathname } })
                  }}
                  className="w-full py-2 bg-primary text-white rounded-lg text-sm"
                >
                  Masuk Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annotation Panel */}
      {isAuthenticated && isMobile && showToolbar && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowToolbar(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto pb-24"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Anotasi Saya</h3>
                <button onClick={() => setShowToolbar(false)}><X className="w-6 h-6" /></button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  Penanda Buku ({annotations.bookmarks.length})
                </h4>
                {annotations.bookmarks.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada penanda buku</p>
                ) : (
                  <div className="space-y-2">
                    {annotations.bookmarks.map(bookmark => (
                      <div key={bookmark.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <button
                            onClick={(e) => handleAnnotationClick(e, bookmark)}
                            className="flex-1 text-left text-sm hover:text-primary"
                          >
                            <div className="font-medium">
                              {bookmark.chapter?.title || `Bab ${bookmark.page}`}
                            </div>
                            {bookmark.note && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                {bookmark.note}
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Highlighter className="w-5 h-5" />
                  Highlight ({currentChapterHighlights.length})
                </h4>
                {currentChapterHighlights.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada highlight di bab ini</p>
                ) : (
                  <div className="space-y-2">
                    {currentChapterHighlights.map(highlight => (
                      <div key={highlight.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div
                              className="text-sm italic p-2 rounded"
                              style={{ backgroundColor: highlight.color + '40' }}
                            >
                              "{highlight.selectedText}"
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteHighlight(highlight.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <StickyNote className="w-5 h-5" />
                  Catatan ({annotations.notes.length})
                </h4>
                {annotations.notes.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada catatan</p>
                ) : (
                  <div className="space-y-2">
                    {annotations.notes.map(note => (
                      <div key={note.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <button
                            onClick={(e) => handleAnnotationClick(e, note)}
                            className="flex-1 text-left"
                          >
                            <div className="text-sm font-medium mb-1">
                              {note.chapter?.title || `Bab ${note.page}`}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {note.content}
                            </div>
                            {note.selectedText && (
                              <div className="text-xs text-gray-500 italic mt-1">
                                "{note.selectedText.substring(0, 100)}..."
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <article ref={contentRef}>
        {/* Header - Outside reading area */}
        <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {chapter.chapterTitle || `Bab ${chapter.chapterNumber}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{chapter.bookTitle}</p>
        </header>

        {/* Chapter Stats Widget - Outside reading area */}
        {isAuthenticated && (
          <ChapterStatsWidget
            bookSlug={bookSlug}
            chapterNumber={parseInt(chapter.chapterNumber)}
          />
        )}

        {/* READING AREA WITH BORDER - Only this gets cream background */}
        <div className={`transition-colors duration-300 rounded-lg my-8 ${
          readingMode ? 'bg-[#FFF8DC] px-8 py-12 shadow-inner border-t border-b border-gray-300' : 'border-t border-b border-gray-200 dark:border-gray-800 py-8'
        }`}>
          <ChapterContent htmlContent={memoizedContent} fontSize={fontSize} readingMode={readingMode} />
        </div>

        {/* Chapter Rating - VISIBLE FOR ALL USERS */}
        <div className="my-8">
          <ChapterRating
            bookSlug={bookSlug}
            chapterNumber={parseInt(chapter.chapterNumber)}
            chapterTitle={chapter.chapterTitle}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Reviews section - Outside reading area */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Diskusi Bab Ini</h2>
            <Button onClick={() => setShowReviewPanel(!showReviewPanel)}>
              <MessageSquare className="w-5 h-5 mr-2" />
              Tulis
            </Button>
          </div>
          
          {showReviewPanel && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <textarea 
                value={reviewContent} 
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Bagaimana pendapat Anda tentang bab ini?" 
                className="w-full p-3 border rounded-lg mb-4 min-h-[100px] bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" 
              />
              <div className="flex gap-2">
                <Button onClick={handleAddReview} disabled={!reviewContent.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowReviewPanel(false)
                    setReviewContent('')
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {r.userProfilePicture ? (
                        <img 
                          src={r.userProfilePicture} 
                          alt={r.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {r.userName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{r.userName || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {r.isSpoiler && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                        Spoiler
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLikeReview(r.id)} 
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        r.isLikedByMe 
                          ? 'text-primary font-semibold' 
                          : 'text-gray-500 hover:text-primary'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${r.isLikedByMe ? 'fill-current' : ''}`} />
                      {r.likeCount || 0} Suka
                    </button>
                    {r.replies && r.replies.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {r.replies.length} balasan
                      </span>
                    )}
                  </div>
                  
                  {/* Replies */}
                  {r.replies && r.replies.length > 0 && (
                    <div className="mt-4 ml-12 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {r.replies.map(reply => (
                        <div key={reply.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-2">
                            {reply.userProfilePicture ? (
                              <img 
                                src={reply.userProfilePicture} 
                                alt={reply.userName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-sm font-semibold">
                                  {reply.userName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-sm">{reply.userName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(reply.createdAt).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada diskusi</p>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

export default ChapterReaderPage