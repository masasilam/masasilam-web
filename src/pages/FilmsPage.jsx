// ============================================
// src/pages/FilmsPage.jsx - PERFORMA OPTIMAL + URL STATE
// ============================================

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { filmService } from '../services/filmService'
import FilmGrid from '../components/Film/FilmGrid'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import SEO from '../components/Common/SEO'
import { Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft, Filter } from 'lucide-react'

const SORTS = [
  { v: 'tahunRilis', l: 'Tahun' },
  { v: 'judul', l: 'Judul' },
  { v: 'durasi', l: 'Durasi' }
]

const Filt = memo(({ crit, onChange, onApply, onReset, onClose }) => (
  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filter Film
      </h3>
      <button
        onClick={onClose}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Input
        placeholder="Genre..."
        value={crit.genre}
        onChange={(e) => onChange('genre', e.target.value)}
      />
      <Input
        placeholder="Negara..."
        value={crit.negara}
        onChange={(e) => onChange('negara', e.target.value)}
      />
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Tahun Dari"
          value={crit.yearFrom}
          onChange={(e) => onChange('yearFrom', e.target.value)}
        />
        <Input
          type="number"
          placeholder="Sampai"
          value={crit.yearTo}
          onChange={(e) => onChange('yearTo', e.target.value)}
        />
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <Button variant="primary" onClick={onApply} fullWidth>
        <Search className="w-4 h-4 mr-2" />
        Terapkan
      </Button>
      <Button variant="secondary" onClick={onReset} fullWidth>
        <X className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  </div>
))

