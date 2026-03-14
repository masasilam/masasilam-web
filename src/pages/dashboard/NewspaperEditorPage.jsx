// src/pages/dashboard/NewspaperEditorPage.jsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, FileText, Globe,
  Newspaper, AlertCircle, ImagePlus, X, Tag, Code
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'nasional',          label: '🇮🇩 Nasional'          },
  { value: 'internasional',     label: '🌏 Internasional'      },
  { value: 'daerah',            label: '📍 Daerah / Lokal'     },
  { value: 'politik',           label: '🏛️ Politik'            },
  { value: 'hukum',             label: '⚖️ Hukum & Kriminal'   },
  { value: 'pemerintahan',      label: '🏢 Pemerintahan'       },
  { value: 'ekonomi',           label: '💰 Ekonomi'            },
  { value: 'bisnis',            label: '📈 Bisnis & Keuangan'  },
  { value: 'pertanian',         label: '🌾 Pertanian'          },
  { value: 'sosial',            label: '👥 Sosial'             },
  { value: 'pendidikan',        label: '📚 Pendidikan'         },
  { value: 'kesehatan',         label: '🏥 Kesehatan'          },
  { value: 'agama',             label: '🕌 Agama'              },
  { value: 'lingkungan',        label: '🌿 Lingkungan'         },
  { value: 'teknologi',         label: '💻 Teknologi'          },
  { value: 'sains',             label: '🔬 Sains & Iptek'      },
  { value: 'budaya',            label: '🎭 Budaya'             },
  { value: 'hiburan',           label: '🎬 Hiburan'            },
  { value: 'olahraga',          label: '⚽ Olahraga'           },
  { value: 'gaya-hidup',        label: '✨ Gaya Hidup'         },
  { value: 'kuliner',           label: '🍜 Kuliner'            },
  { value: 'wisata',            label: '✈️ Wisata'             },
  { value: 'opini',             label: '✍️ Opini / Kolom'      },
  { value: 'sastra',            label: '📖 Sastra & Cerita'    },
  { value: 'cerita-bersambung', label: '📜 Cerita Bersambung'  },
  { value: 'iklan',             label: '📢 Iklan / Pengumuman' },
  { value: 'lainnya',           label: '📰 Lainnya'            },
]

const IMPORTANCE_OPTIONS = [
  { value: 'high',   label: '🔴 Utama',    desc: 'Berita halaman depan' },
  { value: 'medium', label: '🟡 Reguler',  desc: 'Artikel biasa'        },
  { value: 'low',    label: '🔵 Tambahan', desc: 'Artikel pendukung'    },
]

// ─── Quill CSS ────────────────────────────────────────────────────────────────

