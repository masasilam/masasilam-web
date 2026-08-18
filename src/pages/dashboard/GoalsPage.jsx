import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Plus, Edit2, Trash2, CheckCircle, Book, Clock, Calendar, X } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'

const GOAL_TYPES = [
  { value: 'books',   label: 'Jumlah Buku',   unit: 'buku',  icon: Book,     placeholder: 'Contoh: 5'   },
  { value: 'minutes', label: 'Menit Membaca',  unit: 'menit', icon: Clock,    placeholder: 'Contoh: 300' },
  { value: 'streak',  label: 'Streak Harian',  unit: 'hari',  icon: Calendar, placeholder: 'Contoh: 7'   },
]

const TODAY = new Date().toISOString().split('T')[0]

const defaultForm = {
  title: '', description: '', goalType: 'books', targetValue: '',
  unit: 'buku', startDate: TODAY, endDate: '',
}

// ── Goal Form Modal ────────────────────────────────────────────────────────
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
    } catch {
      setErrors({ submit: 'Gagal menyimpan target. Coba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  const selectedType = GOAL_TYPES.find(t => t.value === form.goalType)

  const inputCls = (hasError) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition ${
      hasError ? 'border-red-400 dark:border-red-500' : 'border-stone-200 dark:border-slate-700'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">

        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-stone-900 dark:text-slate-100">
            {editingGoal ? 'Edit Target' : 'Tambah Target Baru'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
              Judul Target <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })) }}
              placeholder="Contoh: Baca 5 buku bulan ini"
              className={inputCls(errors.title)} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
              Tipe Target <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPES.map(t => {
                const Icon   = t.icon
                const active = form.goalType === t.value
                return (
                  <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                        : 'bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600'
                    }`}>
                    <Icon className="w-4 h-4" />
                    <span className="leading-tight text-center">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target value */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
              Target ({selectedType?.unit}) <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" value={form.targetValue}
              onChange={e => { setForm(f => ({ ...f, targetValue: e.target.value })); setErrors(v => ({ ...v, targetValue: '' })) }}
              placeholder={selectedType?.placeholder}
              className={inputCls(errors.targetValue)} />
            {errors.targetValue && <p className="text-xs text-red-500 mt-1">{errors.targetValue}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">Mulai <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate}
                onChange={e => { setForm(f => ({ ...f, startDate: e.target.value })); setErrors(v => ({ ...v, startDate: '' })) }}
                className={inputCls(errors.startDate)} />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">Selesai <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} min={form.startDate || TODAY}
                onChange={e => { setForm(f => ({ ...f, endDate: e.target.value })); setErrors(v => ({ ...v, endDate: '' })) }}
                className={inputCls(errors.endDate)} />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
              Deskripsi <span className="text-xs font-normal text-stone-400">(opsional)</span>
            </label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tambahkan catatan atau motivasi..."
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition resize-none" />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">{errors.submit}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900">
          <button onClick={onClose} disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />Menyimpan...</>
              : editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────
const DeleteConfirmModal = ({ goal, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    try { setDeleting(true); await dashboardService.deleteGoal(goal.id); onDeleted() }
    catch { /* silent */ }
    finally { setDeleting(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 dark:text-slate-100 mb-1">Hapus Target?</h2>
            <p className="text-sm text-stone-500 dark:text-slate-400">"{goal.title}" akan dihapus secara permanen.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40">
            Batal
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghapus...</> : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Goal Card ─────────────────────────────────────────────────────────────
const GoalCard = ({ goal, onEdit, onDelete }) => {
  const progress     = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
  const typeInfo     = GOAL_TYPES.find(t => t.value === goal.type)
  const Icon         = typeInfo?.icon || Target
  const clampedPct   = Math.min(Math.round(progress), 100)
  const isCompleted  = clampedPct >= 100

  const barColor = isCompleted ? 'bg-emerald-500' : progress >= 75 ? 'bg-amber-500' : progress >= 50 ? 'bg-amber-400' : 'bg-amber-300'
  const pctColor = isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'

  return (
    <article className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md ${
      isCompleted
        ? 'border-emerald-200 dark:border-emerald-500/30'
        : 'border-stone-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/50'
    }`}>
      {isCompleted && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent dark:from-emerald-500/5" />
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              isCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-br from-amber-400 to-amber-600'
            }`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-stone-900 dark:text-slate-100 truncate">{goal.title}</h3>
                {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </div>
              {goal.description && <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-1">{goal.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => onEdit(goal)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
              aria-label="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(goal)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              aria-label="Hapus">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-stone-500 dark:text-slate-400">{goal.current} / {goal.target} {goal.unit}</span>
            <span className={`text-xs font-bold ${pctColor}`}>{clampedPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden"
            role="progressbar" aria-valuenow={clampedPct} aria-valuemin="0" aria-valuemax="100">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${clampedPct}%` }} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-slate-500">
          <span>{String(goal.start_date).split('T')[0]} → {String(goal.end_date).split('T')[0]}</span>
          {isCompleted
            ? <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-3 h-3" />Tercapai!</span>
            : <span className="font-medium">{goal.days_remaining} hari lagi</span>}
        </div>
      </div>
    </article>
  )
}

