import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, X, ChevronUp, ChevronDown,
  Search, CheckCircle, AlertCircle, BookOpen, FileText, Hash, Users,
  MapPin, Building2, Archive, Send, RotateCcw, Quote, Languages,
  ExternalLink, ArrowRightLeft, HelpCircle, List, ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import monographService from '../../services/monographService'
import api from '../../services/api'
import toast from 'react-hot-toast'

let uidCounter = 0
const genId = () => `l${++uidCounter}`

const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none border bg-white text-slate-800 placeholder-slate-400 border-slate-200 focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder-slate-500 dark:border-slate-600/80 dark:focus:ring-rose-500/30 dark:focus:border-rose-500/60 disabled:opacity-50`
const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400`

const BUCKET_META = {
  counterpoint: { key: 'counterpoints', label: 'Counterpoint', hint: 'Dokumen yang memberi kontra-narasi terhadap alur utama.' },
  interlude: { key: 'interludes', label: 'Interlude', hint: 'Jeda naratif — sastra, hiburan, atau selingan di luar isu utama.' },
  peripheral: { key: 'peripheralDocuments', label: 'Dokumen Periferal', hint: 'Dokumen pendukung yang relevan namun bukan inti narasi.' },
  appendix: { key: 'appendices', label: 'Lampiran', hint: 'Dokumen referensi tambahan di luar alur dokumenter utama.' },
  carry_forward: { key: 'carryForwardPool', label: 'Carry-Forward Pool', hint: 'Utas kesinambungan yang belum tuntas, dilacak untuk edisi berikutnya.' },
  standalone: { key: 'standaloneRegister', label: 'Standalone Register', hint: 'Dokumen non-naratif yang berdiri sendiri.' },
  unresolved: { key: 'unresolvedRegister', label: 'Unresolved Register', hint: 'Perkara atau isu yang masih menggantung pada edisi ini.' },
}
const ROLE_OPTIONS = [{ value: 'main_arc', label: 'Alur Utama (Bab)' }, ...Object.entries(BUCKET_META).map(([value, m]) => ({ value, label: m.label }))]
const BUCKET_ARRAY_KEYS = Object.values(BUCKET_META).map(m => m.key)
const TEXT_STATUS_OPTIONS = [
  { value: 'complete', label: 'Lengkap' }, { value: 'serial', label: 'Bersambung' },
  { value: 'fragment', label: 'Fragmen' }, { value: 'uncertain', label: 'Tidak Pasti' },
]

const emptyMeta = () => ({
  id: null, slug: null, status: 'draft', sourceName: '', sourceSlug: '',
  editionDate: '', editionDateTo: '', title: '', subtitle: '',
  editorialNote: '', centralQuestion: '', colophon: '', methodNote: '',
  coverImageUrl: '', citationFormatTemplate: '',
})
const emptyStructure = () => ({
  chapters: [], counterpoints: [], interludes: [], peripheralDocuments: [], appendices: [],
  carryForwardPool: [], standaloneRegister: [], unresolvedRegister: [],
  criticalNotes: [], glossary: [], nameIndex: [], placeIndex: [], orgIndex: [],
})

const entryFromResponse = (e) => ({
  articleId: e.articleId, title: e.title, subtitle: e.subtitle, pageNumber: e.pageNumber,
  wordCount: e.wordCount, sourceName: e.sourceName, articleSlug: e.articleSlug,
  textStatus: e.textStatus || 'complete', positionLabel: e.positionLabel || '',
  columnInfo: e.columnInfo || '', editorialNote: e.editorialNote || '',
})
const entryFromCandidate = (c, sourceName) => ({
  articleId: c.articleId, title: c.title, subtitle: c.subtitle, pageNumber: c.pageNumber,
  wordCount: c.wordCount, sourceName, articleSlug: c.slug,
  textStatus: 'complete', positionLabel: c.pageNumber ? `Hal. ${c.pageNumber}` : '', columnInfo: '', editorialNote: '',
})

