// src/App.jsx - FIXED ROUTES WITH GENRE, AUTHORS
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import './styles/index.css'

// Layout Components
import ProtectedRoute from './components/Auth/ProtectedRoute'
import GuestRoute from './components/Auth/GuestRoute'
import PublicLayout from './components/Layout/PublicLayout'
import AuthLayout from './components/Layout/AuthLayout'
import ReaderLayout from './components/Layout/ReaderLayout'

// Public Pages
import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import TableOfContentsPage from './pages/TableOfContentsPage'
import BookReviewsPage from './pages/BookReviewsPage'

// Metadata Pages (NEW)
import GenresPage from './pages/GenresPage'
import CategoryPage from './pages/CategoryPage'
import AuthorsPage from './pages/AuthorsPage'
import AuthorDetailPage from './pages/AuthorDetailPage'

import SearchResultsPage from './pages/SearchResultsPage'
import PopularBooksPage from './pages/PopularBooksPage'
import NewBooksPage from './pages/NewBooksPage'
import RecommendedBooksPage from './pages/RecommendedBooksPage'

// Static Pages
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import HowToReadPage from './pages/HowToReadPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

// Reading Experience
import ChapterReaderWrapper from './pages/ChapterReaderWrapper'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

// Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import MyLibraryPage from './pages/dashboard/MyLibraryPage'
import ReadingHistoryPage from './pages/dashboard/ReadingHistoryPage'
import { BookmarksPage } from './pages/dashboard/BookmarksPage'
import { HighlightsPage } from './pages/dashboard/HighlightsPage'
import { NotesPage } from './pages/dashboard/NotesPage'
import { MyReviewsPage } from './pages/dashboard/MyReviewsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import AnnotationsPage from './pages/dashboard/AnnotationsPage'
import StatisticsPage from './pages/dashboard/StatisticsPage'

// Tambahkan komponen yang belum diimpor
import CalendarPage from './pages/dashboard/CalendarPage'
import AchievementsPage from './pages/dashboard/AchievementsPage'
import GoalsPage from './pages/dashboard/GoalsPage'

// Error Pages
import NotFoundPage from './pages/NotFoundPage'
import MaintenancePage from './pages/MaintenancePage'

function App() {
  const { theme } = useTheme()

  useEffect(() => {
    document.body.className = theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/buku" element={<PublicLayout><BooksPage /></PublicLayout>} />
        <Route path="/buku/terpopuler" element={<PublicLayout><PopularBooksPage /></PublicLayout>} />
        <Route path="/buku/terbaru" element={<PublicLayout><NewBooksPage /></PublicLayout>} />
        <Route path="/buku/rekomendasi" element={<PublicLayout><RecommendedBooksPage /></PublicLayout>} />
        <Route path="/cari" element={<PublicLayout><SearchResultsPage /></PublicLayout>} />
        
        {/* ============ METADATA ROUTES (NEW) ============ */}
        {/* Genre/Category Routes */}
        <Route path="/kategori" element={<PublicLayout><GenresPage /></PublicLayout>} />
        <Route path="/kategori/:genreSlug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        
        {/* Author Routes */}
        <Route path="/penulis" element={<PublicLayout><AuthorsPage /></PublicLayout>} />
        <Route path="/penulis/:authorSlug" element={<PublicLayout><AuthorDetailPage /></PublicLayout>} />
        
        {/* ============ BOOK ROUTES (ORDER MATTERS!) ============ */}
        {/* Book meta pages - must be exact matches before wildcard */}
        <Route path="/buku/:bookSlug/daftar-isi" element={<PublicLayout><TableOfContentsPage /></PublicLayout>} />
        <Route path="/buku/:bookSlug/ulasan" element={<PublicLayout><BookReviewsPage /></PublicLayout>} />
        
        {/* Book detail - must come before chapter wildcard */}
        <Route path="/buku/:bookSlug" element={<PublicLayout><BookDetailPage /></PublicLayout>} />
        
        {/* Chapter reading - hierarchical path (CLEAN URLs) */}
        <Route path="/buku/:bookSlug/*" element={<ChapterReaderWrapper />} />
        
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

        {/* Protected Dashboard Routes - FIXED SYNTAX */}
        <Route path="/dasbor" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardOverview />} />
          <Route path="perpustakaan" element={<MyLibraryPage />} />
          <Route path="riwayat" element={<ReadingHistoryPage />} />
          <Route path="anotasi" element={<AnnotationsPage />} />
          <Route path="statistik" element={<StatisticsPage />} />
          <Route path="kalender" element={<CalendarPage />} />
          <Route path="pencapaian" element={<AchievementsPage />} />
          <Route path="target" element={<GoalsPage />} />
          <Route path="pengaturan" element={<SettingsPage />} />
          
          {/* Tambahkan route untuk dashboard yang sudah diimpor */}
          <Route path="penanda" element={<BookmarksPage />} />
          <Route path="sorotan" element={<HighlightsPage />} />
          <Route path="catatan" element={<NotesPage />} />
          <Route path="ulasan-saya" element={<MyReviewsPage />} />
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