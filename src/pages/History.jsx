import { History as HistoryIcon } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

export function History() {
  // TODO: Fetch actual history from database
  const historyItems = []

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Histórico</h1>
          <p className="text-textSecondary text-sm mt-1">Seus envios anteriores</p>
        </div>

        {/* History List */}
        {historyItems.length === 0 ? (
          <EmptyState 
            icon={HistoryIcon}
            title="Nenhum envio encontrado"
            description="Você ainda não enviou nenhum comprovante de meta."
          />
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-4">
                {/* History item content */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
