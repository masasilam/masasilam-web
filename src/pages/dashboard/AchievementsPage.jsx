import { useState, useEffect, useCallback } from 'react'
import { Trophy, Award, Star, Lock, CheckCircle, Book, Clock, Target, Zap, TrendingUp } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { useNavigate } from 'react-router-dom'

const AchievementsPage = () => {
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [filter, setFilter]             = useState('all')

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getAchievements()
      setAchievements(res?.data || null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAchievements() }, [loadAchievements])

  const getCategoryIcon = (category) => {
    const icons = { reading: Book, time: Clock, milestone: Target, streak: Star, collection: Award }
    return icons[category] || Trophy
  }

  const filteredAchievements = achievements?.list?.filter(a => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked')   return !a.unlocked
    return true
  })

  const unlocked   = achievements?.unlocked || 0
  const total      = achievements?.total    || 1
  const progressPct = Math.round((unlocked / total) * 100)

  const filters = [
    { id: 'all',      label: 'Semua',    count: achievements?.total    || 0 },
    { id: 'unlocked', label: 'Terbuka',  count: achievements?.unlocked || 0 },
    { id: 'locked',   label: 'Terkunci', count: (achievements?.total || 0) - (achievements?.unlocked || 0) },
  ]

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={loadAchievements}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/pencapaian' } })}
    >
      <div className="space-y-6">

        {/* ── Hero Banner ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 sm:p-8 shadow-lg">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -right-4 -bottom-16 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-white/90" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-widest">Pencapaian</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {unlocked} <span className="text-white/60 font-normal text-2xl">/ {total}</span>
              </h1>
              <p className="text-white/75 text-sm">Raih semua pencapaian dengan terus membaca!</p>
            </div>

            {/* Circular progress */}
            <div className="flex-shrink-0 self-start sm:self-auto">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="white" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPct / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{progressPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>Progress</span>
              <span>{unlocked} dari {total} terbuka</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Category Summary ──────────────────────────────────── */}
        {achievements?.categories && achievements.categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {achievements.categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id)
              const catPct = cat.total > 0 ? Math.round((cat.unlocked / cat.total) * 100) : 0
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-stone-200 dark:border-slate-700 text-center hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs font-semibold text-stone-700 dark:text-slate-200 mb-0.5">{cat.name}</p>
                  <p className="text-[11px] text-stone-400 dark:text-slate-500">{cat.unlocked}/{cat.total}</p>
                  <div className="mt-2 h-1 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${catPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Filter Tabs ───────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                filter === f.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                  : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400'
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.id ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Achievements Grid ─────────────────────────────────── */}
        {filteredAchievements?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
            <p className="text-stone-500 dark:text-slate-400 text-sm">
              {filter === 'unlocked' ? 'Belum ada pencapaian terbuka. Terus membaca!' : 'Semua pencapaian sudah terbuka. Luar biasa!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAchievements?.map((achievement) => {
              const CategoryIcon = getCategoryIcon(achievement.category)
              const isUnlocked   = achievement.unlocked
              const progress     = achievement.progress
              const progressPct  = progress ? Math.round((progress.current / progress.target) * 100) : 0

              return (
                <div
                  key={achievement.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-500/30 hover:shadow-lg hover:shadow-amber-100/60 dark:hover:shadow-amber-900/20 hover:-translate-y-0.5'
                      : 'bg-stone-50 dark:bg-slate-900/50 border-stone-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Unlocked glow */}
                  {isUnlocked && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-transparent dark:from-amber-500/5 dark:via-transparent" />
                  )}

                  <div className="relative flex items-start gap-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-stone-200 dark:bg-slate-700'
                    }`}>
                      {isUnlocked
                        ? <CategoryIcon className="w-7 h-7 text-white" />
                        : <Lock className="w-7 h-7 text-stone-400 dark:text-slate-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-stone-900 dark:text-slate-100 leading-tight">{achievement.title}</h3>
                        {isUnlocked && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-slate-400 mb-3 leading-relaxed">{achievement.description}</p>

                      {progress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-stone-500 dark:text-slate-400">Progress</span>
                            <span className="font-semibold text-stone-700 dark:text-slate-300">
                              {progress.current}/{progress.target}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isUnlocked ? 'bg-emerald-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(progressPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {isUnlocked ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {new Date(achievement.unlocked_at).toLocaleDateString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 dark:text-slate-500">Belum terbuka</span>
                        )}
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {achievement.points} poin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

export default AchievementsPage