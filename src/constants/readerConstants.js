export const HIGHLIGHT_COLORS = [
  { name: 'Kuning', value: '#FCD34D', text: '#78350F' },
  { name: 'Hijau',  value: '#6EE7B7', text: '#064E3B' },
  { name: 'Biru',   value: '#93C5FD', text: '#1E3A8A' },
  { name: 'Pink',   value: '#F9A8D4', text: '#831843' },
  { name: 'Ungu',   value: '#C4B5FD', text: '#4C1D95' },
]

export const FONT_OPTIONS = [
  { label: 'Serif (Default)', value: "'Georgia', 'Times New Roman', serif" },
  { label: 'Garamond',        value: "'Garamond', 'Adobe Garamond Pro', 'Times New Roman', serif" },
  { label: 'Sans-Serif',      value: "'Inter', 'Segoe UI', 'Arial', sans-serif" },
  { label: 'Dyslexic-friendly', value: "'Lexend', 'Comic Sans MS', sans-serif" },
  { label: 'Monospace',       value: "'Courier New', 'Courier', monospace" },
]

import { Sun, Coffee, Moon } from 'lucide-react'

export const COLOR_MODES = {
  light: { bg: '#FFFFFF', color: '#1F2937', label: 'Terang',  icon: Sun    },
  cream: { bg: '#f6eee3', color: '#2d1f0e', label: 'Krem',    icon: Coffee },
  dark:  { bg: '#111827', color: '#E5E7EB', label: 'Gelap',   icon: Moon   },
}