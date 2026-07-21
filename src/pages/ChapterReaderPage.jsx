import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import { useTTS } from '../hooks/useTTS'
import useChapterNavigation from '../hooks/useChapterNavigation'
import useFootnoteHandler from '../hooks/useFootnoteHandler'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
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
import FootnotePopup from '../components/Reader/FootnotePopup'
import ChapterContent from '../components/Reader/ChapterContent'
import ReviewsSection from '../components/Reader/ReviewsSection'
import { Volume2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/epub-styles.css'

const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  html {
    -webkit-hyphens: auto !important; -moz-hyphens: auto !important;
    -ms-hyphens: auto !important; hyphens: auto !important;
  }
  .chapter-content,
  .chapter-content p, .chapter-content blockquote,
  .chapter-content li, .chapter-content td, .chapter-content th {
    -webkit-hyphens: auto !important; -moz-hyphens: auto !important;
    -ms-hyphens: auto !important; hyphens: auto !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
    word-break: normal !important;
    -webkit-hyphenate-limit-before: 2 !important;
    -webkit-hyphenate-limit-after: 2 !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-lines: 2 !important;
    -webkit-hyphenate-limit-zone: 8% !important;
  }
  .chapter-content.text-justify p, .chapter-content.text-justify blockquote {
    text-align: justify !important; text-justify: inter-word !important;
  }`

// ═════════════════════════════════════════════════════════════════════════════
const ChapterReaderPage = ({ fontSize, setReadingProgress, chapterPath }) => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef(null)

  const isAuthenticated = !!localStorage.getItem('token')
  const tts = useTTS()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])

  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showTTSPanel, setShowTTSPanel] = useState(true)
  const [readingMode, setReadingMode] = useState(() => localStorage.getItem('readingMode') === 'true')

  const fullChapterPath = chapterPath || ''
  const stopTTSOnUnmount = useRef(true)

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleNextChapter, handlePrevChapter } = useChapterNavigation(bookSlug, chapter, () => {
    if (isAuthenticated) { stopTTSOnUnmount.current = true; tts.stop() }
  })
  const { footnotePopup, setFootnotePopup, handleGoToFootnote } = useFootnoteHandler(contentRef, chapter, bookSlug)

  // ── TTS ────────────────────────────────────────────────────────────────────
  const handleTTSToggle = () => {
    if (!chapter?.htmlContent) return
    stopTTSOnUnmount.current = false
    tts.toggle(chapter.htmlContent)
    if (!tts.isPlaying) setShowTTSPanel(true)
  }

  const handleTTSStop = () => {
    stopTTSOnUnmount.current = true
    tts.stop()
    setShowTTSPanel(false)
  }

  const handleSearchClick = () => setShowSearchModal(true)

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useKeyboardShortcuts({
    chapter, isAuthenticated, isTTSPlaying: tts.isPlaying,
    footnotePopup, showSearchModal, showExportModal: false,
    onPrevChapter: handlePrevChapter, onNextChapter: handleNextChapter,
    onTTSToggle: handleTTSToggle, onSearchOpen: handleSearchClick,
    onFootnoteClose: () => setFootnotePopup(null),
    onSearchClose: () => setShowSearchModal(false),
    onExportClose: () => {},
  })

  // ── Persist reading mode ───────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('readingMode', readingMode)
  }, [readingMode])

  // ── Stop TTS on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (isAuthenticated && stopTTSOnUnmount.current) tts.stop()
    }
  }, [fullChapterPath, isAuthenticated, tts])

  // ── Fetch chapter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullChapterPath) return
    fetchChapter()
  }, [bookSlug, fullChapterPath, isAuthenticated])

  // ── Fetch reviews & persist last chapter ──────────────────────────────────
  useEffect(() => {
    if (chapter?.chapterNumber && fullChapterPath) {
      fetchReviews()
      localStorage.setItem(`lastChapter_${bookSlug}`, fullChapterPath)
    }
  }, [chapter, fullChapterPath, bookSlug])

  // ── Scroll restore ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      if (location.state?.scrollTo !== undefined) {
        setTimeout(() => {
          window.scrollTo({ top: location.state.scrollTo, behavior: 'smooth' })
          window.history.replaceState({}, document.title)
        }, 500)
      } else {
        window.scrollTo(0, 0)
      }
    }
  }, [loading, location.state])

  // ── Scroll progress (UI only) ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !setReadingProgress) return
      const scrollTop    = window.scrollY
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight
      const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapter, setReadingProgress])

  // ── Open external links in new tab ────────────────────────────────────────
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

  // ── Data fetchers ──────────────────────────────────────────────────────────
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

  const fetchReviews = async () => {
    if (!chapter?.chapterNumber) return
    try {
      const response = await chapterService.getChapterReviews(bookSlug, parseInt(chapter.chapterNumber))
      setReviews(response.data?.data || response.data || [])
    } catch {
      setReviews([])
    }
  }

  // ── Review handlers ────────────────────────────────────────────────────────
  const handleAddReview = async (reviewContent) => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    try {
      await chapterService.addChapterReview(
        bookSlug,
        parseInt(chapter.chapterNumber),
        { comment: reviewContent, isSpoiler: false }
      )
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
      if (isLiked) await chapterService.unlikeChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId)
      else         await chapterService.likeChapterReview(bookSlug, parseInt(chapter.chapterNumber), reviewId)
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
      await chapterService.replyToChapterReview(
        bookSlug,
        parseInt(chapter.chapterNumber),
        reviewId,
        { comment: replyContent }
      )
      fetchReviews()
      alert('✓ Balasan ditambahkan!')
    } catch (error) {
      alert('✗ Gagal menambahkan balasan: ' + (error.response?.data?.message || error.message))
    }
  }

  // ── TTS settings ───────────────────────────────────────────────────────────
  const handleTTSApplySettings = () => {
    tts.applySettings({ rate: tts.rate, pitch: tts.pitch, voiceIndex: tts.voiceIndex })
  }

  // ── Memoized content ───────────────────────────────────────────────────────
  const memoizedContent = useMemo(() => chapter?.htmlContent || '', [chapter?.htmlContent])

  // ── SEO helpers ───────────────────────────────────────────────────────────
  const buildFullChapterPath = (breadcrumbs) =>
    breadcrumbs?.length ? breadcrumbs.map(b => b.slug).join('/') : ''

  const buildChapterPath = (breadcrumbs) =>
    breadcrumbs?.length ? breadcrumbs.map(b => b.slug).join('/') : ''

  const chapterUrl = chapter
    ? `/buku/${bookSlug}/${buildFullChapterPath(chapter.breadcrumbs)}`
    : ''

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

  const bookForSchema = chapter
    ? {
        title: chapter.bookTitle,
        slug: bookSlug,
        authorNames: chapter.authorNames || '',
        authorSlugs: chapter.authorSlugs || ''
      }
    : null

  const structuredData = chapter && bookForSchema
    ? combineStructuredData(
        generateBreadcrumbStructuredData(breadcrumbs),
        generateChapterStructuredData(chapter, bookForSchema)
      )
    : null

  const metaDescription = chapter?.htmlContent
    ? generateMetaDescription(chapter.htmlContent, 160)
    : `Baca ${chapter?.chapterTitle || 'bab ini'} dari ${chapter?.bookTitle || 'buku'} secara gratis di MasasilaM.`

  const keywords = `${chapter?.bookTitle || ''}, ${chapter?.chapterTitle || ''}, ${chapter?.authorNames || ''}, baca online gratis, buku domain publik`

  // ── Render guards ──────────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
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

      <div className="relative pb-16" lang="id">
        <style>{hideScrollbarStyle}</style>

        {/* ── Search modal ── */}
        {showSearchModal && (
          <SearchInBook
            bookSlug={bookSlug}
            onClose={() => setShowSearchModal(false)}
          />
        )}

        {/* ── Footnote popup ── */}
        {footnotePopup && (
          <FootnotePopup
            content={footnotePopup.content}
            onClose={() => setFootnotePopup(null)}
            onGoToFootnote={handleGoToFootnote}
            isLocal={footnotePopup.isLocal}
            sourceChapter={footnotePopup.sourceChapter}
          />
        )}

        {/* ── Breadcrumb ── */}
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

        {/* ── TTS panels ── */}
        {tts.availableVoices.length > 0 && (
          <TTSVoiceSetupBanner availableVoices={tts.availableVoices} />
        )}
        {tts.isEnabled && showTTSPanel && (
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

        {/* ── Chapter content ── */}
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
            style={{ maxWidth: '42em', padding: '1.25em' }}
          >
            <ChapterContent
              htmlContent={memoizedContent}
              fontSize={fontSize}
              readingMode={readingMode}
              highlights={[]}
              notes={[]}
            />
          </div>

          {/* ── Chapter rating ── */}
          <div className="my-8">
            <ChapterRating
              bookSlug={bookSlug}
              chapterNumber={parseInt(chapter.chapterNumber)}
              chapterTitle={chapter.chapterTitle}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* ── Reviews ── */}
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

      {/* ══ FOOTER FIXED ════════════════════════════════════════════════════ */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 h-14 flex items-center px-4
        border-t border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900">

        <button
          onClick={handlePrevChapter}
          disabled={!chapter.previousChapter}
          className="flex items-center justify-center w-9 h-9 rounded-lg
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-800
            disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Bab sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setReadingMode(!readingMode)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border text-base transition ${
              readingMode
                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Mode baca"
          >
            📄
          </button>

          <button
            onClick={handleSearchClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-800 transition
              text-gray-500 dark:text-gray-400"
            title="Cari dalam buku"
          >
            <Search size={17} />
          </button>

          <button
            onClick={handleTTSToggle}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition ${
              tts.isPlaying
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={tts.isPlaying ? 'Stop TTS' : 'Dengarkan bab ini'}
          >
            <Volume2 size={17} />
          </button>
        </div>

        <button
          onClick={handleNextChapter}
          disabled={!chapter.nextChapter}
          className="flex items-center justify-center w-9 h-9 rounded-lg
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-800
            disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Bab berikutnya"
        >
          <ChevronRight size={18} />
        </button>

      </footer>
    </>
  )
}

export default ChapterReaderPage