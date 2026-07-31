import { useAuth } from '../context/AuthContext'
import { User as UserIcon, Mail, LogOut, Settings, Edit2, Check, X, Zap, Shield, Hash } from 'lucide-react'
import { useState } from 'react'
import { userAPI } from '../lib/database'

const roleFunctionLabels = {
  rush: 'Rush',
  full_gas: 'Full Gás',
  suporte: 'Suporte',
  curandeiro: 'Curandeiro',
  flex: 'Flex'
}

export function Profile() {
  const { user, profile, logout } = useAuth()
  const [editingNick, setEditingNick] = useState(false)
  const [editingFreeFireId, setEditingFreeFireId] = useState(false)
  const [editingRoleFunction, setEditingRoleFunction] = useState(false)
  const [nickValue, setNickValue] = useState('')
  const [freeFireIdValue, setFreeFireIdValue] = useState('')
  const [roleFunctionValue, setRoleFunctionValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleSaveNick = async () => {
    if (!nickValue.trim()) return
    setSaving(true)
    try {
      await userAPI.updateProfile(user.id, { nick: nickValue.trim() })
      setEditingNick(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating nick:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFreeFireId = async () => {
    if (!freeFireIdValue.trim()) return
    setSaving(true)
    try {
      await userAPI.updateProfile(user.id, { free_fire_id: freeFireIdValue.trim() })
      setEditingFreeFireId(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating Free Fire ID:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRoleFunction = async () => {
    if (!roleFunctionValue) return
    setSaving(true)
    try {
      await userAPI.updateProfile(user.id, { role_function: roleFunctionValue })
      setEditingRoleFunction(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating role function:', error)
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Carregando...'
  const photoURL = profile?.photo_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const nick = profile?.nick || 'Não definido'
  const freeFireId = profile?.free_fire_id || 'Não definido'
  const shortId = profile?.short_id || 'Não definido'
  const roleFunction = profile?.role_function || 'Não definido'
  const role = profile?.role || 'Não definido'

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Perfil</h1>
          <p className="text-textSecondary text-sm mt-1">Suas informações</p>
        </div>

        {/* Profile Card */}
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {photoURL ? (
              <img 
                src={photoURL} 
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-surface2 flex items-center justify-center border-4 border-primary/30 mb-4">
                <UserIcon className="w-12 h-12 text-textSecondary" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-text">{displayName}</h2>
            <p className="text-textSecondary text-sm">{user?.email || ''}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">Nome</p>
                <p className="text-text font-medium">{displayName}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">Email</p>
                <p className="text-text font-medium">{user?.email || 'Não definido'}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">Nick</p>
                {editingNick ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={nickValue}
                      onChange={(e) => setNickValue(e.target.value)}
                      placeholder="Seu nick no jogo"
                      className="flex-1 bg-surface2 text-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                    <button
                      onClick={handleSaveNick}
                      disabled={saving}
                      className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setEditingNick(false)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-text font-medium">{nick}</p>
                    <button
                      onClick={() => {
                        setNickValue(nick === 'Não definido' ? '' : nick)
                        setEditingNick(true)
                      }}
                      className="p-1.5 hover:bg-surface2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-textSecondary" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">ID Free Fire</p>
                {editingFreeFireId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={freeFireIdValue}
                      onChange={(e) => setFreeFireIdValue(e.target.value)}
                      placeholder="Seu ID no jogo"
                      className="flex-1 bg-surface2 text-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                    <button
                      onClick={handleSaveFreeFireId}
                      disabled={saving}
                      className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setEditingFreeFireId(false)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-text font-medium">{freeFireId}</p>
                    <button
                      onClick={() => {
                        setFreeFireIdValue(freeFireId === 'Não definido' ? '' : freeFireId)
                        setEditingFreeFireId(true)
                      }}
                      className="p-1.5 hover:bg-surface2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-textSecondary" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">ID Curto</p>
                <p className="text-text font-medium mt-1">{shortId}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">Função</p>
                {editingRoleFunction ? (
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={roleFunctionValue}
                      onChange={(e) => setRoleFunctionValue(e.target.value)}
                      className="flex-1 bg-surface2 text-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione...</option>
                      <option value="rush">Rush</option>
                      <option value="full_gas">Full Gás</option>
                      <option value="suporte">Suporte</option>
                      <option value="curandeiro">Curandeiro</option>
                      <option value="flex">Flex</option>
                    </select>
                    <button
                      onClick={handleSaveRoleFunction}
                      disabled={saving}
                      className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setEditingRoleFunction(false)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-text font-medium">{roleFunctionLabels[roleFunction] || roleFunction}</p>
                    <button
                      onClick={() => {
                        setRoleFunctionValue(roleFunction || '')
                        setEditingRoleFunction(true)
                      }}
                      className="p-1.5 hover:bg-surface2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-textSecondary" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-textSecondary text-xs">Cargo</p>
                <p className="text-text font-medium">{role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-4 rounded-2xl font-semibold text-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </div>
  )
}
