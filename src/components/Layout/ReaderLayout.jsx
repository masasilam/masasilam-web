// src/components/Layout/ReaderLayout.jsx - MOBILE RESPONSIVE TOC FIXED
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, List, Moon, Settings, Sun, X, Clock, Check, Type, Volume2, Pause, Play, LayoutDashboard } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { chapterService } from '../../services/chapterService'
import logoSvg from '/masasilam-logo.svg'

const ReaderLayout = ({
  children,
  fontSize,
  setFontSize,
  readingProgress,
  contentWidth,
  setContentWidth,
  ttsState,
  onTTSToggle
}) => {
  const { theme, toggleTheme } = useTheme()
  const { bookSlug } = useParams()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [chapters, setChapters] = useState([])
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('reader-font-family') || 'serif')

  const isAuthenticated = !!localStorage.getItem('token')

  useEffect(() => {
    localStorage.setItem('reader-font-family', fontFamily)
  }, [fontFamily])

  useEffect(() => {
    const chapterContent = document.querySelector('.chapter-content')
    if (!chapterContent) return

    const fontFamilyMap = {
      'serif': '"Minion Pro", "Adobe Garamond Pro", "Garamond", "Times New Roman", "Liberation Serif", serif',
      'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      'monospace': '"Courier New", Courier, monospace',
      'georgia': 'Georgia, "Times New Roman", serif',
      'palatino': '"Palatino Linotype", "Book Antiqua", Palatino, serif'
    }

    chapterContent.style.fontFamily = fontFamilyMap[fontFamily]
  }, [fontFamily])

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await chapterService.getAllChapters(bookSlug)
        setChapters(response.data?.data || [])
      } catch (error) {
        console.error('Error fetching chapters:', error)
      }
    }

    if (bookSlug) {
      fetchChapters()
    }
  }, [bookSlug])

  // Prevent body scroll when TOC is open on mobile
  useEffect(() => {
    if (tocOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [tocOpen])

  const widthClasses = {
    normal: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-7xl'
  }

  const resetToDefaults = () => {
    setFontSize(16)
    setFontFamily('serif')
    setContentWidth('normal')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {readingProgress !== undefined && (
        <div
          className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(`/buku/${bookSlug}`)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Kembali ke detail buku"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center">
              <img src={logoSvg} alt="MasaSilam" className="h-10 w-auto dark:invert" />
            </Link>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Link
                  to="/dasbor"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Dashboard"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}

              {onTTSToggle && ttsState && (
                <button
                  onClick={onTTSToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    ttsState.isPlaying
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label={ttsState.isPlaying ? 'Pause TTS' : 'Play TTS'}
                  title={ttsState.isPlaying ? 'Pause TTS' : 'Play TTS'}
                >
                  {ttsState.isEnabled ? (
                    ttsState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Daftar Isi"
                  title="Daftar Isi"
                >
                  <List className="w-5 h-5" />
                </button>

                {tocOpen && (
                  <>
                    <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setTocOpen(false)} />

                    {/* RESPONSIVE TOC - FIXED FOR MOBILE */}
                    <div className="fixed md:absolute right-0 top-0 md:top-12 bottom-0 md:bottom-auto w-full md:w-80 max-w-[85vw] md:max-w-none md:max-h-[70vh] bg-white dark:bg-gray-800 border-l md:border border-gray-200 dark:border-gray-700 md:rounded-lg shadow-xl overflow-y-auto z-[70]">
                      {/* Sticky Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between z-10">
                        <h3 className="font-semibold">Daftar Isi</h3>
                        <button
                          onClick={() => setTocOpen(false)}
                          className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Scrollable Content with Bottom Padding for Mobile */}
                      <div className="divide-y divide-gray-200 dark:divide-gray-700 pb-24 md:pb-4">
                        {chapters.filter(ch => ch.parentChapterId === null).map((chapter) => (
                          <div key={chapter.id}>
                            <Link
                              to={`/buku/${bookSlug}/${chapter.slug}`}
                              onClick={() => setTocOpen(false)}
                              className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                  {chapter.chapterNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm mb-1 line-clamp-2">
                                    {chapter.title || `Bab ${chapter.chapterNumber}`}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{chapter.estimatedReadTime} menit</span>
                                    {chapter.isCompleted && (
                                      <div className="flex items-center gap-1 text-green-600">
                                        <Check className="w-3 h-3" />
                                        <span>Selesai</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>

                            {chapter.subChapters?.length > 0 && (
                              <div className="ml-11 pb-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                {chapter.subChapters.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/buku/${bookSlug}/${chapter.slug}/${sub.slug}`}
                                    onClick={() => setTocOpen(false)}
                                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors py-1"
                                  >
                                    {sub.chapterNumber}. {sub.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle tema"
                title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Pengaturan"
                title="Pengaturan"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className={`mx-auto px-4 py-8 ${widthClasses[contentWidth || 'normal']}`}>
          {children}
        </div>
      </main>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-14 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Pengaturan Pembaca</h3>
                <button
                  onClick={resetToDefaults}
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  Reset Default
                </button>
              </div>

              <div className="space-y-6">
                {fontSize !== undefined && setFontSize && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="w-4 h-4" />
                      <label className="block text-sm font-medium">
                        Ukuran Font: {fontSize}px
                      </label>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Kecil</span>
                      <span>Sedang</span>
                      <span>Besar</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4" />
                    <label className="block text-sm font-medium">Jenis Font</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'serif', label: 'Serif' },
                      { value: 'sans-serif', label: 'Sans-serif' },
                      { value: 'georgia', label: 'Georgia' },
                      { value: 'palatino', label: 'Palatino' }
                    ].map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setFontFamily(font.value)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          fontFamily === font.value
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {contentWidth !== undefined && setContentWidth && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Lebar Konten</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'normal', label: 'Normal' },
                        { value: 'wide', label: 'Lebar' },
                        { value: 'full', label: 'Penuh' }
                      ].map((width) => (
                        <button
                          key={width.value}
                          onClick={() => setContentWidth(width.value)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            contentWidth === width.value
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        >
                          {width.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReaderLayout