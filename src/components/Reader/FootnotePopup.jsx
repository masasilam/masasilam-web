// ============================================
// FILE 2: src/components/Reader/FootnotePopup.jsx
// ============================================
import { X, ExternalLink } from 'lucide-react'

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

export default FootnotePopup