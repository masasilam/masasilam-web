
// ============================================
// FILE 6: src/components/Reader/TextSelectionPopup.jsx
// ============================================
import { X, Highlighter, Check, Lock } from 'lucide-react'
import { useState } from 'react'

const TextSelectionPopup = ({ 
  selectedText, 
  coords, 
  isAuthenticated,
  onClose, 
  onHighlight, 
  onAddNote,
  onNavigateToLogin,
  onMouseDown,
  onTouchStart 
}) => {
  const [highlightColor, setHighlightColor] = useState('#FFEB3B')
  const [noteContent, setNoteContent] = useState('')

  const handleAddNote = () => {
    onAddNote(noteContent)
    setNoteContent('')
  }

  return (
    <div
      className="fixed z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
        maxWidth: '90vw',
        width: '320px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Teks Terpilih</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs italic max-h-20 overflow-y-auto">
          "{selectedText.substring(0, 150)}{selectedText.length > 150 ? '...' : ''}"
        </div>

        {isAuthenticated ? (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-2">Warna Highlight</label>
              <div className="flex gap-2 justify-center">
                {['#FFEB3B', '#4CAF50', '#2196F3', '#FF9800', '#F44336'].map(color => (
                  <button 
                    key={color} 
                    onClick={() => setHighlightColor(color)} 
                    className="w-8 h-8 rounded-full border-2"
                    style={{ 
                      backgroundColor: color, 
                      borderColor: highlightColor === color ? '#000' : 'transparent' 
                    }} 
                  />
                ))}
              </div>
            </div>
            <button 
              onClick={() => onHighlight(highlightColor)} 
              className="w-full py-2 bg-primary text-white rounded-lg text-sm mb-3"
            >
              <Highlighter className="w-4 h-4 inline mr-1" /> Highlight
            </button>
            <div className="pt-3 border-t">
              <textarea 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Tambahkan catatan..." 
                className="w-full p-2 border rounded text-sm mb-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                rows="2" 
              />
              <button 
                onClick={handleAddNote} 
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                <Check className="w-4 h-4 inline mr-1" /> Simpan Catatan
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Login untuk menyimpan highlight dan catatan
            </p>
            <button
              onClick={onNavigateToLogin}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextSelectionPopup