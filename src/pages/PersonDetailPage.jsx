// ============================================
// src/pages/PersonDetailPage.jsx - SEMPURNA SEPERTI BUKU
// ============================================

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { filmService } from '../services/filmService'
import { User, Film, ExternalLink, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/Common/LoadingSpinner'

export default function PersonDetailPage() {
  const { personSlug } = useParams()
  const navigate = useNavigate()

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', personSlug],
    queryFn: () => filmService.getPersonBySlug(personSlug),
    retry: 1
  })

  if (isLoading) return <LoadingSpinner fullScreen />

  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center px-4">
          <User className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Person tidak ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Informasi person yang Anda cari tidak tersedia
          </p>
          <Link
            to="/film"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Kembali ke daftar film
          </Link>
        </div>
      </div>
    )
  }

  const wikidataUrl = person.wikidataQid
    ? `https://www.wikidata.org/wiki/${person.wikidataQid}`
    : null

  return (
    <>
      <Helmet>
        <title>{person.name} - Aktor/Aktris Domain Publik</title>
        <meta
          name="description"
          content={person.description || `${person.name} - Filmografi dan informasi`}
        />
      </Helmet>

      <div className="min-h-screen py-8 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto" aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Beranda
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <Link
              to="/film"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Koleksi Film
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {person.name}
            </span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 group transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* Photo */}
            <div className="md:w-80 flex-shrink-0">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4 shadow-lg">
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {wikidataUrl && (
                <a
                  href={wikidataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-900 dark:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lihat di Wikidata
                </a>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {person.name}
              </h1>

              {person.description && (
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {person.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Film className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Film</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filmography */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Filmografi
            </h2>
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Film className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Daftar film akan ditampilkan di sini
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}