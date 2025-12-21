// ============================================
// FILE: src/components/Reader/AnnotationPanel.jsx - COMPLETE FIXED
// ============================================
import { X, Bookmark, Highlighter, StickyNote } from 'lucide-react'

const AnnotationPanel = ({
  annotations,
  currentChapterNumber,
  onClose,
  onAnnotationClick,
  onDeleteBookmark,
  onDeleteHighlight,
  onDeleteNote
}) => {
  // Helper function to get chapter label from API data
  const getChapterLabel = (annotation) => {
    if (annotation.chapterTitle) {
      return annotation.chapterTitle
    }
    if (annotation.chapterNumber) {
      return `Bab ${annotation.chapterNumber}`
    }
    if (annotation.chapter?.title) {
      return annotation.chapter.title
    }
    if (annotation.page) {
      return `Bab ${annotation.page}`
    }
    return 'Bab tidak diketahui'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto pb-24"
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Anotasi Saya</h3>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>

          {/* Bookmarks Section */}
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
                        onClick={(e) => onAnnotationClick(e, bookmark)}
                        className="flex-1 text-left text-sm hover:text-primary"
                      >
                        <div className="font-medium">
                          {getChapterLabel(bookmark)}
                        </div>
                        {bookmark.note && (
                          <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            {bookmark.note}
                          </div>
                        )}
                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {new Date(bookmark.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteBookmark(bookmark.id)}
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

          {/* Highlights Section */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Highlighter className="w-5 h-5" />
              Highlight ({annotations.highlights.length})
            </h4>
            {annotations.highlights.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada highlight</p>
            ) : (
              <div className="space-y-2">
                {annotations.highlights.map(highlight => (
                  <div key={highlight.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <button
                        onClick={(e) => onAnnotationClick(e, highlight)}
                        className="flex-1 text-left hover:opacity-80 transition-opacity"
                      >
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {getChapterLabel(highlight)}
                        </div>
                        <div
                          className="text-sm italic p-2 rounded"
                          style={{ backgroundColor: highlight.color + '40' }}
                        >
                          "{highlight.highlightedText}"
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {new Date(highlight.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteHighlight(highlight.id)}
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

          {/* Notes Section */}
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
                        onClick={(e) => onAnnotationClick(e, note)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium mb-1">
                          {getChapterLabel(note)}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {note.content}
                        </div>
                        {note.selectedText && (
                          <div className="text-xs text-gray-500 italic mt-1">
                            "{note.selectedText.substring(0, 100)}{note.selectedText.length > 100 ? '...' : ''}"
                          </div>
                        )}
                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {new Date(note.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
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
  )
}

export default AnnotationPanel