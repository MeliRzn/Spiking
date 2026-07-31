import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { linesAPI, lineInvitesAPI } from '../lib/database'
import { Users, Plus, Search, UserPlus, Crown, LogOut, Bell, Check, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

export function Lines() {
  const { user, profile } = useAuth()
  const [lines, setLines] = useState([])
  const [userLine, setUserLine] = useState(null)
  const [userLineMembers, setUserLineMembers] = useState([])
  const [showMembers, setShowMembers] = useState(false)
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [lineName, setLineName] = useState('')
  const [lineDescription, setLineDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteShortId, setInviteShortId] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [respondingInvite, setRespondingInvite] = useState(null)
  const [deletingLine, setDeletingLine] = useState(false)

  useEffect(() => {
    loadLines()
    loadUserLine()
    loadPendingInvites()
  }, [])

  const loadLines = async () => {
    try {
      const data = await linesAPI.getAll()
      setLines(data)
    } catch (error) {
      console.error('Error loading lines:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserLine = async () => {
    try {
      const data = await linesAPI.getUserLine(user.id)
      setUserLine(data)
      if (data) {
        loadLineMembers(data.id)
      }
    } catch (error) {
      console.error('Error loading user line:', error)
    }
  }

  const loadLineMembers = async (lineId) => {
    try {
      const data = await linesAPI.getById(lineId)
      setUserLineMembers(data.line_members || [])
    } catch (error) {
      console.error('Error loading line members:', error)
    }
  }

  const loadPendingInvites = async () => {
    try {
      const data = await lineInvitesAPI.getUserInvites(user.id)
      setPendingInvites(data)
    } catch (error) {
      console.error('Error loading pending invites:', error)
    }
  }

  const handleCreateLine = async () => {
    if (!lineName.trim()) return
    setCreating(true)
    try {
      await linesAPI.create({
        name: lineName,
        leader_id: user.id,
        description: lineDescription || null
      })
      setShowCreateModal(false)
      setLineName('')
      setLineDescription('')
      loadLines()
      loadUserLine()
    } catch (error) {
      console.error('Error creating line:', error)
      alert('Erro ao criar linha')
    } finally {
      setCreating(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteShortId.trim()) return
    setInviting(true)
    try {
      const { searchAPI } = await import('../lib/database')
      const targetUser = await searchAPI.findByShortId(inviteShortId.trim())
      
      if (!targetUser) {
        alert('Usuário não encontrado')
        return
      }

      await lineInvitesAPI.send(userLine.id, user.id, targetUser.id)
      setShowInviteModal(false)
      setInviteShortId('')
      alert('Convite enviado com sucesso!')
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Erro ao enviar convite')
    } finally {
      setInviting(false)
    }
  }

  const handleLeaveLine = async () => {
    if (!confirm('Tem certeza que deseja sair da linha?')) return
    try {
      await linesAPI.removeMember(userLine.id, user.id)
      setUserLine(null)
      setUserLineMembers([])
      loadLines()
    } catch (error) {
      console.error('Error leaving line:', error)
      alert('Erro ao sair da linha')
    }
  }

  const handleDeleteLine = async () => {
    if (!confirm('Tem certeza que deseja deletar esta linha? Esta ação não pode ser desfeita e todos os membros serão removidos.')) return
    setDeletingLine(true)
    try {
      await linesAPI.delete(userLine.id)
      setUserLine(null)
      setUserLineMembers([])
      loadLines()
      alert('Linha deletada com sucesso!')
    } catch (error) {
      console.error('Error deleting line:', error)
      alert('Erro ao deletar linha')
    } finally {
      setDeletingLine(false)
    }
  }

  const handleAcceptInvite = async (inviteId) => {
    setRespondingInvite(inviteId)
    try {
      await lineInvitesAPI.accept(inviteId)
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
      loadUserLine()
      loadLines()
      alert('Você entrou na linha!')
    } catch (error) {
      console.error('Error accepting invite:', error)
      alert('Erro ao aceitar convite: ' + error.message)
    } finally {
      setRespondingInvite(null)
    }
  }

  const handleRejectInvite = async (inviteId) => {
    setRespondingInvite(inviteId)
    try {
      await lineInvitesAPI.reject(inviteId)
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
    } catch (error) {
      console.error('Error rejecting invite:', error)
      alert('Erro ao recusar convite')
    } finally {
      setRespondingInvite(null)
    }
  }

  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Linhas</h1>
          <p className="text-textSecondary text-sm mt-1">Gerencie sua linha</p>
        </div>

        {/* User's Line */}
        {userLine ? (
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{userLine.name}</h3>
                  <p className="text-textSecondary text-sm">Sua linha</p>
                </div>
              </div>
              <div className="flex gap-2">
                {userLine.leader_id === user.id && (
                  <>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <UserPlus className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      onClick={handleDeleteLine}
                      disabled={deletingLine}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {userLine.description && (
              <p className="text-textSecondary text-sm mb-4">{userLine.description}</p>
            )}
            
            {/* Expandable Members */}
            <div className="mb-4">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="w-full py-2 px-3 rounded-lg bg-surface2 hover:bg-surface3 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-medium text-text">
                  Membros ({userLineMembers.length}/8)
                </span>
                {showMembers ? (
                  <ChevronUp className="w-4 h-4 text-textSecondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-textSecondary" />
                )}
              </button>
              {showMembers && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                  {userLineMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-surface2">
                      {member.users?.photo_url ? (
                        <img
                          src={member.users.photo_url}
                          alt={member.users.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface3 flex items-center justify-center">
                          <Users className="w-4 h-4 text-textSecondary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {member.users?.display_name || member.users?.nick || 'Sem nome'}
                        </p>
                        <p className="text-xs text-textSecondary">
                          {member.users?.short_id || 'Sem ID'}
                        </p>
                      </div>
                      {member.users?.id === userLine.leader_id && (
                        <Crown className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLeaveLine}
              className="w-full py-3 rounded-xl font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair da Linha
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 mb-6">
            <EmptyState
              icon={Users}
              title="Você não está em uma linha"
              description="Entre em uma linha ou crie a sua própria."
            />
            {profile?.can_create_line && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full mt-4 py-3 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Linha
              </button>
            )}
          </div>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Convites Pendentes
            </h2>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text">{invite.lines?.name}</h3>
                      <p className="text-textSecondary text-sm">
                        Convidado por {invite.invited_by_user?.display_name || invite.invited_by_user?.nick}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={respondingInvite === invite.id}
                        className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                      </button>
                      <button
                        onClick={() => handleRejectInvite(invite.id)}
                        disabled={respondingInvite === invite.id}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar linhas..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Lines List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredLines.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhuma linha encontrada"
              description="Não há linhas disponíveis no momento."
            />
          ) : (
            filteredLines.map((line) => (
              <div key={line.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text">{line.name}</h3>
                      <p className="text-textSecondary text-sm">
                        {line.leader?.display_name || line.leader?.nick} • {line.line_members?.length || 0}/8 membros
                      </p>
                    </div>
                  </div>
                  {userLine?.id !== line.id && (
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      Ver
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Line Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-text mb-4">Criar Nova Linha</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Nome da Linha
                  </label>
                  <input
                    type="text"
                    value={lineName}
                    onChange={(e) => setLineName(e.target.value)}
                    placeholder="Ex: Alpha Squad"
                    className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={lineDescription}
                    onChange={(e) => setLineDescription(e.target.value)}
                    placeholder="Descreva sua linha..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-textSecondary bg-surface2 hover:bg-surface3 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateLine}
                    disabled={creating || !lineName.trim()}
                    className="flex-1 py-3 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-text mb-4">Convidar Jogador</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    ID Curto do Jogador
                  </label>
                  <input
                    type="text"
                    value={inviteShortId}
                    onChange={(e) => setInviteShortId(e.target.value)}
                    placeholder="Ex: ABC123"
                    className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-textSecondary bg-surface2 hover:bg-surface3 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendInvite}
                    disabled={inviting || !inviteShortId.trim()}
                    className="flex-1 py-3 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {inviting ? 'Enviando...' : 'Enviar Convite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
