// ============================================
// src/components/Common/SEO.jsx - ENHANCED VERSION
// Universal SEO Component with Full Features
// ============================================
import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

const SEO = ({
  // Basic Meta
  title,
  description,
  image,
  url,
  type = 'website',

  // Author & Dates
  author,
  publishedTime,
  modifiedTime,

  // SEO Control
  keywords,
  noindex = false,
  nofollow = false,
  canonical,

  // Pagination
  prevUrl,
  nextUrl,

  // Alternate Languages (future-proofing)
  alternateUrls = [],

  // Structured Data
  structuredData,

  // Open Graph Extras
  ogType,
  ogLocale = 'id_ID',

  // Twitter Card Type
  twitterCard = 'summary_large_image',
}) => {
  const siteUrl = 'https://masasilam.com'
  const siteName = 'MasasilaM'
  const defaultTitle = 'MasasilaM - Perpustakaan Digital Buku Domain Publik'
  const defaultDescription = 'Perpustakaan digital gratis untuk buku klasik domain publik Indonesia. Akses ribuan buku dengan fitur smart reading, bookmark, dan highlight.'
  const defaultImage = `${siteUrl}/og-image.jpg`

  // Process Title
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle

  // Process URL
  const fullUrl = canonical || (url ? `${siteUrl}${url}` : siteUrl)

  // Process Image
  const fullImage = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
    : defaultImage

  // Process Description
  const metaDescription = description || defaultDescription

  // Robots Meta
  const robotsContent = []
  if (noindex) robotsContent.push('noindex')
  if (nofollow) robotsContent.push('nofollow')
  if (!noindex && !nofollow) robotsContent.push('index', 'follow')
  robotsContent.push('max-image-preview:large', 'max-snippet:-1', 'max-video-preview:-1')

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent.join(', ')} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Pagination Links */}
      {prevUrl && <link rel="prev" href={`${siteUrl}${prevUrl}`} />}
      {nextUrl && <link rel="next" href={`${siteUrl}${nextUrl}`} />}

      {/* Alternate Language URLs */}
      {alternateUrls.map(alt => (
        <link
          key={alt.lang}
          rel="alternate"
          hrefLang={alt.lang}
          href={`${siteUrl}${alt.url}`}
        />
      ))}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType || type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />

      {/* Article Meta (for blog posts, book pages) */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title || siteName} />

      {/* Performance Optimization */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Structured Data - Single or Multiple */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script
              key={`structured-data-${index}`}
              type="application/ld+json"
            >
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  )
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  keywords: PropTypes.string,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  canonical: PropTypes.string,
  prevUrl: PropTypes.string,
  nextUrl: PropTypes.string,
  alternateUrls: PropTypes.arrayOf(PropTypes.shape({
    lang: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })),
  structuredData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]),
  ogType: PropTypes.string,
  ogLocale: PropTypes.string,
  twitterCard: PropTypes.string,
}

export default SEO