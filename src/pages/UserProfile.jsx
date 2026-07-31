import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User as UserIcon, Hash, Zap, Shield, ArrowLeft } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { userAPI } from '../lib/database'
import { useNavigate } from 'react-router-dom'

const roleFunctionLabels = {
  rush: 'Rush',
  full_gas: 'Full Gás',
  suporte: 'Suporte',
  curandeiro: 'Curandeiro',
  flex: 'Flex'
}

export function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await userAPI.getProfile(userId)
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-safe pb-24 px-4">
        <div className="pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textSecondary hover:text-text mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-safe pb-24 px-4">
        <div className="pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textSecondary hover:text-text mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <EmptyState
            icon={UserIcon}
            title="Perfil não encontrado"
            description="Este perfil não existe ou foi removido."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textSecondary hover:text-text mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-text">Perfil</h1>
        </div>

        {/* User Card */}
        <div className="glass rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-4">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.display_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center border-2 border-primary/30">
                <UserIcon className="w-8 h-8 text-textSecondary" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text">{profile.display_name}</h2>
              <p className="text-textSecondary text-sm">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-text">Nick</h3>
                <p className="text-textSecondary text-sm">{profile.nick || 'Não definido'}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-text">ID Curto</h3>
                <p className="text-textSecondary text-sm">{profile.short_id || 'Não definido'}</p>
              </div>
            </div>
          </div>

          {profile.free_fire_id && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-text">ID Free Fire</h3>
                  <p className="text-textSecondary text-sm">{profile.free_fire_id}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-text">Cargo</h3>
                <p className="text-textSecondary text-sm">{profile.role || 'Não definido'}</p>
              </div>
            </div>
          </div>

          {profile.role_function && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-text">Função</h3>
                  <p className="text-textSecondary text-sm">
                    {roleFunctionLabels[profile.role_function] || profile.role_function}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
