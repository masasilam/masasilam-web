// src/pages/ChapterReaderWrapper.jsx - WITH PERSISTENT SETTINGS
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import ReaderLayout from '../components/Layout/ReaderLayout'
import ChapterReaderPage from './ChapterReaderPage'
import BookDetailPage from './BookDetailPage'
import PublicLayout from '../components/Layout/PublicLayout'

const ChapterReaderWrapper = () => {
  const params = useParams()
  const location = useLocation()

  // ✅ Load from localStorage on mount
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('reader-font-size')) || 16
  })

  const [contentWidth, setContentWidth] = useState(() => {
    return localStorage.getItem('reader-content-width') || 'normal'
  })

  const [readingProgress, setReadingProgress] = useState(0)

  // ✅ Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('reader-font-size', fontSize.toString())
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('reader-content-width', contentWidth)
  }, [contentWidth])

  const bookSlug = params.bookSlug
  
  // ✅ Extract chapter path after /buku/bookSlug/
  // Example: /buku/book-slug/kerikil-tajam → kerikil-tajam
  // Example: /buku/book-slug/kerikil-tajam/nisan → kerikil-tajam/nisan
  const pathParts = location.pathname.split(`/buku/${bookSlug}/`)
  const chapterPath = pathParts[1] ? pathParts[1].replace(/\/$/, '') : ''

  // ✅ If no chapter path, show book detail page instead
  if (!chapterPath) {
    return (
      <PublicLayout>
        <BookDetailPage />
      </PublicLayout>
    )
  }

  return (
    <ReaderLayout 
      fontSize={fontSize} 
      setFontSize={setFontSize}
      contentWidth={contentWidth}
      setContentWidth={setContentWidth}
      readingProgress={readingProgress}
    >
      <ChapterReaderPage 
        fontSize={fontSize}
        setReadingProgress={setReadingProgress}
        chapterPath={chapterPath}
      />
    </ReaderLayout>
  )
}

export default ChapterReaderWrapper