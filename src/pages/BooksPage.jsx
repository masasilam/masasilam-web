import { useState, useEffect, useCallback, memo } from 'react'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import { Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const SORTS = [
  { v: 'updateAt', l: 'Update' }, { v: 'publishedAt', l: 'Terbit' }, { v: 'title', l: 'Judul' },
  { v: 'averageRating', l: 'Rating' }, { v: 'viewCount', l: 'Views' }, { v: 'readCount', l: 'Baca' },
  { v: 'downloadCount', l: 'Download' }, { v: 'estimatedReadTime', l: 'Durasi' }, { v: 'totalWord', l: 'Kata' },
  { v: 'fileSize', l: 'Size' }, { v: 'totalPages', l: 'Hal' }
]

const Sel = memo(({ val, onChange, opts, ph }) => (
  <select value={val} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary text-sm">
    <option value="">{ph}</option>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
))

const Filt = memo(({ crit, onChange, onApply, onReset, onClose }) => (
  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold">Filter</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5" /></button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Input placeholder="Cari dalam isi..." value={crit.searchInBook} onChange={(e) => onChange('searchInBook', e.target.value)} />
      <Input placeholder="Penulis..." value={crit.authorName} onChange={(e) => onChange('authorName', e.target.value)} />
      <Input placeholder="Kontributor..." value={crit.contributor} onChange={(e) => onChange('contributor', e.target.value)} />
      <Input placeholder="Genre..." value={crit.genre} onChange={(e) => onChange('genre', e.target.value)} />
      <Sel val={crit.difficultyLevel} onChange={(e) => onChange('difficultyLevel', e.target.value)} ph="Tingkat" opts={[{v:'BEGINNER',l:'Pemula'},{v:'INTERMEDIATE',l:'Menengah'},{v:'ADVANCED',l:'Lanjutan'}]} />
      <Sel val={crit.fileFormat} onChange={(e) => onChange('fileFormat', e.target.value)} ph="Format" opts={[{v:'epub',l:'EPUB'},{v:'pdf',l:'PDF'},{v:'mobi',l:'MOBI'}]} />
      <Sel val={crit.isFeatured} onChange={(e) => onChange('isFeatured', e.target.value)} ph="Status" opts={[{v:'true',l:'Unggulan'},{v:'false',l:'Biasa'}]} />
      <Sel val={crit.languageId} onChange={(e) => onChange('languageId', e.target.value)} ph="Bahasa" opts={[{v:'1',l:'Indonesia'},{v:'2',l:'English'},{v:'3',l:'Jawa'}]} />
      <Sel val={crit.minRating} onChange={(e) => onChange('minRating', e.target.value)} ph="Rating Min" opts={[{v:'4.5',l:'4.5+ ⭐'},{v:'4.0',l:'4.0+ ⭐'},{v:'3.5',l:'3.5+ ⭐'},{v:'3.0',l:'3.0+ ⭐'}]} />
      <div className="flex gap-2"><Input type="number" placeholder="Min Ch" value={crit.minChapters} onChange={(e) => onChange('minChapters', e.target.value)} /><Input type="number" placeholder="Max Ch" value={crit.maxChapters} onChange={(e) => onChange('maxChapters', e.target.value)} /></div>
      <div className="flex gap-2"><Input type="number" placeholder="Min MB" value={crit.minFileSize} onChange={(e) => onChange('minFileSize', e.target.value)} /><Input type="number" placeholder="Max MB" value={crit.maxFileSize} onChange={(e) => onChange('maxFileSize', e.target.value)} /></div>
      <div className="flex gap-2"><Input type="number" placeholder="Tahun Dari" value={crit.publicationYearFrom} onChange={(e) => onChange('publicationYearFrom', e.target.value)} /><Input type="number" placeholder="Sampai" value={crit.publicationYearTo} onChange={(e) => onChange('publicationYearTo', e.target.value)} /></div>
      <Input type="number" placeholder="Min View" value={crit.minViewCount} onChange={(e) => onChange('minViewCount', e.target.value)} />
      <Input type="number" placeholder="Min Read" value={crit.minReadCount} onChange={(e) => onChange('minReadCount', e.target.value)} />
    </div>
    <div className="flex gap-2 mt-4">
      <Button variant="primary" onClick={onApply} fullWidth><Search className="w-4 h-4 mr-2" />Terapkan</Button>
      <Button variant="secondary" onClick={onReset} fullWidth><X className="w-4 h-4 mr-2" />Reset</Button>
    </div>
  </div>
))

const SBtn = memo(({ opt, act, ord, load, onClick }) => (
  <button onClick={onClick} disabled={load} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50 whitespace-nowrap ${act ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
    {opt.l}{act ? (ord === 'DESC' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
  </button>
))

const BooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('updateAt')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [showAdv, setShowAdv] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [crit, setCrit] = useState({ searchTitle: '', searchInBook: '', authorName: '', contributor: '', genre: '', minChapters: '', maxChapters: '', minFileSize: '', maxFileSize: '', publicationYearFrom: '', publicationYearTo: '', difficultyLevel: '', fileFormat: '', isFeatured: '', languageId: '', minRating: '', minViewCount: '', minReadCount: '' })

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit: 12, sortField, sortOrder, ...Object.fromEntries(Object.entries(crit).filter(([_, v]) => v)) }
      const res = await bookService.getBooks(params)
      setBooks(res.data?.data || [])
      setTotalPages(Math.ceil((res.data?.total || 0) / 12))
    } catch (e) {
      console.error('Error:', e)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortField, sortOrder, crit])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { document.title = crit.searchTitle ? `${crit.searchTitle} - Koleksi Buku` : 'Koleksi Buku Digital' }, [crit.searchTitle])

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
  const handleReset = useCallback(() => { setCrit({ searchTitle: '', searchInBook: '', authorName: '', contributor: '', genre: '', minChapters: '', maxChapters: '', minFileSize: '', maxFileSize: '', publicationYearFrom: '', publicationYearTo: '', difficultyLevel: '', fileFormat: '', isFeatured: '', languageId: '', minRating: '', minViewCount: '', minReadCount: '' }); setCurrentPage(1); setTimeout(fetch, 100) }, [fetch])

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Koleksi Buku Digital</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Jelajahi ribuan buku berkualitas</p>
        </header>
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <Input type="text" placeholder="Cari judul..." value={crit.searchTitle} onChange={(e) => handleChange('searchTitle', e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleApply()} />
            <Button variant="primary" onClick={handleApply}><Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" /><span className="hidden sm:inline">Cari</span></Button>
            <Button variant={showSort ? 'primary' : 'secondary'} onClick={() => setShowSort(!showSort)}><ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" /><span className="hidden sm:inline">Urutkan</span></Button>
            <Button variant={showAdv ? 'primary' : 'secondary'} onClick={() => setShowAdv(!showAdv)}><SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" /><span className="hidden sm:inline">Filter</span></Button>
          </div>
          {showSort && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Urutkan:</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  <button onClick={() => setShowSort(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SORTS.map(o => <SBtn key={o.v} opt={o} act={sortField === o.v} ord={sortOrder} load={loading} onClick={() => handleSort(o.v)} />)}
              </div>
            </div>
          )}
        </div>
        {showAdv && <Filt crit={crit} onChange={handleChange} onApply={handleApply} onReset={handleReset} onClose={() => setShowAdv(false)} />}
        <BookGrid books={books} loading={loading} />
        {totalPages > 1 && (
          <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
            <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Prev</Button>
            <span className="flex items-center px-3 text-xs text-gray-600 dark:text-gray-400">{currentPage}/{totalPages}</span>
            <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>Next</Button>
          </nav>
        )}
      </div>
    </div>
  )
}

export default BooksPage