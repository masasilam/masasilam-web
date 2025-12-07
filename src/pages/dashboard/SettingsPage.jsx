// SettingsPage
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'

export const SettingsPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    bio: ''
  })

  const handleSave = () => {
    // TODO: Implement save settings
    console.log('Save settings:', formData)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pengaturan</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Profil</h2>
        
        <div className="space-y-6">
          <Input
            label="Nama Lengkap"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <Button onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage