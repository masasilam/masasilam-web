// src/pages/dashboard/BlogEditorPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, Eye, EyeOff, ArrowLeft, ImagePlus, Tag, Folder,
  Calendar, Info, Loader2, X, Plus, Globe, FileText, Clock,
  Code, BookOpen, Minus, Type, Check, Copy, Newspaper,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'DRAFT',     label: 'Draft',     desc: 'Belum dipublikasikan',      icon: FileText, cls: 'text-gray-500'  },
  { value: 'PUBLISHED', label: 'Terbitkan', desc: 'Langsung publik',            icon: Globe,    cls: 'text-green-500' },
  { value: 'SCHEDULED', label: 'Jadwalkan', desc: 'Terbit pada waktu tertentu', icon: Calendar, cls: 'text-blue-500'  },
]

// ─── EPUB Scoped CSS (sama persis dengan NewspaperEditorPage) ─────────────────

const EPUB_SCOPED_CSS = `
  [data-epub] p {
    margin-top: 0; margin-bottom: 0;
    text-indent: 1.5em !important; text-align: justify;
    -webkit-hyphens: auto !important; -moz-hyphens: auto !important;
    hyphens: auto !important; word-wrap: break-word !important;
    overflow-wrap: break-word !important; line-height: inherit !important;
  }
  [data-epub] blockquote, [data-epub] li, [data-epub] td, [data-epub] th {
    -webkit-hyphens: auto !important; hyphens: auto !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
  }
  [data-epub] p:first-child { text-indent: 0 !important; margin-top: 0 !important; }
  [data-epub] h1 + p, [data-epub] h2 + p, [data-epub] h3 + p,
  [data-epub] h4 + p, [data-epub] h5 + p, [data-epub] h6 + p,
  [data-epub] .first-paragraph { text-indent: 0 !important; margin-top: 2em !important; }
  [data-epub] h1, [data-epub] h2, [data-epub] h3,
  [data-epub] h4, [data-epub] h5, [data-epub] h6 {
    font-family: inherit !important; text-align: center !important;
    margin: 2.5em 0 0.25em 0 !important; hyphens: none !important;
  }
  [data-epub] h1 { font-size: 1.5em !important; font-weight: 700 !important; }
  [data-epub] h2 { font-size: 1.3em !important; }
  [data-epub] h3 { font-size: 1.2em !important; }
  [data-epub] p.separator, [data-epub] p.ornament, [data-epub] p.divider {
    text-align: center !important; text-indent: 0 !important; margin: 2em 0 !important;
  }
  [data-epub] blockquote {
    margin: 0.25em 0 !important; padding: 0 0.25em !important;
    border-left: 3px solid #ccc !important; font-style: italic !important;
  }
  [data-epub] blockquote p     { text-indent: 0 !important; }
  [data-epub] blockquote p + p { text-indent: 1.5em !important; }
  [data-epub] .letter {
    margin: 3em auto !important; padding: 2em !important;
    border: 1px solid #ccc !important; border-radius: 8px !important;
    max-width: 36em !important; line-height: 1.6 !important;
  }
  [data-epub] .letter p          { margin: 0; text-indent: 0 !important; }
  [data-epub] .letter .body      { text-indent: 1.5em !important; }
  [data-epub] .letter .date,
  [data-epub] .letter .closing   { text-align: right !important; font-style: italic !important; }
  [data-epub] .letter .signature { text-align: right !important; font-weight: 600 !important; }
  [data-epub] .letter .salutation { font-weight: 500 !important; }
  [data-epub] .poem {
    margin: 2em 0 !important; text-align: left !important;
    text-indent: 0 !important; line-height: 1.4 !important; hyphens: none !important;
  }
  [data-epub] .poem p, [data-epub] .poem div, [data-epub] .poem span {
    text-align: left !important; text-indent: 0 !important; margin: 0 !important; hyphens: none !important;
  }
  [data-epub] .poem p:last-child { text-align: right !important; font-style: italic !important; margin-top: 2em !important; }
  [data-epub] .indent            { margin-left: 2em !important; }
  [data-epub] .epigraph          { font-style: italic !important; text-align: center !important; margin: 3em auto !important; hyphens: none !important; }
  [data-epub] .epigraph p        { text-indent: 0 !important; text-align: center !important; }
  [data-epub] .epigraph cite     { display: block !important; text-align: right !important; font-style: normal !important; }
  [data-epub] .subtitle          { font-size: 1.1em !important; text-align: center !important; margin: 1.5em 0 !important; text-indent: 0 !important; }
  [data-epub] .info-box          { padding: 0.5em 1em !important; margin: 1.5em 0 !important; background-color: #f8f8f8 !important; border: 1px solid #ddd !important; border-radius: 6px !important; }
  [data-epub] .info-box p        { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .note              { margin: 2.5em 0 1.5em 0 !important; padding-top: 1em !important; position: relative !important; font-size: 0.9em !important; border-top: 1px solid #999 !important; }
  [data-epub] .note p            { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .scene-break       { text-align: center !important; margin: 2em 0 !important; letter-spacing: 0.3em !important; }
  [data-epub] .scene-break::before { content: "⁂" !important; }
  [data-epub] ul.dash-list       { list-style: none !important; padding-left: 1.5em !important; }
  [data-epub] ul.dash-list li::before { content: "– " !important; }
  [data-epub] .smallcaps         { font-variant: small-caps !important; }
  [data-epub] .uppercase         { text-transform: uppercase !important; }
  [data-epub] img                { max-width: 100% !important; height: auto !important; display: block !important; margin: 0 auto !important; }
  [data-epub] .image-with-caption { margin: 2em auto !important; text-align: center !important; }
  [data-epub] .image-caption     { text-align: center !important; font-size: 0.9em !important; margin-top: 0.5em !important; }
  [data-epub] .image-small       { max-width: 120px !important; margin: 1em auto !important; }
  [data-epub] .image-medium      { max-width: 200px !important; margin: 1em auto !important; }
  [data-epub] .image-left        { float: left !important; margin: 0 0.5em 0.25em 0 !important; max-width: 45% !important; }
  [data-epub] .image-right       { float: right !important; margin: 0 0 0.25em 0.5em !important; max-width: 45% !important; }
`

