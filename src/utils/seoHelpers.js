// ============================================
// src/utils/seoHelpers.js - COMPLETE ENHANCED VERSION
// All Structured Data Schemas for Perfect SEO
// ============================================

const BASE_URL = 'https://masasilam.com'

// ============================================
// WEBSITE SCHEMA - Critical for Brand Recognition
// ============================================
export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MasasilaM",
  "alternateName": "Perpustakaan Digital MasasilaM",
  "url": BASE_URL,
  "description": "Perpustakaan digital gratis untuk buku klasik domain publik dengan fitur smart reading, bookmark, dan highlight",
  "inLanguage": "id-ID",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/cari?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "MasasilaM",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/logo.png`,
      "width": 512,
      "height": 512
    },
    "sameAs": [
      // Add your social media URLs here
    ]
  }
})

// ============================================
// ORGANIZATION SCHEMA - For About/Contact Pages
// ============================================
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MasasilaM",
  "alternateName": "Perpustakaan Digital MasasilaM",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "description": "Platform perpustakaan digital yang menyediakan akses gratis ke buku-buku domain publik",
  "email": "support@masasilam.com",
  "foundingDate": "2025",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ID",
    "addressRegion": "Jawa Timur",
    "addressLocality": "Surabaya"
  },
  "sameAs": []
})

// ============================================
// ENHANCED BOOK SCHEMA with ReadAction
// ============================================
export const generateBookStructuredData = (book) => {
  const authorArray = book.authorNames
    ? book.authorNames.split(',').map((name, idx) => {
        const slugArray = book.authorSlugs?.split(',') || []
        return {
          "@type": "Person",
          "name": name.trim(),
          "url": slugArray[idx] ? `${BASE_URL}/penulis/${slugArray[idx].trim()}` : undefined
        }
      })
    : []

  const genreArray = book.genres?.split(',').map(g => g.trim()) || []

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "alternateName": book.subtitle || undefined,
    "author": authorArray,
    "description": book.description || `${book.title} oleh ${book.authorNames}`,
    "image": {
      "@type": "ImageObject",
      "url": book.coverImageUrl,
      "width": 800,
      "height": 1200
    },
    "url": `${BASE_URL}/buku/${book.slug}`,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "BOOK_ID",
      "value": book.id?.toString()
    },
    "inLanguage": "id-ID",
    "bookFormat": "https://schema.org/EBook",
    "bookEdition": book.edition?.toString(),
    "numberOfPages": book.totalPages,
    "timeRequired": `PT${book.estimatedReadTime || 0}M`,
    "copyrightYear": book.publicationYear,
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Domain Publik"
    },
    "publisher": {
      "@type": "Organization",
      "name": book.publisher || "MasasilaM",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": book.publishedAt || `${book.publicationYear}-01-01`,
    "dateModified": book.updatedAt,
    "genre": genreArray,
    "keywords": genreArray.join(', '),
    "isAccessibleForFree": true,
    "license": book.copyrightStatus === "Domain Publik"
      ? "https://creativecommons.org/publicdomain/zero/1.0/"
      : undefined,
    "aggregateRating": book.totalRatings > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": book.averageRating,
      "ratingCount": book.totalRatings,
      "bestRating": 5,
      "worstRating": 0.5
    } : undefined,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": book.readCount || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/DownloadAction",
        "userInteractionCount": book.downloadCount || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": book.viewCount || 0
      }
    ],
    "potentialAction": {
      "@type": "ReadAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/buku/${book.slug}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      },
      "expectsAcceptanceOf": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": {
          "@type": "Country",
          "name": "Indonesia"
        }
      }
    },
    "workExample": {
      "@type": "Book",
      "bookFormat": "https://schema.org/EBook",
      "fileFormat": `application/${book.fileFormat || 'epub'}`,
      "contentSize": book.fileSize ? `${(book.fileSize / 1024 / 1024).toFixed(2)}MB` : undefined,
      "potentialAction": {
        "@type": "DownloadAction",
        "target": book.fileUrl
      }
    }
  }
}

// ============================================
// AUTHOR / PERSON SCHEMA
// ============================================
export const generateAuthorStructuredData = (author, books = []) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "url": `${BASE_URL}/penulis/${author.slug}`,
    "image": author.photoUrl || undefined,
    "birthDate": author.birthDate || undefined,
    "deathDate": author.deathDate || undefined,
    "birthPlace": author.birthPlace || undefined,
    "nationality": {
      "@type": "Country",
      "name": author.nationality || "Indonesia"
    },
    "description": author.biography || `${author.name} adalah penulis yang karyanya tersedia di MasasilaM`,
    "sameAs": [],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Penulis"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "MasasilaM"
    },
    "workFeatured": books.slice(0, 10).map(book => ({
      "@type": "Book",
      "name": book.title,
      "url": `${BASE_URL}/buku/${book.slug}`
    }))
  }
}

// ============================================
// COLLECTION PAGE SCHEMA - For List Pages
// ============================================
export const generateCollectionPageStructuredData = (type, items, page, total, limit = 12) => {
  const typeMap = {
    'books': { name: 'Koleksi Buku', itemType: 'Book', basePath: 'buku' },
    'authors': { name: 'Daftar Penulis', itemType: 'Person', basePath: 'penulis' },
    'genres': { name: 'Kategori Buku', itemType: 'Thing', basePath: 'kategori' }
  }

  const config = typeMap[type] || typeMap.books
  const totalPages = Math.ceil(total / limit)

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${config.name} - Halaman ${page}`,
    "description": `Halaman ${page} dari ${totalPages} - Total ${total} ${config.name.toLowerCase()}`,
    "url": `${BASE_URL}/${type}${page > 1 ? `?page=${page}` : ''}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "MasasilaM",
      "url": BASE_URL
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": (page - 1) * limit + index + 1,
        "item": {
          "@type": config.itemType,
          "name": item.title || item.name,
          "url": `${BASE_URL}/${config.basePath}/${item.slug}`,
          "image": item.coverImageUrl || item.photoUrl || undefined
        }
      }))
    }
  }
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url === '#' ? undefined : `${BASE_URL}${crumb.url}`
    }))
  }
}

// ============================================
// CHAPTER SCHEMA - For Reading Pages
// ============================================
export const generateChapterStructuredData = (chapter, book) => {
  const chapterUrl = chapter.parentSlug
    ? `${BASE_URL}/buku/${book.slug}/${chapter.parentSlug}/${chapter.slug}`
    : `${BASE_URL}/buku/${book.slug}/${chapter.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "name": chapter.chapterTitle || chapter.title,
    "position": chapter.chapterNumber,
    "url": chapterUrl,
    "wordCount": chapter.wordCount,
    "timeRequired": `PT${chapter.estimatedReadTime || 1}M`,
    "inLanguage": "id-ID",
    "isPartOf": {
      "@type": "Book",
      "name": book.title,
      "author": book.authorNames?.split(',').map(name => ({
        "@type": "Person",
        "name": name.trim()
      })),
      "url": `${BASE_URL}/buku/${book.slug}`
    },
    "hasPart": chapter.breadcrumbs?.slice(1).map(bc => ({
      "@type": "Chapter",
      "name": bc.title,
      "url": `${BASE_URL}/buku/${book.slug}/${bc.slug}`
    }))
  }
}

