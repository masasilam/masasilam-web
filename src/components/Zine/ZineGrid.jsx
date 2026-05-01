// ============================================
// src/components/Zine/ZineGrid.jsx
// Grid zine — dua mode:
//   grouped=false  → tampilkan ZineCard per volume (default lama)
//   grouped=true   → tampilkan ZineSeriesCard per seri (baru)
//   autoGroup=true → otomatis group dari flat data (recommended)
// LIGHT: skeleton warm stone tones
// DARK:  skeleton cool slate tones
// ============================================
import ZineCard from './ZineCard.jsx'
import ZineSeriesCard from './ZineSeriesCard.jsx'
import { Layers } from 'lucide-react'

// ── Helper: normalisasi judul jadi key grouping ───────────────────────────────
const normalizeTitleKey = (title) =>
  title
    ?.toLowerCase()
    .replace(/[·:].*/g, '')        // buang subtitle setelah · atau :
    .replace(/[^a-z0-9\s]/g, '')   // buang karakter non-alfanumerik
    .trim()
    .replace(/\s+/g, '-') || 'unknown'

// ── Helper: group flat volume list → series list ──────────────────────────────
export const groupZinesBySeries = (zines) => {
  if (!zines?.length) return []

  const map = new Map()

  zines.forEach((zine) => {
    // Kunci grouping: seriesSlug dari backend (ideal) atau judul ternormalisasi.
    // JANGAN pakai slug — tiap volume punya slug berbeda meski judulnya sama.
    const key = zine.seriesSlug || normalizeTitleKey(zine.seriesTitle || zine.title)

    if (!map.has(key)) {
      map.set(key, {
        id:             key,
        slug:           zine.seriesSlug || zine.slug,
        title:          zine.seriesTitle || zine.title,
        publisher:      zine.publisher,
        category:       zine.category,
        isFeatured:     zine.isFeatured || false,
        totalViews:     0,
        totalDownloads: 0,
        volumes:        [],
      })
    }

    const s = map.get(key)

    // Cek apakah volume number yang sama sudah ada
    const existingVolIdx =
      zine.volume != null
        ? s.volumes.findIndex((v) => v.volume === zine.volume)
        : -1

    if (existingVolIdx === -1) {
      // Volume belum ada — tambahkan baru
      s.volumes.push({
        slug:            zine.slug,
        _sourceId:       zine.id,
        volumeLabel:     zine.volumeLabel || (zine.volume ? `Vol.${zine.volume}` : null),
        volume:          zine.volume,
        publicationYear: zine.publicationYear,
        coverImageUrl:   zine.coverImageUrl,
        viewCount:       zine.viewCount     || 0,
        downloadCount:   zine.downloadCount || 0,
        // issueCount hanya dari field issueCount asli — JANGAN fallback ke totalPages
        // karena totalPages = jumlah chapter EPUB, bukan jumlah edisi majalah
        issueCount:      zine.issueCount    || null,
        averageRating:   zine.averageRating || null,
      })

      s.totalViews     += zine.viewCount     || 0
      s.totalDownloads += zine.downloadCount || 0
      if (zine.isFeatured) s.isFeatured = true

    } else {
      // Volume duplikat — update cover jika record ini lebih baru
      const existing = s.volumes[existingVolIdx]
      const isNewer  = (zine.id || 0) > (existing._sourceId || 0)

      if (isNewer && zine.coverImageUrl && zine.coverImageUrl !== existing.coverImageUrl) {
        s.volumes[existingVolIdx] = {
          ...existing,
          coverImageUrl: zine.coverImageUrl,
          slug:          zine.slug,
          _sourceId:     zine.id,
        }
      }
    }
  })

  // Sort volumes: terbaru (nomor terbesar) di depan
  map.forEach((s) => {
    s.volumes.sort((a, b) => (b.volume || 0) - (a.volume || 0))
    s.volumes.forEach((v) => { delete v._sourceId })
  })

  return Array.from(map.values())
}

