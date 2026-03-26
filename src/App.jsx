// ============================================
// FILE: src/App.jsx
// PERUBAHAN: Tambah import CorrectionQueuePage + route /dasbor/koreksi
// ============================================
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'

import ProtectedRoute from './components/Auth/ProtectedRoute'
import GuestRoute from './components/Auth/GuestRoute'
import PublicLayout from './components/Layout/PublicLayout'
import AuthLayout from './components/Layout/AuthLayout'

import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import TableOfContentsPage from './pages/TableOfContentsPage'
import BookReviewsPage from './pages/BookReviewsPage'

import FilmsPage from './pages/FilmsPage'
import FilmDetailPage from './pages/FilmDetailPage'
import FilmWatchPage from './pages/FilmWatchPage'
import PersonDetailPage from './pages/PersonDetailPage'
import CompanyDetailPage from './pages/CompanyDetailPage'

import GenresPage from './pages/GenresPage'
import GenreDetailPage from './pages/GenreDetailPage'
import AuthorsPage from './pages/AuthorsPage'
import AuthorDetailPage from './pages/AuthorDetailPage'

import SearchResultsPage from './pages/SearchResultsPage'
import PopularBooksPage from './pages/PopularBooksPage'
import NewBooksPage from './pages/NewBooksPage'
import RecommendedBooksPage from './pages/RecommendedBooksPage'

import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import HowToReadPage from './pages/HowToReadPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

import ChapterReaderWrapper from './pages/ChapterReaderWrapper'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'

import NewspaperPage from './pages/NewspaperPage'
import NewspaperCategoryPage from './pages/NewspaperCategoryPage'
import NewspaperDatePage from './pages/NewspaperDatePage'
import NewspaperArticleDetailPage from './pages/NewspaperArticleDetailPage'
import NewspaperSearchPage from './pages/NewspaperSearchPage'
import NewspaperOnThisDayPage from './pages/NewspaperOnThisDayPage'

import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import MyLibraryPage from './pages/dashboard/MyLibraryPage'
import ReadingHistoryPage from './pages/dashboard/ReadingHistoryPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import AnnotationsPage from './pages/dashboard/AnnotationsPage'
import StatisticsPage from './pages/dashboard/StatisticsPage'
import CalendarPage from './pages/dashboard/CalendarPage'
import AchievementsPage from './pages/dashboard/AchievementsPage'
import GoalsPage from './pages/dashboard/GoalsPage'
import AdminPage from './pages/dashboard/AdminPage'

import BlogManagePage from './pages/dashboard/BlogManagePage'
import BlogEditorPage from './pages/dashboard/BlogEditorPage'

import NewspaperManagePage from './pages/dashboard/NewspaperManagePage'
import NewspaperEditorPage from './pages/dashboard/NewspaperEditorPage'

// ← BARU: Halaman antrian koreksi untuk admin
import CorrectionQueuePage from './pages/dashboard/CorrectionQueuePage'

import NotFoundPage from './pages/NotFoundPage'
import MaintenancePage from './pages/MaintenancePage'

import EpubReaderPage from './pages/EpubReaderPage'

