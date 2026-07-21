import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Eye, Download, Clock, Star,
  Layers, ChevronRight, Award, Calendar
} from 'lucide-react'
import zineService from '../services/zineService'
import SEO from '../components/Common/SEO'

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}rb`
  return String(n)
}
const fmtTime = (mins) => {
  if (!mins) return null
  return mins >= 60 ? `${Math.round(mins / 60)} jam` : `${mins} mnt`
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const IssueCardSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-xl border animate-pulse
                  bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-800">
    <div className="w-16 h-24 rounded-lg flex-shrink-0 bg-stone-200 dark:bg-slate-700" />
    <div className="flex-1 flex flex-col gap-2 py-1">
      <div className="h-3 w-16 rounded-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 w-1/2 rounded bg-stone-100 dark:bg-slate-800" />
      <div className="flex gap-3 mt-auto">
        <div className="h-2.5 w-12 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-2.5 w-12 rounded bg-stone-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

// ── Issue Card ────────────────────────────────────────────────────────────────
const IssueCard = ({ issue, isLatest }) => (
  <Link
    to={`/zine/${issue.slug}`}
    className="group flex gap-3 p-3 rounded-xl border transition-all duration-200
               bg-white border-stone-200 shadow-sm
               hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50
               dark:bg-slate-900 dark:border-slate-800 dark:shadow-none
               dark:hover:border-emerald-700/60 dark:hover:shadow-emerald-900/30"
  >
    {/* Cover */}
    <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden
                    bg-stone-100 dark:bg-slate-800 shadow-sm">
      {issue.coverImageUrl
        ? <img src={issue.coverImageUrl} alt={issue.issueLabel}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
        : <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-stone-300 dark:text-slate-600" />
          </div>
      }
      {isLatest && (
        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold
                        bg-emerald-500 text-white leading-none">
          Terbaru
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 flex flex-col gap-1">
      {/* Issue label + tahun */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold
                         bg-emerald-50 border border-emerald-200 text-emerald-700
                         dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400">
          {issue.issueLabel}
        </span>
        {issue.publicationYear && (
          <span className="text-[11px] text-stone-400 dark:text-slate-500 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />{issue.publicationYear}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {issue.subtitle && (
        <p className="text-xs font-medium leading-snug line-clamp-2
                      text-stone-700 dark:text-slate-300
                      group-hover:text-emerald-700 dark:group-hover:text-emerald-400
                      transition-colors duration-150">
          {issue.subtitle}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mt-auto pt-1 flex-wrap
                      text-[11px] text-stone-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3 h-3" />{fmt(issue.viewCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Download className="w-3 h-3" />{fmt(issue.downloadCount)}
        </span>
        {issue.estimatedReadTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />{fmtTime(issue.estimatedReadTime)}
          </span>
        )}
        {issue.averageRating > 0 && (
          <span className="inline-flex items-center gap-1 ml-auto">
            <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            {Number(issue.averageRating).toFixed(1)}
          </span>
        )}
      </div>
    </div>

    {/* Arrow */}
    <ChevronRight className="w-4 h-4 flex-shrink-0 self-center opacity-0 group-hover:opacity-100
                             transition-all duration-200 -translate-x-1 group-hover:translate-x-0
                             text-emerald-500" />
  </Link>
)

// ── Volume Section ────────────────────────────────────────────────────────────
const VolumeSection = ({ vol, isFirst, totalVolumes }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-2xl border overflow-hidden transition-colors
                    border-stone-200 dark:border-slate-800">
      {/* Volume header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                   bg-stone-50 hover:bg-stone-100
                   dark:bg-slate-800/60 dark:hover:bg-slate-800"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                          bg-emerald-100 dark:bg-emerald-900/30">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-stone-900 dark:text-slate-100">
                {vol.volumeLabel || `Volume ${vol.volume}`}
              </span>
              {isFirst && totalVolumes > 1 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                 bg-emerald-100 text-emerald-700 border border-emerald-200
                                 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700/50">
                  Terbaru
                </span>
              )}
              {vol.publicationYear && (
                <span className="text-xs text-stone-400 dark:text-slate-500">
                  {vol.publicationYear}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">
              {vol.issues?.length || 0} nomor edisi
            </p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 text-stone-400 dark:text-slate-500
                                  transition-transform duration-200
                                  ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Issue list */}
      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {vol.issues?.map((issue, idx) => (
            <IssueCard
              key={issue.slug || idx}
              issue={issue}
              isLatest={isFirst && idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── ZineSeriesPage ─────────────────────────────────────────────────────────────
const ZineSeriesPage = () => {
  const { seriesSlug } = useParams()
  const navigate       = useNavigate()

  const [series,  setSeries]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Fetch semua zine milik seri ini dari backend
  // Gunakan collectionName-based query; fallback ke searchTitle
  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Rekonstruksi nama koleksi dari slug (zaman-baru → Zaman Baru)
      // Backend harus support query by collectionSlug atau seriesSlug;
      // jika belum, gunakan searchTitle sebagai fallback sementara
      const collectionTitle = seriesSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      const res = await zineService.getZines({
        page:        1,
        limit:       100,
        sortField:   'publishedAt',
        sortOrder:   'ASC',
        // Idealnya: seriesSlug: seriesSlug
        // Fallback sementara:
        searchTitle: collectionTitle,
      })

      const list = res.data?.data || []
      if (!list.length) {
        setError('Seri ini tidak ditemukan.')
        return
      }

      // Bangun struktur seri dari flat list (sama dengan groupZinesBySeries tapi single-series)
      const slugifyCollection = (name) =>
        name?.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') || 'unknown'

      // Ambil item yang benar-benar milik seri ini
      const filtered = list.filter((z) => {
        const key = z.seriesSlug || slugifyCollection(z.collectionName || z.title)
        return key === seriesSlug
      })

      const target = filtered.length ? filtered : list

      // Build volume map
      const volMap = new Map()
      const meta   = target[0]

      target.forEach((zine) => {
        const volNum = zine.volume ?? 0
        if (!volMap.has(volNum)) {
          volMap.set(volNum, {
            volume:          volNum,
            volumeLabel:     zine.volumeLabel || (zine.volume ? `Vol.${zine.volume}` : null),
            publicationYear: zine.publicationYear,
            issues:          [],
          })
        }
        const vol = volMap.get(volNum)
        const exists = vol.issues.some(i => i.slug === zine.slug)
        if (!exists) {
          vol.issues.push({
            slug:              zine.slug,
            issueNumber:       zine.issueNumber,
            issueLabel:        zine.issueNumber ? `No.${zine.issueNumber}` : (zine.subtitle || zine.slug),
            subtitle:          zine.subtitle,
            coverImageUrl:     zine.coverImageUrl,
            viewCount:         zine.viewCount    || 0,
            downloadCount:     zine.downloadCount || 0,
            readCount:         zine.readCount    || 0,
            estimatedReadTime: zine.estimatedReadTime || null,
            averageRating:     zine.averageRating || null,
            publicationYear:   zine.publicationYear,
          })
        }
      })

      // Sort issues ASC, volumes DESC
      const volumes = Array.from(volMap.values())
        .map(vol => ({
          ...vol,
          issues: [...vol.issues].sort((a, b) => {
            const na = parseInt(a.issueNumber || '0', 10)
            const nb = parseInt(b.issueNumber || '0', 10)
            return na - nb
          }),
        }))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))

      const totalIssues = volumes.reduce((s, v) => s + v.issues.length, 0)
      const totalViews  = target.reduce((s, z) => s + (z.viewCount || 0), 0)
      const totalDl     = target.reduce((s, z) => s + (z.downloadCount || 0), 0)

      setSeries({
        title:        meta.collectionName || meta.title,
        publisher:    meta.publisher,
        firstPublisher: meta.firstPublisher,
        category:     meta.category,
        seriesSlug,
        volumes,
        totalIssues,
        totalViews,
        totalDownloads: totalDl,
      })
    } catch (e) {
      console.error('Error fetching series:', e)
      setError('Gagal memuat data seri.')
    } finally {
      setLoading(false)
    }
  }, [seriesSlug])

  useEffect(() => { fetchSeries() }, [fetchSeries])

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen py-8 bg-stone-50 dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-6 w-32 rounded-full bg-stone-200 dark:bg-slate-800 animate-pulse mb-8" />
        <div className="h-8 w-64 rounded bg-stone-200 dark:bg-slate-800 animate-pulse mb-2" />
        <div className="h-4 w-48 rounded bg-stone-100 dark:bg-slate-800/60 animate-pulse mb-10" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <IssueCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !series) return (
    <div className="min-h-screen py-8 bg-stone-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <Layers className="w-16 h-16 text-stone-300 dark:text-slate-700 mb-4" />
      <p className="text-stone-500 dark:text-slate-400 text-base mb-2">{error || 'Seri tidak ditemukan'}</p>
      <button onClick={() => navigate('/zine')}
        className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
        ← Kembali ke Zine
      </button>
    </div>
  )

  const latestIssue = series.volumes[0]?.issues[0]

  return (
    <>
      <SEO
        title={`${series.title} — Semua Edisi`}
        description={`Koleksi lengkap ${series.title}: ${series.totalIssues} nomor edisi dari ${series.volumes.length} volume.`}
        url={`/zine/seri/${seriesSlug}`}
        type="website"
      />

      <div className="min-h-screen py-4 sm:py-8 bg-stone-50 dark:bg-slate-950 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Back */}
          <button onClick={() => navigate('/zine')}
            className="flex items-center gap-2 mb-6 group transition-colors text-sm font-medium
                       text-stone-500 hover:text-stone-900 dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Koleksi Zine
          </button>

          {/* Header seri */}
          <header className="mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center
                              shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/40 flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {series.category && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2
                                   bg-emerald-100 text-emerald-700 border border-emerald-200
                                   dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50">
                    {series.category}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 leading-tight">
                  {series.title}
                </h1>
                <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">
                  {series.firstPublisher || series.publisher}
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-5 flex flex-wrap gap-4 p-4 rounded-xl border
                            bg-white border-stone-200 shadow-sm
                            dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-medium text-stone-400 dark:text-slate-500">Volume</span>
                <span className="text-xl font-bold text-stone-900 dark:text-slate-100">{series.volumes.length}</span>
              </div>
              <div className="w-px bg-stone-100 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-medium text-stone-400 dark:text-slate-500">Total Nomor</span>
                <span className="text-xl font-bold text-stone-900 dark:text-slate-100">{series.totalIssues}</span>
              </div>
              <div className="w-px bg-stone-100 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-medium text-stone-400 dark:text-slate-500">Dibaca</span>
                <span className="text-xl font-bold text-stone-900 dark:text-slate-100">{fmt(series.totalViews)}</span>
              </div>
              <div className="w-px bg-stone-100 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-medium text-stone-400 dark:text-slate-500">Diunduh</span>
                <span className="text-xl font-bold text-stone-900 dark:text-slate-100">{fmt(series.totalDownloads)}</span>
              </div>

              {/* CTA terbaru */}
              {latestIssue && (
                <Link
                  to={`/zine/${latestIssue.slug}`}
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                             bg-emerald-500 hover:bg-emerald-400 text-white transition-all
                             shadow-sm shadow-emerald-200/60 dark:shadow-emerald-900/30 self-center">
                  <BookOpen className="w-4 h-4" />
                  Baca Edisi Terbaru
                </Link>
              )}
            </div>
          </header>

          {/* Volume + Issue sections */}
          <div className="space-y-4">
            {series.volumes.map((vol, idx) => (
              <VolumeSection
                key={vol.volume ?? idx}
                vol={vol}
                isFirst={idx === 0}
                totalVolumes={series.volumes.length}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  )
}

export default ZineSeriesPage