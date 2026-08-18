import api from './api';

const cleanParams = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''));

const formatResponse = (data, limit = 12) => ({
  data: {
    data: data?.films || data?.list || [],
    total: data?.totalItems ?? data?.total ?? 0,
    page: data?.currentPage ?? data?.page ?? 0,
    totalPages: data?.totalPages ?? Math.ceil((data?.totalItems ?? 0) / limit),
  },
});

const sortFilms = (films, sortField, sortOrder) => {
  if (!sortField || !films?.length) return films;
  const dir = sortOrder === 'ASC' ? 1 : -1;
  return [...films].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (!isNaN(parseFloat(va)) && !isNaN(parseFloat(vb))) return (parseFloat(va) - parseFloat(vb)) * dir;
    va = String(va ?? '').toLowerCase();
    vb = String(vb ?? '').toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
};

const filterFilms = (films, { genre, negara, yearFrom, yearTo }) => {
  if (!films?.length) return films;
  return films.filter(film => {
    if (genre) {
      const filmGenres = Array.isArray(film.genre) ? film.genre.join(' ').toLowerCase() : String(film.genre ?? '').toLowerCase();
      if (!filmGenres.includes(genre.toLowerCase())) return false;
    }
    if (negara) {
      const filmNegara = String(film.negaraAsal || film.negara || '').toLowerCase();
      if (!filmNegara.includes(negara.toLowerCase())) return false;
    }
    if (yearFrom) {
      const filmYear = parseInt(String(film.tahunRilis ?? '').slice(0, 4), 10);
      if (filmYear < parseInt(yearFrom, 10)) return false;
    }
    if (yearTo) {
      const filmYear = parseInt(String(film.tahunRilis ?? '').slice(0, 4), 10);
      if (filmYear > parseInt(yearTo, 10)) return false;
    }
    return true;
  });
};

export const filmService = {
  getFilms: async (params = {}) => {
    const { searchTitle = '', page = 0, size = 12, sortField = 'tahunRilis', sortOrder = 'DESC', genre = '', negara = '', yearFrom = '', yearTo = '' } = params;
    try {
      let raw;
      if (searchTitle.trim()) {
        const res = await api.get('/films/search', { params: cleanParams({ q: searchTitle.trim(), page, size, sortBy: sortField, sortOrder }) });
        raw = res.data;
      } else {
        const res = await api.get('/films', { params: cleanParams({ page, size, sortBy: sortField, sortOrder }) });
        raw = res.data;
      }
      let films = raw?.films || [];
      const hasClientFilter = genre || negara || yearFrom || yearTo;
      if (hasClientFilter) films = filterFilms(films, { genre, negara, yearFrom, yearTo });
      const total = hasClientFilter ? films.length : (raw?.totalItems ?? 0);
      return {
        data: {
          data: films,
          total,
          page: raw?.currentPage ?? page,
          totalPages: hasClientFilter ? Math.ceil(films.length / size) : (raw?.totalPages ?? Math.ceil(total / size)),
        },
      };
    } catch {
      return formatResponse(null, size);
    }
  },

  getFilmBySlug: async (slug) => (await api.get(`/films/${slug}`)).data,

  searchFilms: async (query, page = 0, size = 20) => {
    try {
      const response = await api.get('/films/search', { params: cleanParams({ q: query, page, size }) });
      return formatResponse(response.data, size);
    } catch {
      return formatResponse(null, size);
    }
  },

  getPersonBySlug: async (slug) => (await api.get(`/films/person/${slug}`)).data,

  getCompanyBySlug: async (slug) => (await api.get(`/films/company/${slug}`)).data,

  fetchFromWikidata: async (qid) => (await api.get(`/films/wikidata/${qid}`)).data,

  addRating: async (slug, payload) => (await api.post(`/films/${slug}/rating`, payload)).data,

  getRatingStats: async (slug) => (await api.get(`/films/${slug}/rating`)).data,

  getMyRating: async (slug) => (await api.get(`/films/${slug}/rating/me`)).data,

  deleteRating: async (slug) => (await api.delete(`/films/${slug}/rating`)).data,

  getReviews: async (slug, page = 1, limit = 10, sortBy = 'helpful') => (await api.get(`/films/${slug}/reviews`, { params: { page, limit, sortBy } })).data,

  getMyReview: async (slug) => (await api.get(`/films/${slug}/reviews/me`)).data,

  createReview: async (slug, payload) => (await api.post(`/films/${slug}/reviews`, payload)).data,

  updateReview: async (slug, payload) => (await api.put(`/films/${slug}/reviews`, payload)).data,

  deleteReview: async (slug) => (await api.delete(`/films/${slug}/reviews`)).data,

  addReply: async (slug, reviewId, payload) => (await api.post(`/films/${slug}/reviews/${reviewId}/replies`, payload)).data,

  updateReply: async (slug, replyId, payload) => (await api.put(`/films/${slug}/reviews/replies/${replyId}`, payload)).data,

  deleteReply: async (slug, replyId) => (await api.delete(`/films/${slug}/reviews/replies/${replyId}`)).data,

  addOrUpdateFeedback: async (slug, reviewId, payload) => (await api.post(`/films/${slug}/reviews/${reviewId}/feedback`, payload)).data,

  deleteFeedback: async (slug, reviewId) => (await api.delete(`/films/${slug}/reviews/${reviewId}/feedback`)).data,

  addToWatchlist: async (slug) => (await api.post(`/films/${slug}/watchlist`)).data,

  removeFromWatchlist: async (slug) => (await api.delete(`/films/${slug}/watchlist`)).data,

  isInWatchlist: async (slug) => (await api.get(`/films/${slug}/watchlist/me`)).data,

  updateWatchProgress: async (slug, payload) => (await api.post(`/films/${slug}/watch-progress`, payload)).data,

  getMyProgress: async (slug) => (await api.get(`/films/${slug}/watch-progress/me`)).data,

  getVideoSources: async (slug) => (await api.get(`/films/${slug}/video-sources`)).data,

  addVideoSource: async (slug, payload) => (await api.post(`/films/${slug}/video-sources`, payload)).data,

  removeVideoSource: async (slug, sourceId) => (await api.delete(`/films/${slug}/video-sources/${sourceId}`)).data,
};

export default filmService;