const metaFromDetail = (d) => ({
  id: d.id, slug: d.slug, status: d.status, sourceName: d.newspaperSourceName, sourceSlug: d.newspaperSourceSlug,
  editionDate: d.editionDate, editionDateTo: '', title: d.title || '', subtitle: d.subtitle || '',
  editorialNote: d.editorialNote || '', centralQuestion: d.centralQuestion || '',
  colophon: d.colophon || '', methodNote: d.methodNote || '',
  coverImageUrl: d.coverImageUrl || '', citationFormatTemplate: d.citationFormatTemplate || '',
})
const structureFromDetail = (d) => ({
  chapters: (d.chapters || []).map(c => ({ localId: genId(), title: c.title || '', narrativeSummary: c.narrativeSummary || '', entries: (c.entries || []).map(entryFromResponse) })),
  counterpoints: (d.counterpoints || []).map(entryFromResponse),
  interludes: (d.interludes || []).map(entryFromResponse),
  peripheralDocuments: (d.peripheralDocuments || []).map(entryFromResponse),
  appendices: (d.appendices || []).map(entryFromResponse),
  carryForwardPool: (d.carryForwardPool || []).map(entryFromResponse),
  standaloneRegister: (d.standaloneRegister || []).map(entryFromResponse),
  unresolvedRegister: (d.unresolvedRegister || []).map(entryFromResponse),
  criticalNotes: (d.criticalNotes || []).map(n => ({ number: n.number, noteText: n.noteText, relatedArticleId: n.relatedArticleId })),
  glossary: (d.glossary || []).map(g => ({ term: g.term, definition: g.definition })),
  nameIndex: (d.nameIndex || []).map(n => ({ label: n.label, articleIds: (n.references || []).map(r => r.articleId) })),
  placeIndex: (d.placeIndex || []).map(n => ({ label: n.label, articleIds: (n.references || []).map(r => r.articleId) })),
  orgIndex: (d.orgIndex || []).map(n => ({ label: n.label, articleIds: (n.references || []).map(r => r.articleId) })),
})

const TABS = [
  { key: 'naskah', label: 'Naskah', icon: FileText },
  { key: 'kandidat', label: 'Kandidat', icon: Search },
  { key: 'struktur', label: 'Struktur', icon: List },
  { key: 'terbitkan', label: 'Terbitkan', icon: Send },
]

const RoleTag = ({ role }) => {
  const label = role === 'main_arc' ? 'Alur Utama' : (BUCKET_META[role]?.label || role)
  return <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">{label}</span>
}

const EntryEditRow = ({ entry, onUpdate, onRemove, onMoveUp, onMoveDown, canUp, canDown }) => (
  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.title}</p>
        <p className="text-xs text-slate-400">{entry.sourceName}{entry.pageNumber ? ` · Hal. ${entry.pageNumber}` : ''}{entry.wordCount ? ` · ${entry.wordCount} kata` : ''}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button type="button" onClick={onMoveUp} disabled={!canUp} className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={onMoveDown} disabled={!canDown} className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={onRemove} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <input value={entry.positionLabel} onChange={e => onUpdate('positionLabel', e.target.value)} placeholder="Label posisi" className={inputCls + ' !py-1.5 text-xs'} />
      <input value={entry.columnInfo} onChange={e => onUpdate('columnInfo', e.target.value)} placeholder="Info kolom" className={inputCls + ' !py-1.5 text-xs'} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <select value={entry.textStatus} onChange={e => onUpdate('textStatus', e.target.value)} className={inputCls + ' !py-1.5 text-xs cursor-pointer'}>
        {TEXT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input value={entry.editorialNote} onChange={e => onUpdate('editorialNote', e.target.value)} placeholder="Catatan editorial" className={inputCls + ' !py-1.5 text-xs'} />
    </div>
  </div>
)

const BucketSection = ({ role, items, onUpdate, onRemove, onMove }) => {
  const meta = BUCKET_META[role]
  if (!items.length) return null
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{meta.label} <span className="text-xs font-normal text-slate-400">({items.length})</span></h4>
        <p className="text-xs text-slate-400">{meta.hint}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((e, idx) => (
          <EntryEditRow key={e.articleId} entry={e}
            onUpdate={(f, v) => onUpdate(role, e.articleId, f, v)}
            onRemove={() => onRemove(role, e.articleId)}
            onMoveUp={() => onMove(role, e.articleId, -1)} onMoveDown={() => onMove(role, e.articleId, 1)}
            canUp={idx > 0} canDown={idx < items.length - 1} />
        ))}
      </div>
    </div>
  )
}

const IndexEditor = ({ title, icon: Icon, items, entries, onAdd, onLabel, onToggle, onRemove }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icon className="w-4 h-4 text-rose-500" />{title}</h4>
      <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-500"><Plus className="w-3.5 h-3.5" />Tambah</button>
    </div>
    {items.map((item, idx) => (
      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center gap-2">
          <input value={item.label} onChange={e => onLabel(idx, e.target.value)} placeholder="Label (nama/tempat/organisasi)" className={inputCls + ' !py-1.5 text-xs flex-1'} />
          <button type="button" onClick={() => onRemove(idx)} className="p-1.5 rounded text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
          {entries.map(e => (
            <label key={e.articleId} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] cursor-pointer border transition
              ${item.articleIds.includes(e.articleId) ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
              <input type="checkbox" className="hidden" checked={item.articleIds.includes(e.articleId)} onChange={() => onToggle(idx, e.articleId)} />
              {e.title.slice(0, 24)}
            </label>
          ))}
        </div>
      </div>
    ))}
  </div>
)

const MonographEditorPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('ADMIN')
  const isEditing = !!slug

  const [tab, setTab] = useState('naskah')
  const [loading, setLoading] = useState(isEditing)
  const [creating, setCreating] = useState(false)
  const [savingMeta, setSavingMeta] = useState(false)
  const [savingStructure, setSavingStructure] = useState(false)
  const [validating, setValidating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [sources, setSources] = useState([])
  const [meta, setMeta] = useState(emptyMeta())
  const [structure, setStructure] = useState(emptyStructure())
  const [pool, setPool] = useState([])
  const [poolFilter, setPoolFilter] = useState('')
  const [scaffoldForm, setScaffoldForm] = useState({ sourceId: '', from: '', to: '' })
  const [scaffoldLoading, setScaffoldLoading] = useState(false)
  const [validation, setValidation] = useState(null)

  useEffect(() => {
    if (!isAdmin) navigate('/dasbor')
  }, [isAdmin, navigate])

  useEffect(() => {
    api.get('/newspapers/sources', { params: { page: 1, limit: 200 } }).then(r => setSources(r.data?.data?.list || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEditing) return
    let cancelled = false
    setLoading(true)
    monographService.getMonographBySlug(slug)
      .then(detail => { if (cancelled) return; setMeta(metaFromDetail(detail)); setStructure(structureFromDetail(detail)) })
      .catch(() => toast.error('Monograf tidak ditemukan'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug, isEditing])

  const allPlacedEntries = useCallback(() => {
    const list = [...structure.chapters.flatMap(c => c.entries)]
    BUCKET_ARRAY_KEYS.forEach(k => list.push(...structure[k]))
    const seen = new Set()
    return list.filter(e => (seen.has(e.articleId) ? false : (seen.add(e.articleId), true)))
  }, [structure])

  const hasAnyStructure = () => structure.chapters.length > 0 || BUCKET_ARRAY_KEYS.some(k => structure[k].length > 0)

  const addChapter = () => setStructure(s => ({ ...s, chapters: [...s.chapters, { localId: genId(), title: '', narrativeSummary: '', entries: [] }] }))
  const removeChapter = (localId) => {
    const chapter = structure.chapters.find(c => c.localId === localId)
    if (chapter?.entries.length && !window.confirm(`Bab ini memiliki ${chapter.entries.length} dokumen. Hapus bab beserta isinya?`)) return
    setStructure(s => ({ ...s, chapters: s.chapters.filter(c => c.localId !== localId) }))
  }
  const updateChapter = (localId, field, value) => setStructure(s => ({ ...s, chapters: s.chapters.map(c => c.localId === localId ? { ...c, [field]: value } : c) }))
  const moveChapter = (localId, dir) => setStructure(s => {
    const idx = s.chapters.findIndex(c => c.localId === localId)
    const next = idx + dir
    if (next < 0 || next >= s.chapters.length) return s
    const arr = [...s.chapters]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    return { ...s, chapters: arr }
  })

  const addCandidate = (candidate, role, chapterLocalId) => {
    const sourceName = sources.find(s => String(s.id) === String(scaffoldForm.sourceId))?.name || meta.sourceName || ''
    const entry = entryFromCandidate(candidate, sourceName)
    if (role === 'main_arc') {
      if (!chapterLocalId) { toast.error('Pilih bab tujuan terlebih dahulu'); return }
      setStructure(s => ({ ...s, chapters: s.chapters.map(c => c.localId === chapterLocalId ? { ...c, entries: [...c.entries, entry] } : c) }))
    } else {
      const key = BUCKET_META[role].key
      setStructure(s => ({ ...s, [key]: [...s[key], entry] }))
    }
    setPool(p => p.filter(c => c.articleId !== candidate.articleId))
  }

  const updateEntry = (role, articleId, field, value) => {
    if (role === 'main_arc') return
    const key = BUCKET_META[role].key
    setStructure(s => ({ ...s, [key]: s[key].map(e => e.articleId === articleId ? { ...e, [field]: value } : e) }))
  }
  const removeEntry = (role, articleId) => {
    const key = BUCKET_META[role].key
    setStructure(s => ({ ...s, [key]: s[key].filter(e => e.articleId !== articleId) }))
  }
  const moveEntry = (role, articleId, dir) => {
    const key = BUCKET_META[role].key
    setStructure(s => {
      const arr = s[key]
      const idx = arr.findIndex(e => e.articleId === articleId)
      const next = idx + dir
      if (next < 0 || next >= arr.length) return s
      const copy = [...arr]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return { ...s, [key]: copy }
    })
  }

  const updateChapterEntry = (chapterLocalId, articleId, field, value) =>
    setStructure(s => ({ ...s, chapters: s.chapters.map(c => c.localId === chapterLocalId ? { ...c, entries: c.entries.map(e => e.articleId === articleId ? { ...e, [field]: value } : e) } : c) }))
  const removeChapterEntry = (chapterLocalId, articleId) =>
    setStructure(s => ({ ...s, chapters: s.chapters.map(c => c.localId === chapterLocalId ? { ...c, entries: c.entries.filter(e => e.articleId !== articleId) } : c) }))
  const moveChapterEntry = (chapterLocalId, articleId, dir) =>
    setStructure(s => ({ ...s, chapters: s.chapters.map(c => {
      if (c.localId !== chapterLocalId) return c
      const idx = c.entries.findIndex(e => e.articleId === articleId)
      const next = idx + dir
      if (next < 0 || next >= c.entries.length) return c
      const copy = [...c.entries]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return { ...c, entries: copy }
    }) }))

  const addCriticalNote = () => setStructure(s => ({ ...s, criticalNotes: [...s.criticalNotes, { number: s.criticalNotes.length + 1, noteText: '', relatedArticleId: null }] }))
  const updateCriticalNote = (idx, field, value) => setStructure(s => ({ ...s, criticalNotes: s.criticalNotes.map((n, i) => i === idx ? { ...n, [field]: value } : n) }))
  const removeCriticalNote = (idx) => setStructure(s => ({ ...s, criticalNotes: s.criticalNotes.filter((_, i) => i !== idx).map((n, i) => ({ ...n, number: i + 1 })) }))

  const addGlossary = () => setStructure(s => ({ ...s, glossary: [...s.glossary, { term: '', definition: '' }] }))
  const updateGlossary = (idx, field, value) => setStructure(s => ({ ...s, glossary: s.glossary.map((g, i) => i === idx ? { ...g, [field]: value } : g) }))
  const removeGlossary = (idx) => setStructure(s => ({ ...s, glossary: s.glossary.filter((_, i) => i !== idx) }))

  const addIndexEntry = (key) => setStructure(s => ({ ...s, [key]: [...s[key], { label: '', articleIds: [] }] }))
  const updateIndexLabel = (key, idx, value) => setStructure(s => ({ ...s, [key]: s[key].map((n, i) => i === idx ? { ...n, label: value } : n) }))
  const toggleIndexArticle = (key, idx, articleId) => setStructure(s => ({ ...s, [key]: s[key].map((n, i) => i === idx ? { ...n, articleIds: n.articleIds.includes(articleId) ? n.articleIds.filter(a => a !== articleId) : [...n.articleIds, articleId] } : n) }))
  const removeIndexEntry = (key, idx) => setStructure(s => ({ ...s, [key]: s[key].filter((_, i) => i !== idx) }))

  const handleScaffoldSearch = async () => {
    if (!scaffoldForm.sourceId || !scaffoldForm.from || !scaffoldForm.to) { toast.error('Lengkapi sumber dan rentang tanggal'); return }
    setScaffoldLoading(true)
    try {
      const res = await monographService.getScaffold(scaffoldForm)
      const placedIds = new Set(allPlacedEntries().map(e => e.articleId))
      const fresh = (res.candidateArticles || []).filter(c => !placedIds.has(c.articleId) && !pool.some(p => p.articleId === c.articleId))
      setPool(p => [...p, ...fresh])
      if (!meta.title.trim()) setMeta(m => ({ ...m, title: res.suggestedTitle }))
      toast.success(`${fresh.length} kandidat ditemukan`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat kandidat')
    } finally {
      setScaffoldLoading(false)
    }
  }

  const entryToInput = (e, order) => ({
    articleId: e.articleId, order, positionLabel: e.positionLabel || undefined,
    columnInfo: e.columnInfo || undefined, editorialNote: e.editorialNote || undefined, textStatus: e.textStatus || 'complete',
  })
  const buildStructurePayload = () => ({
    chapters: structure.chapters.map((c, i) => ({ chapterOrder: i + 1, title: c.title, narrativeSummary: c.narrativeSummary || undefined, entries: c.entries.map((e, idx) => entryToInput(e, idx)) })),
    counterpoints: structure.counterpoints.map((e, idx) => entryToInput(e, idx)),
    interludes: structure.interludes.map((e, idx) => entryToInput(e, idx)),
    peripheralDocuments: structure.peripheralDocuments.map((e, idx) => entryToInput(e, idx)),
    appendices: structure.appendices.map((e, idx) => entryToInput(e, idx)),
    carryForwardPool: structure.carryForwardPool.map((e, idx) => entryToInput(e, idx)),
    standaloneRegister: structure.standaloneRegister.map((e, idx) => entryToInput(e, idx)),
    unresolvedRegister: structure.unresolvedRegister.map((e, idx) => entryToInput(e, idx)),
    criticalNotes: structure.criticalNotes.filter(n => n.noteText?.trim()),
    glossary: structure.glossary.filter(g => g.term?.trim()).map((g, idx) => ({ term: g.term, definition: g.definition, order: idx })),
    nameIndex: structure.nameIndex.filter(n => n.label?.trim() && n.articleIds.length),
    placeIndex: structure.placeIndex.filter(n => n.label?.trim() && n.articleIds.length),
    orgIndex: structure.orgIndex.filter(n => n.label?.trim() && n.articleIds.length),
  })

  const handleCreateDraft = async () => {
    if (!meta.title.trim()) { toast.error('Judul wajib diisi'); setTab('naskah'); return }
    if (!scaffoldForm.sourceId) { toast.error('Pilih sumber koran di tab Kandidat'); setTab('kandidat'); return }
    if (!scaffoldForm.from) { toast.error('Isi tanggal edisi di tab Kandidat'); setTab('kandidat'); return }
    setCreating(true)
    const tid = toast.loading('Membuat draft monograf...')
    try {
      const payload = {
        title: meta.title.trim(), subtitle: meta.subtitle || undefined,
        sourceId: Number(scaffoldForm.sourceId), editionDate: scaffoldForm.from, editionDateTo: scaffoldForm.to && scaffoldForm.to !== scaffoldForm.from ? scaffoldForm.to : undefined,
        editorialNote: meta.editorialNote || undefined, centralQuestion: meta.centralQuestion || undefined,
        colophon: meta.colophon || undefined, methodNote: meta.methodNote || undefined,
        coverImageUrl: meta.coverImageUrl || undefined, citationFormatTemplate: meta.citationFormatTemplate || undefined,
      }
      const created = await monographService.createMonograph(payload)
      if (hasAnyStructure()) await monographService.saveStructure(created.id, buildStructurePayload())
      toast.success('Draft berhasil dibuat!', { id: tid })
      navigate(`/dasbor/koran/monograf/edit/${created.slug}`, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat draft', { id: tid })
    } finally {
      setCreating(false)
    }
  }

  const handleSaveMeta = async () => {
    if (!meta.title.trim()) { toast.error('Judul wajib diisi'); return }
    setSavingMeta(true)
    const tid = toast.loading('Menyimpan naskah...')
    try {
      await monographService.updateMonograph(meta.id, {
        title: meta.title.trim(), subtitle: meta.subtitle || undefined,
        editionDate: meta.editionDate, editionDateTo: meta.editionDateTo || undefined,
        editorialNote: meta.editorialNote || undefined, centralQuestion: meta.centralQuestion || undefined,
        colophon: meta.colophon || undefined, methodNote: meta.methodNote || undefined,
        coverImageUrl: meta.coverImageUrl || undefined, citationFormatTemplate: meta.citationFormatTemplate || undefined,
      })
      toast.success('Naskah tersimpan!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan', { id: tid })
    } finally {
      setSavingMeta(false)
    }
  }

  const handleSaveStructure = async () => {
    if (!meta.id) { toast.error('Buat draft terlebih dahulu'); setTab('naskah'); return }
    if (!structure.chapters.length) { toast.error('Minimal satu bab pada alur utama diperlukan'); return }
    setSavingStructure(true)
    const tid = toast.loading('Menyimpan struktur...')
    try {
      await monographService.saveStructure(meta.id, buildStructurePayload())
      toast.success('Struktur tersimpan!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan struktur', { id: tid })
    } finally {
      setSavingStructure(false)
    }
  }

  const handleValidate = async () => {
    if (!meta.id) return
    setValidating(true)
    try {
      const res = await monographService.validateMonograph(meta.id)
      setValidation(res)
    } catch {
      toast.error('Gagal memeriksa kesiapan')
    } finally {
      setValidating(false)
    }
  }

  const handlePublish = async () => {
    if (!window.confirm('Terbitkan monograf ini? Halaman akan tampil ke publik.')) return
    setPublishing(true)
    const tid = toast.loading('Menerbitkan...')
    try {
      const res = await monographService.updateStatus(meta.id, 'published')
      setMeta(m => ({ ...m, status: res.status }))
      toast.success('Monograf diterbitkan!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menerbitkan', { id: tid })
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!window.confirm('Tarik monograf ke draft? Publik tidak akan bisa mengaksesnya sampai diterbitkan kembali.')) return
    setPublishing(true)
    try {
      const res = await monographService.updateStatus(meta.id, 'draft')
      setMeta(m => ({ ...m, status: res.status }))
      toast.success('Monograf ditarik ke draft')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menarik ke draft')
    } finally {
      setPublishing(false)
    }
  }

  if (!isAdmin) return null
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data monograf...</p>
    </div>
  )

  const filteredPool = poolFilter ? pool.filter(c => c.title.toLowerCase().includes(poolFilter.toLowerCase())) : pool
  const placedEntries = allPlacedEntries()

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dasbor/koran/monograf')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition group flex-shrink-0">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate flex items-center gap-2">
              {isEditing ? 'Edit Monograf' : 'Monograf Baru'}
              {meta.id && (
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {meta.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{meta.id ? `${placedEntries.length} dokumen ditempatkan` : 'Belum tersimpan sebagai draft'}</p>
          </div>
        </div>
        {!meta.id ? (
          <button onClick={handleCreateDraft} disabled={creating}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 shadow-sm">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {creating ? 'Membuat...' : 'Buat Draft'}
          </button>
        ) : (
          <button onClick={handleSaveMeta} disabled={savingMeta}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 shadow-sm">
            {savingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingMeta ? 'Menyimpan...' : 'Simpan Naskah'}
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              ${tab === t.key ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'naskah' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label className={labelCls}>Judul Monograf <span className="text-rose-500">*</span></label>
              <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} placeholder="Judul monograf..." className={inputCls + ' text-lg font-bold'} />
            </div>
            <div>
              <label className={labelCls}>Subjudul</label>
              <input value={meta.subtitle} onChange={e => setMeta(m => ({ ...m, subtitle: e.target.value }))} placeholder="Subjudul (opsional)..." className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>URL Cover</label>
                <input value={meta.coverImageUrl} onChange={e => setMeta(m => ({ ...m, coverImageUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Template Sitasi</label>
                <input value={meta.citationFormatTemplate} onChange={e => setMeta(m => ({ ...m, citationFormatTemplate: e.target.value }))} placeholder="Format kutipan akademis..." className={inputCls} />
              </div>
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Sumber: <strong className="text-slate-600 dark:text-slate-300">{meta.sourceName}</strong></span>
                <span>Edisi: <strong className="text-slate-600 dark:text-slate-300">{meta.editionDate}</strong></span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label className={labelCls}>Pengantar Kuratorial</label>
              <textarea value={meta.editorialNote} onChange={e => setMeta(m => ({ ...m, editorialNote: e.target.value }))} rows={4} placeholder="Pengantar naratif untuk monograf ini..." className={inputCls + ' resize-y'} />
            </div>
            <div>
              <label className={labelCls}>Pertanyaan Sentral</label>
              <textarea value={meta.centralQuestion} onChange={e => setMeta(m => ({ ...m, centralQuestion: e.target.value }))} rows={2} placeholder="Pertanyaan sentral yang diajukan monograf ini..." className={inputCls + ' resize-y'} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Catatan Metode</label>
                <textarea value={meta.methodNote} onChange={e => setMeta(m => ({ ...m, methodNote: e.target.value }))} rows={3} placeholder="Metode kurasi..." className={inputCls + ' resize-y'} />
              </div>
              <div>
                <label className={labelCls}>Kolofon</label>
                <textarea value={meta.colophon} onChange={e => setMeta(m => ({ ...m, colophon: e.target.value }))} rows={3} placeholder="Disusun oleh..." className={inputCls + ' resize-y'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'kandidat' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cari Kandidat dari Arsip Koran</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <select value={scaffoldForm.sourceId} disabled={isEditing} onChange={e => setScaffoldForm(f => ({ ...f, sourceId: e.target.value }))} className={inputCls + ' cursor-pointer'}>
                <option value="">-- Pilih sumber koran --</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" value={scaffoldForm.from} onChange={e => setScaffoldForm(f => ({ ...f, from: e.target.value }))} className={inputCls} />
              <input type="date" value={scaffoldForm.to} onChange={e => setScaffoldForm(f => ({ ...f, to: e.target.value }))} className={inputCls} />
            </div>
            {isEditing && <p className="text-xs text-amber-600 dark:text-amber-400">Sumber & tanggal utama sudah terkunci mengikuti draft. Field di atas hanya untuk mencari kandidat tambahan dari sumber lain.</p>}
            <button onClick={handleScaffoldSearch} disabled={scaffoldLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60">
              {scaffoldLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Cari Kandidat
            </button>
          </div>

          {pool.length > 0 && (
            <div className="space-y-3">
              <input value={poolFilter} onChange={e => setPoolFilter(e.target.value)} placeholder="Saring kandidat berdasarkan judul..." className={inputCls} />
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredPool.map(c => (
                  <CandidateCard key={c.articleId} candidate={c} chapters={structure.chapters} onAdd={addCandidate} onDismiss={() => setPool(p => p.filter(x => x.articleId !== c.articleId))} />
                ))}
              </div>
            </div>
          )}
          {!pool.length && <p className="text-sm text-slate-400 text-center py-10">Belum ada kandidat. Cari artikel dari sumber & rentang tanggal di atas.</p>}
        </div>
      )}

      {tab === 'struktur' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Alur Dokumenter Utama (Bab)</h3>
            <div className="flex items-center gap-2">
              <button onClick={addChapter} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-500"><Plus className="w-3.5 h-3.5" />Tambah Bab</button>
              <button onClick={handleSaveStructure} disabled={savingStructure || !meta.id}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50">
                {savingStructure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Simpan Struktur
              </button>
            </div>
          </div>

          {structure.chapters.length === 0 && <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">Belum ada bab. Buat bab lalu tempatkan dokumen dari tab Kandidat.</p>}

          {structure.chapters.map((c, i) => (
            <div key={c.localId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-serif text-xl font-bold text-rose-300 dark:text-rose-700 mt-1">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 space-y-2">
                  <input value={c.title} onChange={e => updateChapter(c.localId, 'title', e.target.value)} placeholder="Judul bab..." className={inputCls + ' font-semibold'} />
                  <textarea value={c.narrativeSummary} onChange={e => updateChapter(c.localId, 'narrativeSummary', e.target.value)} rows={2} placeholder="Ringkasan naratif bab ini..." className={inputCls + ' resize-y text-xs'} />
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => moveChapter(c.localId, -1)} disabled={i === 0} className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => moveChapter(c.localId, 1)} disabled={i === structure.chapters.length - 1} className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => removeChapter(c.localId)} className="p-1 rounded text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {c.entries.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {c.entries.map((e, idx) => (
                    <EntryEditRow key={e.articleId} entry={e}
                      onUpdate={(f, v) => updateChapterEntry(c.localId, e.articleId, f, v)}
                      onRemove={() => removeChapterEntry(c.localId, e.articleId)}
                      onMoveUp={() => moveChapterEntry(c.localId, e.articleId, -1)} onMoveDown={() => moveChapterEntry(c.localId, e.articleId, 1)}
                      canUp={idx > 0} canDown={idx < c.entries.length - 1} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-6">
            {Object.keys(BUCKET_META).map(role => (
              <BucketSection key={role} role={role} items={structure[BUCKET_META[role].key]} onUpdate={updateEntry} onRemove={removeEntry} onMove={moveEntry} />
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Quote className="w-4 h-4 text-rose-500" />Catatan Kritis</h4>
              <button onClick={addCriticalNote} className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-500"><Plus className="w-3.5 h-3.5" />Tambah</button>
            </div>
            {structure.criticalNotes.map((n, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-bold text-slate-400 mt-2.5 w-5 flex-shrink-0">{n.number}.</span>
                <div className="flex-1 space-y-2">
                  <textarea value={n.noteText} onChange={e => updateCriticalNote(idx, 'noteText', e.target.value)} rows={2} placeholder="Isi catatan kritis..." className={inputCls + ' resize-y text-xs'} />
                  <select value={n.relatedArticleId || ''} onChange={e => updateCriticalNote(idx, 'relatedArticleId', e.target.value ? Number(e.target.value) : null)} className={inputCls + ' !py-1.5 text-xs cursor-pointer'}>
                    <option value="">Tidak terkait dokumen tertentu</option>
                    {placedEntries.map(e => <option key={e.articleId} value={e.articleId}>{e.title}</option>)}
                  </select>
                </div>
                <button onClick={() => removeCriticalNote(idx)} className="p-1.5 rounded text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Languages className="w-4 h-4 text-rose-500" />Glosarium</h4>
              <button onClick={addGlossary} className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-500"><Plus className="w-3.5 h-3.5" />Tambah</button>
            </div>
            {structure.glossary.map((g, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <input value={g.term} onChange={e => updateGlossary(idx, 'term', e.target.value)} placeholder="Istilah" className={inputCls + ' !py-1.5 text-xs'} />
                  <input value={g.definition} onChange={e => updateGlossary(idx, 'definition', e.target.value)} placeholder="Definisi" className={inputCls + ' !py-1.5 text-xs'} />
                </div>
                <button onClick={() => removeGlossary(idx)} className="p-1.5 rounded text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-6">
            <IndexEditor title="Indeks Nama" icon={Users} items={structure.nameIndex} entries={placedEntries}
              onAdd={() => addIndexEntry('nameIndex')} onLabel={(i, v) => updateIndexLabel('nameIndex', i, v)}
              onToggle={(i, a) => toggleIndexArticle('nameIndex', i, a)} onRemove={i => removeIndexEntry('nameIndex', i)} />
            <IndexEditor title="Indeks Tempat" icon={MapPin} items={structure.placeIndex} entries={placedEntries}
              onAdd={() => addIndexEntry('placeIndex')} onLabel={(i, v) => updateIndexLabel('placeIndex', i, v)}
              onToggle={(i, a) => toggleIndexArticle('placeIndex', i, a)} onRemove={i => removeIndexEntry('placeIndex', i)} />
            <IndexEditor title="Indeks Organisasi" icon={Building2} items={structure.orgIndex} entries={placedEntries}
              onAdd={() => addIndexEntry('orgIndex')} onLabel={(i, v) => updateIndexLabel('orgIndex', i, v)}
              onToggle={(i, a) => toggleIndexArticle('orgIndex', i, a)} onRemove={i => removeIndexEntry('orgIndex', i)} />
          </div>
        </div>
      )}

      {tab === 'terbitkan' && (
        <div className="space-y-5">
          {!meta.id ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
              <Archive className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-400">Buat draft terlebih dahulu di tab Naskah sebelum bisa menerbitkan.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-rose-500" />Cek Kesiapan Terbit</h3>
                  <button onClick={handleValidate} disabled={validating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400 transition disabled:opacity-50">
                    {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}Periksa Ulang
                  </button>
                </div>
                {validation && (
                  validation.ready ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />Monograf siap diterbitkan.
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {validation.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{issue}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row gap-3">
                {meta.status === 'published' ? (
                  <>
                    <a href={`/koran/monograf/${meta.slug}`} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 transition">
                      <ExternalLink className="w-4 h-4" />Lihat Halaman Publik
                    </a>
                    <button onClick={handleUnpublish} disabled={publishing}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition disabled:opacity-60">
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}Tarik ke Draft
                    </button>
                  </>
                ) : (
                  <button onClick={handlePublish} disabled={publishing}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-60 shadow-lg shadow-rose-200/60 dark:shadow-rose-900/30">
                    {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Terbitkan Monograf
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const CandidateCard = ({ candidate, chapters, onAdd, onDismiss }) => {
  const [role, setRole] = useState(candidate.suggestedRole || 'main_arc')
  const [chapterLocalId, setChapterLocalId] = useState(chapters[0]?.localId || '')
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{candidate.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{candidate.pageNumber ? `Hal. ${candidate.pageNumber} · ` : ''}{candidate.wordCount || 0} kata</p>
        </div>
        <button onClick={onDismiss} className="p-1 rounded text-slate-300 hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
      </div>
      <RoleTag role={candidate.suggestedRole || 'main_arc'} />
      <div className="grid grid-cols-2 gap-2">
        <select value={role} onChange={e => setRole(e.target.value)} className={inputCls + ' !py-1.5 text-xs cursor-pointer'}>
          {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {role === 'main_arc' ? (
          <select value={chapterLocalId} onChange={e => setChapterLocalId(e.target.value)} className={inputCls + ' !py-1.5 text-xs cursor-pointer'}>
            <option value="">-- Pilih bab --</option>
            {chapters.map(c => <option key={c.localId} value={c.localId}>{c.title || '(tanpa judul)'}</option>)}
          </select>
        ) : (
          <button onClick={() => onAdd(candidate, role, null)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition">
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        )}
      </div>
      {role === 'main_arc' && (
        <button onClick={() => onAdd(candidate, role, chapterLocalId)} disabled={!chapterLocalId}
          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" />Tambah ke Bab
        </button>
      )}
    </div>
  )
}

export default MonographEditorPage