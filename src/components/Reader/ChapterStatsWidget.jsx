// ============================================
// FILE 3: src/components/Reader/ChapterStatsWidget.jsx
// ============================================
import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { chapterService } from '../../services/chapterService'

const ChapterStatsWidget = ({ bookSlug, chapterNumber }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await chapterService.getChapterStats(bookSlug, chapterNumber)
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [bookSlug, chapterNumber])

  if (loading || !stats) return null

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Statistik Bab</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.readerCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Pembaca</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completionRate?.toFixed(0) || 0}%</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Selesai</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.highlightCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Highlight</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.commentCount || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Komentar</div>
        </div>
      </div>
    </div>
  )
}

export default ChapterStatsWidget