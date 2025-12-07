// src/pages/ChapterReaderPage.jsx - WITH TTS FEATURE
import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import { 
  ChevronLeft, ChevronRight, Bookmark, Highlighter,
  StickyNote, MessageSquare, ThumbsUp, Send, X, Check, Menu,
  Volume2, VolumeX, Pause, Play, SkipForward, SkipBack
} from 'lucide-react'
import '../styles/epub-styles.css'

// Helper: Build chapter URL from chapter navigation info
const buildChapterUrl = (bookSlug, chapterInfo) => {
  if (!chapterInfo) return ''
  
  const { slug, chapterLevel, parentSlug } = chapterInfo
  
  // Level 1: /buku/{bookSlug}/{slug}
  if (chapterLevel === 1) {
    return `/buku/${bookSlug}/${slug}`
  }
  
  // Level 2+: /buku/{bookSlug}/{parentSlug}/{slug}
  if (!parentSlug) {
    return `/buku/${bookSlug}/${slug}`
  }
  
  return `/buku/${bookSlug}/${parentSlug}/${slug}`
}

const ChapterContent = memo(({ htmlContent, fontSize }) => {
  return (
    <div 
      className="chapter-content prose dark:prose-invert max-w-none mb-12" 
      style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', userSelect: 'text' }}
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

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [annotations, setAnnotations] = useState({ bookmarks: [], highlights: [], notes: [] })
  const [reviews, setReviews] = useState([])
  
  const [showToolbar, setShowToolbar] = useState(false)
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [showReviewPanel, setShowReviewPanel] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [selectionCoords, setSelectionCoords] = useState(null)
  const [isInteractingWithPopup, setIsInteractingWithPopup] = useState(false)
  
  const [highlightColor, setHighlightColor] = useState('#FFEB3B')
  const [noteContent, setNoteContent] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [isMobile, setIsMobile] = useState(true)

  // TTS States
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [ttsPlaying, setTtsPlaying] = useState(false)
  const [ttsPaused, setTtsPaused] = useState(false)
  const [ttsRate, setTtsRate] = useState(1.0)
  const [ttsPitch, setTtsPitch] = useState(1.0)
  const [ttsVoiceIndex, setTtsVoiceIndex] = useState(0)
  const [availableVoices, setAvailableVoices] = useState([])
  const [showTTSSettings, setShowTTSSettings] = useState(false)
  const [ttsFullText, setTtsFullText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const utteranceRef = useRef(null)
  const startTimeRef = useRef(0)
  const startCharRef = useRef(0)

  const fullChapterPath = chapterPath || ''

  // Initialize TTS voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      // Filter Indonesian voices first, then all voices
      const indonesianVoices = voices.filter(v => v.lang.startsWith('id'))
      setAvailableVoices(indonesianVoices.length > 0 ? indonesianVoices : voices)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // TTS Functions
  const extractTextFromHTML = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Estimate character position based on time elapsed
  const estimateCharPosition = (text, startChar, elapsedMs, rate) => {
    // Average speaking rate: ~150 words per minute at rate 1.0
    // Average word length: ~5 characters
    // So roughly 12.5 chars per second at rate 1.0
    const charsPerSecond = 12.5 * rate
    const elapsedSeconds = elapsedMs / 1000
    const estimatedChars = Math.floor(elapsedSeconds * charsPerSecond)
    return Math.min(startChar + estimatedChars, text.length)
  }

  const speak = (text, startFromChar = 0) => {
    if (!text) {
      console.warn('No text to speak')
      return
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel()

    // Get text from the starting position
    const textToSpeak = startFromChar > 0 ? text.substring(startFromChar) : text
    
    if (!textToSpeak.trim()) {
      console.warn('No more text to speak')
      setTtsPlaying(false)
      setTtsEnabled(false)
      return
    }

    console.log('🔊 Speaking from char:', startFromChar, 'Preview:', textToSpeak.substring(0, 50))

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    // Set voice
    if (availableVoices.length > 0 && availableVoices[ttsVoiceIndex]) {
      utterance.voice = availableVoices[ttsVoiceIndex]
    }
    
    utterance.rate = ttsRate
    utterance.pitch = ttsPitch
    utterance.lang = 'id-ID'

    utterance.onstart = () => {
      setTtsPlaying(true)
      setTtsPaused(false)
      setTtsEnabled(true)
      startTimeRef.current = Date.now()
      startCharRef.current = startFromChar
      console.log('▶️ Started at:', startFromChar)
    }

    utterance.onboundary = (event) => {
      // Update actual position in full text
      const actualPosition = startFromChar + event.charIndex
      setCurrentCharIndex(actualPosition)
    }

    utterance.onpause = () => {
      // Only triggered if native pause works
      const elapsed = Date.now() - startTimeRef.current
      const estimatedPos = estimateCharPosition(text, startCharRef.current, elapsed, ttsRate)
      setCurrentCharIndex(estimatedPos)
      setTtsPaused(true)
      setTtsPlaying(false)
      console.log('⏸️ Native paused at:', estimatedPos)
    }

    utterance.onresume = () => {
      startTimeRef.current = Date.now()
      startCharRef.current = currentCharIndex
      setTtsPlaying(true)
      setTtsPaused(false)
      console.log('▶️ Resumed from:', currentCharIndex)
    }

    utterance.onend = () => {
      setTtsPlaying(false)
      setTtsPaused(false)
      setTtsEnabled(false)
      setCurrentCharIndex(0)
      console.log('⏹️ Ended')
    }

    utterance.onerror = (event) => {
      console.error('❌ TTS Error:', event.error)
      setTtsPlaying(false)
      setTtsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const startTTS = () => {
    if (!chapter?.content) return

    // Extract full text
    const text = extractTextFromHTML(chapter.htmlContent || chapter.content)
    
    if (!text.trim()) {
      console.warn('No text to speak')
      return
    }

    setTtsFullText(text)
    setCurrentCharIndex(0)
    speak(text, 0)
  }

  const pauseTTS = () => {
    if (!window.speechSynthesis.speaking) return
    
    console.log('🛑 User clicked pause')
    
    // Calculate current position before canceling
    const elapsed = Date.now() - startTimeRef.current
    const estimatedPos = estimateCharPosition(ttsFullText, startCharRef.current, elapsed, ttsRate)
    
    // Update position BEFORE canceling
    setCurrentCharIndex(estimatedPos)
    
    // Try native pause
    window.speechSynthesis.pause()
    
    // Check if pause worked, if not cancel
    setTimeout(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        // Native pause didn't work, cancel it
        window.speechSynthesis.cancel()
        console.log('⏸️ Cancelled at position:', estimatedPos)
      } else {
        console.log('⏸️ Native pause at position:', estimatedPos)
      }
      setTtsPlaying(false)
      setTtsPaused(true)
    }, 50)
  }

  const resumeTTS = () => {
    if (!ttsFullText) {
      startTTS()
      return
    }
    
    // Try native resume first
    if (window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume()
        console.log('▶️ Native resume')
        return
      } catch (e) {
        console.log('❌ Native resume failed:', e)
      }
    }
    
    // Fallback: restart from saved position
    console.log('🔄 Restart from position:', currentCharIndex)
    speak(ttsFullText, currentCharIndex)
  }

  const stopTTS = () => {
    window.speechSynthesis.cancel()
    setTtsPlaying(false)
    setTtsPaused(false)
    setTtsEnabled(false)
    setTtsFullText('')
    setCurrentCharIndex(0)
  }

  const toggleTTS = () => {
    if (!ttsEnabled && !ttsPaused) {
      startTTS()
    } else if (ttsPlaying) {
      pauseTTS()
    } else if (ttsPaused || ttsEnabled) {
      resumeTTS()
    }
  }

  // Stop TTS when chapter changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [fullChapterPath])

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
      setReviews(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleAddBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
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
      navigate('/masuk', { state: { from: location.pathname } })
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
      navigate('/masuk', { state: { from: location.pathname } })
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
        content: reviewContent, 
        rating: reviewRating
      })
      
      setReviewContent('')
      setReviewRating(5)
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

  // Navigation using chapter info from response
  const handleNextChapter = () => {
    if (!chapter?.nextChapter) return
    stopTTS() // Stop TTS when navigating
    const nextUrl = buildChapterUrl(bookSlug, chapter.nextChapter)
    navigate(nextUrl)
  }

  const handlePrevChapter = () => {
    if (!chapter?.previousChapter) return
    stopTTS() // Stop TTS when navigating
    const prevUrl = buildChapterUrl(bookSlug, chapter.previousChapter)
    navigate(prevUrl)
  }

  // Annotation navigation using chapter info
  const handleAnnotationClick = (e, annotation) => {
    e.preventDefault()
    e.stopPropagation()
    
    const position = parseInt(annotation.position) || 0
    setShowToolbar(false)
    
    // Check if annotation is in current chapter
    if (annotation.page === parseInt(chapter?.chapterNumber)) {
      // Same chapter - just scroll
      window.scrollTo({ top: position, behavior: 'smooth' })
    } else {
      // Different chapter - navigate using chapter info
      if (annotation.chapter) {
        const targetUrl = buildChapterUrl(bookSlug, annotation.chapter)
        navigate(targetUrl, { state: { scrollTo: position } })
      }
    }
  }

  const memoizedContent = useMemo(() => {
    if (!chapter?.htmlContent) return ''
    return chapter.htmlContent
  }, [chapter?.htmlContent])

  // Add target="_blank" to external links
  useEffect(() => {
    if (!contentRef.current) return
    
    const links = contentRef.current.querySelectorAll('.chapter-content a')
    links.forEach(link => {
      const href = link.getAttribute('href')
      // Check if it's an external link (starts with http:// or https://)
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
      {/* Breadcrumbs Navigation */}
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
      
      {/* TTS Control Panel - Floating */}
      {ttsEnabled && (
        <div className="fixed top-20 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Text to Speech
            </h4>
            <button onClick={stopTTS} className="text-red-500 hover:text-red-700">
              <VolumeX className="w-4 h-4" />
            </button>
          </div>

          {/* Progress indicator */}
          {ttsFullText && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">
                Progress: {Math.round((currentCharIndex / ttsFullText.length) * 100)}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentCharIndex / ttsFullText.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handlePrevChapter}
              disabled={!chapter?.previousChapter}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Bab sebelumnya"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleTTS}
              className="p-3 rounded-full bg-primary text-white hover:bg-primary/90"
              title={ttsPlaying ? 'Pause' : 'Play'}
            >
              {ttsPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={handleNextChapter}
              disabled={!chapter?.nextChapter}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Bab selanjutnya"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowTTSSettings(!showTTSSettings)}
            className="w-full text-xs text-center text-primary hover:underline"
          >
            {showTTSSettings ? 'Sembunyikan' : 'Pengaturan'} ⚙️
          </button>

          {showTTSSettings && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Speed Control */}
              <div>
                <label className="text-xs font-medium block mb-1">
                  Kecepatan: {ttsRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Pitch Control */}
              <div>
                <label className="text-xs font-medium block mb-1">
                  Nada: {ttsPitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Voice Selection */}
              {availableVoices.length > 0 && (
                <div>
                  <label className="text-xs font-medium block mb-1">Suara</label>
                  <select
                    value={ttsVoiceIndex}
                    onChange={(e) => setTtsVoiceIndex(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
                  >
                    {availableVoices.map((voice, index) => (
                      <option key={index} value={index}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => {
                  const wasPlaying = ttsPlaying
                  stopTTS()
                  if (wasPlaying) {
                    setTimeout(() => startTTS(), 100)
                  }
                }}
                className="w-full py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary/90"
              >
                Terapkan Pengaturan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-around py-3 px-2 max-w-2xl mx-auto">
          <button 
            onClick={toggleTTS} 
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              ttsPlaying 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {ttsPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="text-xs">{ttsPlaying ? 'Pause' : 'Dengar'}</span>
          </button>
          
          {isAuthenticated && (
            <button onClick={() => setShowToolbar(!showToolbar)} className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Menu className="w-5 h-5" /><span className="text-xs">Anotasi</span>
            </button>
          )}
          <button onClick={handleAddBookmark} className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Bookmark className="w-5 h-5" /><span className="text-xs">Penanda</span>
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

              {/* Bookmarks */}
              {annotations.bookmarks?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" /> Penanda Buku
                  </h4>
                  <div className="space-y-2">
                    {annotations.bookmarks.map(b => {
                      const isDiff = b.page !== parseInt(chapter.chapterNumber)
                      return (
                        <div key={b.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {isDiff && (
                                <div className="text-xs font-semibold text-primary mb-2">
                                  📍 {b.chapter?.title || `Bab ${b.page}`}
                                </div>
                              )}
                              {b.description && <p className="text-sm mb-2">{b.description}</p>}
                              <button onClick={(e) => handleAnnotationClick(e, b)} className="text-xs text-primary font-medium hover:underline">
                                {isDiff ? 'Buka bab ini →' : 'Lompat ke lokasi →'}
                              </button>
                            </div>
                            <button 
                              onClick={() => handleDeleteBookmark(b.id)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Hapus penanda"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {currentChapterHighlights?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Highlighter className="w-4 h-4" /> Highlight
                  </h4>
                  <div className="space-y-2">
                    {currentChapterHighlights.map(h => (
                      <div key={h.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div 
                              className="text-sm mb-2 p-2 rounded" 
                              style={{ backgroundColor: h.color + '40' }}
                            >
                              "{h.selectedText}"
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteHighlight(h.id)}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Hapus highlight"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {annotations.notes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Catatan
                  </h4>
                  <div className="space-y-2">
                    {annotations.notes.map(n => {
                      const isDiff = n.page !== parseInt(chapter.chapterNumber)
                      return (
                        <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {isDiff && (
                                <div className="text-xs font-semibold text-primary mb-2">
                                  📍 {n.chapter?.title || `Bab ${n.page}`}
                                </div>
                              )}
                              <p className="text-sm mb-2">{n.content}</p>
                              {n.selectedText && (
                                <div className="text-xs text-gray-500 italic mb-2">
                                  "{n.selectedText}"
                                </div>
                              )}
                              <button onClick={(e) => handleAnnotationClick(e, n)} className="text-xs text-primary font-medium hover:underline">
                                {isDiff ? 'Buka bab ini →' : 'Lompat ke lokasi →'}
                              </button>
                            </div>
                            <button 
                              onClick={() => handleDeleteNote(n.id)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Hapus catatan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {annotations.bookmarks?.length === 0 && 
               annotations.highlights?.length === 0 && 
               annotations.notes?.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Belum ada anotasi
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <article ref={contentRef}>
        <header className="mb-8 pb-8 border-b">
          <div className="text-sm text-gray-500 mb-2">Bab {chapter.chapterNumber} dari {chapter.totalChapters}</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{chapter.chapterTitle || `Bab ${chapter.chapterNumber}`}</h1>
          <p className="text-gray-600">{chapter.bookTitle}</p>
        </header>
        
        <ChapterContent htmlContent={memoizedContent} fontSize={fontSize} />
        
        <div className="pt-8 border-t mb-8">
          <div className="flex justify-between gap-4">
            <Button 
              variant="secondary" 
              onClick={handlePrevChapter} 
              disabled={!chapter?.previousChapter}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Sebelumnya
            </Button>
            <Button 
              onClick={handleNextChapter} 
              disabled={!chapter?.nextChapter}
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Diskusi Bab Ini</h2>
            <Button onClick={() => setShowReviewPanel(!showReviewPanel)}>
              <MessageSquare className="w-5 h-5 mr-2" />
              Tulis
            </Button>
          </div>
          
          {showReviewPanel && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setReviewRating(star)} 
                      className={`text-3xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
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
                    setReviewRating(5)
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{r.userName}</div>
                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('id-ID')}</div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => <span key={i}>{i < r.rating ? '★' : '☆'}</span>)}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{r.content}</p>
                <button onClick={() => handleLikeReview(r.id)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                  <ThumbsUp className="w-4 h-4" />{r.likeCount || 0} Suka
                </button>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada diskusi</p>}
          </div>
        </div>
      </article>
    </div>
  )
}

export default ChapterReaderPage