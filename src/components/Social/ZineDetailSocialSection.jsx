import { Quote, ListChecks } from 'lucide-react'
import AddToListButton             from './AddToListButton'
import SocialAnnotationsForEntity  from './SocialAnnotationsForEntity'
import ListsContainingEntity       from './ListsContainingEntity'
import SocialSectionBlock          from './SocialSectionBlock'

const ZineDetailSocialSection = ({ zine }) => {
  if (!zine?.id) return null

  return (
    <div className="space-y-3 mt-8 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
        <span className="text-[10px] uppercase tracking-widest font-semibold
                          text-stone-300 dark:text-slate-600">
          Komunitas Pembaca
        </span>
        <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl border
                      bg-emerald-50/60 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900">
        <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Simpan ke Daftar Baca
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Tambahkan zine ini ke koleksi bacaanmu
          </p>
        </div>
        <AddToListButton
          entityType="ZINE"
          entityId={zine.id}
          entityTitle={zine.title}
        />
      </div>

      <SocialSectionBlock
        title="Kutipan dari Pembaca"
        icon={Quote}
        iconColor="text-rose-500"
        defaultOpen={false}
      >
        <SocialAnnotationsForEntity
          entityType="ZINE"
          entityId={zine.id}
        />
      </SocialSectionBlock>

      <SocialSectionBlock
        title="Ada di Rak Bacaan"
        icon={ListChecks}
        iconColor="text-teal-500"
        defaultOpen={false}
      >
        <ListsContainingEntity
          entityType="ZINE"
          entityId={zine.id}
        />
      </SocialSectionBlock>
    </div>
  )
}

export default ZineDetailSocialSection