import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { linesAPI, lineInvitesAPI } from '../lib/database'
import { Users, Crown, ArrowLeft, UserPlus, Shield, Zap, Hash } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roleFunctionLabels = {
  rush: 'Rush',
  full_gas: 'Full Gás',
  suporte: 'Suporte',
  curandeiro: 'Curandeiro',
  flex: 'Flex'
}

export function LineDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [line, setLine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteShortId, setInviteShortId] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    loadLine()
  }, [id])

  const loadLine = async () => {
    try {
      const data = await linesAPI.getById(id)
      setLine(data)
    } catch (error) {
      console.error('Error loading line:', error)
    } finally {
      setLoading(false)
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

      await lineInvitesAPI.send(line.id, user.id, targetUser.id)
      setShowInviteModal(false)
      setInviteShortId('')
      alert('Convite enviado com sucesso!')
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Erro ao enviar convite: ' + error.message)
    } finally {
      setInviting(false)
    }
  }

  const isLeader = line?.leader_id === user.id
  const isMember = line?.line_members?.some(m => m.user_id === user.id)
  const memberCount = line?.line_members?.length || 0

  if (loading) {
    return (
      <div className="min-h-screen pt-safe pb-24 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!line) {
    return (
      <div className="min-h-screen pt-safe pb-24 px-4">
        <div className="pt-6 pb-4">
          <button onClick={() => navigate('/lines')} className="flex items-center gap-2 text-textSecondary hover:text-text">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>
        <p className="text-textSecondary">Linha não encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <button onClick={() => navigate('/lines')} className="flex items-center gap-2 text-textSecondary hover:text-text mb-4">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">{line.name}</h1>
              <p className="text-textSecondary text-sm mt-1">
                Líder: {line.leader?.display_name || line.leader?.nick}
              </p>
            </div>
            {isLeader && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Line Info */}
        <div className="glass rounded-2xl p-5 mb-6">
          {line.description && (
            <p className="text-text mb-4">{line.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-textSecondary" />
              <span className="text-text">{memberCount}/8 membros</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-textSecondary" />
              <span className="text-text">{line.leader?.display_name || line.leader?.nick}</span>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Membros</h2>
          <div className="space-y-3">
            {line.line_members?.map((member) => {
              const isLineLeader = member.user_id === line.leader_id
              return (
                <div key={member.user_id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    {member.users?.photo_url ? (
                      <img
                        src={member.users.photo_url}
                        alt={member.users.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
                        <Users className="w-6 h-6 text-textSecondary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text">{member.users?.display_name}</h3>
                        {isLineLeader && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-textSecondary text-sm">{member.users?.nick}</p>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      {member.users?.short_id && (
                        <div className="flex items-center gap-1 text-textSecondary">
                          <Hash className="w-3 h-3" />
                          {member.users.short_id}
                        </div>
                      )}
                      {member.users?.role_function && (
                        <div className="flex items-center gap-1 text-textSecondary">
                          <Zap className="w-3 h-3" />
                          {roleFunctionLabels[member.users.role_function] || member.users.role_function}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

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
