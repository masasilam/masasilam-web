import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPlus, ChevronDown, Check, Loader2, Plus, BookmarkCheck, X } from 'lucide-react'
import { readingListService } from '../../services/socialService'

const AddToListButton = ({ entityType, entityId, entityTitle = '' }) => {
  const navigate          = useNavigate()
  const isAuthenticated   = !!localStorage.getItem('token')
  const dropdownRef       = useRef(null)

  const [open,       setOpen]       = useState(false)
  const [lists,      setLists]      = useState([])
  const [loading,    setLoading]    = useState(false)
  const [adding,     setAdding]     = useState(null)   // listId sedang diproses
  const [added,      setAdded]      = useState({})     // { [listId]: true }
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle,   setNewTitle]   = useState('')
  const [creating,   setCreating]   = useState(false)
  const [toast,      setToast]      = useState(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setShowCreate(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Fetch daftar baca milik user + cek mana yang sudah mengandung entity ini
  const loadLists = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const [listsRes, containingRes] = await Promise.allSettled([
        readingListService.getMine(1, 50),
        readingListService.findContaining(entityType, entityId),
      ])

      const myLists = listsRes.status === 'fulfilled'
        ? (listsRes.value.data?.data?.list || listsRes.value.data?.data?.data || [])
        : []

      const containingIds = containingRes.status === 'fulfilled'
        ? (containingRes.value.data?.data || []).map(l => l.id)
        : []

      setLists(myLists)

      const addedMap = {}
      containingIds.forEach(id => { addedMap[id] = true })
      setAdded(addedMap)
    } catch (err) {
      console.warn('[AddToListButton] loadLists error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, entityType, entityId])

  const handleOpen = () => {
    if (!isAuthenticated) {
      navigate('/masuk')
      return
    }
    if (!open) loadLists()
    setOpen(o => !o)
    setShowCreate(false)
  }

  const handleAdd = async (list) => {
    if (added[list.id]) return  // sudah ada
    setAdding(list.id)
    try {
      await readingListService.addItem(list.id, {
        entityType,
        entityId: Number(entityId),
        note: '',
      })
      setAdded(prev => ({ ...prev, [list.id]: true }))
      showToast(`Ditambahkan ke "${list.title}"`)
    } catch (e) {
      const detail = e?.response?.data?.detail || 'Gagal menambahkan'
      if (detail.toLowerCase().includes('already') || detail.toLowerCase().includes('duplikat')) {
        setAdded(prev => ({ ...prev, [list.id]: true }))
        showToast(`Sudah ada di "${list.title}"`)
      } else {
        showToast(detail, 'error')
      }
    } finally {
      setAdding(null)
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const res = await readingListService.create({
        title:      newTitle.trim(),
        visibility: 'public',
        tags:       [],
      })
      const created = res.data?.data
      if (created) {
        setLists(prev => [created, ...prev])
        // langsung tambahkan item ke daftar baru
        await readingListService.addItem(created.id, {
          entityType,
          entityId: Number(entityId),
          note: '',
        })
        setAdded(prev => ({ ...prev, [created.id]: true }))
        showToast(`Daftar "${created.title}" dibuat & item ditambahkan`)
      }
      setNewTitle('')
      setShowCreate(false)
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Gagal membuat daftar', 'error')
    } finally {
      setCreating(false)
    }
  }

  const addedCount = Object.values(added).filter(Boolean).length

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Main button ── */}
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
                    transition-all active:scale-95 hover:scale-[1.02]
                    ${addedCount > 0
                      ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-teal-300 hover:text-teal-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-600 dark:hover:text-teal-400'
                    }`}
      >
        {addedCount > 0
          ? <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
          : <ListPlus      className="w-4 h-4 flex-shrink-0" />
        }
        <span className="hidden sm:inline">
          {addedCount > 0 ? `Di ${addedCount} Daftar` : 'Simpan ke Daftar'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl shadow-2xl border overflow-hidden
                        bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b
                          border-stone-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Daftar Baca Saya
            </span>
            <button onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List items */}
          <div className="max-h-60 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-stone-300 dark:text-slate-600" />
              </div>
            ) : lists.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-stone-400 dark:text-slate-500 mb-2">
                  Belum punya daftar baca
                </p>
              </div>
            ) : (
              lists.map(list => {
                const isAdded   = !!added[list.id]
                const isLoading = adding === list.id
                return (
                  <button
                    key={list.id}
                    onClick={() => handleAdd(list)}
                    disabled={isAdded || isLoading}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                ${isAdded
                                  ? 'cursor-default'
                                  : 'hover:bg-stone-50 dark:hover:bg-slate-800'
                                }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border
                                    ${isAdded
                                      ? 'bg-teal-100 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700'
                                      : 'bg-stone-100 border-stone-200 dark:bg-slate-800 dark:border-slate-700'
                                    }`}>
                      {isLoading
                        ? <Loader2 className="w-3 h-3 animate-spin text-teal-500" />
                        : isAdded
                          ? <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          : <Plus  className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate
                                    ${isAdded
                                      ? 'text-teal-700 dark:text-teal-300'
                                      : 'text-stone-800 dark:text-slate-200'
                                    }`}>
                        {list.title}
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-slate-500">
                        {list.itemCount || 0} item · {list.visibility === 'private' ? 'Pribadi' : 'Publik'}
                      </p>
                    </div>
                    {isAdded && (
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex-shrink-0">
                        Tersimpan
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Create new list */}
          <div className="border-t border-stone-100 dark:border-slate-800 p-3">
            {showCreate ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false) }}
                  placeholder="Nama daftar baru..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none
                             bg-stone-50 border-stone-200 text-stone-900
                             focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400
                             dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-all
                             disabled:opacity-40
                             bg-teal-500 hover:bg-teal-400 text-white">
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buat'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                           transition-all
                           text-teal-600 hover:bg-teal-50
                           dark:text-teal-400 dark:hover:bg-teal-900/20">
                <Plus className="w-3.5 h-3.5" />
                Buat daftar baru
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
                         px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium
                         transition-all animate-in slide-in-from-bottom-2
                         ${toast.type === 'error'
                           ? 'bg-red-600 text-white'
                           : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                         }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default AddToListButton