// ─── Visual Viewer Settings ───────────────────────────────────────────────────

const FONT_SIZES = [
  { label: 'XS',  value: '0.82rem' },
  { label: 'S',   value: '0.92rem' },
  { label: 'M',   value: '1rem'    },
  { label: 'L',   value: '1.1rem'  },
  { label: 'XL',  value: '1.2rem'  },
  { label: 'XXL', value: '1.35rem' },
]

const FONT_FAMILIES = [
  { key: 'garamond', label: 'Garamond', stack: '"Minion Pro","Adobe Garamond Pro","Garamond","Times New Roman","Liberation Serif",serif' },
  { key: 'georgia',  label: 'Georgia',  stack: 'Georgia,"Times New Roman",serif' },
  { key: 'times',    label: 'Times',    stack: '"Times New Roman",Times,serif' },
  { key: 'palatino', label: 'Palatino', stack: '"Palatino Linotype","Book Antiqua",Palatino,serif' },
  { key: 'system',   label: 'Sans',     stack: 'ui-sans-serif,system-ui,-apple-system,sans-serif' },
]

const READ_MODES = [
  { key: 'light', label: 'Terang', bg: '#ffffff', color: '#111111', cardBg: '#f9fafb', border: '#e5e7eb' },
  { key: 'sepia', label: 'Sepia',  bg: '#f5f0e8', color: '#3b2d1f', cardBg: '#ede8de', border: '#d6c9b0' },
  { key: 'dark',  label: 'Gelap',  bg: '#1a1a2e', color: '#ffffff', cardBg: '#16213e', border: '#2d2d4e' },
]

// ─── EPUB Reference Data ──────────────────────────────────────────────────────