const QUILL_CSS = `
  .ql-toolbar.ql-snow { border:1px solid #e5e7eb!important; border-bottom:none!important; border-radius:.5rem .5rem 0 0!important; background:#f9fafb!important; padding:8px 10px!important; flex-wrap:wrap!important; }
  .dark .ql-toolbar.ql-snow { background:#1e293b!important; border-color:#334155!important; }
  .dark .ql-toolbar.ql-snow .ql-stroke { stroke:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-fill   { fill:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-label { color:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-label .ql-stroke { stroke:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-options { background:#1e293b!important; border-color:#334155!important; color:#e2e8f0!important; }
  .ql-toolbar.ql-snow button:hover .ql-stroke, .ql-toolbar.ql-snow .ql-active .ql-stroke { stroke:var(--color-primary,#10b981)!important; }
  .ql-toolbar.ql-snow button:hover .ql-fill,   .ql-toolbar.ql-snow .ql-active .ql-fill   { fill:var(--color-primary,#10b981)!important; }
  .dark .ql-toolbar.ql-snow button:hover .ql-stroke, .dark .ql-toolbar.ql-snow .ql-active .ql-stroke { stroke:var(--color-primary,#10b981)!important; }
  .dark .ql-toolbar.ql-snow button:hover .ql-fill,   .dark .ql-toolbar.ql-snow .ql-active .ql-fill   { fill:var(--color-primary,#10b981)!important; }
  .ql-container.ql-snow { border:1px solid #e5e7eb!important; border-radius:0 0 .5rem .5rem!important; font-family:Georgia,serif!important; }
  .dark .ql-container.ql-snow { border-color:#334155!important; background:#0f172a!important; color:#e2e8f0!important; }
  .ql-editor { min-height:480px!important; line-height:2!important; padding:1.5rem 1.75rem!important; font-size:1rem!important; }
  .ql-editor.ql-blank::before { font-style:normal!important; color:#9ca3af!important; font-family:inherit!important; left:1.75rem!important; top:1.5rem!important; line-height:2!important; font-size:1rem!important; }
  .dark .ql-editor.ql-blank::before { color:#64748b!important; }
  .ql-editor h1 { font-size:2em; font-weight:800; margin:1.25rem 0 .5rem; }
  .ql-editor h2 { font-size:1.6em; font-weight:700; margin:1.1rem 0 .4rem; }
  .ql-editor h3 { font-size:1.3em; font-weight:600; margin:.9rem 0 .3rem; }
  .ql-editor p  { margin-bottom:.75em; }
  .ql-editor a  { color:var(--color-primary,#10b981); text-decoration:underline; }
  .ql-editor img { max-width:100%; border-radius:.5rem; margin:.75rem auto; display:block; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,.15); }
  .ql-editor img:hover { opacity:.9; outline:2px solid var(--color-primary,#10b981); }
  .ql-editor blockquote { border-left:4px solid var(--color-primary,#10b981)!important; padding:.75rem 1.25rem!important; margin:1rem 0!important; background:rgba(16,185,129,.06)!important; border-radius:0 .375rem .375rem 0!important; font-style:italic!important; }
  .ql-editor pre.ql-syntax { background:#1e293b!important; color:#e2e8f0!important; padding:1rem 1.25rem!important; border-radius:.5rem!important; overflow-x:auto!important; font-size:.875em!important; }
  .ql-editor ol, .ql-editor ul { padding-left:1.5em; margin-bottom:.75em; }
  .ql-tooltip { z-index:9999!important; background:white; box-shadow:0 4px 12px rgba(0,0,0,.15); border-radius:6px; border:1px solid #e5e7eb; }
  .dark .ql-tooltip { background:#1e293b; border-color:#334155; color:#e2e8f0; }
  .dark .ql-tooltip input { background:#0f172a; color:#e2e8f0; border-color:#334155; }
  .ql-picker-options { z-index:9999!important; }
`

// ─── Quill Loader ─────────────────────────────────────────────────────────────

