import { Lock, Eye, Database, UserCheck, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import SEO from '../components/Common/SEO'

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, accent, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 overflow-hidden">
    <div className={`flex items-center gap-4 px-7 sm:px-8 py-6 ${accent.header}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}>
        <Icon className={`w-6 h-6 ${accent.iconText}`} aria-hidden="true" />
      </div>
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="p-7 sm:p-8 space-y-6">{children}</div>
  </div>
)

// ─── List helpers ─────────────────────────────────────────────────────────────
const AllowList = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const DenyList = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-red-700 dark:text-red-300">
        <span className="flex-shrink-0 font-bold mt-0.5" aria-hidden="true">✗</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const SubHeading = ({ children }) => (
  <h3 className="font-semibold text-stone-800 dark:text-slate-200 text-sm sm:text-base mb-3">{children}</h3>
)

const DenyBox = ({ title, items }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-5 sm:p-6">
    <div className="flex items-center gap-2 mb-4">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
      <h3 className="font-bold text-sm text-red-800 dark:text-red-200">{title}</h3>
    </div>
    <DenyList items={items} />
  </div>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
const PrivacyPolicyPage = () => {
  const principles = [
    'Menyediakan layanan yang berfungsi dengan baik untuk Anda',
    'Meningkatkan platform secara kolektif bersama komunitas',
    'Menghormati otonomi dan kebebasan Anda sepenuhnya',
  ]

  return (
    <>
      <SEO
        title="Kebijakan Privasi — MasasilaM"
        description="Pelajari bagaimana MasasilaM mengumpulkan, menggunakan, dan melindungi data Anda. Privasi Anda adalah hak fundamental kami."
        url="/privasi"
        type="website"
        keywords="kebijakan privasi, privacy policy, data, keamanan, masasilam"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300 motion-reduce:transition-none flex flex-col">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 opacity-60 dark:opacity-80" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full mb-6 border border-emerald-200 dark:border-emerald-800/40">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Privasi & Keamanan
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
              Kebijakan Privasi
            </h1>
            <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Privasi Anda adalah hak fundamental. Kami mengumpulkan sesedikit mungkin data.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 justify-center text-xs sm:text-sm">
              {[
                { icon: Shield, label: 'Enkripsi SSL/TLS', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: Lock,   label: 'Password di-hash', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'           },
                { icon: Eye,    label: 'Tanpa iklan',      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'    },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full ${color}`}>
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />{label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* ── PRINSIP DASAR ─────────────────────────────────────── */}
          <section className="mt-10 sm:mt-14">
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-3xl p-7 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                  Data yang kami kumpulkan hanya untuk:
                </h2>
              </div>
              <AllowList items={principles} />
            </div>
          </section>

          {/* ── SECTIONS ─────────────────────────────────────────── */}
          <div className="mt-6 space-y-6">

            {/* 1. Data Collection */}
            <Section
              icon={Database}
              title="1. Data yang Kami Kumpulkan"
              accent={{ header: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800', iconBg: 'bg-white/20', iconText: 'text-white' }}
            >
              <div>
                <SubHeading>Data yang Anda Berikan Sukarela:</SubHeading>
                <AllowList items={[
                  'Username (bisa pseudonim — nama asli tidak wajib)',
                  'Alamat email (hanya untuk verifikasi dan reset password)',
                  'Password (di-hash dengan bcrypt — kami tidak pernah tahu password Anda)',
                  'Anotasi pribadi (highlight, catatan, bookmark) — hanya untuk Anda',
                  'Review dan komentar publik (jika Anda memilih untuk membagikan)',
                ]} />
              </div>
              <div>
                <SubHeading>Data yang Dikumpulkan Secara Teknis:</SubHeading>
                <AllowList items={[
                  'Data membaca (progress, waktu) — untuk melanjutkan dari posisi terakhir',
                  'Metadata penggunaan anonim — untuk perbaikan bug dan fitur',
                  'Log server anonim — tanpa informasi identitas pribadi',
                ]} />
              </div>
              <DenyBox
                title="Yang TIDAK Kami Kumpulkan:"
                items={['Data lokasi spesifik', 'Data perangkat secara detail', 'Data perilaku untuk iklan', 'Data dari pihak ketiga tentang Anda']}
              />
            </Section>

            {/* 2. Penggunaan Data */}
            <Section
              icon={Eye}
              title="2. Mengapa Kami Menggunakan Data"
              accent={{ header: 'bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800', iconBg: 'bg-white/20', iconText: 'text-white' }}
            >
              <div>
                <SubHeading>Untuk Layanan Dasar:</SubHeading>
                <AllowList items={[
                  'Menyimpan progress membaca Anda antar sesi',
                  'Menyinkronkan anotasi dan bookmark di semua perangkat',
                  'Mengotentikasi akses Anda ke akun',
                ]} />
              </div>
              <div>
                <SubHeading>Untuk Perbaikan Komunitas:</SubHeading>
                <AllowList items={[
                  'Melihat fitur platform yang paling banyak digunakan (data anonim & agregat)',
                  'Mendeteksi dan memperbaiki masalah teknis',
                  'Memahami jenis buku yang paling dicari untuk prioritas digitalisasi',
                ]} />
              </div>
              <DenyBox
                title="TIDAK PERNAH digunakan untuk:"
                items={['Iklan bertarget atau personalisasi komersial', 'Dijual ke pihak ketiga dalam bentuk apapun', 'Manipulasi perilaku pengguna', 'Surveillance atau pengawasan']}
              />
            </Section>

            {/* 3. Berbagi Data */}
            <Section
              icon={UserCheck}
              title="3. Berbagi Data"
              accent={{ header: 'bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-700 dark:to-violet-800', iconBg: 'bg-white/20', iconText: 'text-white' }}
            >
              <DenyBox
                title="Kami TIDAK:"
                items={['Menjual data Anda dalam bentuk apapun', 'Membagikan data pribadi Anda ke pihak ketiga', 'Memberikan data ke pemerintah tanpa proses hukum yang sah']}
              />
              <div>
                <SubHeading>Kami BAGIKAN secara anonim & teragregasi:</SubHeading>
                <AllowList items={[
                  'Statistik penggunaan platform (contoh: "buku ini dibaca 1.000 kali bulan lalu")',
                  'Data genre populer — untuk panduan kontributor',
                  'Metrik akses regional — untuk optimisasi performa server',
                ]} />
              </div>
            </Section>

            {/* 4. Hak Anda */}
            <Section
              icon={Lock}
              title="4. Hak-Hak Anda"
              accent={{ header: 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700', iconBg: 'bg-white/20', iconText: 'text-white' }}
            >
              <AllowList items={[
                'Mengakses semua data yang kami simpan tentang Anda kapan saja',
                'Mengunduh semua anotasi dan data membaca Anda',
                'Menghapus akun dan semua data pribadi permanen',
                'Meminta koreksi data yang tidak akurat',
                'Menolak pengumpulan data tertentu melalui pengaturan akun',
              ]} />
              <p className="text-sm text-stone-500 dark:text-slate-400 leading-relaxed">
                Untuk menggunakan hak-hak Anda, hubungi kami di{' '}
                <a href="mailto:info@masa-silam.com" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  info@masa-silam.com
                </a>
                {' '}— kami akan merespons dalam 3—5 hari kerja.
              </p>
            </Section>

          </div>

          {/* ── CTA ───────────────────────────────────────────────── */}
          <section className="mt-8 mb-16">
            <div className="bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden text-center">
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-3">Ada Pertanyaan Soal Privasi?</h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Tim kami dengan senang hati menjawab pertanyaan Anda seputar keamanan dan privasi data.
                </p>
                <a
                  href="mailto:info@masa-silam.com"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" /> Hubungi Tim Privasi
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicyPage