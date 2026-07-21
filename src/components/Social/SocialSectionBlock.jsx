import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const SocialSectionBlock = ({
  title,
  icon: Icon,
  iconColor = 'text-rose-500',
  badge = null,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors
                     bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800 ${className}`}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4
                   hover:bg-stone-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />}
          <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">{title}</span>
          {badge != null && badge > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold
                             bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-400">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-slate-500
                                 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 border-t border-stone-50 dark:border-slate-800 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default SocialSectionBlock