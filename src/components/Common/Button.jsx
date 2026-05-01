// ============================================
// src/components/Common/Button.jsx
// Palette selaras BooksPage & BookDetailPage:
//
// primary  : amber-500 bg (#f59e0b) — CTA utama
// secondary: stone-100/slate-800 — netral
// outline  : border amber-500, text amber-600 — ghost CTA
// ghost    : transparent hover stone/slate
// ============================================

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all ' +
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  // ── Variants ──────────────────────────────────────────────────────────────
  // primary  → amber-500 solid (selaras tombol "Cari" & CTA BooksPage)
  // secondary→ stone-100 / slate-800 (selaras tombol "Reset" FilterPanel)
  // outline  → border amber, text amber (selaras prev/next pagination)
  // ghost    → transparent hover stone/slate
  const variants = {
    primary:
      'bg-amber-500 hover:bg-amber-400 text-white ' +
      'shadow-sm shadow-amber-200/80 hover:shadow-md ' +
      'dark:shadow-amber-900/40',

      'primary-emerald':
        'bg-emerald-500 hover:bg-emerald-400 text-white ' +
        'shadow-sm shadow-emerald-200/80 hover:shadow-md ' +
        'dark:shadow-emerald-900/40',

    secondary:
      'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 ' +
      'dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700',

    outline:
      'border border-stone-200 bg-white text-stone-600 ' +
      'hover:border-amber-400 hover:text-amber-600 shadow-sm ' +
      'dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none ' +
      'dark:hover:border-amber-500/70 dark:hover:text-amber-400',

    ghost:
      'text-stone-600 hover:bg-stone-100 hover:text-stone-900 ' +
      'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1',
    md: 'px-5 py-2.5 text-sm gap-1.5',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Memproses...
        </>
      ) : children}
    </button>
  )
}

export default Button