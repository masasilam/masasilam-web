// src/pages/dashboard/GoalsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Plus, Edit2, Trash2, CheckCircle, Book, Clock, Calendar, X } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'

const GOAL_TYPES = [
  { value: 'books',   label: 'Jumlah Buku',  unit: 'buku',  icon: Book,     placeholder: 'Contoh: 5'   },
  { value: 'minutes', label: 'Menit Membaca', unit: 'menit', icon: Clock,    placeholder: 'Contoh: 300' },
  { value: 'streak',  label: 'Streak Harian', unit: 'hari',  icon: Calendar, placeholder: 'Contoh: 7'   },
]

const TODAY = new Date().toISOString().split('T')[0]

const defaultForm = {
  title: '', description: '', goalType: 'books', targetValue: '',
  unit: 'buku', startDate: TODAY, endDate: '',
}

const GoalFormModal = ({ editingGoal, onClose, onSaved }) => {
  const [form,   setForm]   = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingGoal) {
      setForm({
        title:       editingGoal.title       || '',
        description: editingGoal.description || '',
        goalType:    editingGoal.type        || 'books',
        targetValue: String(editingGoal.target || ''),
        unit:        editingGoal.unit        || 'buku',
        startDate:   editingGoal.start_date  ? String(editingGoal.start_date).split('T')[0] : TODAY,
        endDate:     editingGoal.end_date    ? String(editingGoal.end_date).split('T')[0]   : '',
      })
    } else {
      setForm(defaultForm)
    }
  }, [editingGoal])

  const handleTypeChange = (type) => {
    const found = GOAL_TYPES.find(t => t.value === type)
    setForm(f => ({ ...f, goalType: type, unit: found?.unit || 'buku' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Judul wajib diisi'
    if (!form.targetValue || isNaN(Number(form.targetValue)) || Number(form.targetValue) <= 0)
      e.targetValue = 'Target harus angka positif'
    if (!form.startDate) e.startDate = 'Tanggal mulai wajib diisi'
    if (!form.endDate)   e.endDate   = 'Tanggal selesai wajib diisi'
    if (form.startDate && form.endDate && form.endDate <= form.startDate)
      e.endDate = 'Tanggal selesai harus setelah tanggal mulai'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    try {
      setSaving(true)
      const payload = {
        title: form.title.trim(), description: form.description.trim() || null,
        goalType: form.goalType, targetValue: Number(form.targetValue),
        unit: form.unit, startDate: form.startDate, endDate: form.endDate,
      }
      if (editingGoal) await dashboardService.updateGoal(editingGoal.id, payload)
      else             await dashboardService.createGoal(payload)
      onSaved()
    } catch (err) {
      console.error('Save goal error:', err)
      setErrors({ submit: 'Gagal menyimpan target. Coba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  const selectedType = GOAL_TYPES.find(t => t.value === form.goalType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {editingGoal ? 'Edit Target' : 'Tambah Target Baru'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Target <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })) }}
              placeholder="Contoh: Baca 5 buku bulan ini"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.title ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipe Target <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPES.map(t => {
                const Icon   = t.icon
                const active = form.goalType === t.value
                return (
                  <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                      active ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                    }`}>
                    <Icon className="w-4 h-4" />{t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target ({selectedType?.unit}) <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" value={form.targetValue}
              onChange={e => { setForm(f => ({ ...f, targetValue: e.target.value })); setErrors(v => ({ ...v, targetValue: '' })) }}
              placeholder={selectedType?.placeholder}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.targetValue ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
            {errors.targetValue && <p className="text-xs text-red-500 mt-1">{errors.targetValue}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mulai <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate}
                onChange={e => { setForm(f => ({ ...f, startDate: e.target.value })); setErrors(v => ({ ...v, startDate: '' })) }}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.startDate ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selesai <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} min={form.startDate || TODAY}
                onChange={e => { setForm(f => ({ ...f, endDate: e.target.value })); setErrors(v => ({ ...v, endDate: '' })) }}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.endDate ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi <span className="text-xs text-gray-400">(opsional)</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tambahkan catatan atau motivasi..." rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition resize-none" />
          </div>
          {errors.submit && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{errors.submit}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-40">
              Batal
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : (editingGoal ? 'Simpan Perubahan' : 'Buat Target')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DeleteConfirmModal = ({ goal, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    try { setDeleting(true); await dashboardService.deleteGoal(goal.id); onDeleted() }
    catch (err) { console.error('Delete goal error:', err) }
    finally { setDeleting(false) }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Hapus Target?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">"{goal.title}" akan dihapus permanen.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-40">
            Batal
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menghapus...</> : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const progress     = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
  const typeInfo     = GOAL_TYPES.find(t => t.value === goal.type)
  const Icon         = typeInfo?.icon || Target
  const progressColor =
    progress >= 100 ? 'text-green-600 dark:text-green-400' :
    progress >= 75  ? 'text-blue-600 dark:text-blue-400'   :
    progress >= 50  ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
  const barColor =
    progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-primary'

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate text-gray-900 dark:text-gray-100">{goal.title}</h3>
            {goal.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{goal.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(goal)} className="p-2 text-gray-500 hover:text-primary transition-colors rounded" aria-label="Edit"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(goal)} className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{goal.current} / {goal.target} {goal.unit}</span>
          <span className={`text-xs font-bold ${progressColor}`}>{Math.min(Math.round(progress), 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={Math.min(progress, 100)} aria-valuemin="0" aria-valuemax="100">
          <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex gap-3">
          <span>{String(goal.start_date).split('T')[0]}</span>
          <span>→</span>
          <span>{String(goal.end_date).split('T')[0]}</span>
        </div>
        {progress >= 100
          ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" />Tercapai!</span>
          : <span>{goal.days_remaining} hari lagi</span>}
      </div>
    </article>
  )
}

const GoalsPage = () => {
  const navigate   = useNavigate()
  const [goals,        setGoals]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal,  setEditingGoal]  = useState(null)
  const [deletingGoal, setDeletingGoal] = useState(null)

  useEffect(() => {
    document.title = 'Target Membaca - Dashboard MasasilaM'
  }, [])

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await dashboardService.getGoals()
      setGoals(data?.data ?? null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
      console.error('Failed to load goals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  const handleSaved   = () => { setShowAddModal(false); setEditingGoal(null); loadGoals() }
  const handleDeleted = () => { setDeletingGoal(null); loadGoals() }

  const summaryItems = [
    { label: 'Total Target',    value: goals?.summary?.total     || 0, icon: Target,      bg: 'bg-blue-100 dark:bg-blue-900',    color: 'text-blue-600 dark:text-blue-400'   },
    { label: 'Tercapai',        value: goals?.summary?.completed || 0, icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900',  color: 'text-green-600 dark:text-green-400' },
    { label: 'Sedang Berjalan', value: goals?.summary?.active    || 0, icon: Clock,       bg: 'bg-yellow-100 dark:bg-yellow-900',color: 'text-yellow-600 dark:text-yellow-400'},
    { label: 'Bulan Ini',       value: goals?.summary?.thisMonth || 0, icon: Calendar,    bg: 'bg-purple-100 dark:bg-purple-900',color: 'text-purple-600 dark:text-purple-400', colSpan: true },
  ]

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={loadGoals}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/target' } })}
    >
      <div className="space-y-4 sm:space-y-6">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Target Membaca</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tetapkan dan lacak target membaca Anda</p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-base">Tambah Target</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {summaryItems.map(({ label, value, icon: Icon, bg, color, colSpan }) => (
            <div key={label} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 ${colSpan ? 'col-span-2 lg:col-span-1' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-3 ${bg} rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">Target Aktif</h2>
          {goals?.active && goals.active.length > 0 ? (
            goals.active.map(goal => (
              <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={setDeletingGoal} />
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Belum ada target aktif</p>
              <button onClick={() => setShowAddModal(true)}
                className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors">
                Buat Target Pertama
              </button>
            </div>
          )}
        </div>

        {goals?.completed && goals.completed.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">Target Tercapai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.completed.map(goal => {
                const typeInfo = GOAL_TYPES.find(t => t.value === goal.type)
                const Icon     = typeInfo?.icon || Target
                return (
                  <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-2 border-green-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{goal.title}</h3>
                        <p className="text-xs text-gray-500">{goal.current} / {goal.target} {goal.unit}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                    {goal.completed_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Tercapai: {String(goal.completed_at).split('T')[0]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {(showAddModal || editingGoal) && (
          <GoalFormModal
            editingGoal={editingGoal}
            onClose={() => { setShowAddModal(false); setEditingGoal(null) }}
            onSaved={handleSaved}
          />
        )}
        {deletingGoal && (
          <DeleteConfirmModal goal={deletingGoal} onClose={() => setDeletingGoal(null)} onDeleted={handleDeleted} />
        )}
      </div>
    </DashboardShell>
  )
}

export default GoalsPage