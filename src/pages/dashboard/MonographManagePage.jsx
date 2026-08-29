import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight,
  Loader, Archive, BookOpen, Newspaper, Send, FileEdit,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import monographService from '../../services/monographService'
import { getWikimediaThumb } from '../../utils/filmImages'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Terbit' },
]

const StatusBadge = ({ status }) => {
  const isPublished = status === 'published'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
      ${isPublished
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
      {isPublished ? <Send className="w-3 h-3" /> : <FileEdit className="w-3 h-3" />}
      {isPublished ? 'Terbit' : 'Draft'}
    </span>
  )
}

const MonographRow = ({ m, onDelete, deleting }) => {
  const thumb = getWikimediaThumb(m.coverImageUrl, 200)
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
      <td className="px-4 pl-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-slate-800 flex-shrink-0 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-800 z-10" />
            {thumb
              ? <img src={thumb} alt={m.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Archive className="w-4 h-4 text-rose-400" /></div>}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>{m.title}</p>
            {m.subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{m.subtitle}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        <span className="flex items-center gap-1.5"><Newspaper className="w-3.5 h-3.5 opacity-50" />{m.newspaperSourceName}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{m.editionDateFormatted || m.editionDate}</td>
      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{m.totalArticles || 0} dokumen</span>
      </td>
      <td className="px-4 pr-5 py-3">
        <div className="flex items-center justify-end gap-1">
          {m.status === 'published' && (
            <a href={`/koran/monograf/${m.slug}`} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition" title="Lihat">
              <Eye className="w-4 h-4" />
            </a>
          )}
          <Link to={`/dasbor/koran/monograf/edit/${m.slug}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => onDelete(m)} disabled={deleting === m.id}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50" title="Hapus">
            {deleting === m.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

const MonographManagePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.roles?.includes('ADMIN')

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await monographService.getManageList({ page, limit: 20, q: search || undefined, status })
      const pageData = res?.data || {}
      setList(pageData.list || [])
      setTotalPages(Math.max(1, Math.ceil((pageData.totalCount || 0) / 20)))
    } catch {
      toast.error('Gagal memuat daftar monograf')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    if (!isAdmin) { navigate('/dasbor'); return }
    fetchList()
  }, [fetchList, isAdmin, navigate])

  const handleDelete = async (m) => {
    if (!window.confirm(`Hapus monograf "${m.title}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeleting(m.id)
    try {
      await monographService.deleteMonograph(m.id)
      toast.success('Monograf dihapus')
      fetchList()
    } catch {
      toast.error('Gagal menghapus monograf')
    } finally {
      setDeleting(null)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-rose-600" />Kelola Monograf
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Susun monograf dokumenter dari edisi-edisi koran arsip</p>
        </div>
        <Link to="/dasbor/koran/monograf/baru"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-sm transition shadow-sm">
          <Plus className="w-4 h-4" />Buat Monograf Baru
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari judul, sumber, atau tema..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900/60">
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => { setStatus(t.value); setPage(1) }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition
                  ${status === t.value ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader className="w-8 h-8 animate-spin text-rose-500" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada monograf</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {['Monograf', 'Sumber', 'Edisi', 'Status', 'Dokumen', 'Aksi'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 uppercase tracking-wider first:pl-5 last:pr-5 last:text-right whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {list.map(m => <MonographRow key={m.id} m={m} onDelete={handleDelete} deleting={deleting} />)}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MonographManagePage