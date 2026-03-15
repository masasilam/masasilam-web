// src/pages/dashboard/NewspaperEditorPage.jsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, FileText, Globe,
  Newspaper, AlertCircle, ImagePlus, X, Tag,
  Code, Eye, Minus, Plus, Type, BookOpen, Copy, Check
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'
import '../../styles/epub-styles.css'

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

// ─── EPUB SCOPED CSS — sama persis dengan NewspaperArticleDetailPage ──────────

const EPUB_SCOPED_CSS = `
  [data-epub] p {
    margin-top: 0;
    margin-bottom: 0;
    text-indent: 1.5em !important;
    text-align: justify;
    -webkit-hyphens: auto !important;
    -moz-hyphens: auto !important;
    -ms-hyphens: auto !important;
    hyphens: auto !important;
    -webkit-hyphenate-limit-before: 2 !important;
    -webkit-hyphenate-limit-after: 2 !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-lines: 2 !important;
    -webkit-hyphenate-limit-zone: 8% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    line-height: inherit !important;
  }
  [data-epub] blockquote, [data-epub] li, [data-epub] td, [data-epub] th {
    -webkit-hyphens: auto !important;
    -moz-hyphens: auto !important;
    hyphens: auto !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  [data-epub] p:first-child {
    text-indent: 0 !important;
    margin-top: 0 !important;
  }
  [data-epub] h1 + p, [data-epub] h2 + p, [data-epub] h3 + p,
  [data-epub] h4 + p, [data-epub] h5 + p, [data-epub] h6 + p,
  [data-epub] .first-paragraph {
    text-indent: 0 !important;
    margin-top: 2em !important;
  }
  [data-epub] h1, [data-epub] h2, [data-epub] h3,
  [data-epub] h4, [data-epub] h5, [data-epub] h6 {
    font-family: inherit !important;
    text-align: center !important;
    margin: 2.5em 0 0.25em 0 !important;
    hyphens: none !important;
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

// ─── Epub Class Reference ─────────────────────────────────────────────────────

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
        html:  '<p style="text-align: right; margin-top: 2em;">Dengan segala hormat,<br/>\nN. V. Medan Priyayi</p>',
      },
      {
        label: 'Paragraf rata tengah',
        desc:  'inline style text-align: center',
        html:  '<p style="text-align: center;">Teks rata tengah</p>',
      },
      {
        label: 'Paragraf dengan margin atas',
        desc:  'inline style margin-top tidak dioverride',
        html:  '<p style="margin-top: 2em;">Paragraf dengan jarak atas 2em.</p>',
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
        html:  '<p>Diterbitkan oleh <span class="smallcaps">N. V. Medan Priyayi</span>.</p>',
      },
    ],
  },
  {
    category: '✉️ Format Surat (.letter)',
    items: [
      {
        label: 'Surat lengkap (.letter)',
        desc:  'Kotak surat dengan tanggal, salam, isi, penutup, tanda tangan',
        html:  `<div class="letter">
  <p class="date">Batavia, 8 Januari 1910</p>
  <p class="salutation">Kepada Yth. Para Pelanggan,</p>
  <p class="body">Isi surat pertama tanpa indentasi.</p>
  <p class="body">Paragraf isi berikutnya dengan indentasi.</p>
  <p class="closing">Dengan segala hormat,</p>
  <p class="signature">N. V. Medan Priyayi</p>
</div>`,
      },
      {
        label: 'Penutup rata kanan (inline)',
        desc:  'Langsung pakai inline style — tanpa wrapper .letter',
        html:  '<p style="text-align: right; margin-top: 2em;">Dengan segala hormat,<br/>\nN. V. Medan Priyayi Batavia<br/>\nPenerbit</p>',
      },
    ],
  },
  {
    category: '🎭 Puisi (.poem)',
    items: [
      {
        label: 'Puisi lengkap',
        desc:  'Judul, penulis, baris-baris, atribusi',
        html:  `<div class="poem">
  <h3>Judul Sajak</h3>
  <p class="author">Nama Penyair</p>
  <div>
    <span>Baris pertama sajak ini</span>
    <span>Baris kedua sajak ini</span>
  </div>
  <div>
    <span class="indent">Baris dengan indentasi</span>
    <span>Baris berikutnya</span>
  </div>
  <p>— Sumber, Tahun</p>
</div>`,
      },
    ],
  },
  {
    category: '💬 Kutipan & Dialog',
    items: [
      {
        label: 'Blockquote',
        desc:  'Kutipan panjang dengan garis kiri',
        html:  '<blockquote>\n  <p>Teks yang dikutip dari sumber lain.</p>\n  <p>Paragraf kedua dalam kutipan.</p>\n</blockquote>',
      },
      {
        label: 'Epigraf',
        desc:  'Kutipan pendek di awal artikel, rata tengah',
        html:  `<div class="epigraph">
  <p>Satu kata mengandung seribu makna.</p>
  <cite>— Pujangga Besar, 1900</cite>
</div>`,
      },
      {
        label: 'Dialog',
        desc:  'Format percakapan antar tokoh',
        html:  `<div class="dialog">
  <p><span class="speaker">Raden:</span> Apa kabar tuan?</p>
  <p><span class="speaker">Tuan:</span> Baik sekali, terima kasih.</p>
</div>`,
      },
    ],
  },
  {
    category: '📦 Kotak & Catatan',
    items: [
      {
        label: 'Info-box',
        desc:  'Kotak abu-abu untuk catatan editorial',
        html:  `<div class="info-box">
  <p><strong>Catatan Editor:</strong> Artikel ini diambil dari edisi cetak.</p>
  <p>Ejaan asli 1910 dipertahankan.</p>
</div>`,
      },
      {
        label: 'Note / Catatan kaki',
        desc:  'Catatan kaki dengan garis pemisah otomatis',
        html:  `<div class="note">
  <p><strong>¹</strong> Medan Prijaji adalah surat kabar berbahasa Melayu pertama yang dimiliki pribumi.</p>
  <p><strong>²</strong> R. M. Tirtohadisoerjo mendirikannya pada 1907.</p>
</div>`,
      },
    ],
  },
  {
    category: '🖼 Gambar',
    items: [
      {
        label: 'Gambar dengan caption',
        desc:  'Gambar + keterangan di bawah',
        html:  `<div class="image-with-caption">
  <img src="URL_GAMBAR" alt="Deskripsi" />
  <p class="image-caption">Keterangan gambar.</p>
</div>`,
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
        label: 'Daftar huruf (A, B, C)',
        desc:  'Ordered list huruf kapital',
        html:  '<ol type="A">\n  <li>Butir A</li>\n  <li>Butir B</li>\n</ol>',
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
        html:  `<table>
  <tr><th>Kolom A</th><th>Kolom B</th></tr>
  <tr><td>Data 1</td><td>Data 2</td></tr>
