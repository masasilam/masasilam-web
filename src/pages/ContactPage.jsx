import { useState } from 'react'
import { Mail, Send, MessageCircle, ArrowRight, CheckCircle2, BookOpen, HelpCircle, Info } from 'lucide-react'
import SEO from '../components/Common/SEO'

const quickLinks = [
  {
    icon: HelpCircle,
    title: 'FAQ',
    desc: 'Pertanyaan yang sering diajukan',
    href: '/faq',
    accent: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40' },
  },
  {
    icon: BookOpen,
    title: 'Panduan Membaca',
    desc: 'Cara menggunakan platform',
    href: '/cara-membaca',
    accent: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
  },
  {
    icon: Info,
    title: 'Tentang Kami',
    desc: 'Pelajari lebih lanjut tentang MasasilaM',
    href: '/tentang',
    accent: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/40' },
  },
]

const inputClass = `w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700
  text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all text-sm`

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
)

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setSuccess(true)
    setLoading(false)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSuccess(false), 5000)
  }

  const set = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }))

  return (
    <>
      <SEO
        title="Hubungi Kami — MasasilaM"
        description="Ada pertanyaan atau masukan? Hubungi tim MasasilaM. Kami siap membantu Anda."
        url="/kontak"
        type="website"
        keywords="kontak, hubungi kami, support, bantuan, masasilam"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mb-6 border border-amber-200 dark:border-amber-800/40">
              <MessageCircle className="w-3.5 h-3.5" /> Hubungi Kami
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
              Ada Pertanyaan?
            </h1>
            <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Tim kami siap membantu Anda. Kirim pesan melalui formulir di bawah atau langsung ke email kami.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

          {/* ── EMAIL DIRECT ──────────────────────────────────────── */}
          <section className="mt-10 sm:mt-14">
            <a
              href="mailto:info@masa-silam.com"
              className="group flex items-center gap-5 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-0.5">Email Langsung</p>
                <p className="font-semibold text-stone-900 dark:text-white">info@masa-silam.com</p>
                <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">Respons dalam 1–2 hari kerja</p>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </a>
          </section>

          {/* ── MAIN GRID ─────────────────────────────────────────── */}
          <section className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">

            {/* Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-stone-900 to-slate-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400/60 mb-0.5">Formulir Kontak</p>
                  <h2 className="font-serif text-xl font-bold text-white">Kirim Pesan</h2>
                </div>
              </div>

              <div className="p-8">
                {success ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">Pesan Terkirim!</h3>
                    <p className="text-stone-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                      Terima kasih telah menghubungi kami. Tim kami akan segera merespons pesan Anda.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Nama" required>
                        <input type="text" value={formData.name} onChange={set('name')} required placeholder="Nama lengkap Anda" className={inputClass} />
                      </Field>
                      <Field label="Email" required>
                        <input type="email" value={formData.email} onChange={set('email')} required placeholder="email@example.com" className={inputClass} />
                      </Field>
                    </div>
                    <Field label="Subjek" required>
                      <input type="text" value={formData.subject} onChange={set('subject')} required placeholder="Topik pesan Anda" className={inputClass} />
                    </Field>
                    <Field label="Pesan" required>
                      <textarea value={formData.message} onChange={set('message')} rows={5} required placeholder="Tulis pesan Anda di sini..." className={`${inputClass} resize-none`} />
                    </Field>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                      {loading
                        ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mengirim...</>
                        : <><Send className="w-4 h-4" />Kirim Pesan</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-4">Link Cepat</p>
              {quickLinks.map(({ icon: Icon, title, desc, href, accent }) => (
                <a
                  key={href}
                  href={href}
                  className={`group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all hover:shadow-md ${accent.border} hover:${accent.border}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.bg} transition-colors`}>
                    <Icon className={`w-5 h-5 ${accent.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${accent.text}`}>{title}</p>
                    <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${accent.text}`} />
                </a>
              ))}

              {/* Info box */}
              <div className="mt-4 p-5 bg-stone-50 dark:bg-slate-800/50 rounded-2xl border border-stone-200 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-3">Informasi</p>
                <div className="space-y-2 text-sm text-stone-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Respons dalam 1–2 hari kerja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Tidak ada pertanyaan yang bodoh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Tim yang ramah dan responsif</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pb-16" />
        </div>
      </div>
    </>
  )
}

export default ContactPage