// ============================================
// REVIEW SCHEMA - For Review Pages
// ============================================
export const generateReviewStructuredData = (reviews, book) => {
  if (!reviews || reviews.length === 0) return null

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "url": `${BASE_URL}/buku/${book.slug}`,
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.username || review.authorName || "Anonymous"
      },
      "datePublished": review.createdAt,
      "reviewBody": review.content || review.comment,
      "reviewRating": review.rating ? {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 0.5
      } : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "MasasilaM"
      }
    }))
  }
}

// ============================================
// TABLE OF CONTENTS SCHEMA
// ============================================
export const generateTableOfContentsStructuredData = (chapters, book) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Daftar Isi - ${book.title}`,
    "description": `Daftar lengkap ${chapters.length} bab dari buku ${book.title}`,
    "url": `${BASE_URL}/buku/${book.slug}/daftar-isi`,
    "isPartOf": {
      "@type": "Book",
      "name": book.title,
      "url": `${BASE_URL}/buku/${book.slug}`
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": chapters.length,
      "itemListElement": chapters.map((chapter, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Chapter",
          "name": chapter.title,
          "position": chapter.chapterNumber,
          "url": `${BASE_URL}/buku/${book.slug}/${chapter.slug}`
        }
      }))
    }
  }
}

// ============================================
// FAQ SCHEMA - For FAQ Page
// ============================================
export const generateFAQStructuredData = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// ============================================
// ARTICLE SCHEMA - For Blog/Static Pages
// ============================================
export const generateArticleStructuredData = (article) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image || `${BASE_URL}/og-image.jpg`,
    "datePublished": article.publishedAt,
    "dateModified": article.modifiedAt || article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "MasasilaM"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MasasilaM",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}${article.url}`
    }
  }
}

// ============================================
// SEARCH RESULTS SCHEMA
// ============================================
export const generateSearchResultsStructuredData = (query, results, total) => {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Hasil Pencarian: ${query}`,
    "url": `${BASE_URL}/cari?q=${encodeURIComponent(query)}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": total,
      "itemListElement": results.map((result, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "name": result.title,
          "url": `${BASE_URL}/buku/${result.slug}`
        }
      }))
    }
  }
}

// ============================================
// HELPER: Generate Multiple Schemas
// ============================================
export const combineStructuredData = (...schemas) => {
  return schemas.filter(Boolean)
}

// ============================================
// HELPER: Get Canonical URL
// ============================================
export const getCanonicalUrl = (path) => {
  return `${BASE_URL}${path.split('?')[0]}`
}

// ============================================
// HELPER: Generate Meta Description
// ============================================
export const generateMetaDescription = (text, maxLength = 160) => {
  if (!text) return ''
  const cleaned = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.length > maxLength
    ? `${cleaned.substring(0, maxLength - 3)}...`
    : cleaned
}

// ============================================
// HELPER: Generate Keywords
// ============================================
export const generateKeywords = (genres, author, bookTitle) => {
  const keywords = ['buku gratis', 'domain publik', 'perpustakaan digital', 'literasi digital']

  if (genres) {
    keywords.push(...genres.split(',').map(g => g.trim().toLowerCase()))
  }

  if (author) {
    keywords.push(author.toLowerCase())
  }

  if (bookTitle) {
    keywords.push(bookTitle.toLowerCase())
  }

  return keywords.join(', ')
}