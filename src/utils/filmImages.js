// ─────────────────────────────────────────────────────────────────────────────
// Sumber kebenaran tunggal untuk semua gambar film.
//
// Sebelumnya rantai fallback ini disalin di 5 file (FilmCard, FeaturedBanner,
// HomePage, SearchResultsPage, FilmDetailPage) sehingga tiap perubahan harus
// diedit 5x dan gampang jadi tidak konsisten.
//
// Film punya DUA gambar utama dengan rasio berbeda — jangan saling tukar:
//   • posterPortraitUrl → poster bioskop, potret 2:3  (kartu potret)
//   • posterUrl         → cover/still landscape 16:9  (kartu 16:9, hero, banner)
// ─────────────────────────────────────────────────────────────────────────────

// Ubah URL file asli Wikimedia jadi URL thumbnail dengan lebar tertentu, supaya
// tidak menarik gambar 4000px untuk kartu selebar 300px.
export const getWikimediaThumb = (url, w = 600) => {
  if (!url) return null
  if (url.includes('/thumb/')) return url
  if (!url.includes('upload.wikimedia.org')) return url
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|[a-z]+)\/)([^/]\/[^/]{2}\/)(.+)$/
  )
  if (!m) return url
  const [, base, hash, filename] = m
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const thumbFilename = isSvg ? `${filename}.png` : filename
  return `${base}thumb/${hash}${filename}/${w}px-${thumbFilename}`
}

// imageUrls datang dalam dua bentuk tergantung endpoint:
//   GET /films        → Film entity     → String dipisah koma
//   GET /films/{slug} → FilmDetail      → List<String>
// Keduanya harus ditangani, kalau tidak gambar tambahan hilang di salah satu sisi.
const toImageList = (imageUrls) => {
  if (Array.isArray(imageUrls)) return imageUrls.filter(Boolean)
  if (typeof imageUrls === 'string' && imageUrls.trim()) {
    return imageUrls.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

// Thumbnail yang di-generate provider video (YouTube/Archive.org) — ini "stills",
// bukan poster. Hanya ada di endpoint detail; endpoint list tidak mengirim videoSources.
const getStills = (film) => {
  const sources = Array.isArray(film?.videoSources) ? film.videoSources : []
  return [
    sources.find(v => !v.isTrailer)?.thumbnailUrl,
    sources.find(v => v.isTrailer)?.thumbnailUrl,
  ].filter(Boolean)
}

// Poster potret 2:3. Sengaja TIDAK fallback ke landscape: memaksa still 16:9 ke
// slot potret menghasilkan letterbox jelek. Pemanggil yang memutuskan mau
// fallback (pakai getFilmCover) atau tampilkan placeholder.
export const getFilmPortrait = (film) =>
  film?.posterPortraitUrl || film?.poster_portrait_url || null

// Cover landscape 16:9. Stills dipakai sebagai jaring pengaman supaya film lama
// yang belum punya cover tetap tampil.
export const getFilmLandscape = (film) => {
  if (!film) return null
  return (
    film.posterUrl || film.poster_url || film.poster ||
    getStills(film)[0] ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl ||
    film.imageUrl || film.image ||
    toImageList(film.imageUrls)[0] ||
    null
  )
}

// Dipakai komponen kartu: minta bentuk yang dibutuhkan slot, dapat fallback
// otomatis kalau gambar yang ideal belum diinput admin.
export const getFilmCover = (film, shape = 'landscape') =>
  shape === 'portrait'
    ? (getFilmPortrait(film) || getFilmLandscape(film))
    : (getFilmLandscape(film) || getFilmPortrait(film))

// Semua gambar unik milik film, untuk galeri di halaman detail. Inilah yang
// akhirnya memanfaatkan "URL Gambar Tambahan" — sebelumnya field itu ada di
// posisi paling buncit rantai fallback sehingga tidak pernah tercapai.
export const getFilmGallery = (film) => {
  if (!film) return []
  return [...new Set([
    getFilmPortrait(film),
    film.posterUrl || film.poster_url || film.poster,
    ...getStills(film),
    ...toImageList(film.imageUrls),
  ].filter(Boolean))]
}
