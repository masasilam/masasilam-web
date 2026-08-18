import { useState } from 'react'
import { Quote, ListChecks, ChevronDown, BookMarked, Users } from 'lucide-react'
import AddToListButton            from './AddToListButton'
import SocialAnnotationsForEntity from './SocialAnnotationsForEntity'
import ListsContainingEntity      from './ListsContainingEntity'

// ─── Collapsible block ────────────────────────────────────────────────────────
const CollapsibleBlock = ({ icon: Icon, iconColor, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200
                     ${open
                       ? 'border-stone-200 dark:border-slate-700 shadow-sm'
                       : 'border-stone-100 dark:border-slate-800'
                     } bg-white dark:bg-slate-900`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left
                   hover:bg-stone-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                           ${open
                             ? 'bg-stone-100 dark:bg-slate-700'
                             : 'bg-stone-50 dark:bg-slate-800'}`}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-sm font-semibold text-stone-800 dark:text-slate-200 truncate">
            {title}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
                                 text-stone-300 dark:text-slate-600
                                 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-stone-100 dark:border-slate-800 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const BookDetailSocialSection = ({ book }) => {
  if (!book?.id) return null

  return (
    <div className="space-y-2.5">

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 py-1">
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold
                        text-stone-300 dark:text-slate-600">
          <Users className="w-3 h-3" />
          Komunitas
        </div>
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
      </div>

      {/* ── Simpan ke Daftar Baca ───────────────────────────────── */}
      {/*
        Layout VERTIKAL (flex-col) agar:
        - Teks "Simpan ke Daftar Baca" & "Tambahkan buku ini ke koleksimu"
          selalu terbaca penuh di sidebar PC (±300px) maupun mobile
        - Button AddToListButton full-width di bawah teks, tidak saling berebut tempat
      */}
      <div className="flex flex-col gap-3 px-4 py-3.5 rounded-2xl border
                      bg-white dark:bg-slate-900
                      border-stone-200 dark:border-slate-700
                      hover:border-teal-300 dark:hover:border-teal-700
                      transition-colors duration-200 group">

        {/* Row atas: icon + teks */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                          bg-teal-50 dark:bg-teal-900/20
                          group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30
                          transition-colors mt-0.5">
            <BookMarked className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800 dark:text-slate-200 leading-snug">
              Simpan ke Daftar Baca
            </p>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5 leading-snug">
              Tambahkan buku ini ke koleksi
            </p>
          </div>
        </div>

        {/* Row bawah: button full width */}
        <AddToListButton
          entityType="BOOK"
          entityId={book.id}
          entityTitle={book.title}
          fullWidth
        />
      </div>

      {/* ── Kutipan dari Pembaca ─────────────────────────────────── */}
      <CollapsibleBlock
        icon={Quote}
        iconColor="text-rose-500 dark:text-rose-400"
        title="Kutipan dari Pembaca"
        defaultOpen={false}
      >
        <SocialAnnotationsForEntity
          entityType="BOOK"
          entityId={book.id}
        />
      </CollapsibleBlock>

      {/* ── Ada di Rak Bacaan ────────────────────────────────────── */}
      <CollapsibleBlock
        icon={ListChecks}
        iconColor="text-teal-600 dark:text-teal-400"
        title="Ada di Rak Bacaan"
        defaultOpen={false}
      >
        <ListsContainingEntity
          entityType="BOOK"
          entityId={book.id}
        />
      </CollapsibleBlock>

    </div>
  )
}

export default BookDetailSocialSection