// src/components/Social/BookDetailSocialSection.jsx
// Semua section sosial yang ditambahkan ke BookDetailPage
// Dipisah ke komponen sendiri agar BookDetailPage tidak berantakan
// Import satu komponen ini di BookDetailPage

import { Quote, ListChecks } from 'lucide-react'
import AddToListButton           from './AddToListButton'
import SocialAnnotationsForEntity from './SocialAnnotationsForEntity'
import ListsContainingEntity      from './ListsContainingEntity'
import SocialSectionBlock         from './SocialSectionBlock'

const BookDetailSocialSection = ({ book }) => {
  if (!book?.id) return null

  return (
    <div className="space-y-3 mt-8 mb-4">
      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
        <span className="text-[10px] uppercase tracking-widest font-semibold
                          text-stone-300 dark:text-slate-600">
          Komunitas Pembaca
        </span>
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
      </div>

      {/* ── Tombol simpan ke daftar baca (standalone, selalu tampil) ── */}
      <div className="flex items-center gap-3 p-4 rounded-xl border
                      bg-teal-50/60 border-teal-200 dark:bg-teal-900/10 dark:border-teal-900">
        <ListChecks className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
            Simpan ke Daftar Baca
          </p>
          <p className="text-xs text-teal-600 dark:text-teal-400">
            Tambahkan buku ini ke koleksi bacaanmu
          </p>
        </div>
        <AddToListButton
          entityType="BOOK"
          entityId={book.id}
          entityTitle={book.title}
        />
      </div>

      {/* ── Kutipan dari pembaca lain ── */}
      <SocialSectionBlock
        title="Kutipan dari Pembaca"
        icon={Quote}
        iconColor="text-rose-500"
        defaultOpen={false}
      >
        <SocialAnnotationsForEntity
          entityType="BOOK"
          entityId={book.id}
        />
      </SocialSectionBlock>

      {/* ── Ada di daftar baca siapa ── */}
      <SocialSectionBlock
        title="Ada di Rak Bacaan"
        icon={ListChecks}
        iconColor="text-teal-500"
        defaultOpen={false}
      >
        <ListsContainingEntity
          entityType="BOOK"
          entityId={book.id}
        />
      </SocialSectionBlock>
    </div>
  )
}

export default BookDetailSocialSection