// src/pages/ChapterReaderWrapper.jsx
import { useState } from 'react'
import { useParams, useLocation, Navigate } from 'react-router-dom'
import ReaderLayout from '../components/Layout/ReaderLayout'
import ChapterReaderPage from './ChapterReaderPage'
import BookDetailPage from './BookDetailPage'
import PublicLayout from '../components/Layout/PublicLayout'

const ChapterReaderWrapper = () => {
  const params = useParams()
  const location = useLocation()
  const [fontSize, setFontSize] = useState(16)
  const [contentWidth, setContentWidth] = useState('normal')
  const [readingProgress, setReadingProgress] = useState(0)

  const bookSlug = params.bookSlug
  
  // ✅ Extract chapter path after /buku/bookSlug/
  // Example: /buku/book-slug/kerikil-tajam → kerikil-tajam
  // Example: /buku/book-slug/kerikil-tajam/nisan → kerikil-tajam/nisan
  const pathParts = location.pathname.split(`/buku/${bookSlug}/`)
  const chapterPath = pathParts[1] ? pathParts[1].replace(/\/$/, '') : ''

  console.log('📖 ChapterReaderWrapper:', {
    bookSlug,
    fullPathname: location.pathname,
    extractedChapterPath: chapterPath,
  })

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