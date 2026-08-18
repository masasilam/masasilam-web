import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users2, RefreshCw, BookOpen, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { twinService } from '../../services/socialService'
import toast from 'react-hot-toast'

const TwinCard = ({ twin }) => {
  const pct = Math.round((twin.similarityScore || 0) * 100)
  const segments = 10
  const filled = Math.round((pct / 100) * segments)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/sosial/profil/${twin.username}`}>
          {twin.profilePictureUrl ? (
            <img src={twin.profilePictureUrl} alt={twin.username}
              className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {(twin.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/sosial/profil/${twin.username}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            {twin.displayName || twin.username}
          </Link>
          <p className="text-xs text-gray-400">@{twin.username}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pct}%</div>
          <div className="text-[10px] text-gray-400">kemiripan</div>
        </div>
      </div>

      {/* Similarity bar */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < filled ? 'bg-purple-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          {twin.commonCount || 0} bacaan sama
        </span>
        <Link to={`/sosial/profil/${twin.username}`}
          className="text-purple-600 dark:text-purple-400 hover:underline">
          Lihat profil →
        </Link>
      </div>
    </div>
  )
}

const ReadingTwinsPage = () => {
  const [twins, setTwins] = useState([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await twinService.getMine(1, 20)
        setTwins(res.data?.data || [])
      } catch { toast.error('Gagal memuat reading twin') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await twinService.recalculate()
      toast.success('Kalkulasi twin dimulai. Hasilnya akan muncul beberapa menit kemudian.')
      setTimeout(async () => {
        const res = await twinService.getMine(1, 20)
        setTwins(res.data?.data || [])
        setRecalculating(false)
      }, 5000)
    } catch { toast.error('Gagal memulai kalkulasi'); setRecalculating(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-purple-500" /> Reading Twin
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pengguna dengan selera baca paling mirip denganmu</p>
        </div>
        <button onClick={handleRecalculate} disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm font-medium rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50">
          {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Perbarui
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-200 dark:border-purple-800 mb-6">
        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
          Reading Twin dihitung berdasarkan kesamaan buku, zine, dan film yang pernah kamu baca dengan pengguna lain. Semakin banyak konten yang sama, semakin tinggi persentase kemiripannya.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : twins.length === 0 ? (
        <div className="text-center py-16">
          <Users2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada reading twin</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Baca lebih banyak konten untuk menemukan pengguna dengan selera serupa</p>
          <button onClick={handleRecalculate} disabled={recalculating}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto disabled:opacity-50">
            {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Hitung Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {twins.map((twin, i) => <TwinCard key={twin.userId || i} twin={twin} />)}
        </div>
      )}
    </div>
  )
}

export default ReadingTwinsPage