// ============================================
// src/utils/constants.js
// ============================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lentera-pustaka.up.railway.app'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MasasilaM'
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Platform Perpustakaan Digital'

export const ROUTES = {
  HOME: '/',
  BOOKS: '/buku',
  BOOK_DETAIL: '/buku/:bookSlug',
  BOOK_TOC: '/buku/:bookSlug/daftar-isi',
  BOOK_REVIEWS: '/buku/:bookSlug/ulasan',
  READ_ENTRY: '/buku/:bookSlug/bab',
  READ_CHAPTER: '/buku/:bookSlug/bab/:chapterNumber',
  CATEGORIES: '/kategori',
  CATEGORY_DETAIL: '/kategori/:genreSlug',
  AUTHORS: '/penulis',
  AUTHOR_DETAIL: '/penulis/:authorSlug',
  SEARCH: '/cari',
  POPULAR: '/buku/terpopuler',
  NEW: '/buku/terbaru',
  RECOMMENDED: '/buku/rekomendasi',
  LOGIN: '/masuk',
  REGISTER: '/daftar',
  FORGOT_PASSWORD: '/lupa-kata-sandi',
  RESET_PASSWORD: '/reset-kata-sandi',
  VERIFY_EMAIL: '/verifikasi-email',
  DASHBOARD: '/dasbor',
  DASHBOARD_LIBRARY: '/dasbor/perpustakaan',
  DASHBOARD_HISTORY: '/dasbor/riwayat',
  DASHBOARD_BOOKMARKS: '/dasbor/penanda',
  DASHBOARD_HIGHLIGHTS: '/dasbor/sorotan',
  DASHBOARD_NOTES: '/dasbor/catatan',
  DASHBOARD_REVIEWS: '/dasbor/ulasan',
  DASHBOARD_SETTINGS: '/dasbor/pengaturan',
  ABOUT: '/tentang',
  HOW_TO_READ: '/cara-membaca',
  FAQ: '/faq',
  CONTACT: '/kontak',
  PRIVACY: '/privasi',
  TERMS: '/syarat-ketentuan',
  NOT_FOUND: '/404',
  MAINTENANCE: '/pemeliharaan',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  BOOKS_PER_PAGE: 12,
  REVIEWS_PER_PAGE: 10,
  CHAPTERS_PER_PAGE: 20,
}

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
}

export const BOOK_SORT_OPTIONS = [
  { value: 'updateAt', label: 'Terbaru' },
  { value: 'viewCount', label: 'Terpopuler' },
  { value: 'title', label: 'Judul A-Z' },
  { value: 'averageRating', label: 'Rating Tertinggi' },
  { value: 'estimatedReadTime', label: 'Waktu Baca' },
]

export const HIGHLIGHT_COLORS = [
  { value: 'yellow', label: 'Kuning', class: 'bg-yellow-200' },
  { value: 'green', label: 'Hijau', class: 'bg-green-200' },
  { value: 'blue', label: 'Biru', class: 'bg-blue-200' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-200' },
  { value: 'purple', label: 'Ungu', class: 'bg-purple-200' },
]

export const READING_SPEEDS = {
  SLOW: 150,      // words per minute
  AVERAGE: 200,
  FAST: 300,
}