import { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Users, 
  Megaphone, 
  Bell, 
  BarChart3,
  Target,
  ChevronRight,
  LogOut,
  Save,
  Ban,
  Trash2,
  ShieldCheck,
  UserPlus
} from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { weeklyGoalsAPI, membersAPI, userAPI, goalsAPI } from '../lib/database'

export function Admin() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('goals')
  const [warPointsTarget, setWarPointsTarget] = useState('')
  const [weeklyPointsTarget, setWeeklyPointsTarget] = useState('')
  const [saving, setSaving] = useState(false)
  const [membersList, setMembersList] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [pendingUploads, setPendingUploads] = useState([])
  const [loadingUploads, setLoadingUploads] = useState(false)

  const announcements = []
  const statistics = null

  const tabs = [
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'uploads', icon: Target, label: 'Uploads' },
    { id: 'members', icon: Users, label: 'Membros' },
    { id: 'announcements', icon: Megaphone, label: 'Anúncios' },
    { id: 'notifications', icon: Bell, label: 'Notificações' },
    { id: 'statistics', icon: BarChart3, label: 'Estatísticas' },
  ]

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers()
    } else if (activeTab === 'uploads') {
      loadPendingUploads()
    }
  }, [activeTab])

  const loadPendingUploads = async () => {
    setLoadingUploads(true)
    try {
      const data = await goalsAPI.getPending()
      setPendingUploads(data)
    } catch (error) {
      console.error('Error loading uploads:', error)
    } finally {
      setLoadingUploads(false)
    }
  }

  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const data = await membersAPI.getAll()
      setMembersList(data)
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSaveGoals = async () => {
    if (!warPointsTarget || !weeklyPointsTarget) return
    setSaving(true)
    try {
      const weekNumber = getWeekNumber(new Date())
      const year = new Date().getFullYear()
      
      await weeklyGoalsAPI.upsert({
        week_number: weekNumber,
        year,
        war_points_target: parseInt(warPointsTarget),
        weekly_points_target: parseInt(weeklyPointsTarget),
        start_date: getStartOfWeek(new Date()),
        end_date: getEndOfWeek(new Date()),
        is_active: true
      })
      
      alert('Metas definidas com sucesso!')
      setWarPointsTarget('')
      setWeeklyPointsTarget('')
    } catch (error) {
      console.error('Error saving goals:', error)
      alert('Erro ao salvar metas')
    } finally {
      setSaving(false)
    }
  }

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }

  const getEndOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? 0 : 7)
    d.setDate(diff)
    d.setHours(23, 59, 59, 999)
    return d.toISOString()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    try {
      await membersAPI.updateRole(userId, newRole)
      loadMembers()
      alert(`Usuário ${newRole === 'admin' ? 'promovido a admin' : 'removido do admin'}`)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Erro ao atualizar cargo')
    }
  }

  const handleToggleCreateLine = async (userId, currentPermission) => {
    try {
      await userAPI.updateProfile(userId, { can_create_line: !currentPermission })
      loadMembers()
      alert('Permissão atualizada com sucesso!')
    } catch (error) {
      console.error('Error updating permission:', error)
      alert('Erro ao atualizar permissão')
    }
  }

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      await userAPI.updateProfile(userId, { is_blocked: !currentBlocked })
      loadMembers()
      alert(`Conta ${!currentBlocked ? 'bloqueada' : 'desbloqueada'} com sucesso!`)
    } catch (error) {
      console.error('Error updating block status:', error)
      alert('Erro ao atualizar status de bloqueio')
    }
  }

  const handleDeleteAccount = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) return
    try {
      await userAPI.updateProfile(userId, { deleted_at: new Date().toISOString() })
      loadMembers()
      alert('Conta excluída com sucesso!')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Erro ao excluir conta')
    }
  }

  const handleApproveUpload = async (goalId) => {
    try {
      await goalsAPI.approve(goalId, user.id)
      loadPendingUploads()
      alert('Upload aprovado com sucesso!')
    } catch (error) {
      console.error('Error approving upload:', error)
      alert('Erro ao aprovar upload')
    }
  }

  const handleRejectUpload = async (goalId) => {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return
    try {
      await goalsAPI.reject(goalId, reason)
      loadPendingUploads()
      alert('Upload rejeitado com sucesso!')
    } catch (error) {
      console.error('Error rejecting upload:', error)
      alert('Erro ao rejeitar upload')
    }
  }

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Administração</h1>
              <p className="text-textSecondary text-sm mt-1">Painel de controle</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'glass text-textSecondary hover:text-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'goals' && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Definir Metas da Semana</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Meta de Pontos de Guerra
                </label>
                <input
                  type="number"
                  value={warPointsTarget}
                  onChange={(e) => setWarPointsTarget(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Meta de Pontos Semanais
                </label>
                <input
                  type="number"
                  value={weeklyPointsTarget}
                  onChange={(e) => setWeeklyPointsTarget(e.target.value)}
                  placeholder="Ex: 3000"
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSaveGoals}
                disabled={saving}
                className="w-full py-4 rounded-2xl font-semibold text-lg bg-primary text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Salvar Metas'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div>
            {loadingUploads ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : pendingUploads.length === 0 ? (
              <EmptyState 
                icon={Target}
                title="Nenhum upload pendente"
                description="Os uploads pendentes aparecerão aqui para aprovação."
              />
            ) : (
              <div className="space-y-3">
                {pendingUploads.map((upload) => (
                  <div key={upload.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {upload.users?.photo_url ? (
                        <img 
                          src={upload.users.photo_url} 
                          alt={upload.users.display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
                          <Users className="w-6 h-6 text-textSecondary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-text">{upload.users?.display_name || upload.users?.email}</h3>
                        <p className="text-textSecondary text-sm">{upload.users?.nick || 'Sem nick'}</p>
                        <p className="text-textSecondary text-xs">Semana {upload.week_number} - {upload.year}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-textSecondary text-xs mb-1">Pontos de Guerra</p>
                        {upload.war_points_image && (
                          <img 
                            src={upload.war_points_image} 
                            alt="Pontos de Guerra"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-textSecondary text-xs mb-1">Pontos Semanais</p>
                        {upload.weekly_points_image && (
                          <img 
                            src={upload.weekly_points_image} 
                            alt="Pontos Semanais"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveUpload(upload.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Bateu
                      </button>
                      <button
                        onClick={() => handleRejectUpload(upload.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Não Bateu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {loadingMembers ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : membersList.length === 0 ? (
              <EmptyState 
                icon={Users}
                title="Nenhum membro cadastrado"
                description="Os membros da guilda aparecerão aqui para gerenciamento."
              />
            ) : (
              <div className="space-y-3">
                {membersList.map((member) => (
                  <div key={member.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url} 
                          alt={member.display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
                          <Users className="w-6 h-6 text-textSecondary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-text">{member.display_name}</h3>
                        <p className="text-textSecondary text-sm">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-surface2 text-textSecondary'
                        }`}>
                          {member.role}
                        </span>
                        {member.is_blocked && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleAdmin(member.id, member.role)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          member.role === 'admin' 
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                            : 'bg-primary/20 text-primary hover:bg-primary/30'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {member.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleCreateLine(member.id, member.can_create_line)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          member.can_create_line 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-surface2 text-textSecondary hover:bg-surface3'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        {member.can_create_line ? 'Remover Permissão' : 'Pode Criar Linha'}
                      </button>
                      <button
                        onClick={() => handleToggleBlock(member.id, member.is_blocked)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          member.is_blocked 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        <Ban className="w-4 h-4" />
                        {member.is_blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(member.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            {announcements.length === 0 ? (
              <div className="space-y-4">
                <EmptyState 
                  icon={Megaphone}
                  title="Nenhum anúncio"
                  description="Crie anúncios para informar a guilda."
                />
                <button className="w-full py-4 rounded-2xl font-semibold text-lg bg-primary text-white flex items-center justify-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Criar Anúncio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="glass rounded-2xl p-4">
                    {/* Announcement item content */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Enviar Notificação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Mensagem
                </label>
                <textarea
                  placeholder="Conteúdo da notificação"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <button className="w-full py-4 rounded-2xl font-semibold text-lg bg-primary text-white flex items-center justify-center gap-2">
                <Bell className="w-5 h-5" />
                Enviar Notificação
              </button>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            {!statistics ? (
              <EmptyState 
                icon={BarChart3}
                title="Nenhuma estatística disponível"
                description="As estatísticas serão exibidas quando houver dados suficientes."
              />
            ) : (
              <div className="space-y-4">
                {/* Statistics content */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
