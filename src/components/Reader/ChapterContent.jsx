// ============================================
// FILE 4: src/components/Reader/ChapterContent.jsx
// ============================================
import { memo } from 'react'

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

ChapterContent.displayName = 'ChapterContent'

export default ChapterContent