// ============================================
// FILE 5: src/components/Reader/SwipeIndicator.jsx
// ============================================
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SwipeIndicator = ({ direction }) => {
  if (!direction) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
      <div className={`bg-black/50 text-white px-6 py-4 rounded-full flex items-center gap-3 animate-in fade-in zoom-in duration-200 ${
        direction === 'left' ? 'slide-in-from-right-10' : 'slide-in-from-left-10'
      }`}>
        {direction === 'right' ? (
          <>
            <ChevronLeft className="w-8 h-8" />
            <span className="text-lg font-semibold">Bab Sebelumnya</span>
          </>
        ) : (
          <>
            <span className="text-lg font-semibold">Bab Selanjutnya</span>
            <ChevronRight className="w-8 h-8" />
          </>
        )}
      </div>
    </div>
  )
}

export default SwipeIndicator