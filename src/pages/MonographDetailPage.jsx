import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Archive, BookOpen, Calendar, Newspaper, ChevronDown, ChevronRight,
  Hash, Quote, BookMarked, Users, MapPin, Building2, Languages,
  FileText, List, ExternalLink, Share2, AlertCircle, Fingerprint,
  ArrowRightLeft, HelpCircle, ClipboardCopy, Type
} from 'lucide-react'
import monographService from '../services/monographService'
import SEO from '../components/Common/SEO'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { getWikimediaThumb } from '../utils/filmImages'

const STATUS_LABEL = {
  complete: { label: 'Lengkap', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
  serial: { label: 'Bersambung', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  fragment: { label: 'Fragmen', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
  uncertain: { label: 'Tidak Pasti', color: 'text-stone-500 bg-stone-100 dark:text-slate-400 dark:bg-slate-800' },
}

const READ_MODES = [
  { key: 'light', label: 'Terang', bg: '#ffffff', color: '#1c1917', cardBg: '#fafaf9', border: '#e7e5e4' },
  { key: 'sepia', label: 'Sepia', bg: '#f5f0e8', color: '#3b2d1f', cardBg: '#ede8de', border: '#d6c9b0' },
  { key: 'dark', label: 'Gelap', bg: '#0b1220', color: '#f1f5f9', cardBg: '#0f172a', border: '#334155' },
]
const FONT_SIZES = ['0.85rem', '0.92rem', '1rem', '1.08rem', '1.18rem']
const LS_FONT_KEY = 'monograf_reader_fontIdx'
const LS_MODE_KEY = 'monograf_reader_mode'

const articleUrl = (entry) => `/koran/${entry.sourceSlug}/${entry.articleSlug}`

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="flex items-center gap-2.5 font-bold text-sm text-stone-800 dark:text-slate-200">
          <Icon className="w-4 h-4 text-rose-600 dark:text-rose-400" />{title}
          {typeof count === 'number' && <span className="text-xs font-normal text-stone-400 dark:text-slate-500">({count})</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 border-t border-stone-100 dark:border-slate-800 pt-4">{children}</div>}
    </div>
  )
}

const EntryRow = ({ entry }) => {
  const status = STATUS_LABEL[entry.textStatus] || STATUS_LABEL.complete
  const positionText = entry.positionLabel
    || [entry.pageNumber ? `Hal. ${entry.pageNumber}` : null, entry.columnInfo ? `Kol. ${entry.columnInfo}` : null].filter(Boolean).join(', ')
  return (
    <Link to={articleUrl(entry)} className="group flex items-start gap-3 py-3.5 border-b border-stone-100 dark:border-slate-800 last:border-0">
      <div className="w-1 self-stretch rounded-full bg-rose-200 dark:bg-rose-900 flex-shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
          {positionText && <span className="text-[10px] text-stone-400 dark:text-slate-500 flex items-center gap-0.5"><Hash className="w-2.5 h-2.5" />{positionText}</span>}
          {entry.sourceName && <span className="text-[10px] text-stone-400 dark:text-slate-500">{entry.sourceName}</span>}
        </div>
        <h4 className="font-serif text-sm sm:text-base font-semibold leading-snug text-stone-800 dark:text-slate-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">{entry.title}</h4>
        {entry.subtitle && <p className="text-xs italic text-stone-500 dark:text-slate-400 mt-0.5">{entry.subtitle}</p>}
        {entry.leadSnippet && <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1 line-clamp-2">{entry.leadSnippet}</p>}
        {entry.editorialNote && <p className="text-[11px] italic text-rose-600/80 dark:text-rose-400/70 mt-1">Catatan editorial: {entry.editorialNote}</p>}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-stone-300 dark:text-slate-600 flex-shrink-0 mt-1 group-hover:text-rose-500 transition-colors" />
    </Link>
  )
}

const ChapterBlock = ({ chapter, index }) => (
  <section id={chapter.id} className="scroll-mt-24">
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-serif text-2xl font-bold text-rose-700/30 dark:text-rose-500/30">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-slate-50">{chapter.title}</h2>
        {chapter.narrativeSummary && <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">{chapter.narrativeSummary}</p>}
      </div>
    </div>
    <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 px-5">
      {chapter.entries.map(e => <EntryRow key={e.articleId} entry={e} />)}
    </div>
  </section>
)

const ProvenanceRow = ({ entry }) => {
  const status = STATUS_LABEL[entry.textStatus] || STATUS_LABEL.complete
  return (
    <Link to={articleUrl(entry)} className="group flex items-center justify-between gap-3 py-2 border-b border-stone-100 dark:border-slate-800 last:border-0 text-xs">
      <div className="min-w-0 flex-1">
        <span className="font-medium text-stone-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate block">{entry.title}</span>
        <span className="text-stone-400 dark:text-slate-500">{entry.role} · {entry.pageNumber ? `hal. ${entry.pageNumber}` : '—'}</span>
      </div>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${status.color}`}>{status.label}</span>
    </Link>
  )
}

const ReaderToolbar = ({ fontIdx, setFontIdx, modeKey, setModeKey }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 bg-white dark:bg-slate-900">
        <Type className="w-3.5 h-3.5" /><span className="hidden sm:inline">Tampilan</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border p-4 z-30 bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-stone-400 dark:text-slate-500">Ukuran Huruf</p>
          <div className="flex gap-1 mb-4">
            {FONT_SIZES.map((_, i) => (
              <button key={i} onClick={() => setFontIdx(i)}
                className={`flex-1 h-8 rounded-lg border text-xs font-bold transition-all ${i === fontIdx ? 'bg-rose-600 border-rose-600 text-white' : 'border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400'}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-stone-400 dark:text-slate-500">Mode Baca</p>
          <div className="flex gap-2">
            {READ_MODES.map(m => (
              <button key={m.key} onClick={() => setModeKey(m.key)}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${modeKey === m.key ? 'border-rose-500' : 'border-stone-200 dark:border-slate-700'}`}
                style={{ background: m.bg, color: m.color }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MonographDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [m, setM] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [fontIdx, setFontIdx] = useState(() => {
    const v = parseInt(localStorage.getItem(LS_FONT_KEY))
    return isNaN(v) ? 2 : Math.max(0, Math.min(FONT_SIZES.length - 1, v))
  })
  const [modeKey, setModeKey] = useState(() => {
    const v = localStorage.getItem(LS_MODE_KEY)
    return READ_MODES.find(r => r.key === v) ? v : 'light'
  })

  useEffect(() => { localStorage.setItem(LS_FONT_KEY, String(fontIdx)) }, [fontIdx])
  useEffect(() => { localStorage.setItem(LS_MODE_KEY, modeKey) }, [modeKey])

  const mode = READ_MODES.find(r => r.key === modeKey) || READ_MODES[0]
  const fontSize = FONT_SIZES[fontIdx]

  useEffect(() => {
    let cancelled = false
    setLoading(true); setNotFound(false)
    monographService.getMonographBySlug(slug)
      .then(data => {
        if (cancelled) return
        setM(data)
        document.title = `${data.title} — Monograf Dokumenter`
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  const structuredData = useMemo(() => {
    if (!m) return null
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Book',
          name: m.title,
          alternativeHeadline: m.subtitle,
          datePublished: m.editionDate,
          inLanguage: 'id',
          isPartOf: { '@type': 'Periodical', name: m.newspaperSourceName },
          citation: m.citationFormatTemplate || undefined,
          abstract: m.centralQuestion || m.editorialNote,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Koran', item: 'https://masasilam.com/koran' },
            { '@type': 'ListItem', position: 2, name: 'Monograf', item: 'https://masasilam.com/koran/monograf' },
            { '@type': 'ListItem', position: 3, name: m.title, item: `https://masasilam.com/koran/monograf/${slug}` },
          ],
        },
      ],
    }
  }, [m, slug])

  if (loading) return <LoadingSpinner fullScreen />
  if (notFound || !m) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-stone-50 dark:bg-slate-950">
      <Archive className="w-16 h-16 mb-4 text-stone-200 dark:text-slate-700" />
      <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-slate-200">Monograf Tidak Ditemukan</h1>
      <button onClick={() => navigate('/koran/monograf')} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-rose-700 hover:bg-rose-600 text-white transition-all">Kembali ke Monograf</button>
    </div>
  )

  const coverUrl = getWikimediaThumb(m.coverImageUrl, 600)

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: m.title, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); toast.success('Tautan disalin!') }
    } catch { }
  }

  const handleCopyCitation = async () => {
    if (!m.citationFormatTemplate) return
    try { await navigator.clipboard.writeText(m.citationFormatTemplate); toast.success('Sitasi disalin!') }
    catch { toast.error('Gagal menyalin sitasi') }
  }

  const clusterSections = [
    { key: 'counterpoints', title: 'Counterpoints', icon: AlertCircle, data: m.counterpoints },
    { key: 'interludes', title: 'Interludes', icon: BookOpen, data: m.interludes },
    { key: 'peripheralDocuments', title: 'Peripheral Documents', icon: FileText, data: m.peripheralDocuments },
    { key: 'appendices', title: 'Appendices', icon: List, data: m.appendices },
  ].filter(s => s.data?.length > 0)

  const trackingRegisters = [
    { key: 'carryForwardPool', title: 'Carry-Forward Pool', icon: ArrowRightLeft, data: m.carryForwardPool,
      note: 'Utas kesinambungan yang belum tuntas di edisi ini, dilacak untuk dihubungkan ke edisi berikutnya.' },
    { key: 'standaloneRegister', title: 'Standalone Register', icon: FileText, data: m.standaloneRegister,
      note: 'Dokumen non-naratif yang berdiri sendiri, di luar alur bab utama.' },
    { key: 'unresolvedRegister', title: 'Unresolved Register', icon: HelpCircle, data: m.unresolvedRegister,
      note: 'Perkara hukum, pemogokan, atau isu yang masih menggantung pada edisi ini.' },
  ].filter(s => s.data?.length > 0)

  return (
    <>
      <SEO
        title={`${m.title} — Monograf Dokumenter`}
        description={m.subtitle || m.editorialNote?.slice(0, 160)}
        url={`/koran/monograf/${slug}`}
        type="article"
        image={m.coverImageUrl}
        structuredData={structuredData}
      />

      <div className="min-h-screen transition-colors duration-300" style={{ background: mode.bg }}>

        <div style={{ background: '#0f172a' }} className="py-2.5 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
            <Link to="/koran" className="text-slate-400 hover:text-white transition">Koran</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link to="/koran/monograf" className="text-slate-400 hover:text-white transition">Monograf</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-500 truncate">{m.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">

          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="w-40 sm:w-48 flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-xl border" style={{ borderColor: mode.border, background: mode.cardBg }}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-800 via-rose-900 to-stone-900 z-10" />
                {coverUrl ? <img src={coverUrl} alt={m.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Archive className="w-10 h-10 text-rose-400" /></div>}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-rose-700 dark:text-rose-400 mb-2"><Archive className="w-3.5 h-3.5" />MONOGRAF DOKUMENTER</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight" style={{ color: mode.color }}>{m.title}</h1>
              {m.subtitle && <p className="text-sm sm:text-base italic mb-4" style={{ color: mode.color, opacity: 0.65 }}>{m.subtitle}</p>}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs mb-4" style={{ color: mode.color, opacity: 0.6 }}>
                <span className="flex items-center gap-1"><Newspaper className="w-3.5 h-3.5" />{m.newspaperSourceName}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{m.editionDateFormatted || m.editionDate}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{m.totalArticles} dokumen ({m.inBookCount} inti, {m.appendixCount} lampiran)</span>
                <span>~{m.readingTimeMinutes} mnt baca</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {m.chapters?.[0] && (
                  <a href={`#${m.chapters[0].id}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-700 hover:bg-rose-600 text-white transition-all">
                    <BookOpen className="w-4 h-4" />Mulai Membaca
                  </a>
                )}
                <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: mode.border, color: mode.color }}>
                  <Share2 className="w-4 h-4" />Bagikan
                </button>
                <ReaderToolbar fontIdx={fontIdx} setFontIdx={setFontIdx} modeKey={modeKey} setModeKey={setModeKey} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-20 rounded-2xl border p-4" style={{ borderColor: mode.border, background: mode.cardBg }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: mode.color, opacity: 0.5 }}><List className="w-3.5 h-3.5" />Daftar Isi</h3>
                <nav className="space-y-1">
                  {m.chapters?.map((c, i) => (
                    <a key={c.id} href={`#${c.id}`} className="block text-xs py-1.5 px-2 rounded-lg hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/10 dark:hover:text-rose-400 transition-colors" style={{ color: mode.color, opacity: 0.75 }}>
                      {String(i + 1).padStart(2, '0')}. {c.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8" style={{ fontSize, color: mode.color }}>

              <div className="space-y-3">
                {m.editorialNote && (
                  <CollapsibleSection title="Pengantar Kuratorial" icon={FileText} defaultOpen>
                    <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">{m.editorialNote}</p>
                    {m.centralQuestion && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-1">Pertanyaan Pusat</p>
                        <p className="text-sm opacity-90">{m.centralQuestion}</p>
                      </div>
                    )}
                    {m.methodNote && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide opacity-50 mb-1">Catatan Metode</p>
                        <p className="text-sm opacity-80">{m.methodNote}</p>
                      </div>
                    )}
                  </CollapsibleSection>
                )}
                {m.colophon && (
                  <CollapsibleSection title="Kolofon Edisi" icon={BookMarked}>
                    <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">{m.colophon}</p>
                  </CollapsibleSection>
                )}
              </div>

              <div className="space-y-8">
                {m.chapters?.map((c, i) => <ChapterBlock key={c.id} chapter={c} index={i} />)}
              </div>

              {clusterSections.map(s => (
                <CollapsibleSection key={s.key} title={s.title} icon={s.icon} count={s.data.length}>
                  <div className="-mx-1">{s.data.map(e => <EntryRow key={e.articleId} entry={e} />)}</div>
                </CollapsibleSection>
              ))}

              {m.criticalNotes?.length > 0 && (
                <CollapsibleSection title="Catatan Kritis" icon={Quote} count={m.criticalNotes.length}>
                  <ol className="space-y-2 text-sm opacity-80 list-decimal pl-4">
                    {m.criticalNotes.map(n => (
                      <li key={n.number}>
                        {n.noteText}
                        {n.relatedArticleSlug && n.relatedArticleSourceSlug && (
                          <Link to={`/koran/${n.relatedArticleSourceSlug}/${n.relatedArticleSlug}`} className="ml-1.5 text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5 text-xs">
                            lihat dokumen <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </CollapsibleSection>
              )}

              {(m.nameIndex?.length > 0 || m.placeIndex?.length > 0 || m.orgIndex?.length > 0) && (
                <CollapsibleSection title="Indeks Nama, Tempat & Organisasi" icon={Users}>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    {m.nameIndex?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-50 mb-2">Nama</p>
                        <ul className="space-y-1.5 opacity-80">
                          {m.nameIndex.map(n => (
                            <li key={n.label}>
                              {n.label}
                              <span className="opacity-50"> ({n.references.length})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.placeIndex?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-50 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Tempat</p>
                        <ul className="space-y-1.5 opacity-80">
                          {m.placeIndex.map(p => (
                            <li key={p.label}>{p.label}<span className="opacity-50"> ({p.references.length})</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.orgIndex?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-50 mb-2 flex items-center gap-1"><Building2 className="w-3 h-3" />Organisasi</p>
                        <ul className="space-y-1.5 opacity-80">
                          {m.orgIndex.map(o => (
                            <li key={o.label}>{o.label}<span className="opacity-50"> ({o.references.length})</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {m.glossary?.length > 0 && (
                <CollapsibleSection title="Glosarium Istilah Historis" icon={Languages} count={m.glossary.length}>
                  <dl className="space-y-2 text-sm">
                    {m.glossary.map(g => (
                      <div key={g.term}>
                        <dt className="font-semibold inline">{g.term}</dt>
                        <dd className="inline opacity-70"> — {g.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleSection>
              )}

              {trackingRegisters.map(s => (
                <CollapsibleSection key={s.key} title={s.title} icon={s.icon} count={s.data.length}>
                  <p className="text-xs opacity-60 mb-3">{s.note}</p>
                  <div className="space-y-1">{s.data.map(e => <ProvenanceRow key={e.articleId} entry={e} />)}</div>
                </CollapsibleSection>
              ))}

              {m.provenanceRegister?.length > 0 && (
                <CollapsibleSection title="Provenance Register — Seluruh Dokumen" icon={Fingerprint} count={m.provenanceRegister.length}>
                  <p className="text-xs opacity-60 mb-3">Sidik jari asal-usul seluruh {m.provenanceRegister.length} dokumen dalam monograf ini, termasuk yang sudah tampil di bab/klaster di atas — bagian ini untuk keperluan audit silang peneliti.</p>
                  <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
                    {m.provenanceRegister.map(e => <ProvenanceRow key={`prov-${e.articleId}`} entry={e} />)}
                  </div>
                </CollapsibleSection>
              )}

              {m.citationFormatTemplate && (
                <CollapsibleSection title="Panduan Kutipan Akademis" icon={Quote} defaultOpen>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 font-mono text-xs leading-relaxed opacity-90">{m.citationFormatTemplate}</div>
                  <button onClick={handleCopyCitation} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline">
                    <ClipboardCopy className="w-3.5 h-3.5" />Salin sitasi
                  </button>
                </CollapsibleSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MonographDetailPage