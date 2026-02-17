// ============================================
// src/pages/FilmDetailPage.jsx - PORTRAIT POSTER (2:3) + IMAGE GALLERY - FIXED
// ============================================

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { filmService } from '../services/filmService'
import {
  Calendar, Clock, Globe, Film, Play, Download, User,
  Building2, Tag, ArrowLeft, Share2, Eye, DollarSign,
  Star, Award, Video, Edit, Camera, Music, Users, Image
} from 'lucide-react'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import TrailerModal from '../components/Film/TrailerModal'

export default function FilmDetailPage() {
  const { filmSlug } = useParams()
  const navigate = useNavigate()
  const [showAllCast, setShowAllCast] = useState(false)
  const [showFilmDetails, setShowFilmDetails] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

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

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        trailerUrl={film.trailerUrl}
        filmTitle={film.judul}
      />

      {/* Lightbox untuk imageUrls */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Film still"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}

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
            {/* SIDEBAR - Poster PORTRAIT (2:3) - FIXED */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">

                {/* PORTRAIT POSTER 2:3 - seperti poster film asli */}
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

                {/* Image Gallery - tampilkan imageUrls sebagai still foto */}
                {film.imageUrls && film.imageUrls.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      Foto dari Film
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {film.imageUrls.map((imgUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(imgUrl)}
                          className="aspect-[16/9] rounded overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={imgUrl}
                            alt={`${film.judul} - foto ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                      Tonton Film Lengkap
                    </Button>
                  )}

                  {film.trailerUrl && (
                    <Button
                      fullWidth
                      variant="secondary"
                      size="lg"
                      onClick={() => setShowTrailerModal(true)}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Tonton Trailer
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

                {/* Review Scores */}
                {film.reviewScores && film.reviewScores.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      Rating Kritikus
                    </h3>
                    <div className="space-y-2">
                      {film.reviewScores.map((review, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{review.source}</span>
                          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                            {review.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget & Box Office */}
                {(film.budget || (film.boxOffice && film.boxOffice.length > 0)) && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Finansial
                    </h3>
                    <div className="space-y-2">
                      {film.budget && (
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Budget</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {film.budget.displayValue}
                          </div>
                        </div>
                      )}
                      {film.boxOffice && film.boxOffice.map((bo, index) => (
                        <div key={index}>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Box Office {bo.region !== 'worldwide' ? `(${bo.region})` : '(Worldwide)'}
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {bo.displayValue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info Card */}
                {(film.negaraAsal || film.jenis || film.color || film.originalLanguage) && (
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

                    {film.color && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Warna</div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">{film.color}</div>
                      </div>
                    )}

                    {film.originalLanguage && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Bahasa Asli</div>
                        <div className="font-medium text-gray-900 dark:text-white">{film.originalLanguage}</div>
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

              {/* Screenwriters */}
              {film.penulisSkenario && film.penulisSkenario.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Edit className="w-5 h-5" />
                    Penulis Skenario
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {film.penulisSkenario.map((writer, index) => (
                      <Link
                        key={`writer-${writer.id}-${index}`}
                        to={`/person/${writer.slug}`}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                      >
                        {writer.photoUrl ? (
                          <img
                            src={writer.photoUrl}
                            alt={writer.name}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {writer.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Cast */}
              {film.pemeran && film.pemeran.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5" />
                    Pemeran
                  </h2>
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
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
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

              {/* Tim Kreatif */}
              {((film.cinematographer && film.cinematographer.length > 0) ||
                (film.filmEditor && film.filmEditor.length > 0) ||
                (film.composer && film.composer.length > 0) ||
                (film.produser && film.produser.length > 0)) && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tim Kreatif</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {film.cinematographer && film.cinematographer.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Sinematografer
                        </h3>
                        {film.cinematographer.map((person, index) => (
                          <Link
                            key={`cinematographer-${person.id}-${index}`}
                            to={`/person/${person.slug}`}
                            className="block text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                          >
                            {person.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {film.filmEditor && film.filmEditor.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          Editor
                        </h3>
                        {film.filmEditor.map((person, index) => (
                          <Link
                            key={`editor-${person.id}-${index}`}
                            to={`/person/${person.slug}`}
                            className="block text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                          >
                            {person.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {film.composer && film.composer.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Komposer Musik
                        </h3>
                        {film.composer.map((person, index) => (
                          <Link
                            key={`composer-${person.id}-${index}`}
                            to={`/person/${person.slug}`}
                            className="block text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                          >
                            {person.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {film.produser && film.produser.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Produser
                        </h3>
                        {film.produser.map((person, index) => (
                          <Link
                            key={`producer-${person.id}-${index}`}
                            to={`/person/${person.slug}`}
                            className="block text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-1"
                          >
                            {person.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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

              {/* Distributors */}
              {film.distributor && film.distributor.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Building2 className="w-5 h-5" />
                    Distributor
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {film.distributor.map((company, index) => (
                      <Link
                        key={`distributor-${company.id}-${index}`}
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
              {(film.durasi || film.tahunRilis || film.negaraAsal || film.jenis ||
                film.narrativeLocation || film.filmingLocation || film.followedBy || film.partOfSeries) && (
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
                        {film.narrativeLocation && film.narrativeLocation.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Lokasi Cerita</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.narrativeLocation.join(', ')}</div>
                          </div>
                        )}
                        {film.filmingLocation && film.filmingLocation.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Lokasi Syuting</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.filmingLocation.join(', ')}</div>
                          </div>
                        )}
                        {film.followedBy && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Sekuel</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.followedBy}</div>
                          </div>
                        )}
                        {film.partOfSeries && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Bagian dari Series</div>
                            <div className="font-medium text-gray-900 dark:text-white">{film.partOfSeries}</div>
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