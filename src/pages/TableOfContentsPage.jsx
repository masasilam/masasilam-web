import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapterService } from '../services/chapterService'
import bookService from '../services/bookService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import { generateTableOfContentsStructuredData, generateBreadcrumbStructuredData } from '../utils/seoHelpers'
import { BookOpen, Check, Clock, ChevronDown, ChevronRight } from 'lucide-react'

const buildChapterPath = (chapter, parentChapter = null) => {
  if (!chapter?.slug) return chapter?.chapterNumber || ''
  if (!parentChapter) return chapter.slug
  return `${parentChapter.slug}/${chapter.slug}`
}

const ChapterItem = ({ chapter, bookSlug, level = 0, parentChapter = null }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasSubChapters = chapter.subChapters && chapter.subChapters.length > 0
  const chapterPath = buildChapterPath(chapter, parentChapter)

  return (
    <div>
      <div className="relative">
        {hasSubChapters && (
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            aria-label={isExpanded ? "Tutup sub-bab" : "Buka sub-bab"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        <Link
          to={`/buku/${bookSlug}/${chapterPath}`}
          className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group ${
            level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700' : ''
          } ${hasSubChapters ? 'pl-10' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${
              level === 0 ? 'w-12 h-12' : 'w-10 h-10'
            } bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors`}>
              {chapter.chapterNumber}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold group-hover:text-primary transition-colors ${
                level === 0 ? 'text-lg mb-1' : 'text-base mb-1'
              }`}>
                {chapter.title || `Bab ${chapter.chapterNumber}`}
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{chapter.estimatedReadTime} menit</span>
                </div>
                {chapter.wordCount > 0 && (
                  <span>{chapter.wordCount.toLocaleString('id-ID')} kata</span>
                )}
                {chapter.isCompleted && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Selesai</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {hasSubChapters && isExpanded && (
        <div className="border-l-2 border-primary/20 ml-6">
          {chapter.subChapters.map((subChapter) => (
            <ChapterItem
              key={subChapter.id}
              chapter={subChapter}
              bookSlug={bookSlug}
              level={level + 1}
              parentChapter={chapter}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const TableOfContentsPage = () => {
  const { bookSlug } = useParams()
  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [bookSlug])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookResponse, chaptersResponse] = await Promise.all([
        bookService.getBookBySlug(bookSlug),
        chapterService.getAllChapters(bookSlug)
      ])

      setBook(bookResponse.data)
      setChapters(chaptersResponse.data?.data || [])
    } catch (error) {
      console.error('Error fetching table of contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const mainChaptersCount = chapters.filter(ch => ch.parentChapterId === null).length
  const firstChapter = chapters.find(ch => ch.parentChapterId === null)
  const firstChapterPath = firstChapter ? buildChapterPath(firstChapter) : '1'

  // Generate SEO data
  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Koleksi Buku', url: '/buku' },
    { name: book?.title || 'Buku', url: `/buku/${bookSlug}` },
    { name: 'Daftar Isi', url: '#' }
  ]

  const tocSchema = book ? generateTableOfContentsStructuredData(
    chapters.filter(ch => ch.parentChapterId === null),
    book
  ) : null

  const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbs)

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <SEO
        title={`Daftar Isi - ${book?.title || 'Buku'}`}
        description={`Daftar lengkap ${mainChaptersCount} bab dari buku ${book?.title}. Mulai membaca dari bab mana saja.`}
        url={`/buku/${bookSlug}/daftar-isi`}
        type="website"
        structuredData={tocSchema ? [tocSchema, breadcrumbSchema] : [breadcrumbSchema]}
        keywords={`daftar isi, ${book?.title}, bab buku, chapter`}
      />

      <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Link to={`/buku/${bookSlug}`} className="text-primary hover:underline mb-2 inline-block">
              ← Kembali ke Detail Buku
            </Link>
            <h1 className="text-4xl font-bold mb-2">{book?.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Daftar Isi • {mainChaptersCount} Bab Utama
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {chapters.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada bab tersedia</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {chapters
                  .filter(ch => ch.parentChapterId === null)
                  .map((chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      bookSlug={bookSlug}
                      level={0}
                      parentChapter={null}
                    />
                  ))}
              </div>
            )}
          </div>

          {chapters.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                to={`/buku/${bookSlug}/${firstChapterPath}`}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Mulai Membaca
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TableOfContentsPage