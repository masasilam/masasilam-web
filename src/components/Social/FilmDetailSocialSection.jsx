import { Quote, ListChecks } from 'lucide-react'
import AddToListButton             from './AddToListButton'
import SocialAnnotationsForEntity  from './SocialAnnotationsForEntity'
import ListsContainingEntity       from './ListsContainingEntity'
import SocialSectionBlock          from './SocialSectionBlock'

const FilmDetailSocialSection = ({ film }) => {
  if (!film?.id) return null

  return (
    <div className="space-y-3 mt-8 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        <span className="text-[10px] uppercase tracking-widest font-semibold
                          text-slate-300 dark:text-slate-600">
          Komunitas Penonton
        </span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl border
                      bg-blue-50/60 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900">
        <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Simpan ke Daftar Tonton
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Tambahkan film ini ke koleksimu
          </p>
        </div>
        <AddToListButton
          entityType="FILM"
          entityId={film.id}
          entityTitle={film.judul}
        />
      </div>

      <SocialSectionBlock
        title="Kutipan dari Penonton"
        icon={Quote}
        iconColor="text-rose-500"
        defaultOpen={false}
      >
        <SocialAnnotationsForEntity
          entityType="FILM"
          entityId={film.id}
        />
      </SocialSectionBlock>

      <SocialSectionBlock
        title="Ada di Daftar Tonton"
        icon={ListChecks}
        iconColor="text-teal-500"
        defaultOpen={false}
      >
        <ListsContainingEntity
          entityType="FILM"
          entityId={film.id}
        />
      </SocialSectionBlock>
    </div>
  )
}

export default FilmDetailSocialSection