const EPUB_REFERENCE = [
  {
    category: '📝 Paragraf & Teks',
    items: [
      {
        label: 'Paragraf biasa',
        desc:  'Paragraf 1 tanpa indent. Paragraf 2+ indent 1.5em otomatis.',
        html:  '<p>Paragraf pertama — tanpa indentasi otomatis.</p>\n<p>Paragraf kedua — indentasi 1.5em otomatis.</p>\n<p>Paragraf ketiga — sama.</p>',
      },
      {
        label: 'Paragraf rata kanan',
        desc:  'inline style text-align: right tidak dioverride',
        html:  '<p style="text-align: right; margin-top: 2em;">Hormat kami,<br/>\nRedaksi</p>',
      },
      {
        label: 'Paragraf rata tengah',
        desc:  'inline style text-align: center',
        html:  '<p style="text-align: center;">Teks rata tengah</p>',
      },
      {
        label: '.first-paragraph',
        desc:  'Paksa tanpa indent di mana saja',
        html:  '<p class="first-paragraph">Paragraf tanpa indentasi meski bukan paragraf pertama.</p>',
      },
      {
        label: 'Separator (p.separator)',
        desc:  'Pemisah bagian',
        html:  '<p class="separator">* * *</p>',
      },
      {
        label: 'Scene break (⁂)',
        desc:  'Simbol ⁂ otomatis',
        html:  '<div class="scene-break"></div>',
      },
      {
        label: 'Small caps',
        desc:  'Huruf kapital kecil',
        html:  '<p>Diterbitkan oleh <span class="smallcaps">Penerbit Nusantara</span>.</p>',
      },
    ],
  },
  {
    category: '💬 Kutipan & Epigraf',
    items: [
      {
        label: 'Blockquote',
        desc:  'Kutipan panjang dengan garis kiri',
        html:  '<blockquote>\n  <p>Teks yang dikutip dari sumber lain.</p>\n  <p>Paragraf kedua dalam kutipan.</p>\n</blockquote>',
      },
      {
        label: 'Epigraf',
        desc:  'Kutipan pendek di awal artikel',
        html:  '<div class="epigraph">\n  <p>Satu kata mengandung seribu makna.</p>\n  <cite>— Pujangga Besar, 1900</cite>\n</div>',
      },
    ],
  },
  {
    category: '✉️ Format Surat (.letter)',
    items: [
      {
        label: 'Surat lengkap',
        desc:  'Kotak surat dengan tanggal, salam, isi, penutup',
        html:  '<div class="letter">\n  <p class="date">Jakarta, 1 Januari 2025</p>\n  <p class="salutation">Kepada Yth. Pembaca,</p>\n  <p class="body">Isi surat pertama tanpa indentasi.</p>\n  <p class="body">Paragraf isi berikutnya dengan indentasi.</p>\n  <p class="closing">Dengan segala hormat,</p>\n  <p class="signature">Redaksi</p>\n</div>',
      },
    ],
  },
  {
    category: '🎭 Puisi (.poem)',
    items: [
      {
        label: 'Puisi lengkap',
        desc:  'Judul, penulis, baris-baris',
        html:  '<div class="poem">\n  <h3>Judul Sajak</h3>\n  <p class="author">Nama Penyair</p>\n  <div>\n    <span>Baris pertama sajak ini</span>\n    <span>Baris kedua sajak ini</span>\n  </div>\n  <p>— Sumber, Tahun</p>\n</div>',
      },
    ],
  },
  {
    category: '📦 Kotak & Catatan',
    items: [
      {
        label: 'Info-box',
        desc:  'Kotak abu-abu untuk catatan editorial',
        html:  '<div class="info-box">\n  <p><strong>Catatan:</strong> Teks catatan penting di sini.</p>\n  <p>Baris kedua catatan.</p>\n</div>',
      },
      {
        label: 'Note / Catatan kaki',
        desc:  'Catatan kaki dengan garis pemisah otomatis',
        html:  '<div class="note">\n  <p><strong>¹</strong> Keterangan catatan pertama.</p>\n  <p><strong>²</strong> Keterangan catatan kedua.</p>\n</div>',
      },
    ],
  },
  {
    category: '🖼 Gambar',
    items: [
      {
        label: 'Gambar dengan caption',
        desc:  'Gambar + keterangan di bawah',
        html:  '<div class="image-with-caption">\n  <img src="URL_GAMBAR" alt="Deskripsi" />\n  <p class="image-caption">Keterangan gambar.</p>\n</div>',
      },
      {
        label: 'Gambar kecil (120px)',
        desc:  'Ornamen atau logo kecil',
        html:  '<img src="URL_GAMBAR" alt="" class="image-small" />',
      },
      {
        label: 'Gambar melayang kiri',
        desc:  'Teks mengalir di kanannya',
        html:  '<img src="URL_GAMBAR" alt="" class="image-left" />\n<p>Teks di sebelah kanan gambar.</p>',
      },
    ],
  },
  {
    category: '📋 Daftar',
    items: [
      {
        label: 'Daftar angka (1, 2, 3)',
        desc:  'Ordered list biasa',
        html:  '<ol>\n  <li>Butir pertama</li>\n  <li>Butir kedua</li>\n</ol>',
      },
      {
        label: 'Daftar strip (—)',
        desc:  'Unordered list dengan dash',
        html:  '<ul class="dash-list">\n  <li>Butir pertama</li>\n  <li>Butir kedua</li>\n</ul>',
      },
    ],
  },
  {
    category: '📐 Tabel',
    items: [
      {
        label: 'Tabel sederhana',
        desc:  'Tabel dengan border dan header',
        html:  '<table>\n  <tr><th>Kolom A</th><th>Kolom B</th></tr>\n  <tr><td>Data 1</td><td>Data 2</td></tr>\n</table>',
      },
    ],
  },
]