</table>`,
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
  const ref      = useRef(null)
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
                fontFamily: f.stack,
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

      {/* ✅ FIX: margin: '0 auto' — konten max-width 38em selalu di tengah */}
      <div ref={ref} data-epub lang="id" className="chapter"
        style={{
          fontFamily, fontSize, lineHeight: 1.5,
          color: mode.color, backgroundColor: mode.bg,
          margin: '0 auto', padding: '1.25em', maxWidth: '38em',
          transition: 'background-color 0.2s, color 0.2s, font-size 0.15s',
        }}
      />
    </div>
  )
}

// ─── Content Editor ───────────────────────────────────────────────────────────

const ContentEditor = ({ value, onChange, onImageUpload }) => {
  const [tab, setTab]         = useState('html')
  const textareaRef           = useRef(null)
  const fileInputRef          = useRef(null)
  const [uploading, setUploading] = useState(false)

  const insertAtCursor = useCallback((before, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = value.substring(start, end)
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
      if (url) { insertAtCursor(`<img src="${url}" alt="" />`); toast.success('Disisipkan!', { id: tid }) }
      else toast.error('Gagal upload', { id: tid })
    } catch (err) {
      toast.error('Gagal: ' + (err?.message || ''), { id: tid })
    } finally { setUploading(false) }
  }, [onImageUpload, insertAtCursor])

  const TAG_SHORTCUTS = [
    { label: '<p>',          action: () => insertAtCursor('<p>', '</p>') },
    { label: '<h1>',         action: () => insertAtCursor('<h1>', '</h1>') },
    { label: '<h2>',         action: () => insertAtCursor('<h2>', '</h2>') },
    { label: '<strong>',     action: () => insertAtCursor('<strong>', '</strong>') },
    { label: '<em>',         action: () => insertAtCursor('<em>', '</em>') },
    { label: '<br/>',        action: () => insertAtCursor('<br/>') },
    { label: '<blockquote>', action: () => insertAtCursor('<blockquote>\n', '\n</blockquote>') },
    { label: '.letter',      action: () => insertAtCursor('<div class="letter">\n', '\n</div>') },
    { label: '.poem',        action: () => insertAtCursor('<div class="poem">\n', '\n</div>') },
    { label: '.info-box',    action: () => insertAtCursor('<div class="info-box">\n', '\n</div>') },
    { label: '.note',        action: () => insertAtCursor('<div class="note">\n', '\n</div>') },
    { label: '.separator',   action: () => insertAtCursor('<p class="separator">* * *</p>') },
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
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            {TAG_SHORTCUTS.map(({ label, action, title: hint, uploading: upl }) => (
              <button key={label} type="button" onClick={action} title={hint || label} disabled={!!upl}
                className="px-2 py-1 rounded text-xs font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition disabled:opacity-50">
                {upl ? <Loader2 className="w-3 h-3 animate-spin inline" /> : label}
              </button>
            ))}
          </div>
          <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
            spellCheck={false}
            placeholder={'<p>Paragraf pertama — tanpa indent (p:first-child).</p>\n<p>Paragraf kedua — indent 1.5em otomatis.</p>\n<p style="text-align: right; margin-top: 2em;">Rata kanan — inline style tidak dioverride.</p>'}
            className="w-full min-h-[520px] px-4 py-3 bg-gray-950 text-green-300 font-mono text-sm leading-relaxed focus:outline-none resize-y placeholder-gray-700"
            style={{ fontFamily: '"Fira Code","Cascadia Code","Consolas","Courier New",monospace' }}
          />
          <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
            💡 Tab <strong>Visual</strong> untuk cek tampilan · Tab <strong>Referensi</strong> untuk semua class epub
          </p>
        </div>
      )}

      {tab === 'visual' && <VisualView html={value} />}
      {tab === 'ref'    && <ReferencePanel onInsert={handleInsertSnippet} />}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </div>
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

const SourceCombobox = ({ sources, value, onChange }) => {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => { setQuery(value?.name || '') }, [value?.name])
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered  = query.trim() ? sources.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) : sources
  const showAddNew = query.trim() && !sources.find(s => s.name.toLowerCase() === query.toLowerCase())

  return (
    <div ref={wrapRef} className="relative">
      <div className={`flex items-center gap-1 px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 transition ${open ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-600'}`}>
        <input ref={inputRef} type="text" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange({ id: null, name: e.target.value }) }}
          onFocus={() => setOpen(true)} placeholder="Pilih atau ketik nama sumber baru..."
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 min-w-0" />
        {query && <button type="button" onClick={() => { setQuery(''); onChange({ id: null, name: '' }); inputRef.current?.focus() }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>}
        <button type="button" onClick={() => { setOpen(o => !o); inputRef.current?.focus() }} className="text-gray-400 flex-shrink-0">
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {showAddNew && (
            <button type="button" onClick={() => { onChange({ id: null, name: query.trim() }); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 border-b border-gray-100 dark:border-gray-700 text-left">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">+</span>
              Tambah "<strong>{query.trim()}</strong>"
            </button>
          )}
          {filtered.map(s => (
            <button key={s.id} type="button" onClick={() => { setQuery(s.name); onChange({ id: s.id, name: s.name }); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${value?.id === s.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
              <Newspaper className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />{s.name}
              {s.location && <span className="text-xs text-gray-400 ml-auto">{s.location}</span>}
            </button>
          ))}
          {filtered.length === 0 && !showAddNew && <p className="px-3 py-3 text-sm text-gray-400 text-center">Belum ada sumber terdaftar</p>}
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

const extractContent = (a) => a.bodyOriginal || a.bodyModern || a.htmlContent || a.content || ''

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
    title: '', subtitle: '', slug: '',
    category: 'nasional',
    publishDate: new Date().toISOString().split('T')[0],
    source: { id: null, name: '' },
    htmlContent: '', author: '', pageNumber: '',
    importance: 'medium', parentArticleId: '', articleLevel: 0,
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target?.value ?? e }))

  const wordCount = form.htmlContent
    ? form.htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
    : 0

  // ✅ FIX: Set lang="id" di <html> agar browser memuat kamus hyphenation Indonesia
  useEffect(() => {
    const prevLang = document.documentElement.lang
    document.documentElement.lang = 'id'
    return () => { document.documentElement.lang = prevLang }
  }, [])

  const generateSlug = (t) => t.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => {
    if (!isEditing) setForm(f => ({ ...f, slug: generateSlug(f.title) }))
  }, [form.title, isEditing])

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
          if (!a) { toast.error('Data tidak ditemukan'); return }
          setForm(f => ({
            ...f,
            title: a.title || '', subtitle: a.subtitle || '',
            slug: a.slug || '', category: a.category || 'nasional',
            publishDate: a.publishDate || f.publishDate,
            htmlContent: extractContent(a), author: a.author || '',
            pageNumber: a.pageNumber ? String(a.pageNumber) : '',
            importance: a.importance || 'medium',
            source: { id: a.sourceId || null, name: a.sourceName || '' },
          }))
          if (a.imageUrl) setCoverPreview(a.imageUrl)
        })
        .catch(() => toast.error('Gagal memuat data artikel'))
        .finally(() => setLoading(false))
    }
  }, [id, isAdmin]) // eslint-disable-line

  const handleImageUpload = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/blog/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    const url = res.data?.data?.url || res.data?.url
    if (!url) throw new Error('URL tidak ada di response')
    return url
  }, [])

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Maksimal 10MB'); return }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.title.trim())        { toast.error('Judul wajib diisi'); return }
    if (!isEditing && !form.slug.trim()) { toast.error('Slug wajib diisi'); return }
    if (!form.category)            { toast.error('Kategori wajib dipilih'); return }
    if (!form.publishDate)         { toast.error('Tanggal wajib diisi'); return }
    if (!form.htmlContent?.trim()) { toast.error('Konten wajib diisi'); return }

    setSaving(true)
    const tid = toast.loading(isEditing ? 'Menyimpan perubahan...' : 'Membuat artikel...')
    try {
      let imageUrl = ''
      if (coverFile) imageUrl = await handleImageUpload(coverFile) || ''
      const plain = form.htmlContent.replace(/<[^>]*>/g, ' ').trim()
      const payload = {
        title: form.title.trim(), subtitle: form.subtitle.trim() || undefined,
        category: form.category, publishDate: form.publishDate,
        content: plain, htmlContent: form.htmlContent,
        bodyOriginal: form.htmlContent, bodyModern: form.htmlContent,
        sourceId: form.source.id || undefined,
        sourceName: !form.source.id && form.source.name.trim() ? form.source.name.trim() : undefined,
        author: form.author.trim() || undefined,
        pageNumber: form.pageNumber ? parseInt(form.pageNumber) : undefined,
        importance: form.importance, imageUrl: imageUrl || undefined,
      }
      if (isEditing) {
        payload.slug = form.slug.trim() || undefined
        await api.put(`/newspapers/articles/${id}`, payload)
        toast.success('Artikel berhasil diperbarui!', { id: tid })
        navigate('/dasbor/koran')
      } else {
        payload.slug            = form.slug.trim()
        payload.parentArticleId = form.parentArticleId ? parseInt(form.parentArticleId) : undefined
        payload.articleLevel    = parseInt(form.articleLevel) || 0
        const res     = await api.post('/newspapers', payload)
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

  if (!isAdmin) return null
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data artikel...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dasbor/koran')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition group flex-shrink-0">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
              {isEditing ? 'Edit Artikel Koran' : 'Tambah Artikel Koran'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {wordCount > 0
                ? <span className="text-primary font-medium">{wordCount.toLocaleString()} kata · ~{Math.max(1, Math.ceil(wordCount / 200))} mnt baca</span>
                : <span>Field bertanda <span className="text-red-500">*</span> wajib diisi</span>
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
        {/* MAIN FORM */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title + Subtitle + Slug */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <InputField label="Judul Artikel" required>
              <input type="text" value={form.title} onChange={set('title')} placeholder="Masukkan judul berita..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-300 dark:placeholder-gray-600" />
            </InputField>
            <InputField label="Sub Judul" hint="Opsional">
              <input type="text" value={form.subtitle} onChange={set('subtitle')} placeholder="Kalimat penjelas di bawah judul utama..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm italic focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-300 dark:placeholder-gray-600" />
            </InputField>
            <InputField label="Slug URL" required={!isEditing} hint={isEditing ? 'Ubah slug = URL lama tidak valid' : 'Otomatis dari judul'}>
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${isEditing ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">/koran/{form.category}/{form.publishDate}/</span>
                <input type="text" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm font-mono focus:outline-none min-w-0" />
              </div>
              {isEditing && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠ Mengubah slug akan membuat URL lama tidak valid</p>}
            </InputField>
          </div>

          {/* Cover */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <ImagePlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gambar Cover</span>
              <span className="text-xs text-gray-400">(opsional)</span>
            </div>
            {coverPreview ? (
              <div className="relative group">
                <img src={coverPreview} alt="Cover" className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => coverRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium">
                    <ImagePlus className="w-4 h-4" />Ganti
                  </button>
                  <button onClick={() => { setCoverFile(null); setCoverPreview(null) }} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">
                    <X className="w-4 h-4" />Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => coverRef.current?.click()} className="w-full h-36 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary/10 transition">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Klik untuk upload gambar cover</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP · Maks 10MB</span>
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten Artikel <span className="text-red-500">*</span>
            </label>
            <ContentEditor
              value={form.htmlContent}
              onChange={(html) => setForm(f => ({ ...f, htmlContent: html }))}
              onImageUpload={handleImageUpload}
            />
          </div>

          {!isEditing && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Hierarki Artikel</h3>
                <span className="text-xs text-gray-400">(opsional)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="ID Artikel Induk" hint="Untuk sub-artikel">
                  <input type="number" value={form.parentArticleId} onChange={set('parentArticleId')} placeholder="ID artikel utama"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </InputField>
                <InputField label="Level Artikel" hint="0 = utama, 1 = sub">
                  <input type="number" min="0" max="5" value={form.articleLevel} onChange={set('articleLevel')}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </InputField>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
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
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, importance: opt.value }))}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left border transition ${
                      form.importance === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              <SourceCombobox sources={sources} value={form.source} onChange={(src) => setForm(f => ({ ...f, source: src }))} />
            </InputField>
            <InputField label="Penulis" hint="Opsional">
              <input type="text" value={form.author} onChange={set('author')} placeholder="Nama jurnalis/penulis"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </InputField>
            <InputField label="Nomor Halaman" hint="Opsional">
              <input type="number" min="1" value={form.pageNumber} onChange={set('pageNumber')} placeholder="Contoh: 1"
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
                <p className="font-semibold">Alur Kerja Editor:</p>
                <p>1️⃣ <strong>HTML</strong> — tulis/paste konten</p>
                <p>2️⃣ <strong>Visual</strong> — cek tampilan akhir</p>
                <p>3️⃣ <strong>Referensi</strong> — semua class epub</p>
                <p>📌 <code>p:first-child</code> = tanpa indent</p>
                <p>📌 Inline style tidak dioverride</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewspaperEditorPage