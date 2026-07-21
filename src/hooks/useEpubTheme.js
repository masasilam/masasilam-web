import { useCallback } from 'react'
import { COLOR_MODES } from '../constants/readerConstants'
import { getZineVars, injectZineDocStyles } from '../utils/zineTheme'

export const useEpubTheme = () => {
  const applyTheme = useCallback((rendition, mode, size, family) => {
    if (!rendition) return
    if (!rendition.themes) return
    if (!rendition.manager) return

    try {
      const cfg = COLOR_MODES[mode] || COLOR_MODES.light
      const isDarkMode  = mode === 'dark'
      const isCreamMode = mode === 'cream'

      const infoBoxBg        = isDarkMode ? '#2d2d2d' : isCreamMode ? '#ede3d6' : '#f8f8f8'
      const infoBoxBorder    = isDarkMode ? '#555'    : isCreamMode ? '#c9b89a' : '#ddd'
      const letterBg         = isDarkMode ? '#1e1e1e' : isCreamMode ? '#ede3d6' : '#fdfcf8'
      const letterBorder     = isDarkMode ? '#444'    : isCreamMode ? '#c9b89a' : '#ccc'
      const thBg             = isDarkMode ? '#222'    : isCreamMode ? '#e8dcc8' : '#f0f0f0'
      const tdBorder         = isDarkMode ? '#444'    : isCreamMode ? '#c9b89a' : '#ccc'
      const blockquoteBorder = isDarkMode ? '#666'    : isCreamMode ? '#b09070' : '#ccc'
      const separatorColor   = isDarkMode ? '#999'    : isCreamMode ? '#8c7055' : '#666'
      const codeBg           = isDarkMode ? '#1e1e1e' : isCreamMode ? '#ede3d6' : '#f6f6f6'

      const zineVars = getZineVars(mode)

      rendition.themes.register('reader-theme', {
        ':root': {
          ...zineVars,
          'color-scheme': 'light',
        },
        'html':                   { 'background': cfg.bg + ' !important' },
        'body':                   { 'background-color': cfg.bg + ' !important', 'color': cfg.color + ' !important', 'font-size': `${size}px !important`, 'font-family': family, '-webkit-font-smoothing': 'antialiased' },
        'p':                      { 'color': cfg.color },
        'h1,h2,h3,h4,h5,h6':      { 'color': cfg.color },
        'a':                      { 'color': isDarkMode ? '#FCD34D' : isCreamMode ? '#7a5c3a' : '' },
        'li':                     { 'color': cfg.color },
        'td':                     { 'color': cfg.color, 'border-color': tdBorder },
        'th':                     { 'color': cfg.color, 'background-color': thBg, 'border-color': tdBorder },
        'blockquote':             { 'border-left-color': blockquoteBorder, 'color': cfg.color },
        'code':                   { 'background-color': codeBg, 'color': cfg.color },
        'pre':                    { 'background-color': codeBg, 'color': cfg.color },
        'p.separator':            { 'color': separatorColor },
        'p.ornament':             { 'color': separatorColor },
        'p.divider':              { 'color': separatorColor },
        '.scene-break':           { 'color': separatorColor },
        '.note':                  { 'color': cfg.color },
        '.image-caption':         { 'color': separatorColor },
        '.info-box':              { 'background-color': infoBoxBg + ' !important', 'border-color': infoBoxBorder + ' !important', 'color': cfg.color + ' !important' },
        '.info-box p':            { 'color': cfg.color + ' !important' },
        '.letter':                { 'background-color': letterBg + ' !important', 'border-color': letterBorder + ' !important', 'color': cfg.color + ' !important' },
        '.letter p':              { 'color': cfg.color },
        '.letter .date':          { 'color': cfg.color },
        '.letter .salutation':    { 'color': cfg.color },
        '.letter .closing':       { 'color': cfg.color },
        '.letter .signature':     { 'color': cfg.color },
        'img': {
          'max-width':   '100%',
          'height':      'auto',
          'display':     'block',
          'margin':      '0 auto',
          'filter':      isDarkMode ? 'invert(0.85)' : 'none',
        },
        'figure': {
          'margin':     '1.5em auto',
          'text-align': 'center',
          'max-width':  '100%',
          'display':    'block',
        },
        'figure img': {
          'max-width':    '100%',
          'width':        'auto',
          'height':       'auto',
          'max-height':   '60vh',
          'object-fit':   'contain',
          'margin':       '0 auto',
        },
        '.image-with-caption': {
          'margin':     '1.5em auto',
          'text-align': 'center',
          'max-width':  '100%',
        },
        '.image-with-caption img': {
          'max-width':  '100%',
          'width':      'auto',
          'height':     'auto',
          'max-height': '60vh',
          'object-fit': 'contain',
          'margin':     '0 auto',
        },
        'img.ornament':           { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
        'img.icon':               { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
        'img.decoration':         { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
        'img.logo':               { 'filter': isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none' },
        '.colophon img':          { 'max-width': 'min(120px, 40%)', 'height': 'auto', 'filter': isDarkMode ? 'invert(1) hue-rotate(155deg) saturate(4) brightness(0.9)' : 'none', 'opacity': '1' },
        '.imprint img':           { 'max-width': 'min(120px, 40%)', 'height': 'auto', 'filter': isDarkMode ? 'invert(1) hue-rotate(155deg) saturate(4) brightness(0.9)' : 'none', 'opacity': '1' },
        'img.no-invert':          { 'filter': 'none !important' },
        'img.photo':              { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
        'img.illustration':       { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
        'img.colored':            { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
        '.chapter img.no-invert': { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
        'img.image-inline':       { 'filter': isDarkMode ? 'invert(1)' : 'none', 'opacity': isDarkMode ? '0.9' : '1' },
        '.epub-highlight': {
          'opacity':        isDarkMode  ? '0.35' : isCreamMode ? '0.45' : '0.4',
          'mix-blend-mode': isDarkMode  ? 'screen' : 'multiply',
        },
      })

      rendition.themes.select('reader-theme')

      // ─── INJECT LANGSUNG KE IFRAME AKTIF ─────────────────────────────────
      // themes.select() hanya berlaku untuk render berikutnya.
      // Inject <style> langsung ke document yang sedang ditampilkan
      // agar perubahan font/warna terlihat INSTANT tanpa display() ulang.
      try {
        const allContents = rendition.getContents ? rendition.getContents() : []
        allContents.forEach(content => {
          try {
            const doc = content.document
            if (!doc) return

            // Update atau buat style tag dinamis
            let dynamicStyle = doc.getElementById('__epub_dynamic__')
            if (!dynamicStyle) {
              dynamicStyle = doc.createElement('style')
              dynamicStyle.id = '__epub_dynamic__'
              ;(doc.head || doc.documentElement).appendChild(dynamicStyle)
            }
            dynamicStyle.textContent = `
              html {
                background: ${cfg.bg} !important;
              }
              body {
                background-color: ${cfg.bg} !important;
                color: ${cfg.color} !important;
                font-size: ${size}px !important;
                font-family: ${family} !important;
                -webkit-font-smoothing: antialiased;
              }
              p, li, span, div, td, th, blockquote,
              h1, h2, h3, h4, h5, h6 {
                color: ${cfg.color} !important;
              }
              p, li, span, div {
                font-size: inherit !important;
              }
              a {
                color: ${isDarkMode ? '#FCD34D' : isCreamMode ? '#7a5c3a' : 'inherit'} !important;
              }
            `

            // Tetap jalankan injectZineDocStyles untuk override tambahan
            injectZineDocStyles(doc, mode)
          } catch {}
        })
      } catch {}

    } catch (err) {
      console.warn('[useEpubTheme] applyTheme terlalu cepat, skip:', err.message)
    }
  }, [])

  return { applyTheme }
}