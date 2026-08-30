export const getZineVars = (mode) => {
  const isDarkMode = mode === 'dark'
  const isCreamMode = mode === 'cream'
  if (isDarkMode) return { '--zine-ink': '#EDE4CC', '--zine-ink-soft': '#D4C8A8', '--zine-white': '#111827', '--zine-cream': '#111827', '--zine-cream-dark': '#1C1608', '--zine-gray': '#9A8E7A', '--zine-gray-light': '#5A5040', '--zine-rule': '#6B5E40', '--zine-orange': '#E06030', '--zine-navy': '#8AAECC' }
  if (isCreamMode) return { '--zine-ink': '#2d1f0e', '--zine-ink-soft': '#3d2c18', '--zine-white': '#f6eee3', '--zine-cream': '#f6eee3', '--zine-cream-dark': '#ede3d6', '--zine-gray': '#7a6a55', '--zine-gray-light': '#c9b89a', '--zine-rule': '#b09070', '--zine-orange': '#C94B1A', '--zine-navy': '#1A2744' }
  return { '--zine-ink': '#1A1209', '--zine-ink-soft': '#2E2416', '--zine-white': '#FDFAF4', '--zine-cream': '#F5EFE0', '--zine-cream-dark': '#EDE4CC', '--zine-gray': '#6B6055', '--zine-gray-light': '#B0A898', '--zine-rule': '#8C7A62', '--zine-orange': '#C94B1A', '--zine-navy': '#1A2744' }
}

export const injectZineDocStyles = (doc, mode) => {
  if (!doc) return
  try {
    const zineVars = getZineVars(mode)
    const isDarkMode = mode === 'dark'
    const isCreamMode = mode === 'cream'
    const noteBorder = isDarkMode ? '#666' : '#999'
    const captionColor = isDarkMode ? '#aaa' : '#666'
    const infoBoxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'

    let varsEl = doc.getElementById('reader-zine-vars-override')
    if (!varsEl) { varsEl = doc.createElement('style'); varsEl.id = 'reader-zine-vars-override'; (doc.head || doc.documentElement).appendChild(varsEl) }
    const vars = Object.entries(zineVars).map(([k, v]) => `${k}:${v};`).join('')
    varsEl.textContent = `:root{${vars}color-scheme:light;}@media(prefers-color-scheme:dark){:root{${vars}}}`

    let fixEl = doc.getElementById('reader-zine-layout-fix')
    if (!fixEl) { fixEl = doc.createElement('style'); fixEl.id = 'reader-zine-layout-fix'; (doc.head || doc.documentElement).appendChild(fixEl) }
    fixEl.textContent = `
      img { max-width: 100% !important; height: auto !important; display: block !important; }
      figure img, .portrait-box img { max-width: 100% !important; width: auto !important; height: auto !important; max-height: 60vh !important; margin: 0 auto !important; display: block !important; object-fit: contain !important; }
      .image-with-caption img { max-width: 100% !important; width: auto !important; height: auto !important; margin: 0 auto !important; display: block !important; }
      figure, .image-with-caption { margin: 1.5em auto !important; text-align: center !important; max-width: 100% !important; display: block !important; }
      .image-small { max-width: min(120px, 45%) !important; max-height: 120px !important; width: auto !important; height: auto !important; margin: 1em auto !important; object-fit: contain !important; }
      .image-medium { max-width: min(200px, 80%) !important; max-height: 200px !important; width: auto !important; height: auto !important; margin: 1em auto !important; object-fit: contain !important; }
      .image-left, .figures-left { float: left !important; max-width: 45% !important; margin: 0 0.5em 0.25em 0 !important; overflow: hidden !important; display: block !important; }
      .image-right, .figures-right { float: right !important; max-width: 45% !important; margin: 0 0 0.25em 0.5em !important; overflow: hidden !important; display: block !important; }
      .figures-right img, .figures-left img, .image-right img, .image-left img { width: 100% !important; height: auto !important; max-height: none !important; display: block !important; object-fit: contain !important; }
      .colophon img, .imprint img { max-width: 150px !important; max-height: 150px !important; width: auto !important; height: auto !important; margin: 1em auto 2em auto !important; object-fit: contain !important; }
      .clearfix { display: flow-root !important; }
      .clearfix::after { display: none !important; }
      .initial { float: left !important; font-size: 3.5em !important; font-weight: 700 !important; line-height: 0.82 !important; margin: 0.05em 0.1em 0 0 !important; display: block !important; }
      p:has(> .initial) { text-indent: 0 !important; overflow: hidden !important; }
      .drop-cap::first-letter { float: left !important; font-size: 3.8em !important; font-weight: 700 !important; line-height: 0.82 !important; margin: 0.05em 0.08em 0 0 !important; }
      .portrait-box { display: block !important; overflow: hidden !important; }
      .two-column { -webkit-column-count: 2 !important; column-count: 2 !important; -webkit-column-gap: 2em !important; column-gap: 2em !important; overflow: visible !important; }
      .sidebar-box { display: block !important; overflow: hidden !important; }
      .figures-right figcaption, .figures-left figcaption { text-align: center !important; font-size: 0.75em !important; font-style: italic !important; margin-top: 0.3em !important; }
      .image-caption { color: ${captionColor} !important; }
      .colophon .credit-label { color: #666 !important; }
      .colophon .credit-divider { border-top-color: #999 !important; }
      .note::before, .poem .note::before, .letter .note::before, .dialog .note::before, blockquote .note::before { border-top: 1px solid ${noteBorder} !important; }
      .info-box { box-shadow: ${infoBoxShadow} !important; }
      img { filter: ${isDarkMode ? 'invert(0.85)' : 'none'} !important; opacity: ${isDarkMode ? '0.9' : '1'} !important; }
      img.ornament, img.icon, img.decoration { filter: ${isDarkMode ? 'invert(1) opacity(0.7)' : 'none'} !important; opacity: 1 !important; }
      img.logo, .colophon img, .imprint img { filter: ${isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none'} !important; opacity: 1 !important; }
      img.photo, img.illustration, img.colored, img.no-invert, figure img, .figures-right img, .figures-left img, .portrait-box img { filter: none !important; opacity: ${isDarkMode ? '0.88' : '1'} !important; }
      .epub-highlight { mix-blend-mode: ${isDarkMode ? 'screen' : 'multiply'} !important; opacity: ${isDarkMode ? '0.35' : isCreamMode ? '0.45' : '0.4'} !important; }
    `
  } catch { }
}

export const injectCustomFonts = (doc) => {
  if (!doc) return
  try {
    if (doc.getElementById('reader-google-fonts')) return
    const link = doc.createElement('link')
    link.id = 'reader-google-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Lexend:wght@400;500;600&display=swap'
    ;(doc.head || doc.documentElement).appendChild(link)
  } catch { }
}