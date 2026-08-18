export const parseSubtitleUrl = (url) => {
  if (!url) return null

  // If it's a wiki page URL, convert to raw file URL
  if (url.includes('/wiki/TimedText:')) {
    // Extract the title part from wiki URL
    const titleMatch = url.match(/\/wiki\/(TimedText:.+)$/)
    if (titleMatch) {
      const title = titleMatch[1]
      return `https://commons.wikimedia.org/w/index.php?title=${title}&action=raw`
    }
  }

  // If it's already a direct URL (e.g., .srt, .vtt), return as is
  if (url.endsWith('.srt') || url.endsWith('.vtt')) {
    return url
  }

  // If unknown format, return original
  return url
}

/**
 * Check if film has valid subtitle
 *
 * @param {object} film - Film object from API
 * @returns {boolean} - True if has valid subtitle
 *
 * @example
 * {hasSubtitle(film) && <SubtitleComponent />}
 */
export const hasSubtitle = (film) => {
  if (!film?.subtitleUrl) return false
  const parsedUrl = parseSubtitleUrl(film.subtitleUrl)
  return !!parsedUrl
}

/**
 * Get subtitle language code from URL
 *
 * @param {string} url - Subtitle URL
 * @returns {string} - Language code (e.g., 'en', 'id', 'fr')
 *
 * @example
 * getSubtitleLanguage('...Night_of_the_Living_Dead.webm.en.srt')
 * // Returns: 'en'
 */
export const getSubtitleLanguage = (url) => {
  if (!url) return 'en' // default

  // Try to extract language code from filename
  // Pattern: filename.LANG.srt or filename.webm.LANG.srt
  const match = url.match(/\.([a-z]{2})\.srt$/i)
  return match ? match[1] : 'en'
}

/**
 * Get subtitle language label
 *
 * @param {string} code - Language code
 * @returns {string} - Human-readable language name
 *
 * @example
 * getSubtitleLabel('en') // Returns: 'English'
 * getSubtitleLabel('id') // Returns: 'Indonesian'
 */
export const getSubtitleLabel = (code) => {
  const labels = {
    'en': 'English',
    'id': 'Indonesian',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'ru': 'Russian',
    'pt': 'Portuguese',
    'it': 'Italian',
  }

  return labels[code] || code.toUpperCase()
}

/**
 * Format video duration from seconds to readable string
 *
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration (e.g., "1:35:52" or "5:30")
 *
 * @example
 * formatDuration(5752) // Returns: "1:35:52"
 * formatDuration(330)  // Returns: "5:30"
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse duration string to seconds
 *
 * @param {string} duration - Duration string (e.g., "96 menit", "1h 35m")
 * @returns {number} - Duration in seconds
 *
 * @example
 * parseDuration("96 menit")     // Returns: 5760
 * parseDuration("1h 35m")       // Returns: 5700
 * parseDuration("1:35:52")      // Returns: 5752
 */
export const parseDuration = (duration) => {
  if (!duration) return 0

  // Format: "96 menit"
  const menitMatch = duration.match(/(\d+)\s*menit/i)
  if (menitMatch) {
    return parseInt(menitMatch[1]) * 60
  }

  // Format: "1h 35m" or "1 hour 35 minutes"
  const hourMinMatch = duration.match(/(\d+)h[our]*\s*(\d+)?m[inute]*/i)
  if (hourMinMatch) {
    const hours = parseInt(hourMinMatch[1])
    const minutes = hourMinMatch[2] ? parseInt(hourMinMatch[2]) : 0
    return (hours * 3600) + (minutes * 60)
  }

  // Format: "1:35:52" or "5:30"
  const timeMatch = duration.match(/(\d+):(\d+)(?::(\d+))?/)
  if (timeMatch) {
    const hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2])
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0

    // If only 2 parts, assume minutes:seconds
    if (!timeMatch[3]) {
      return (hours * 60) + minutes
    }

    return (hours * 3600) + (minutes * 60) + seconds
  }

  return 0
}

/**
 * Check if video URL is valid and accessible
 *
 * @param {string} url - Video URL
 * @returns {boolean} - True if valid video URL
 *
 * @example
 * isValidVideoUrl('https://...video.webm') // Returns: true
 * isValidVideoUrl('not-a-url')              // Returns: false
 */
export const isValidVideoUrl = (url) => {
  if (!url) return false

  try {
    const validUrl = new URL(url)
    const validExtensions = ['.webm', '.mp4', '.ogg', '.ogv']
    return validExtensions.some(ext => url.toLowerCase().includes(ext))
  } catch {
    return false
  }
}

/**
 * Get video thumbnail from Wikimedia Commons URL
 *
 * @param {string} videoUrl - Wikimedia video URL
 * @param {number} width - Thumbnail width (default: 300)
 * @returns {string|null} - Thumbnail URL or null
 *
 * @example
 * getVideoThumbnail(film.videoUrl, 600)
 * // Returns: https://...thumbnail.jpg
 */
export const getVideoThumbnail = (videoUrl, width = 300) => {
  if (!videoUrl || !videoUrl.includes('wikimedia.org')) return null

  // Extract filename from URL
  const filename = videoUrl.split('/').pop()

  // Wikimedia thumbnail format
  // Note: This is a simplified version. Real implementation might need API call
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=${width}`
}

/**
 * Generate embed code for video
 *
 * @param {object} film - Film object
 * @param {number} width - Video width
 * @param {number} height - Video height
 * @returns {string} - HTML embed code
 *
 * @example
 * const embedCode = generateEmbedCode(film, 800, 450)
 */
export const generateEmbedCode = (film, width = 800, height = 450) => {
  if (!film?.videoUrl) return ''

  const subtitleUrl = parseSubtitleUrl(film.subtitleUrl)
  const subtitleTrack = subtitleUrl
    ? `<track kind="subtitles" src="${subtitleUrl}" srclang="en" label="English" default>`
    : ''

  return `<video width="${width}" height="${height}" controls crossorigin="anonymous">
  <source src="${film.videoUrl}" type="video/webm">
  ${subtitleTrack}
  Your browser does not support the video tag.
</video>`
}

/**
 * Download subtitle file
 *
 * @param {string} url - Subtitle URL
 * @param {string} filename - Desired filename
 *
 * @example
 * downloadSubtitle(film.subtitleUrl, 'night-of-the-living-dead-en.srt')
 */
export const downloadSubtitle = async (url, filename = 'subtitle.srt') => {
  if (!url) return

  try {
    const parsedUrl = parseSubtitleUrl(url)
    const response = await fetch(parsedUrl)
    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error downloading subtitle:', error)
  }
}

/**
 * Get playback speed options
 *
 * @returns {Array} - Array of playback speed options
 */
export const getPlaybackSpeeds = () => {
  return [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' },
  ]
}

export default {
  parseSubtitleUrl,
  hasSubtitle,
  getSubtitleLanguage,
  getSubtitleLabel,
  formatDuration,
  parseDuration,
  isValidVideoUrl,
  getVideoThumbnail,
  generateEmbedCode,
  downloadSubtitle,
  getPlaybackSpeeds,
}