// ── Skeleton untuk ZineSeriesCard ─────────────────────────────────────────────
const SkeletonSeriesCard = () => (
  <div className="rounded-xl border overflow-hidden animate-pulse
                  bg-white border-stone-200
                  dark:bg-slate-900 dark:border-slate-800">
    <div className="h-px w-full bg-gradient-to-r from-emerald-300 to-teal-300
                    dark:from-emerald-700 dark:to-teal-700" />
    <div className="flex gap-3 px-3 pt-3 pb-2 bg-stone-50 dark:bg-slate-800/60">
      <div className="relative w-[82px] h-[112px] flex-shrink-0">
        <div className="absolute rounded-lg bg-stone-200 dark:bg-slate-700"
          style={{ width: 62, height: 90, bottom: 0, left: 2, opacity: 0.45 }} />
        <div className="absolute rounded-lg bg-stone-300 dark:bg-slate-600"
          style={{ width: 68, height: 98, bottom: 0, left: 7, opacity: 0.65 }} />
        <div className="absolute rounded-lg bg-stone-400 dark:bg-slate-500"
          style={{ width: 74, height: 108, bottom: 0, left: 8 }} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
        <div className="h-4 w-16 rounded-full bg-stone-200 dark:bg-slate-700" />
        <div className="space-y-1.5">
          <div className="h-3 rounded w-full bg-stone-200 dark:bg-slate-700" />
          <div className="h-3 rounded w-3/4 bg-stone-200 dark:bg-slate-700" />
        </div>
        <div className="h-2.5 w-1/2 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-3 w-16 rounded bg-stone-100 dark:bg-slate-800 mt-auto" />
      </div>
    </div>
    <div className="px-3 pt-2.5 pb-1">
      <div className="h-2 w-16 rounded mb-2 bg-stone-100 dark:bg-slate-800" />
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-14 rounded-lg bg-stone-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
    <div className="px-3 pt-1.5 pb-3">
      <div className="flex gap-1.5">
        <div className="flex-1 h-8 rounded-lg bg-stone-200 dark:bg-slate-700" />
        <div className="w-16 h-8 rounded-lg bg-stone-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

// ── Skeleton untuk ZineCard per-volume (mode lama) ────────────────────────────
const SkeletonVolumeCard = () => (
  <div className="rounded-xl border overflow-hidden animate-pulse
                  bg-white border-stone-200
                  dark:bg-slate-900 dark:border-slate-800">
    <div className="h-px w-full bg-gradient-to-r from-emerald-200 to-teal-200
                    dark:from-emerald-900/40 dark:to-teal-900/40" />
    <div className="aspect-[2/3] bg-gradient-to-br from-stone-100 to-stone-200
                    dark:from-slate-800 dark:to-slate-750" />
    <div className="p-3 space-y-2.5">
      <div className="flex gap-1">
        <div className="h-3.5 w-12 rounded-full bg-stone-200 dark:bg-slate-700" />
        <div className="h-3.5 w-16 rounded-full bg-stone-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 rounded-md w-full bg-stone-200 dark:bg-slate-700" />
        <div className="h-3 rounded-md w-3/4 bg-stone-200 dark:bg-slate-700" />
      </div>
      <div className="h-2.5 rounded-md w-1/2 bg-stone-100 dark:bg-slate-800" />
      <div className="flex gap-2 pt-1">
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

// ── ZineGrid ──────────────────────────────────────────────────────────────────
const ZineGrid = ({
  zines,
  loading       = false,
  emptyMessage  = 'Tidak ada zine ditemukan',
  skeletonCount = 12,
  grouped       = false,
  autoGroup     = true,
}) => {
  const useSeriesMode = grouped || autoGroup

  const seriesGridClass =
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
  const volumeGridClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'

  const gridClass         = useSeriesMode ? seriesGridClass : volumeGridClass
  const SkeletonComponent = useSeriesMode ? SkeletonSeriesCard : SkeletonVolumeCard

  if (loading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Memuat zine…">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    )
  }

  if (!zines || zines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-5 rounded-2xl flex items-center justify-center
                        bg-emerald-50 dark:bg-emerald-900/20">
          <Layers className="w-10 h-10 text-emerald-300 dark:text-emerald-700" />
        </div>
        <p className="text-base font-medium mb-1 text-stone-500 dark:text-slate-400">
          {emptyMessage}
        </p>
        <p className="text-sm text-stone-400 dark:text-slate-600">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    )
  }

  if (useSeriesMode) {
    const seriesList = grouped ? zines : groupZinesBySeries(zines)
    return (
      <div className={gridClass}>
        {seriesList.map((series) => (
          <ZineSeriesCard key={series.id} series={series} />
        ))}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {zines.map((zine) => (
        <ZineCard key={zine.id} zine={zine} />
      ))}
    </div>
  )
}

export default ZineGrid