export const splitList = csv => (csv && csv !== 'undefined' && csv !== 'null') ? csv.split(',').map(s => s.trim()).filter(Boolean) : []
export const primaryGenreSlug = article => splitList(article?.genreSlugs)[0] || 'lainnya'
export const articleGenreSlugs = article => splitList(article?.genreSlugs)
export const genreChips = article => {
    const names = splitList(article?.genres)
    const slugs = splitList(article?.genreSlugs)
    return names.map((name, i) => ({ name, slug: slugs[i] || primaryGenreSlug(article) }))
}
export const articleHref = article => `/koran/${article.sourceSlug}/${article.slug}`
export const sourceHref = sourceSlug => `/koran/${sourceSlug}`
export const yearHref = (sourceSlug, year) => `/koran/${sourceSlug}/${year}`
export const editionHref = (sourceSlug, publishDate) => `/koran/${sourceSlug}/${new Date(publishDate).getFullYear()}/${publishDate}`
export const rubrikHref = genreSlug => `/koran/rubrik/${genreSlug}`
export const isYearSegment = segment => /^\d{4}$/.test(segment)