import api from './api';

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );

const formatResponse = (data, limit = 12) => ({
  data: {
    data:       data?.films || data?.list || [],
    total:      data?.totalItems ?? data?.total ?? 0,
    page:       data?.currentPage ?? data?.page ?? 0,
    totalPages: data?.totalPages ?? Math.ceil((data?.totalItems ?? 0) / limit),
  },
});

const sortFilms = (films, sortField, sortOrder) => {
  if (!sortField || !films?.length) return films;
  const dir = sortOrder === 'ASC' ? 1 : -1;
  return [...films].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (!isNaN(parseFloat(va)) && !isNaN(parseFloat(vb))) {
      return (parseFloat(va) - parseFloat(vb)) * dir;
    }
    va = String(va ?? '').toLowerCase();
    vb = String(vb ?? '').toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });
};

const filterFilms = (films, { genre, negara, yearFrom, yearTo }) => {
  if (!films?.length) return films;
  return films.filter(film => {
    if (genre) {
      const filmGenres = Array.isArray(film.genre)
        ? film.genre.join(' ').toLowerCase()
        : String(film.genre ?? '').toLowerCase();
      if (!filmGenres.includes(genre.toLowerCase())) return false;
    }
    if (negara) {
      const filmNegara = String(
        film.negaraAsal || film.negara || ''
      ).toLowerCase();
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
    const {
      searchTitle = '',
      page        = 0,
      size        = 12,
      sortField,
      sortOrder   = 'DESC',
      genre       = '',
      negara      = '',
      yearFrom    = '',
      yearTo      = '',
    } = params;

    try {
      let raw;

      if (searchTitle.trim()) {
        const res = await api.get('/films/search', {
          params: cleanParams({ q: searchTitle.trim(), page, size }),
        });
        raw = res.data;
      } else {
        const res = await api.get('/films', {
          params: cleanParams({ page, size }),
        });
        raw = res.data;
      }

      let films = raw?.films || [];

      if (genre || negara || yearFrom || yearTo) {
        films = filterFilms(films, { genre, negara, yearFrom, yearTo });
      }

      if (sortField) {
        films = sortFilms(films, sortField, sortOrder);
      }

      const hasClientFilter = genre || negara || yearFrom || yearTo;
      const total = hasClientFilter
        ? films.length
        : (raw?.totalItems ?? 0);

      return {
        data: {
          data:       films,
          total,
          page:       raw?.currentPage ?? page,
          totalPages: hasClientFilter
            ? Math.ceil(films.length / size)
            : (raw?.totalPages ?? Math.ceil(total / size)),
        },
      };
    } catch (error) {
      console.error('filmService.getFilms error:', error);
      return formatResponse(null, size);
    }
  },

  getFilmBySlug: async (slug) => {
    const response = await api.get(`/films/${slug}`);
    return response.data;
  },

  searchFilms: async (query, page = 0, size = 20) => {
    try {
      const response = await api.get('/films/search', {
        params: cleanParams({ q: query, page, size }),
      });
      return formatResponse(response.data, size);
    } catch (error) {
      console.error('filmService.searchFilms error:', error);
      return formatResponse(null, size);
    }
  },

  getPersonBySlug: async (slug) => {
    const response = await api.get(`/films/person/${slug}`);
    return response.data;
  },

  getCompanyBySlug: async (slug) => {
    const response = await api.get(`/films/company/${slug}`);
    return response.data;
  },

  fetchFromWikidata: async (qid) => {
    const response = await api.get(`/films/wikidata/${qid}`);
    return response.data;
  },
};

export default filmService;