// ─── CopyButton ───────────────────────────────────────────────────────────────

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
        copied
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Disalin!' : 'Salin'}
    </button>
  )
}

// ─── Reference Panel ──────────────────────────────────────────────────────────

const ReferencePanel = ({ onInsert }) => {
  const [openCat, setOpenCat] = useState(null)
  return (
    <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 px-1">
        Klik <strong>Sisip</strong> untuk langsung menambahkan ke editor HTML.
      </p>
      {EPUB_REFERENCE.map((cat) => (
        <div key={cat.category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenCat(openCat === cat.category ? null : cat.category)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <span>{cat.category}</span>
            <span className="text-xs font-normal text-gray-400">{cat.items.length} item</span>
          </button>
          {openCat === cat.category && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {cat.items.map((item) => (
                <div key={item.label} className="px-4 py-3 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <CopyButton text={item.html} />
                      <button onClick={() => onInsert(item.html)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition">
                        <Code className="w-3 h-3" />Sisip
                      </button>
                    </div>
                  </div>
                  <pre className="mt-2 px-3 py-2 bg-gray-950 text-green-400 rounded text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {item.html}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Visual View ──────────────────────────────────────────────────────────────

const VisualView = ({ html }) => {
  const ref    = useRef(null)
  const [fontIdx, setFontIdx] = useState(2)
  const [fontKey, setFontKey] = useState('garamond')
  const [modeKey, setModeKey] = useState('light')

  const mode       = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]
  const fontSize   = FONT_SIZES[fontIdx].value
  const fontFamily = (FONT_FAMILIES.find(f => f.key === fontKey) || FONT_FAMILIES[0]).stack

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || ''
  }, [html])

  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ background: mode.bg }}>
        <Eye className="w-10 h-10 opacity-20" style={{ color: mode.color }} />
        <p className="text-sm opacity-40" style={{ color: mode.color }}>Tulis HTML lalu lihat di sini</p>
      </div>
    )
  }

  return (
    <div style={{ background: mode.bg }}>
      <style>{EPUB_SCOPED_CSS}</style>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap"
        style={{ borderBottom: `1px solid ${mode.border}`, background: mode.cardBg }}>
        <div className="flex items-center gap-1">
          <Type className="w-3 h-3 opacity-40" style={{ color: mode.color }} />
          <button onClick={() => setFontIdx(i => Math.max(0, i - 1))} disabled={fontIdx === 0}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 disabled:opacity-25"
            style={{ color: mode.color }}><Minus className="w-3 h-3" /></button>
          <span className="text-xs font-mono w-7 text-center" style={{ color: mode.color, opacity: 0.7 }}>
            {FONT_SIZES[fontIdx].label}
          </span>
          <button onClick={() => setFontIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))} disabled={fontIdx === FONT_SIZES.length - 1}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 disabled:opacity-25"
            style={{ color: mode.color }}><Plus className="w-3 h-3" /></button>
        </div>
        <div className="w-px h-4" style={{ background: mode.border }} />
        <div className="flex items-center gap-1 flex-wrap">
          {FONT_FAMILIES.map(f => (
            <button key={f.key} onClick={() => setFontKey(f.key)}
              className="px-2 py-0.5 rounded text-xs border transition"
              style={{
                fontFamily:  f.stack,
                borderColor: fontKey === f.key ? '#10b981' : mode.border,
                background:  fontKey === f.key ? '#10b981' : 'transparent',
                color:       fontKey === f.key ? '#ffffff' : mode.color,
              }}>{f.label}</button>
          ))}
        </div>
        <div className="w-px h-4" style={{ background: mode.border }} />
        <div className="flex items-center gap-1.5">
          {READ_MODES.map(m => (
            <button key={m.key} onClick={() => setModeKey(m.key)} title={m.label}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                background:  m.bg,
                borderColor: modeKey === m.key ? '#10b981' : m.border,
                transform:   modeKey === m.key ? 'scale(1.25)' : 'scale(1)',
              }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={ref} data-epub lang="id"
        style={{
          fontFamily, fontSize, lineHeight: 1.7,
          color: mode.color, backgroundColor: mode.bg,
          margin: '0 auto', padding: '1.5em 1.25em', maxWidth: '42em',
          transition: 'background-color 0.2s, color 0.2s, font-size 0.15s',
        }}
      />
    </div>
  )
}

// ─── Content Editor ───────────────────────────────────────────────────────────

const ContentEditor = ({ value, onChange, onImageUpload }) => {
  const [tab, setTab]             = useState('html')
  const textareaRef               = useRef(null)
  const fileInputRef              = useRef(null)
  const [uploading, setUploading] = useState(false)

  const insertAtCursor = useCallback((before, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start  = ta.selectionStart
    const end    = ta.selectionEnd
    const sel    = value.substring(start, end)
    const newVal = value.substring(0, start) + before + sel + after + value.substring(end)
    onChange(newVal)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    })
  }, [value, onChange])

  const handleInsertSnippet = useCallback((snippet) => {
    const newVal = value ? value + '\n' + snippet : snippet
    onChange(newVal)
    setTab('html')
    toast.success('Snippet disisipkan!')
  }, [value, onChange])

  const handleWrapParagraphs = useCallback(() => {
    const wrapped = value
      .split(/\n\n+/)
      .map(block => block.trim())
      .filter(Boolean)
      .map(block => block.startsWith('<') ? block : `<p>${block}</p>`)
      .join('\n')
    onChange(wrapped)
    toast.success('Teks di-wrap ke <p>')
  }, [value, onChange])

  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus gambar'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Maks 10MB'); return }
    setUploading(true)
    const tid = toast.loading('Mengupload gambar...')
    try {
      const url = await onImageUpload(file)
      if (url) {
        insertAtCursor(`<img src="${url}" alt="" />`)
        toast.success('Gambar berhasil disisipkan!', { id: tid })
      } else {
        toast.error('Gagal upload', { id: tid })
      }
    } catch (err) {
      toast.error('Gagal: ' + (err?.message || ''), { id: tid })
    } finally { setUploading(false) }
  }, [onImageUpload, insertAtCursor])

  const TAG_SHORTCUTS = [
    { label: '<p>',          action: () => insertAtCursor('<p>', '</p>') },
    { label: '<h2>',         action: () => insertAtCursor('<h2>', '</h2>') },
    { label: '<h3>',         action: () => insertAtCursor('<h3>', '</h3>') },
    { label: '<strong>',     action: () => insertAtCursor('<strong>', '</strong>') },
    { label: '<em>',         action: () => insertAtCursor('<em>', '</em>') },
    { label: '<br/>',        action: () => insertAtCursor('<br/>') },
    { label: '<a>',          action: () => insertAtCursor('<a href="">', '</a>') },
    { label: '<blockquote>', action: () => insertAtCursor('<blockquote>\n', '\n</blockquote>') },
    { label: '.info-box',    action: () => insertAtCursor('<div class="info-box">\n', '\n</div>') },
    { label: '.note',        action: () => insertAtCursor('<div class="note">\n', '\n</div>') },
    { label: '.separator',   action: () => insertAtCursor('<p class="separator">* * *</p>') },
    { label: '.poem',        action: () => insertAtCursor('<div class="poem">\n', '\n</div>') },
    { label: '🖼 img',       action: () => fileInputRef.current?.click(), uploading },
    { label: '⇒ <p>',        action: handleWrapParagraphs, title: 'Wrap teks polos menjadi <p>' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {[
          { key: 'html',   icon: <Code className="w-4 h-4" />,     label: 'HTML'      },
          { key: 'visual', icon: <Eye className="w-4 h-4" />,      label: 'Visual'    },
          { key: 'ref',    icon: <BookOpen className="w-4 h-4" />, label: 'Referensi' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
        <div className="ml-auto px-4 flex items-center gap-2">
          {tab === 'html' && (
            <span className="text-xs text-gray-400 font-mono">{(value?.length || 0).toLocaleString()} chr</span>
          )}
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            {tab === 'html' ? 'Editor HTML' : tab === 'visual' ? 'Preview Publik' : 'Panduan Class'}
          </span>
        </div>
      </div>

      {/* HTML Tab */}
      {tab === 'html' && (
        <div>
          {/* Shortcut bar */}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            {TAG_SHORTCUTS.map(({ label, action, title: hint, uploading: upl }) => (
              <button key={label} type="button" onClick={action} title={hint || label} disabled={!!upl}
                className="px-2 py-1 rounded text-xs font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition disabled:opacity-50">
                {upl ? <Loader2 className="w-3 h-3 animate-spin inline" /> : label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            placeholder={'<p>Paragraf pertama — tanpa indent (p:first-child).</p>\n<p>Paragraf kedua — indent 1.5em otomatis.</p>\n<p style="text-align: right; margin-top: 2em;">Rata kanan — inline style tidak dioverride.</p>'}
            className="w-full min-h-[520px] px-4 py-3 bg-gray-950 text-green-300 font-mono text-sm leading-relaxed focus:outline-none resize-y placeholder-gray-700"
            style={{ fontFamily: '"Fira Code","Cascadia Code","Consolas","Courier New",monospace' }}
          />
          <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
            💡 Tab <strong>Visual</strong> untuk cek tampilan · Tab <strong>Referensi</strong> untuk semua class · 🖼 upload gambar via tombol img di atas
          </p>
        </div>
      )}

      {tab === 'visual' && <VisualView html={value} />}
      {tab === 'ref'    && <ReferencePanel onInsert={handleInsertSnippet} />}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BlogEditorPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const isAdmin   = user?.roles?.includes('ADMIN')
  const isEditing = !!id

  const [loading,     setLoading]     = useState(isEditing)
  const [saving,      setSaving]      = useState(false)
  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [excerpt,     setExcerpt]     = useState('')
  const [status,      setStatus]      = useState('DRAFT')
  const [scheduled,   setScheduled]   = useState('')
  const [tags,        setTags]        = useState([])
  const [tagInput,    setTagInput]    = useState('')
  const [catIds,      setCatIds]      = useState([])
  const [cats,        setCats]        = useState([])
  const [featFile,    setFeatFile]    = useState(null)
  const [featPreview, setFeatPreview] = useState(null)

  const featRef = useRef()

  // Set lang="id" agar browser memuat kamus hyphenation Indonesia
  useEffect(() => {
    const prevLang = document.documentElement.lang
    document.documentElement.lang = 'id'
    return () => { document.documentElement.lang = prevLang }
  }, [])

  const wordCount = content
    ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
    : 0

  const slugPreview = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => {
    if (!isAdmin) { toast.error('Akses ditolak'); navigate('/dasbor') }
    fetchCategories()
    if (isEditing) fetchPost()
  }, [id]) // eslint-disable-line

  const fetchCategories = async () => {
    try { setCats((await api.get('/blog/categories')).data?.data || []) }
    catch { /* ignore */ }
  }

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/blog/admin/${id}`)
      applyPost(res.data?.data)
    } catch {
      try {
        const res   = await api.get('/blog/my-posts', { params: { page: 1, limit: 100 } })
        const found = (res.data?.data?.list || res.data?.data?.data || []).find(p => String(p.id) === String(id))
        if (found) {
          applyPost(found)
          if (!found.content) toast('Konten tidak termuat penuh — coba refresh', { icon: '⚠️' })
        } else {
          toast.error('Artikel tidak ditemukan'); navigate('/dasbor/blog')
        }
      } catch { toast.error('Gagal memuat artikel'); navigate('/dasbor/blog') }
    } finally { setLoading(false) }
  }

  const applyPost = (post) => {
    if (!post) return
    setTitle(post.title || '')
    setExcerpt(post.excerpt || '')
    setStatus(post.status || 'DRAFT')
    if (post.content) setContent(post.content)
    if (post.featuredImage) setFeatPreview(post.featuredImage)
    if (post.tags) {
      setTags(post.tags.includes(':')
        ? post.tags.split('|').map(t => t.split(':')[1]).filter(Boolean)
        : post.tags.split(',').map(t => t.trim()).filter(Boolean))
    }
    if (post.categories) {
      setCatIds(post.categories.split('|').map(c => Number(c.split(':')[0])).filter(Boolean))
    }
  }

  const handleFeatured = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return }
    setFeatFile(file)
    setFeatPreview(URL.createObjectURL(file))
  }

  // Dipakai oleh ContentEditor untuk upload gambar inline
  const handleImageUpload = useCallback(async (file) => {
    const form = new FormData()
    form.append('image', file)
    if (id) form.append('postId', id)
    const res = await api.post('/blog/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const url = res.data?.data?.url || res.data?.url
    if (!url) throw new Error('URL tidak ada di response')
    return url
  }, [id])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 20) setTags(p => [...p, t])
    setTagInput('')
  }

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Judul tidak boleh kosong'); return }
    if (!content || !content.replace(/<[^>]*>/g, '').trim()) { toast.error('Konten tidak boleh kosong'); return }
    if (status === 'SCHEDULED' && !scheduled) { toast.error('Pilih waktu terbit'); return }

    if (content.includes('blob:')) {
      if (!window.confirm('⚠️ Konten mengandung gambar sementara (blob) yang bisa hilang.\nLanjutkan?')) return
    }

    setSaving(true)
    const tid = toast.loading(isEditing ? 'Menyimpan...' : 'Membuat artikel...')
    try {
      const payload = {
        title:       title.trim(),
        content,
        excerpt:     excerpt.trim() || undefined,
        status,
        tags,
        categoryIds: catIds,
        bookIds:     [],
        scheduledAt: status === 'SCHEDULED' && scheduled ? scheduled : undefined,
      }
      const form = new FormData()
      form.append('blogPost', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      if (featFile) form.append('images', featFile)

      const opts = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (isEditing) {
        await api.put(`/blog/${id}`, form, opts)
        toast.success('Artikel berhasil diperbarui!', { id: tid })
      } else {
        const res     = await api.post('/blog', form, opts)
        const newSlug = res.data?.data?.slug
        if (status === 'PUBLISHED' && newSlug) {
          toast.success('Artikel berhasil diterbitkan!', { id: tid })
          navigate(`/blog/${newSlug}`)
        } else {
          toast.success(
            status === 'SCHEDULED' ? 'Artikel berhasil dijadwalkan!' : 'Draft berhasil disimpan!',
            { id: tid }
          )
          navigate('/dasbor/blog')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Gagal menyimpan', { id: tid })
    } finally { setSaving(false) }
  }

  if (!isAdmin) return null
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat artikel...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto pb-16">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dasbor/blog')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {wordCount > 0
                ? <span className="text-primary font-medium">{wordCount.toLocaleString()} kata · ~{Math.max(1, Math.ceil(wordCount / 200))} mnt baca</span>
                : 'Mulai menulis'}
            </p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : status === 'PUBLISHED' ? 'Terbitkan' : 'Simpan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── EDITOR AREA ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Judul artikel..."
              className="w-full text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 leading-tight" />
            {title && (
              <p className="text-xs text-gray-400 mt-2 font-mono flex items-center gap-1">
                <Globe className="w-3 h-3" />/blog/<span className="text-primary">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gambar Cover</span>
              </div>
              <span className="text-xs text-gray-400">Rekomendasi: 1200×630 px</span>
            </div>
            {featPreview ? (
              <div className="relative group">
                <img src={featPreview} alt="Cover" className="w-full h-60 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => featRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                    <ImagePlus className="w-4 h-4" />Ganti
                  </button>
                  <button onClick={() => { setFeatFile(null); setFeatPreview(null) }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
                    <X className="w-4 h-4" />Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => featRef.current?.click()}
                className="w-full h-40 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary/10 transition">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Klik untuk upload gambar cover</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP · Maks 10MB</span>
              </button>
            )}
            <input ref={featRef} type="file" accept="image/*" className="hidden" onChange={handleFeatured} />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Ringkasan <span className="text-gray-400 font-normal">— tampil di kartu artikel</span>
            </label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="Jika kosong, otomatis diambil dari awal konten..."
              rows={3} maxLength={300}
              className="w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none resize-none focus:ring-2 focus:ring-primary/50 placeholder-gray-300 dark:placeholder-gray-600 transition" />
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${excerpt.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                {excerpt.length}/300
              </span>
            </div>
          </div>

          {/* Content Editor — sama dengan newspaper */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Konten Artikel <span className="text-red-500">*</span>
            </label>
            <ContentEditor
              value={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">

          {/* Status & Publish */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />Status Publikasi
            </h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(({ value, label, desc, icon: Icon, cls }) => (
                <button key={value} onClick={() => setStatus(value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                    status === value
                      ? 'bg-primary/10 border-2 border-primary text-primary'
                      : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${status === value ? 'text-primary' : cls}`} />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs font-normal opacity-70">{desc}</div>
                  </div>
                  {status === value && <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </button>
              ))}
            </div>

            {status === 'SCHEDULED' && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />Jadwal Terbit
                </label>
                <input type="datetime-local" value={scheduled} onChange={e => setScheduled(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : status === 'PUBLISHED' ? '🚀 Terbitkan Artikel' : '💾 Simpan Draft'}
            </button>
          </div>

          {/* Categories */}
          {cats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />Kategori
              </h3>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {cats.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1.5 rounded-lg transition group">
                    <input type="checkbox" checked={catIds.includes(cat.id)}
                      onChange={() => setCatIds(p => p.includes(cat.id) ? p.filter(c => c !== cat.id) : [...p, cat.id])}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />Tags
            </h3>
            <p className="text-xs text-gray-400 mb-3">Membantu SEO & penemuan artikel · Maks 20</p>
            <div className="flex gap-2 mb-3">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Ketik tag, tekan Enter..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400 dark:placeholder-gray-500" />
              <button onClick={addTag} disabled={!tagInput.trim() || tags.length >= 20}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-40">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-8">
              {tags.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada tag.</p>}
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                  #{tag}
                  <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="opacity-60 hover:opacity-100 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1.5">Alur Kerja Editor:</p>
                <p>1️⃣ <strong>HTML</strong> — tulis atau paste konten</p>
                <p>2️⃣ <strong>Visual</strong> — cek tampilan akhir artikel</p>
                <p>3️⃣ <strong>Referensi</strong> — semua class epub tersedia</p>
                <p className="mt-1.5 border-t border-blue-200 dark:border-blue-700 pt-1.5">
                  📌 <code>p:first-child</code> = tanpa indent<br/>
                  📌 Inline style tidak dioverride<br/>
                  🖼 Klik <strong>img</strong> di toolbar untuk upload
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BlogEditorPage