function App() {
  const { theme } = useTheme()
  useGoogleAnalytics()

  useEffect(() => {
    document.body.className = theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

        {/* Book Routes */}
        <Route path="/buku" element={<PublicLayout><BooksPage /></PublicLayout>} />
        <Route path="/buku/terpopuler" element={<PublicLayout><PopularBooksPage /></PublicLayout>} />
        <Route path="/buku/terbaru" element={<PublicLayout><NewBooksPage /></PublicLayout>} />
        <Route path="/buku/rekomendasi" element={<PublicLayout><RecommendedBooksPage /></PublicLayout>} />
        <Route path="/buku/:bookSlug/daftar-isi" element={<PublicLayout><TableOfContentsPage /></PublicLayout>} />
        <Route path="/buku/:bookSlug/ulasan" element={<PublicLayout><BookReviewsPage /></PublicLayout>} />
        <Route path="/buku/:bookSlug" element={<PublicLayout><BookDetailPage /></PublicLayout>} />
        <Route path="/buku/:bookSlug/*" element={<ChapterReaderWrapper />} />
        <Route path="/buku/:bookSlug/baca" element={<EpubReaderPage />} />

        {/* Film Routes */}
        <Route path="/film" element={<PublicLayout><FilmsPage /></PublicLayout>} />
        <Route path="/film/:filmSlug" element={<PublicLayout><FilmDetailPage /></PublicLayout>} />
        <Route path="/film/:filmSlug/tonton" element={<FilmWatchPage />} />
        <Route path="/person/:personSlug" element={<PublicLayout><PersonDetailPage /></PublicLayout>} />
        <Route path="/perusahaan/:companySlug" element={<PublicLayout><CompanyDetailPage /></PublicLayout>} />

        {/* Blog Routes */}
        <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />

        {/* Koran Routes */}
        <Route path="/koran" element={<PublicLayout><NewspaperPage /></PublicLayout>} />
        <Route path="/koran/cari" element={<PublicLayout><NewspaperSearchPage /></PublicLayout>} />
        <Route path="/koran/hari-ini" element={<PublicLayout><NewspaperOnThisDayPage /></PublicLayout>} />
        <Route path="/koran/kategori/:categorySlug" element={<PublicLayout><NewspaperCategoryPage /></PublicLayout>} />
        <Route path="/koran/tanggal/:date" element={<PublicLayout><NewspaperDatePage /></PublicLayout>} />
        <Route path="/koran/:categorySlug/:date" element={<PublicLayout><NewspaperDatePage /></PublicLayout>} />
        <Route path="/koran/:categorySlug/:date/:articleSlug" element={<PublicLayout><NewspaperArticleDetailPage /></PublicLayout>} />

        {/* Search */}
        <Route path="/cari" element={<PublicLayout><SearchResultsPage /></PublicLayout>} />

        {/* Metadata Routes */}
        <Route path="/kategori" element={<PublicLayout><GenresPage /></PublicLayout>} />
        <Route path="/kategori/:genreSlug" element={<PublicLayout><GenreDetailPage /></PublicLayout>} />
        <Route path="/penulis" element={<PublicLayout><AuthorsPage /></PublicLayout>} />
        <Route path="/penulis/:authorSlug" element={<PublicLayout><AuthorDetailPage /></PublicLayout>} />

        {/* Static Pages */}
        <Route path="/tentang" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/cara-membaca" element={<PublicLayout><HowToReadPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/kontak" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/privasi" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path="/syarat-ketentuan" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />

        {/* Auth */}
        <Route path="/masuk" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/daftar" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/lupa-kata-sandi" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
        <Route path="/reset-kata-sandi" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
        <Route path="/verifikasi-email" element={<AuthLayout><VerifyEmailPage /></AuthLayout>} />

        {/* Protected Dashboard Routes */}
        <Route path="/dasbor" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="perpustakaan" element={<MyLibraryPage />} />
          <Route path="riwayat" element={<ReadingHistoryPage />} />
          <Route path="anotasi" element={<AnnotationsPage />} />
          <Route path="statistik" element={<StatisticsPage />} />
          <Route path="kalender" element={<CalendarPage />} />
          <Route path="pencapaian" element={<AchievementsPage />} />
          <Route path="target" element={<GoalsPage />} />
          <Route path="pengaturan" element={<SettingsPage />} />
          <Route path="kelola" element={<AdminPage />} />

          {/* Blog Admin */}
          <Route path="blog" element={<BlogManagePage />} />
          <Route path="blog/baru" element={<BlogEditorPage />} />
          <Route path="blog/edit/:id" element={<BlogEditorPage />} />

          {/* Koran Admin */}
          <Route path="koran" element={<NewspaperManagePage />} />
          <Route path="koran/baru" element={<NewspaperEditorPage />} />
          <Route path="koran/edit/:id" element={<NewspaperEditorPage />} />

          {/* ← BARU: Correction Queue Admin */}
          <Route path="koreksi" element={<CorrectionQueuePage />} />
        </Route>

        {/* Error Pages */}
        <Route path="/pemeliharaan" element={<MaintenancePage />} />
        <Route path="/404" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  )
}

export default App