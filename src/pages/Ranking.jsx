import { Trophy } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

export function Ranking() {
  // TODO: Fetch actual ranking from database
  const rankingData = []

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Ranking</h1>
          <p className="text-textSecondary text-sm mt-1">Classificação da guilda</p>
        </div>

        {/* Ranking List */}
        {rankingData.length === 0 ? (
          <EmptyState 
            icon={Trophy}
            title="Nenhum ranking disponível"
            description="O ranking será exibido quando houver dados cadastrados."
          />
        ) : (
          <div className="space-y-3">
            {rankingData.map((player, index) => (
              <div key={player.id} className="glass rounded-2xl p-4">
                {/* Ranking item content */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
