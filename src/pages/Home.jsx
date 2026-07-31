import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User as UserIcon, Target, TrendingUp } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { weeklyGoalsAPI, goalsAPI } from '../lib/database'

export function Home() {
  const { user, profile } = useAuth()
  const [weeklyGoals, setWeeklyGoals] = useState(null)
  const [userGoal, setUserGoal] = useState(null)
  const [loadingGoals, setLoadingGoals] = useState(true)

  useEffect(() => {
    loadWeeklyGoals()
    loadUserGoal()
  }, [])

  const loadWeeklyGoals = async () => {
    setLoadingGoals(true)
    try {
      const data = await weeklyGoalsAPI.getCurrent()
      setWeeklyGoals(data)
    } catch (error) {
      console.error('Error loading weekly goals:', error)
    } finally {
      setLoadingGoals(false)
    }
  }

  const loadUserGoal = async () => {
    try {
      const now = new Date()
      const weekNumber = getWeekNumber(now)
      const year = now.getFullYear()
      const data = await goalsAPI.getHistory(user.id)
      const currentWeekGoal = data.find(g => g.week_number === weekNumber && g.year === year)
      setUserGoal(currentWeekGoal)
    } catch (error) {
      console.error('Error loading user goal:', error)
    }
  }

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Jogador'
  const photoURL = profile?.photo_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const nick = profile?.nick || 'Não definido'
  const role = profile?.role || 'Não definido'

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Olá, {displayName.split(' ')[0]}</h1>
          <p className="text-textSecondary text-sm mt-1">Bem-vindo à guilda</p>
        </div>

        {/* User Card */}
        <div className="glass rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-4">
            {photoURL ? (
              <img 
                src={photoURL} 
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center border-2 border-primary/30">
                <UserIcon className="w-8 h-8 text-textSecondary" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text">{displayName}</h2>
              <p className="text-textSecondary text-sm">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* User Info - Empty States */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-text">Nick</h3>
                <p className="text-textSecondary text-sm">{nick}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-text">Cargo</h3>
                <p className="text-textSecondary text-sm">{role}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-text">Status da Meta da Semana</h3>
                {loadingGoals ? (
                  <p className="text-textSecondary text-sm">Carregando...</p>
                ) : userGoal ? (
                  <p className={`text-sm font-medium ${
                    userGoal.status === 'approved' ? 'text-green-400' :
                    userGoal.status === 'rejected' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {userGoal.status === 'approved' ? 'Aprovado' :
                     userGoal.status === 'rejected' ? 'Rejeitado' :
                     'Pendente de aprovação'}
                  </p>
                ) : (
                  <p className="text-textSecondary text-sm">Aguardando upload</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goal Status */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-text mb-4">Meta da Semana</h3>
          {loadingGoals ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : weeklyGoals ? (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text">Semana {weeklyGoals.week_number} - {weeklyGoals.year}</h3>
                  <p className="text-textSecondary text-sm">
                    {new Date(weeklyGoals.start_date).toLocaleDateString('pt-BR')} - {new Date(weeklyGoals.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-textSecondary text-xs mb-1">Pontos de Guerra</p>
                  <p className="text-2xl font-bold text-text">{weeklyGoals.war_points_target}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-textSecondary text-xs mb-1">Pontos Semanais</p>
                  <p className="text-2xl font-bold text-text">{weeklyGoals.weekly_points_target}</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState 
              icon={Target}
              title="Nenhuma meta definida"
              description="Configure sua meta semanal para começar a acompanhar seu progresso."
            />
          )}
        </div>
      </div>
    </div>
  )
}
