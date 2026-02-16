// ============================================
// src/services/filmService.js - Film Service
// Clean, fast, SEO-ready
// ============================================
import api from './api';

const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));

const formatResponse = (data, limit) => ({
  data: {
    data: data?.films || data?.list || [],
    total: data?.totalItems || data?.total || 0,
    page: data?.currentPage || data?.page || 1,
    totalPages: data?.totalPages || Math.ceil((data?.totalItems || 0) / (limit || 12))
  }
});

export const filmService = {
  // Get all films with pagination
  getFilms: async (params = {}) => {
    try {
      const response = await api.get('/films', { params: cleanParams(params) });
      return formatResponse(response.data, params.size || params.limit);
    } catch (error) {
      return formatResponse(null, params.size || params.limit);
    }
  },

  // Get film by slug
  getFilmBySlug: async (slug) => {
    const response = await api.get(`/films/${slug}`);
    return response.data;
  },

  // Search films
  searchFilms: async (query, page = 0, size = 20) => {
    try {
      const response = await api.get('/films/search', {
        params: cleanParams({ q: query, page, size })
      });
      return formatResponse(response.data, size);
    } catch (error) {
      return formatResponse(null, size);
    }
  },

  // Get person by slug
  getPersonBySlug: async (slug) => {
    const response = await api.get(`/films/person/${slug}`);
    return response.data;
  },

  // Get company by slug
  getCompanyBySlug: async (slug) => {
    const response = await api.get(`/films/company/${slug}`);
    return response.data;
  },

  // Fetch film from Wikidata
  fetchFromWikidata: async (qid) => {
    const response = await api.get(`/films/wikidata/${qid}`);
    return response.data;
  }
};

export default filmService;