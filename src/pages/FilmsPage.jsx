// ============================================
// src/pages/FilmsPage.jsx - WARNA SEMPURNA SEPERTI BooksPage
// ============================================

import { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
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

const Sel = memo(({ val, onChange, opts, ph }) => (
  <select
    value={val}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm transition-colors"
  >
    <option value="">{ph}</option>
    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
))

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

const FilmsPage = () => {
  const navigate = useNavigate()
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFilms, setTotalFilms] = useState(0)
  const [sortField, setSortField] = useState('tahunRilis')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [showAdv, setShowAdv] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [crit, setCrit] = useState({
    searchTitle: '',
    genre: '',
    negara: '',
    yearFrom: '',
    yearTo: ''
  })

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage - 1,
        size: 12,
        sortField,
        sortOrder,
        ...Object.fromEntries(Object.entries(crit).filter(([_, v]) => v))
      }
      const res = await filmService.getFilms(params)
      setFilms(res.data?.data || [])
      const total = res.data?.total || 0
      setTotalFilms(total)
      setTotalPages(Math.ceil(total / 12))
    } catch (e) {
      console.error('Error:', e)
      setFilms([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortField, sortOrder, crit])

  useEffect(() => { fetch() }, [fetch])

  const handleSort = useCallback((f) => {
    if (sortField === f) {
      setSortOrder(o => o === 'DESC' ? 'ASC' : 'DESC')
    } else {
      setSortField(f)
      setSortOrder('DESC')
    }
    setCurrentPage(1)
  }, [sortField])

  const handleChange = useCallback((f, v) => setCrit(p => ({ ...p, [f]: v })), [])
  const handleApply = useCallback(() => { setCurrentPage(1); fetch() }, [fetch])
  const handleReset = useCallback(() => {
    setCrit({ searchTitle: '', genre: '', negara: '', yearFrom: '', yearTo: '' })
    setCurrentPage(1)
    setTimeout(fetch, 100)
  }, [fetch])

  const pageTitle = crit.searchTitle
    ? `${crit.searchTitle} - Koleksi Film`
    : `Koleksi Film Digital - Halaman ${currentPage}`

  const pageDescription = crit.searchTitle
    ? `Hasil pencarian "${crit.searchTitle}" - Temukan film yang Anda cari`
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
                      aria-label="Close"
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
            <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Prev
              </Button>
              <span className="flex items-center px-3 text-xs text-gray-600 dark:text-gray-400">
                {currentPage}/{totalPages}
              </span>
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