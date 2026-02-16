// ============================================
// src/pages/FilmDetailPage.jsx - SEMPURNA SEPERTI BUKU
// ============================================

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { filmService } from '../services/filmService'
import {
  Calendar, Clock, Globe, Film, Play, Download, User,
  Building2, Tag, ArrowLeft, Share2, Eye
} from 'lucide-react'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'

export default function FilmDetailPage() {
  const { filmSlug } = useParams()
  const navigate = useNavigate()
  const [showAllCast, setShowAllCast] = useState(false)
  const [showFilmDetails, setShowFilmDetails] = useState(false)

  const { data: film, isLoading, error } = useQuery({
    queryKey: ['film', filmSlug],
    queryFn: async () => {
      const response = await filmService.getFilmBySlug(filmSlug)
      return response.data || response
    },
    retry: 1,
    staleTime: 5 * 60 * 1000
  })

  const handleShare = async () => {
    const shareData = {
      title: film.judul,
      text: `Tonton "${film.judul}"`,
      url: window.location.href
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Link disalin ke clipboard!')
      }
    } catch {}
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  if (error || !film || !film.judul) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Film className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? 'Gagal memuat film' : 'Film tidak ditemukan'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || 'Film yang Anda cari tidak tersedia'}
          </p>
          <Link to="/film" className="text-blue-600 dark:text-blue-400 hover:underline">
            Kembali ke daftar film
          </Link>
        </div>
      </div>
    )
  }

  const displayedCast = showAllCast ? film.pemeran : film.pemeran?.slice(0, 6) || []
  const year = film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : null

  return (
    <>
      <Helmet>
        <title>
          {film.judul}
          {year ? ` (${year})` : ''} - Film Domain Publik
        </title>
        <meta
          name="description"
          content={film.deskripsi || `${film.judul} - Film klasik domain publik`}
        />
      </Helmet>

      <div className="min-h-screen py-8 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto" aria-label="Breadcrumb">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              Beranda
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <Link to="/film" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              Koleksi Film
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">{film.judul}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/film')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 group transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Koleksi Film</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SIDEBAR - Poster */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4 shadow-lg">
                  {film.posterUrl ? (
                    <img
                      src={film.posterUrl}
                      alt={`Poster ${film.judul}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {film.videoUrl && (
                    <Button
                      fullWidth
                      variant="primary"
                      size="lg"
                      onClick={() => navigate(`/film/${filmSlug}/tonton`)}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Tonton Film
                    </Button>
                  )}

                  {film.videoUrl && (
                    <a
                      href={film.videoUrl}
                      download
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Unduh Film
                    </a>
                  )}

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Bagikan
                  </Button>
                </div>

                {/* Additional Info Card */}
                {(film.negaraAsal || film.jenis || film.wikidataQid) && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 text-sm border border-gray-200 dark:border-gray-700">
                    {film.negaraAsal && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Negara</div>
                          <div className="font-medium text-gray-900 dark:text-white">{film.negaraAsal}</div>
                        </div>
                      </div>
                    )}

                    {film.jenis && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Jenis</div>
                        <div className="font-medium text-gray-900 dark:text-white">{film.jenis}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <article className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{film.judul}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                {year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{year}</span>
                  </div>
                )}
                {film.durasi && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{film.durasi}</span>
                  </div>
                )}
                {film.negaraAsal && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>{film.negaraAsal}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {film.deskripsi && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sinopsis</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {film.deskripsi}
                  </p>
                </section>
              )}

              {/* Genres */}
              {film.genre && film.genre.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Tag className="w-5 h-5" />
                    Genre
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {film.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Directors */}
              {film.sutradara && film.sutradara.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Sutradara</h2>
                  <div className="flex flex-wrap gap-3">
                    {film.sutradara.map((director, index) => (
                      <Link
                        key={`director-${director.id}-${index}`}
                        to={`/person/${director.slug}`}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                      >
                        {director.photoUrl ? (
                          <img
                            src={director.photoUrl}
                            alt={director.name}
                            className="w-12 h-12 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {director.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Cast */}
              {film.pemeran && film.pemeran.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Pemeran</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayedCast.map((actor, index) => (
                      <Link
                        key={`actor-${actor.id}-${index}`}
                        to={`/person/${actor.slug}`}
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                      >
                        {actor.photoUrl ? (
                          <img
                            src={actor.photoUrl}
                            alt={actor.name}
                            className="w-12 h-12 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {actor.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {film.pemeran.length > 6 && (
                    <button
                      onClick={() => setShowAllCast(!showAllCast)}
                      className="mt-3 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      {showAllCast
                        ? 'Tampilkan lebih sedikit'
                        : `Lihat semua pemeran (${film.pemeran.length})`
                      }
                    </button>
                  )}
                </section>
              )}

              {/* Production Companies */}
              {film.perusahaanProduksi && film.perusahaanProduksi.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Building2 className="w-5 h-5" />
                    Perusahaan Produksi
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {film.perusahaanProduksi.map((company, index) => (
                      <Link
                        key={`company-${company.id}-${index}`}
                        to={`/perusahaan/${company.slug}`}
                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {company.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Film Details Collapsible */}
              {(film.durasi || film.tahunRilis || film.negaraAsal || film.jenis) && (
                <section className="mb-8">
                  <button
                    onClick={() => setShowFilmDetails(!showFilmDetails)}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Film className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Detail Film Lengkap</span>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform text-gray-500 dark:text-gray-400 ${showFilmDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFilmDetails && (
                    <div className="mt-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {film.durasi && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Durasi</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.durasi}</div>
                          </div>
                        )}
                        {year && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Tahun Rilis</div>
                            <div className="font-medium text-gray-900 dark:text-white">{year}</div>
                          </div>
                        )}
                        {film.negaraAsal && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Negara Asal</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.negaraAsal}</div>
                          </div>
                        )}
                        {film.jenis && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Jenis</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.jenis}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Subtitles Info */}
              {film.subtitleUrl && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>✨ Subtitle tersedia:</strong>{' '}
                    <a
                      href={film.subtitleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline font-medium"
                    >
                      Unduh subtitle
                    </a>
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  )
}