const SBtn = memo(({ opt, act, ord, load, onClick }) => (
  <button
    onClick={onClick}
    disabled={load}
    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50 whitespace-nowrap ${
      act
        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md hover:bg-blue-700 dark:hover:bg-blue-600'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
    }`}
  >
    {opt.l}
    {act ? (
      ord === 'DESC' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowUpDown className="w-3 h-3 opacity-30" />
    )}
  </button>
))

const EMPTY_CRIT = { searchTitle: '', genre: '', negara: '', yearFrom: '', yearTo: '' }

const FilmsPage = () => {
  const navigate = useNavigate()

  // ── URL sebagai sumber kebenaran untuk page ──────────────────────────────────
  // Saat user kembali dari detail film, browser restore URL → page otomatis kembali
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1))

  const setCurrentPage = useCallback((valOrFn) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      const prevPage = Math.max(1, Number(prev.get('page') || 1))
      const newPage = typeof valOrFn === 'function' ? valOrFn(prevPage) : valOrFn
      if (newPage <= 1) {
        next.delete('page')
      } else {
        next.set('page', String(newPage))
      }
      return next
    }, { replace: false }) // false → masuk history stack, tombol Back browser berfungsi
  }, [setSearchParams])

  // ── Data state ───────────────────────────────────────────────────────────────
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFilms, setTotalFilms] = useState(0)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showAdv, setShowAdv] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [pageInput, setPageInput] = useState(currentPage)

  // ── Input sementara (tidak memicu fetch) ─────────────────────────────────────
  const [crit, setCrit] = useState(EMPTY_CRIT)
  const [appliedCrit, setAppliedCrit] = useState(EMPTY_CRIT)
  const [sortField, setSortField] = useState('tahunRilis')
  const [sortOrder, setSortOrder] = useState('DESC')

  const abortRef = useRef(null)

  // ── Satu-satunya fetch trigger ───────────────────────────────────────────────
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    const doFetch = async () => {
      try {
        setLoading(true)
        const params = {
          page: currentPage - 1,
          size: 12,
          sortField,
          sortOrder,
          ...Object.fromEntries(Object.entries(appliedCrit).filter(([, v]) => v))
        }
        const res = await filmService.getFilms(params)
        setFilms(res.data?.data || [])
        const total = res.data?.total || 0
        setTotalFilms(total)
        setTotalPages(Math.ceil(total / 12))
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error:', e)
          setFilms([])
        }
      } finally {
        setLoading(false)
      }
    }

    doFetch()
    return () => abortRef.current?.abort()
  }, [currentPage, sortField, sortOrder, appliedCrit])

  useEffect(() => { setPageInput(currentPage) }, [currentPage])

  const handleChange = useCallback((f, v) => setCrit(p => ({ ...p, [f]: v })), [])

  const handleApply = useCallback(() => {
    setAppliedCrit(prev => {
      const next = { ...EMPTY_CRIT, ...crit }
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev
      return next
    })
    setCurrentPage(1)
  }, [crit, setCurrentPage])

  const handleReset = useCallback(() => {
    setCrit(EMPTY_CRIT)
    setAppliedCrit(EMPTY_CRIT)
    setCurrentPage(1)
  }, [setCurrentPage])

  const handleSort = useCallback((f) => {
    setSortField(prev => {
      if (prev === f) {
        setSortOrder(o => o === 'DESC' ? 'ASC' : 'DESC')
        return prev
      }
      setSortOrder('DESC')
      return f
    })
    setCurrentPage(1)
  }, [setCurrentPage])

  const handlePageInputChange = (e) => setPageInput(e.target.value)

  const handlePageInputCommit = useCallback(() => {
    const val = Number(pageInput)
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val)
    } else {
      setPageInput(currentPage)
    }
  }, [pageInput, totalPages, currentPage, setCurrentPage])

  const handlePageInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur()
      handlePageInputCommit()
    }
  }, [handlePageInputCommit])

  const pageTitle = appliedCrit.searchTitle
    ? `${appliedCrit.searchTitle} - Koleksi Film`
    : `Koleksi Film Digital - Halaman ${currentPage}`

  const pageDescription = appliedCrit.searchTitle
    ? `Hasil pencarian "${appliedCrit.searchTitle}" - Temukan film yang Anda cari`
    : `Jelajahi ${totalFilms.toLocaleString('id-ID')} film klasik domain publik. Halaman ${currentPage} dari ${totalPages}.`

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={`/film${currentPage > 1 ? `?page=${currentPage}` : ''}`}
        type="website"
        keywords="film gratis, domain publik, film klasik, tonton film online, film vintage"
      />

      <div className="min-h-screen py-4 sm:py-8 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 sm:mb-6 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Kembali ke Beranda</span>
          </button>

          <header className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Koleksi Film Digital
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Jelajahi {totalFilms.toLocaleString('id-ID')} film klasik domain publik
            </p>
          </header>

          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Cari judul film..."
                value={crit.searchTitle}
                onChange={(e) => handleChange('searchTitle', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              />
              <Button variant="primary" onClick={handleApply}>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Cari</span>
              </Button>
              <Button variant={showSort ? 'primary' : 'secondary'} onClick={() => setShowSort(!showSort)}>
                <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Urutkan</span>
              </Button>
              <Button variant={showAdv ? 'primary' : 'secondary'} onClick={() => setShowAdv(!showAdv)}>
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>

            {showSort && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Urutkan:</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                    <button
                      onClick={() => setShowSort(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SORTS.map(o => (
                    <SBtn
                      key={o.v}
                      opt={o}
                      act={sortField === o.v}
                      ord={sortOrder}
                      load={loading}
                      onClick={() => handleSort(o.v)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {showAdv && (
            <Filt
              crit={crit}
              onChange={handleChange}
              onApply={handleApply}
              onReset={handleReset}
              onClose={() => setShowAdv(false)}
            />
          )}

          <FilmGrid films={films} loading={loading} />

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center items-center gap-2" aria-label="Pagination">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Prev
              </Button>

              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">Hal.</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputCommit}
                  onKeyDown={handlePageInputKeyDown}
                  disabled={loading}
                  className="w-14 px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-xs disabled:opacity-50 transition-colors"
                />
                <span>dari {totalPages}</span>
              </div>

              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </nav>
          )}
        </div>
      </div>
    </>
  )
}

export default FilmsPage