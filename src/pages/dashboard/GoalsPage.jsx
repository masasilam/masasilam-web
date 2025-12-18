// src/pages/dashboard/GoalsPage.jsx
import { useState, useEffect } from 'react'
import { Target, Plus, Edit2, Trash2, CheckCircle, Book, Clock, Calendar } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

const GoalsPage = () => {
  const [goals, setGoals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getGoals()
      setGoals(data)
    } catch (error) {
      console.error('Failed to load goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGoalIcon = (type) => {
    const icons = {
      books: Book,
      pages: Book,
      time: Clock,
      streak: Calendar
    }
    return icons[type] || Target
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400'
    if (progress >= 75) return 'text-blue-600 dark:text-blue-400'
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getProgressBarColor = (progress) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Target Membaca</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tetapkan dan lacak target membaca Anda
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Target
          </button>
        </div>
      </div>

      {/* Active Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Target</p>
              <p className="text-2xl font-bold">{goals?.summary?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tercapai</p>
              <p className="text-2xl font-bold">{goals?.summary?.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sedang Berjalan</p>
              <p className="text-2xl font-bold">{goals?.summary?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bulan Ini</p>
              <p className="text-2xl font-bold">{goals?.summary?.this_month || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="font-bold text-xl">Target Aktif</h2>
        
        {goals?.active?.map((goal) => {
          const Icon = getGoalIcon(goal.type)
          const progress = (goal.current / goal.target) * 100

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Progress: {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className={`text-sm font-semibold ${getProgressColor(progress)}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getProgressBarColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Time Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Mulai: {new Date(goal.start_date).toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Target: {new Date(goal.end_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                
                {progress >= 100 ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Tercapai!
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">
                    {goal.days_remaining} hari tersisa
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {goals?.active?.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Belum ada target aktif
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Buat Target Pertama
            </button>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {goals?.completed && goals.completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-xl">Target Tercapai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.completed.map((goal) => {
              const Icon = getGoalIcon(goal.type)
              
              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-green-500"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tercapai pada {new Date(goal.completed_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal (simplified - would need full implementation) */}
      {(showAddModal || editingGoal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="font-bold text-xl mb-4">
              {editingGoal ? 'Edit Target' : 'Tambah Target Baru'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Form untuk menambah/edit target akan diimplementasikan di sini
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingGoal(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
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