// ── Completed Goal Row ─────────────────────────────────────────────────────
const CompletedGoalRow = ({ goal }) => {
  const typeInfo = GOAL_TYPES.find(t => t.value === goal.type)
  const Icon     = typeInfo?.icon || Target
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-500/25">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-stone-900 dark:text-slate-100 truncate">{goal.title}</h3>
        <p className="text-xs text-stone-400 dark:text-slate-500">{goal.current} / {goal.target} {goal.unit}</p>
      </div>
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
        <CheckCircle className="w-4 h-4" />
        {goal.completed_at && (
          <span className="text-xs hidden sm:inline">{String(goal.completed_at).split('T')[0]}</span>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
const GoalsPage = () => {
  const navigate    = useNavigate()
  const [goals,        setGoals]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal,  setEditingGoal]  = useState(null)
  const [deletingGoal, setDeletingGoal] = useState(null)

  useEffect(() => { document.title = 'Target Membaca - Dashboard' }, [])

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await dashboardService.getGoals()
      setGoals(data?.data ?? null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  const handleSaved   = () => { setShowAddModal(false); setEditingGoal(null); loadGoals() }
  const handleDeleted = () => { setDeletingGoal(null); loadGoals() }

  const summaryItems = [
    { label: 'Total Target',    value: goals?.summary?.total     || 0, icon: Target,      color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10'     },
    { label: 'Tercapai',        value: goals?.summary?.completed || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-500/10'},
    { label: 'Aktif',           value: goals?.summary?.active    || 0, icon: Clock,       color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10'   },
    { label: 'Bulan Ini',       value: goals?.summary?.thisMonth || 0, icon: Calendar,    color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ]

  return (
    <DashboardShell
      loading={loading} error={error} onRetry={loadGoals}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/target' } })}
    >
      <div className="space-y-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-1">Target Membaca</h1>
            <p className="text-sm text-stone-500 dark:text-slate-400">Tetapkan dan lacak target membaca Anda</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-sm font-bold rounded-xl transition-all self-start sm:self-auto shadow-sm shadow-amber-200 dark:shadow-amber-900/30"
          >
            <Plus className="w-4 h-4" /> Tambah Target
          </button>
        </div>

        {/* ── Summary Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryItems.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-slate-100">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Active Goals ─────────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-lg text-stone-900 dark:text-slate-100 mb-3">Target Aktif</h2>
          {goals?.active && goals.active.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.active.map(goal => (
                <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={setDeletingGoal} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-stone-300 dark:text-slate-600" />
              </div>
              <p className="text-stone-500 dark:text-slate-400 text-sm mb-4">Belum ada target aktif</p>
              <button onClick={() => setShowAddModal(true)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl transition-all">
                Buat Target Pertama
              </button>
            </div>
          )}
        </div>

        {/* ── Completed Goals ───────────────────────────────────── */}
        {goals?.completed && goals.completed.length > 0 && (
          <div>
            <h2 className="font-bold text-lg text-stone-900 dark:text-slate-100 mb-3">Target Tercapai 🎉</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.completed.map(goal => <CompletedGoalRow key={goal.id} goal={goal} />)}
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
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
    </DashboardShell>
  )
}

export default GoalsPage