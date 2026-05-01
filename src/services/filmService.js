// ============================================
// src/services/filmService.js
//
// FIX LOG:
//  ✓ getFilms: searchTitle → /films/search?q=... (bukan /films)
//  ✓ getFilms: genre/negara/year dipass ke search endpoint via q compound
//  ✓ sort: dihandle client-side karena backend tidak support sortField
//  ✓ formatResponse: normalise field names dari dua endpoint berbeda
// ============================================

import api from './api';

// Hapus value kosong / null agar tidak dikirim ke backend
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );

// Normalise response dari dua endpoint:
//   /films        → { films, totalItems, currentPage, totalPages }
//   /films/search → { films, query, totalItems, currentPage, totalPages }
const formatResponse = (data, limit = 12) => ({
  data: {
    data:       data?.films || data?.list || [],
    total:      data?.totalItems ?? data?.total ?? 0,
    page:       data?.currentPage ?? data?.page ?? 0,
    totalPages: data?.totalPages ?? Math.ceil((data?.totalItems ?? 0) / limit),
  },
});

// ── Client-side sort (karena backend /films tidak support sortField) ──────────
const sortFilms = (films, sortField, sortOrder) => {
  if (!sortField || !films?.length) return films;
  const dir = sortOrder === 'ASC' ? 1 : -1;
  return [...films].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    // Angka
    if (!isNaN(parseFloat(va)) && !isNaN(parseFloat(vb))) {
      return (parseFloat(va) - parseFloat(vb)) * dir;
    }
    // String / tanggal
    va = String(va ?? '').toLowerCase();
    vb = String(vb ?? '').toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });
};

// ── Client-side filter (backend search hanya support q/page/size) ─────────────
const filterFilms = (films, { genre, negara, yearFrom, yearTo }) => {
  if (!films?.length) return films;
  return films.filter(film => {
    // Genre
    if (genre) {
      const filmGenres = Array.isArray(film.genre)
        ? film.genre.join(' ').toLowerCase()
        : String(film.genre ?? '').toLowerCase();
      if (!filmGenres.includes(genre.toLowerCase())) return false;
    }
    // Negara
    if (negara) {
      const filmNegara = String(
        film.negaraAsal || film.negara || ''
      ).toLowerCase();
      if (!filmNegara.includes(negara.toLowerCase())) return false;
    }
    // Tahun dari
    if (yearFrom) {
      const filmYear = parseInt(String(film.tahunRilis ?? '').slice(0, 4), 10);
      if (filmYear < parseInt(yearFrom, 10)) return false;
    }
    // Tahun sampai
    if (yearTo) {
      const filmYear = parseInt(String(film.tahunRilis ?? '').slice(0, 4), 10);
      if (filmYear > parseInt(yearTo, 10)) return false;
    }
    return true;
  });
};

// ─────────────────────────────────────────────────────────────────────────────

export const filmService = {

  /**
   * getFilms — satu-satunya entry point dari FilmsPage.
   *
   * Routing:
   *  • Ada searchTitle → GET /films/search?q=searchTitle&page=...&size=...
   *  • Tidak ada       → GET /films?page=...&size=...
   *
   * Sort & filter genre/negara/tahun dilakukan client-side setelah dapat data,
   * karena backend belum mendukung parameter tersebut.
   *
   * Catatan paging:
   *  Backend menggunakan 0-indexed page. FilmsPage sudah mengirim page-1.
   */
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
        // ── Search endpoint ────────────────────────────────────────
        // Backend: GET /films/search?q=...&page=...&size=...
        // Response: { films, query, currentPage, totalItems, totalPages }
        const res = await api.get('/films/search', {
          params: cleanParams({ q: searchTitle.trim(), page, size }),
        });
        raw = res.data;
      } else {
        // ── List endpoint ──────────────────────────────────────────
        // Backend: GET /films?page=...&size=...
        // Response: { films, currentPage, totalItems, totalPages }
        const res = await api.get('/films', {
          params: cleanParams({ page, size }),
        });
        raw = res.data;
      }

      // ── Client-side filter & sort ──────────────────────────────
      let films = raw?.films || [];

      // 1. Filter genre/negara/tahun
      if (genre || negara || yearFrom || yearTo) {
        films = filterFilms(films, { genre, negara, yearFrom, yearTo });
      }

      // 2. Sort (semua field)
      if (sortField) {
        films = sortFilms(films, sortField, sortOrder);
      }

      // Kembalikan dengan total yang sudah difilter jika ada filter aktif
      const hasClientFilter = genre || negara || yearFrom || yearTo;
      const total = hasClientFilter
        ? films.length     // setelah filter, total berubah
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

  // Get film by slug → GET /films/{slug}
  getFilmBySlug: async (slug) => {
    const response = await api.get(`/films/${slug}`);
    return response.data;
  },

  // Search films langsung (bisa dipanggil dari komponen lain)
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

  // Get person by slug → GET /films/person/{slug}
  getPersonBySlug: async (slug) => {
    const response = await api.get(`/films/person/${slug}`);
    return response.data;
  },

  // Get company by slug → GET /films/company/{slug}
  getCompanyBySlug: async (slug) => {
    const response = await api.get(`/films/company/${slug}`);
    return response.data;
  },

  // Fetch from Wikidata → GET /films/wikidata/{qid}
  fetchFromWikidata: async (qid) => {
    const response = await api.get(`/films/wikidata/${qid}`);
    return response.data;
  },
};

export default filmService;