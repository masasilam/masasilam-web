import { X, ExternalLink } from 'lucide-react'

const FootnotePopup = ({ content, onClose, onGoToFootnote, isLocal, sourceChapter }) => (
  <>
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 60 }} onClick={onClose} />

    <div
      style={{
        position: 'fixed', left: '0.5rem', right: '0.5rem', bottom: '88px', zIndex: 61,
        maxHeight: 'calc(100vh - 168px)', display: 'flex', flexDirection: 'column',
        borderRadius: '1rem', boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
      }}
      className="bg-white dark:bg-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', flexShrink: 0 }}
        className="border-b border-gray-200 dark:border-gray-700"
      >
        <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }} className="text-gray-900 dark:text-white">
          Catatan Kaki
        </h3>
        <button
          onClick={onClose}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex' }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      </div>

      {sourceChapter && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', flexShrink: 0 }} className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-blue-700 dark:text-blue-300">
            <svg style={{ width: '1rem', height: '1rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <span style={{ fontWeight: 500 }}>Dari bab:</span>
            <span>{sourceChapter}</span>
          </div>
        </div>
      )}

      <div
        style={{ padding: '1rem', overflowY: 'auto', flex: 1, fontSize: '0.875rem', lineHeight: 1.7, WebkitOverflowScrolling: 'touch' }}
        className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {isLocal && (
        <div style={{ padding: '0.875rem 1rem', flexShrink: 0 }} className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onGoToFootnote}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
            className="bg-primary hover:bg-primary/90 text-white active:scale-95"
          >
            <ExternalLink style={{ width: '1rem', height: '1rem' }} />
            Lihat Catatan Lengkap
          </button>
        </div>
      )}
    </div>
  </>
)

export default FootnotePopup