let quillLoadPromise = null
const loadQuill = () => {
  if (quillLoadPromise) return quillLoadPromise
  quillLoadPromise = new Promise((resolve) => {
    if (window.Quill) { resolve(window.Quill); return }
    if (!document.getElementById('quill-css')) {
      const link = document.createElement('link')
      link.id = 'quill-css'; link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js'
    script.onload  = () => resolve(window.Quill)
    script.onerror = () => { quillLoadPromise = null; resolve(null) }
    document.head.appendChild(script)
  })
  return quillLoadPromise
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

const RichEditor = ({ value, onChange, onImageInsert }) => {
  const containerRef = useRef(null)
  const quillRef     = useRef(null)
  const imgInputRef  = useRef(null)
  const suppressRef  = useRef(false)
  const lastValueRef = useRef('')
  const valueRef     = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])

  const [htmlMode, setHtmlMode] = useState(false)

  useEffect(() => {
    let alive = true
    loadQuill().then((Quill) => {
      if (!alive || !Quill || !containerRef.current || quillRef.current) return
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: 'Mulai menulis berita di sini...',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean'],
            ],
            handlers: { image: () => imgInputRef.current?.click() },
          },
          history: { delay: 1000, maxStack: 100, userOnly: true },
        },
      })

      if (valueRef.current) {
        suppressRef.current = true
        quillRef.current.root.innerHTML = valueRef.current
        suppressRef.current = false
        lastValueRef.current = valueRef.current
      }

      quillRef.current.on('text-change', () => {
        if (suppressRef.current) return
        const html = quillRef.current.root.innerHTML
        const out  = html === '<p><br></p>' ? '' : html
        lastValueRef.current = out
        onChange(out)
      })
    })
    return () => { alive = false }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!quillRef.current) return
    if (value === lastValueRef.current) return
    if (!value) return
    suppressRef.current = true
    quillRef.current.root.innerHTML = value
    suppressRef.current = false
    lastValueRef.current = value
  }, [value])

  // Switch mode: HTML → Visual: sync konten ke Quill
  const handleToggleMode = () => {
    if (htmlMode) {
      // Kembali ke visual — sync nilai terkini ke Quill
      if (quillRef.current && value) {
        suppressRef.current = true
        quillRef.current.root.innerHTML = value
        suppressRef.current = false
        lastValueRef.current = value
      }
    }
    setHtmlMode(m => !m)
  }

  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Ukuran gambar maksimal 10MB'); return }
    const tid = toast.loading('Mengupload gambar...')
    try {
      const url = await onImageInsert(file)
      if (url && quillRef.current) {
        const range = quillRef.current.getSelection(true)
        const idx   = range ? range.index : quillRef.current.getLength()
        quillRef.current.insertEmbed(idx, 'image', url)
        quillRef.current.setSelection(idx + 1, 0)
        toast.success('Gambar berhasil disisipkan!', { id: tid })
      } else {
        toast.error('Gagal mendapatkan URL gambar', { id: tid })
      }
    } catch (err) {
      toast.error('Gagal upload: ' + (err?.message || ''), { id: tid })
    }
  }, [onImageInsert])

  return (
    <>
      <style>{QUILL_CSS}</style>

      {/* ── Mode Toggle Bar ── */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {htmlMode
            ? '⚠️ Mode HTML aktif — tulis tag secara langsung'
            : '🖊️ Mode Visual — editor WYSIWYG'}
        </span>
        <button
          type="button"
          onClick={handleToggleMode}
          title={htmlMode ? 'Beralih ke editor visual' : 'Beralih ke editor HTML'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            htmlMode
              ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
              : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {htmlMode ? (
            <><FileText className="w-3.5 h-3.5" /> Visual Editor</>
          ) : (
            <><Code className="w-3.5 h-3.5" /> &lt;/&gt; HTML Mode</>
          )}
        </button>
      </div>

      {/* ── HTML Textarea (raw mode) ── */}
      {htmlMode && (
        <div className="relative">
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            placeholder={'<p>Tulis atau paste HTML di sini...</p>\n<p>Contoh: <strong>teks tebal</strong>, <em>miring</em></p>'}
            className={`
              w-full min-h-[480px] px-4 py-3 rounded-lg border
              border-amber-300 dark:border-amber-700
              bg-gray-950 text-green-400
              font-mono text-sm leading-relaxed
              focus:outline-none focus:ring-2 focus:ring-amber-400/60
              resize-y placeholder-gray-600
            `}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
            <span className="text-xs text-gray-600 bg-gray-900/80 px-2 py-0.5 rounded font-mono">
              {value ? value.length.toLocaleString() + ' char' : '0 char'}
            </span>
          </div>
        </div>
      )}

      {/* ── Quill Visual Editor ──
          Pakai display:none bukan unmount agar instance Quill tetap hidup
          dan konten tidak ter-reset saat switch mode ── */}
      <div style={{ display: htmlMode ? 'none' : 'block' }}>
        <div ref={containerRef} />
      </div>

      <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const InputField = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
    {children}
  </div>
)

// ─── Source Combobox ──────────────────────────────────────────────────────────

const SourceCombobox = ({ sources, value, onChange }) => {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => { setQuery(value?.name || '') }, [value?.name])

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim()
    ? sources.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : sources

  const handleInput = (e) => {
    const text = e.target.value
    setQuery(text)
    setOpen(true)
    onChange({ id: null, name: text })
  }

  const handleSelect = (source) => {
    setQuery(source.name)
    onChange({ id: source.id, name: source.name })
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    onChange({ id: null, name: '' })
    inputRef.current?.focus()
  }

  const showAddNew = query.trim() && !sources.find(s => s.name.toLowerCase() === query.toLowerCase())

  return (
    <div ref={wrapRef} className="relative">
      <div className={`flex items-center gap-1 px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 transition ${
        open ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-600'
      }`}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Pilih atau ketik nama sumber baru..."
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
        />
        {query && (
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onClick={() => { setOpen(o => !o); inputRef.current?.focus() }}
          className="text-gray-400 flex-shrink-0">
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {showAddNew && (
            <button type="button"
              onClick={() => { onChange({ id: null, name: query.trim() }); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 border-b border-gray-100 dark:border-gray-700 text-left">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">+</span>
              <span>Tambah "<strong>{query.trim()}</strong>" sebagai sumber baru</span>
            </button>
          )}
          {filtered.length > 0 ? filtered.map(s => (
            <button key={s.id} type="button"
              onClick={() => handleSelect(s)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                value?.id === s.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}>
              <Newspaper className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
              {s.name}
              {s.location && <span className="text-xs text-gray-400 ml-auto">{s.location}</span>}
            </button>
          )) : !showAddNew && (
            <p className="px-3 py-3 text-sm text-gray-400 text-center">Belum ada sumber terdaftar</p>
          )}
        </div>
      )}

      {query && (
        <p className="text-xs mt-1 px-0.5">
          {value?.id
            ? <span className="text-green-600 dark:text-green-400">✓ Sumber terdaftar (ID: {value.id})</span>
            : <span className="text-amber-600 dark:text-amber-400">⚠ Sumber baru — akan ditambahkan otomatis</span>
          }
        </p>
      )}
    </div>
  )
}

// ─── Helper: ekstrak konten dari response backend ────────────────────────────
const extractContent = (a) =>
  a.bodyOriginal || a.bodyModern || a.htmlContent || a.content || ''

// ─── Main Page ────────────────────────────────────────────────────────────────

const NewspaperEditorPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const isAdmin   = user?.roles?.includes('ADMIN')
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving,  setSaving]  = useState(false)
  const [sources, setSources] = useState([])

  const [coverFile,    setCoverFile]    = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const coverRef = useRef()

  const [form, setForm] = useState({
    title:           '',
    subtitle:        '',
    slug:            '',
    category:        'nasional',
    publishDate:     new Date().toISOString().split('T')[0],
    source:          { id: null, name: '' },
    htmlContent:     '',
    author:          '',
    pageNumber:      '',
    importance:      'medium',
    parentArticleId: '',
    articleLevel:    0,
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target?.value ?? e }))

  const wordCount = form.htmlContent
    ? form.htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
    : 0

  const generateSlug = (title) => title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => {
    if (!isEditing) setForm(f => ({ ...f, slug: generateSlug(f.title) }))
  }, [form.title, isEditing])

  // ─── Load data saat mount ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isAdmin) { toast.error('Akses ditolak'); navigate('/dasbor'); return }

    api.get('/newspapers/sources', { params: { page: 1, limit: 100 } })
      .then(r => setSources(r.data?.data?.list || []))
      .catch(() => {})

    if (isEditing) {
      setLoading(true)
      api.get(`/newspapers/articles/${id}`)
        .then(r => {
          const a = r.data?.data
          if (!a) { toast.error('Data artikel tidak ditemukan'); return }

          const content = extractContent(a)

          setForm(f => ({
            ...f,
            title:       a.title       || '',
            subtitle:    a.subtitle    || '',
            slug:        a.slug        || '',
            category:    a.category    || 'nasional',
            publishDate: a.publishDate || f.publishDate,
            htmlContent: content,
            author:      a.author      || '',
            pageNumber:  a.pageNumber  ? String(a.pageNumber) : '',
            importance:  a.importance  || 'medium',
            source: {
              id:   a.sourceId   || null,
              name: a.sourceName || '',
            },
          }))
          if (a.imageUrl) setCoverPreview(a.imageUrl)
        })
        .catch(() => toast.error('Gagal memuat data artikel'))
        .finally(() => setLoading(false))
    }
  }, [id, isAdmin]) // eslint-disable-line

  // ─── Upload ───────────────────────────────────────────────────────────────

  const handleImageInsert = useCallback(async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/blog/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data?.data?.url || res.data?.url
      if (!url) throw new Error('URL tidak ada di response')
      return url
    } catch (err) {
      console.error('Gagal upload gambar:', err?.response?.data || err?.message)
      throw err
    }
  }, [])

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Maksimal 10MB'); return }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim())                            { toast.error('Judul wajib diisi'); return }
    if (!isEditing && !form.slug.trim())               { toast.error('Slug wajib diisi');  return }
    if (!form.category)                                { toast.error('Kategori wajib dipilih'); return }
    if (!form.publishDate)                             { toast.error('Tanggal wajib diisi'); return }
    if (!form.htmlContent || !form.htmlContent.trim()) { toast.error('Konten wajib diisi'); return }

    setSaving(true)
    const tid = toast.loading(isEditing ? 'Menyimpan perubahan...' : 'Membuat artikel...')
    try {
      let imageUrl = ''
      if (coverFile) {
        const uploaded = await handleImageInsert(coverFile)
        if (uploaded) imageUrl = uploaded
      }

      const plainContent = form.htmlContent.replace(/<[^>]*>/g, ' ').trim()

      if (isEditing) {
        await api.put(`/newspapers/articles/${id}`, {
          title:        form.title.trim(),
          subtitle:     form.subtitle.trim() || undefined,
          slug:         form.slug.trim() || undefined,
          content:      plainContent,
          htmlContent:  form.htmlContent,
          category:     form.category,
          publishDate:  form.publishDate,
          sourceId:     form.source.id   ? form.source.id   : undefined,
          sourceName:   !form.source.id  && form.source.name.trim() ? form.source.name.trim() : undefined,
          author:       form.author.trim() || undefined,
          pageNumber:   form.pageNumber ? parseInt(form.pageNumber) : undefined,
          importance:   form.importance,
          imageUrl:     imageUrl || undefined,
        })
        toast.success('Artikel berhasil diperbarui!', { id: tid })
        navigate('/dasbor/koran')
      } else {
        const res = await api.post('/newspapers', {
          title:           form.title.trim(),
          subtitle:        form.subtitle.trim() || undefined,
          slug:            form.slug.trim(),
          category:        form.category,
          publishDate:     form.publishDate,
          sourceId:        form.source.id   || undefined,
          sourceName:      !form.source.id && form.source.name.trim() ? form.source.name.trim() : undefined,
          content:         plainContent,
          htmlContent:     form.htmlContent,
          bodyOriginal:    form.htmlContent,
          bodyModern:      form.htmlContent,
          author:          form.author.trim() || undefined,
          pageNumber:      form.pageNumber ? parseInt(form.pageNumber) : undefined,
          importance:      form.importance,
          imageUrl:        imageUrl || undefined,
          parentArticleId: form.parentArticleId ? parseInt(form.parentArticleId) : undefined,
          articleLevel:    parseInt(form.articleLevel) || 0,
        })
        const created = res.data?.data
        toast.success('Artikel berhasil dibuat!', { id: tid })
        if (created?.category && created?.publishDate && created?.slug) {
          navigate(`/koran/${created.category}/${created.publishDate}/${created.slug}`)
        } else {
          navigate('/dasbor/koran')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Gagal menyimpan', { id: tid })
    } finally {
      setSaving(false)
    }
  }

  // ─── Guard ────────────────────────────────────────────────────────────────

  if (!isAdmin) return null
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data artikel...</p>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto pb-16">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dasbor/koran')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {isEditing ? 'Edit Artikel Koran' : 'Tambah Artikel Koran'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {wordCount > 0
                ? <span className="text-primary font-medium">
                    {wordCount.toLocaleString()} kata · ~{Math.max(1, Math.ceil(wordCount / 200))} mnt baca
                  </span>
                : <span>Semua field wajib bertanda <span className="text-red-500">*</span></span>
              }
            </p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : '📰 Terbitkan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── MAIN FORM ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title + Subtitle + Slug */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <InputField label="Judul Artikel" required>
              <input type="text" value={form.title} onChange={set('title')}
                placeholder="Masukkan judul berita..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-300 dark:placeholder-gray-600" />
            </InputField>

            <InputField label="Sub Judul" hint="Opsional — kalimat penjelas di bawah judul utama">
              <input type="text" value={form.subtitle} onChange={set('subtitle')}
                placeholder="Contoh: Pemerintah tegaskan kebijakan baru..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm italic focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-300 dark:placeholder-gray-600" />
              {form.subtitle && (
                <p className="text-xs text-gray-400 mt-1 pl-1">
                  Preview: <span className="italic text-gray-500 dark:text-gray-400">"{form.subtitle}"</span>
                </p>
              )}
            </InputField>

            <InputField
              label="Slug URL"
              required={!isEditing}
              hint={isEditing ? 'Ubah slug akan mengubah URL artikel' : 'Otomatis dari judul, bisa diedit manual'}>
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${
                isEditing
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  /koran/{form.category}/{form.publishDate}/
                </span>
                <input type="text" value={form.slug}
                  onChange={e => setForm(f => ({
                    ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                  }))}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm font-mono focus:outline-none min-w-0" />
              </div>
              {isEditing && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠ Mengubah slug akan membuat URL lama tidak valid
                </p>
              )}
            </InputField>
          </div>

          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gambar Cover</span>
                <span className="text-xs text-gray-400">(opsional)</span>
              </div>
              <span className="text-xs text-gray-400">Rekomendasi: 1200×630 px</span>
            </div>
            {coverPreview ? (
              <div className="relative group">
                <img src={coverPreview} alt="Cover" className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => coverRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                    <ImagePlus className="w-4 h-4" />Ganti
                  </button>
                  <button onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
                    <X className="w-4 h-4" />Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => coverRef.current?.click()}
                className="w-full h-36 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary/10 transition">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Klik untuk upload gambar cover</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP · Maks 10MB</span>
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Konten Artikel <span className="text-red-500">*</span>
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                Rich Text Editor
              </span>
            </div>
            <div className="p-3">
              <RichEditor
                value={form.htmlContent}
                onChange={(html) => setForm(f => ({ ...f, htmlContent: html }))}
                onImageInsert={handleImageInsert}
              />
              <p className="text-xs text-gray-400 mt-2 px-1">
                💡 Klik 🖼 di toolbar untuk sisipkan gambar · 💬 blockquote · &lt;/&gt; kode · Atau klik <strong>HTML Mode</strong> untuk edit raw HTML
              </p>
            </div>
          </div>

          {/* Hierarchy — hanya create */}
          {!isEditing && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Hierarki Artikel</h3>
                <span className="text-xs text-gray-400">(opsional — untuk artikel turunan)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="ID Artikel Induk" hint="Untuk sub-artikel">
                  <input type="number" value={form.parentArticleId} onChange={set('parentArticleId')}
                    placeholder="ID artikel utama"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </InputField>
                <InputField label="Level Artikel" hint="0 = utama, 1 = sub, dst">
                  <input type="number" min="0" max="5" value={form.articleLevel} onChange={set('articleLevel')}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </InputField>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />Pengaturan Publikasi
            </h3>
            <InputField label="Kategori" required>
              <select value={form.category} onChange={set('category')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </InputField>
            <InputField label="Tanggal Terbit" required>
              <input type="date" value={form.publishDate} onChange={set('publishDate')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </InputField>
            <InputField label="Prioritas">
              <div className="space-y-2">
                {IMPORTANCE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm(f => ({ ...f, importance: opt.value }))}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left border transition ${
                      form.importance === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs opacity-60 ml-auto">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </InputField>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-primary" />Sumber & Penulis
            </h3>
            <InputField label="Sumber Koran">
              <SourceCombobox
                sources={sources}
                value={form.source}
                onChange={(src) => setForm(f => ({ ...f, source: src }))}
              />
            </InputField>
            <InputField label="Penulis" hint="Opsional">
              <input type="text" value={form.author} onChange={set('author')}
                placeholder="Nama jurnalis/penulis"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </InputField>
            <InputField label="Nomor Halaman" hint="Opsional">
              <input type="number" min="1" value={form.pageNumber} onChange={set('pageNumber')}
                placeholder="Contoh: 1"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </InputField>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : isEditing ? '💾 Simpan Perubahan' : '📰 Buat Artikel'}
          </button>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold">Tips Editor:</p>
                <p>🖼 <strong>Gambar inline</strong> — klik ikon gambar di toolbar</p>
                <p>💬 <strong>Kutipan</strong> — gunakan blockquote untuk highlight</p>
                <p>⌨️ <strong>Ctrl+Z</strong> undo · <strong>Ctrl+Y</strong> redo</p>
                <p>🖥 <strong>HTML Mode</strong> — klik tombol di atas editor untuk edit raw HTML</p>
                <p>📸 Cover di-upload otomatis saat simpan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewspaperEditorPage