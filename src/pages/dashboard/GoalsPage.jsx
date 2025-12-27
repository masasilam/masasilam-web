// src/pages/dashboard/GoalsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Target, Plus, Edit2, Trash2, CheckCircle, Book, Clock, Calendar } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

const GoalsPage = () => {
  const [goals, setGoals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    document.title = 'Target Membaca - Dashboard MasasilaM'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Tetapkan dan lacak target membaca Anda')
    }
    loadGoals()
  }, [])

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getGoals()
      setGoals(data)
    } catch (error) {
      console.error('Failed to load goals:', error)
      setError('Gagal memuat target')
    } finally {
      setLoading(false)
    }
  }, [])

  const getGoalIcon = useCallback((type) => {
    const icons = {
      books: Book,
      pages: Book,
      time: Clock,
      streak: Calendar
    }
    return icons[type] || Target
  }, [])

  const getProgressColor = useCallback((progress) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400'
    if (progress >= 75) return 'text-blue-600 dark:text-blue-400'
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }, [])

  const getProgressBarColor = useCallback((progress) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Memuat target...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center" role="alert">
        <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadGoals}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Target Membaca</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Tetapkan dan lacak target membaca Anda
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm sm:text-base">Tambah Target</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg" aria-hidden="true">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Target</p>
              <p className="text-xl sm:text-2xl font-bold">{goals?.summary?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg" aria-hidden="true">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tercapai</p>
              <p className="text-xl sm:text-2xl font-bold">{goals?.summary?.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg" aria-hidden="true">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sedang Berjalan</p>
              <p className="text-xl sm:text-2xl font-bold">{goals?.summary?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg" aria-hidden="true">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bulan Ini</p>
              <p className="text-xl sm:text-2xl font-bold">{goals?.summary?.this_month || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg sm:text-xl">Target Aktif</h2>

        {goals?.active?.map((goal) => {
          const Icon = getGoalIcon(goal.type)
          const progress = (goal.current / goal.target) * 100

          return (
            <article
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex-shrink-0" aria-hidden="true">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">{goal.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    aria-label="Edit target"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    aria-label="Hapus target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Progress: {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold ${getProgressColor(progress)}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3" role="progressbar" aria-valuenow={Math.min(progress, 100)} aria-valuemin="0" aria-valuemax="100">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getProgressBarColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Time Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Mulai: <time dateTime={goal.start_date}>{new Date(goal.start_date).toLocaleDateString('id-ID')}</time>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Target: <time dateTime={goal.end_date}>{new Date(goal.end_date).toLocaleDateString('id-ID')}</time>
                  </span>
                </div>

                {progress >= 100 ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    Tercapai!
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">
                    {goal.days_remaining} hari tersisa
                  </span>
                )}
              </div>
            </article>
          )
        })}

        {/* Empty State */}
        {(!goals?.active || goals.active.length === 0) && (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
              Belum ada target aktif
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Buat Target Pertama
            </button>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {goals?.completed && goals.completed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-lg sm:text-xl">Target Tercapai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {goals.completed.map((goal) => {
              const Icon = getGoalIcon(goal.type)

              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-green-500"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg" aria-hidden="true">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{goal.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tercapai pada <time dateTime={goal.completed_at}>{new Date(goal.completed_at).toLocaleDateString('id-ID')}</time>
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingGoal) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 id="modal-title" className="font-bold text-lg sm:text-xl mb-4">
              {editingGoal ? 'Edit Target' : 'Tambah Target Baru'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              Form untuk menambah/edit target akan diimplementasikan di sini
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingGoal(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Batal
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsPage