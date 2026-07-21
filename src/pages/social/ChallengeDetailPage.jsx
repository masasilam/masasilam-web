import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Target, Users, Zap, Calendar, CheckCircle,
  BookOpen, Layers, Film, Newspaper, Flag, Clock, BarChart2,
  Plus, X, Loader2, Star, Medal, Trash2
} from 'lucide-react'
import { challengeService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

// ── Record Progress Modal ─────────────────────────────────────────────────────
const RecordProgressModal = ({ challengeId, entityTypes, onClose, onRecorded }) => {
  const [entityType, setEntityType] = useState(entityTypes?.[0] || 'BOOK')
  const [entityId, setEntityId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!entityId) { toast.error('ID entitas wajib diisi'); return }
    setSaving(true)
    try {
      const res = await challengeService.recordProgress(challengeId, entityType, Number(entityId))
      onRecorded(res.data?.data)
      onClose()
      toast.success('Progres berhasil dicatat!')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Gagal mencatat progres')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Catat Progres</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tipe</label>
            <div className="flex flex-wrap gap-2">
              {(entityTypes || ['BOOK']).map(t => (
                <button key={t} onClick={() => setEntityType(t)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${entityType === t ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">ID Buku / Konten *</label>
            <input type="number" value={entityId} onChange={e => setEntityId(e.target.value)}
              placeholder="Masukkan ID..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <p className="text-xs text-gray-400">Tambahkan buku atau konten yang telah kamu selesaikan untuk tantangan ini.</p>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Catat
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const ChallengeDetailPage = () => {
  const { challengeId } = useParams()  // bisa slug ("mmm") atau numeric ID ("123")
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [abandoning, setAbandoning] = useState(false)
  const [deleting, setDeleting] = useState(false)  // ← TAMBAHAN
  const [showProgress, setShowProgress] = useState(false)

  // numericId adalah challenge.id (Long) yang aman dipakai ke semua endpoint
  const numericId = challenge?.id

  // isMine: cek via username (selalu ada) atau fallback via userId kalau backend return createdByUserId
  const isMine = user && challenge && (
    user.username === challenge.createdByUsername ||
    user.id === challenge.createdByUserId
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const isNumeric = /^\d+$/.test(challengeId)

      // Fetch detail: pakai slug endpoint kalau bukan angka
      const cRes = isNumeric
        ? await challengeService.getById(challengeId)
        : await challengeService.getBySlug(challengeId)

      const ch = cRes.data?.data
      setChallenge(ch)

      // Fetch leaderboard pakai ch.id (numeric), bukan challengeId dari params
      const lRes = await challengeService.getLeaderboard(ch.id, 1, 20)
      setLeaderboard(lRes.data?.data?.entries || [])
    } catch {
      toast.error('Tantangan tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }, [challengeId])

  useEffect(() => { load() }, [load])

  // Semua handler pakai numericId (challenge.id), bukan challengeId dari params
  // handleJoin
  const handleJoin = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    if (!numericId) return
    setJoining(true)
    try {
      await challengeService.join(numericId)
      toast.success('Bergabung ke tantangan!')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      load()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Gagal bergabung')
    } finally { setJoining(false) }
  }

  // handleAbandon
  const handleAbandon = async () => {
    if (!confirm('Keluar dari tantangan ini?')) return
    if (!numericId) return
    setAbandoning(true)
    try {
      await challengeService.abandon(numericId)
      toast.success('Keluar dari tantangan')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      load()
    } catch {
      toast.error('Gagal')
    } finally { setAbandoning(false) }
  }

  // ← TAMBAHAN: hapus tantangan (hanya owner)
  const deleteChallenge = async () => {
    if (!confirm('Hapus tantangan ini? Semua data peserta akan ikut terhapus.')) return
    setDeleting(true)
    try {
      await challengeService.delete(numericId)
      toast.success('Tantangan dihapus')
      navigate(-1)
    } catch {
      toast.error('Gagal menghapus tantangan')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/4" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  )

  if (!challenge) return <div className="text-center py-20 text-gray-400">Tantangan tidak ditemukan</div>

  const isJoined = !!challenge.myStatus
  const isCompleted = challenge.myStatus === 'completed'
  const isInProgress = challenge.myStatus === 'in_progress'
  const progress = challenge.myProgressPercent || 0
  const progressCount = challenge.myProgressCount || 0
  const now = new Date()
  const end = challenge.endDate ? new Date(challenge.endDate) : null
  const daysLeft = end ? Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24))) : null
  const isExpired = end && end < now

  // entityTypes bisa berupa array (dari backend) atau string comma-separated
  const entityTypes = Array.isArray(challenge.entityTypes)
    ? challenge.entityTypes
    : (challenge.entityTypes ? challenge.entityTypes.split(',').map(t => t.trim()).filter(Boolean) : ['BOOK'])

  const MEDAL_ICON = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">

            {/* ← TAMBAHAN: kolom kiri — tombol hapus (jika owner) + icon trophy */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {isMine && (
                <button
                  onClick={deleteChallenge}
                  disabled={deleting}
                  title="Hapus tantangan"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-400 hover:text-red-600 transition-all disabled:opacity-50">
                  {deleting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {challenge.isOfficial && (
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full font-semibold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" /> Resmi
                  </span>
                )}
                {isExpired && <span className="text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full">Berakhir</span>}
                {isCompleted && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Selesai
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{challenge.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">oleh {challenge.createdByUsername || 'Admin'}</p>
            </div>
          </div>

          {challenge.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">{challenge.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon: Target,      label: 'Target',    value: challenge.targetCount,            color: 'text-yellow-500' },
              { icon: Users,       label: 'Peserta',   value: challenge.participantCount || 0,  color: 'text-blue-500'   },
              { icon: Zap,         label: 'XP Reward', value: `${challenge.xpReward || 0} XP`, color: 'text-purple-500' },
              { icon: CheckCircle, label: 'Selesai',   value: challenge.completionCount || 0,   color: 'text-green-500'  },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Dates */}
          {(challenge.startDate || challenge.endDate) && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{challenge.startDate} → {challenge.endDate}</span>
              {daysLeft !== null && !isExpired && (
                <span className="text-orange-500 font-medium">({daysLeft} hari lagi)</span>
              )}
            </div>
          )}

          {/* My Progress */}
          {isInProgress && (
            <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Progres Saya</span>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{progressCount} / {challenge.targetCount}</span>
              </div>
              <div className="w-full h-3 bg-yellow-200 dark:bg-yellow-900/40 rounded-full overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1.5">{Math.round(progress)}% selesai</p>
            </div>
          )}

          {/* My Completed Items */}
          {challenge.myItems && challenge.myItems.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Yang Sudah Dibaca</h3>
              <div className="space-y-1.5">
                {challenge.myItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span>{item.entityType} #{item.entityId}{item.entityTitle ? ` — ${item.entityTitle}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {!isJoined ? (
              <button onClick={handleJoin} disabled={joining || isExpired}
                className="flex-1 min-w-32 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl transition-all disabled:opacity-50">
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                {isExpired ? 'Tantangan Berakhir' : 'Ikut Tantangan'}
              </button>
            ) : (
              <>
                {isInProgress && (
                  <button onClick={() => setShowProgress(true)}
                    className="flex-1 min-w-32 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl transition-all">
                    <Plus className="w-4 h-4" /> Catat Progres
                  </button>
                )}
                {isInProgress && (
                  <button onClick={handleAbandon} disabled={abandoning}
                    className="px-4 py-2.5 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    Keluar
                  </button>
                )}
                {isCompleted && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-semibold rounded-xl">
                    <Trophy className="w-4 h-4" /> Tantangan Selesai!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Badge info */}
      {challenge.badgeName && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800 mb-4">
          <Medal className="w-8 h-8 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lencana Hadiah</p>
            <p className="font-semibold text-gray-900 dark:text-white">{challenge.badgeName}</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-800">
          <BarChart2 className="w-4 h-4 text-yellow-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Leaderboard</h2>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada peserta di leaderboard</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {leaderboard.map((e, i) => (
              <div key={e.userId || i} className={`flex items-center gap-3 px-4 py-3 ${i < 3 ? 'bg-yellow-50/40 dark:bg-yellow-900/5' : ''}`}>
                <span className="w-6 text-center text-sm">
                  {MEDAL_ICON[i] || <span className="text-xs text-gray-400 font-mono">{i + 1}</span>}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(e.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/sosial/profil/${e.username}`}
                    className="font-medium text-sm text-gray-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                    {e.displayName || e.username}
                  </Link>
                  {e.completedAt && (
                    <p className="text-[10px] text-green-500 flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Selesai
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{e.progressCount}</span>
                  <span className="text-xs text-gray-400"> / {challenge.targetCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal — pakai numericId (challenge.id), bukan challengeId dari params */}
      {showProgress && (
        <RecordProgressModal
          challengeId={numericId}
          entityTypes={entityTypes}
          onClose={() => setShowProgress(false)}
          onRecorded={(updated) => { setChallenge(updated); setShowProgress(false); load() }}
        />
      )}
    </div>
  )
}

export default ChallengeDetailPage