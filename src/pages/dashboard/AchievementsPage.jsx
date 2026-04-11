// ============================================
// src/pages/dashboard/AchievementsPage.jsx
//
// PERBAIKAN:
//   - Sebelumnya: const data = await dashboardService.getAchievements()
//     lalu setAchievements(data) — yang diset adalah wrapper normalize()
//     { success, message, code, data } bukan AchievementsResponse.
//   - Sekarang: const res = await ... lalu setAchievements(res.data)
// ============================================
import { useState, useEffect } from 'react'
import { Trophy, Award, Star, Lock, CheckCircle, Book, Clock, Target } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all')

  useEffect(() => { loadAchievements() }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const res = await dashboardService.getAchievements()
      // PERBAIKAN: normalize() → { success, data }
      // data = AchievementsResponse { list, total, unlocked, categories }
      setAchievements(res?.data || null)
    } catch (err) {
      console.error('Failed to load achievements:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      reading: Book, time: Clock, milestone: Target,
      streak: Star, collection: Award
    }
    return icons[category] || Trophy
  }

  const filteredAchievements = achievements?.list?.filter(a => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked')   return !a.unlocked
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pencapaian</h1>
            <p className="text-primary-light">
              Raih pencapaian dengan terus membaca dan jelajahi dunia literasi!
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{achievements?.unlocked || 0}</div>
            <div className="text-sm text-primary-light">
              dari {achievements?.total || 0} pencapaian
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>
              {Math.round(((achievements?.unlocked || 0) / (achievements?.total || 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{
                width: `${((achievements?.unlocked || 0) / (achievements?.total || 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex gap-2">
          {[
            { id: 'all',      label: `Semua (${achievements?.total || 0})` },
            { id: 'unlocked', label: `Terbuka (${achievements?.unlocked || 0})` },
            { id: 'locked',   label: `Terkunci (${(achievements?.total || 0) - (achievements?.unlocked || 0)})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements?.map((achievement) => {
          const CategoryIcon = getCategoryIcon(achievement.category)
          const isUnlocked   = achievement.unlocked

          return (
            <div
              key={achievement.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all ${
                isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-full ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  {isUnlocked
                    ? <CategoryIcon className="w-8 h-8 text-white" />
                    : <Lock className="w-8 h-8 text-gray-500" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{achievement.title}</h3>
                    {isUnlocked && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {achievement.description}
                  </p>

                  {achievement.progress && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold">
                          {achievement.progress.current}/{achievement.progress.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isUnlocked ? 'bg-green-500' : 'bg-primary'}`}
                          style={{
                            width: `${(achievement.progress.current / achievement.progress.target) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    {isUnlocked ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {new Date(achievement.unlocked_at).toLocaleDateString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Belum terbuka</span>
                    )}
                    <span className="font-semibold text-primary">{achievement.points} poin</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAchievements?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'unlocked'
              ? 'Belum ada pencapaian yang terbuka. Terus membaca!'
              : 'Semua pencapaian sudah terbuka. Luar biasa!'}
          </p>
        </div>
      )}

      {/* Categories Summary */}
      {achievements?.categories && achievements.categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="font-bold text-xl mb-4">Kategori Pencapaian</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {achievements.categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id)
              return (
                <div key={cat.id} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.unlocked}/{cat.total}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementsPage