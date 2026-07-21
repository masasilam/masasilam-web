import { Quote, ListChecks } from 'lucide-react'
import AddToListButton             from './AddToListButton'
import SocialAnnotationsForEntity  from './SocialAnnotationsForEntity'
import SocialSectionBlock          from './SocialSectionBlock'

const NewspaperSocialSection = ({ article, mode }) => {
  if (!article?.id) return null

  const borderClr = mode?.key === 'dark' ? '#1e293b' : mode?.key === 'sepia' ? '#d6c9b0' : '#e7e5e4'
  const colorVar  = mode?.color || '#1c1917'

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: borderClr }} />
        <span className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: colorVar, opacity: 0.4 }}>
          Komunitas Pembaca
        </span>
        <div className="flex-1 h-px" style={{ background: borderClr }} />
      </div>

      {/* Simpan ke daftar baca */}
      <div className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background: mode?.cardBg || '#fafaf9', borderColor: borderClr }}>
        <ListChecks className="w-5 h-5 flex-shrink-0" style={{ color: '#7c3aed' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: colorVar }}>
            Simpan Artikel Ini
          </p>
          <p className="text-xs" style={{ color: colorVar, opacity: 0.55 }}>
            Tambahkan ke daftar bacaanmu
          </p>
        </div>
        <AddToListButton
          entityType="NEWSPAPER"
          entityId={article.id}
          entityTitle={article.title}
        />
      </div>

      {/* Kutipan dari pembaca */}
      <SocialSectionBlock
        title="Kutipan dari Pembaca"
        icon={Quote}
        iconColor="text-violet-500"
        defaultOpen={false}
      >
        <SocialAnnotationsForEntity
          entityType="NEWSPAPER"
          entityId={article.id}
        />
      </SocialSectionBlock>
    </div>
  )
}

export default NewspaperSocialSection