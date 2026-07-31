import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Hash, Shield, Zap, Filter } from 'lucide-react'
import { searchAPI } from '../lib/database'
import { EmptyState } from '../components/EmptyState'

const roleFunctionLabels = {
  rush: 'Rush',
  full_gas: 'Full Gás',
  suporte: 'Suporte',
  curandeiro: 'Curandeiro',
  flex: 'Flex'
}

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      let data = []
      
      switch (searchType) {
        case 'all':
          data = await searchAPI.searchUsers(query)
          break
        case 'short_id':
          const user = await searchAPI.findByShortId(query)
          data = user ? [user] : []
          break
        case 'line':
          data = await searchAPI.searchByLine(query)
          break
        case 'role':
          data = await searchAPI.searchByRole(query)
          break
        case 'function':
          data = await searchAPI.searchByFunction(query)
          break
        default:
          data = await searchAPI.searchUsers(query)
      }
      
      setResults(data)
    } catch (error) {
      console.error('Error searching:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Buscar Jogadores</h1>
          <p className="text-textSecondary text-sm mt-1">Encontre membros da guilda</p>
        </div>

        {/* Search Type Selector */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'short_id', label: 'ID Curto' },
              { id: 'line', label: 'Linha' },
              { id: 'role', label: 'Cargo' },
              { id: 'function', label: 'Função' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
                  searchType === type.id
                    ? 'bg-primary text-white'
                    : 'glass text-textSecondary hover:text-text'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                searchType === 'short_id' ? 'Digite o ID curto...' :
                searchType === 'line' ? 'Digite o nome da linha...' :
                searchType === 'role' ? 'Digite o cargo...' :
                searchType === 'function' ? 'Digite a função...' :
                'Digite nick, ID ou nome...'
              }
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface2 border border-border text-text placeholder-textSecondary focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : hasSearched ? (
          results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum resultado encontrado"
              description="Tente buscar com outros termos."
            />
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                // Check if result is a user or a line
                if (result.line_members) {
                  // It's a line
                  return (
                    <div key={result.id} className="glass rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-text">{result.name}</h3>
                          <p className="text-textSecondary text-sm">
                            Líder: {result.leader?.display_name || result.leader?.nick}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-textSecondary text-sm">{result.line_members?.length || 0} membros</p>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  // It's a user
                  return (
                    <div 
                      key={result.id} 
                      className="glass rounded-2xl p-4 cursor-pointer hover:bg-surface2/50 transition-colors"
                      onClick={() => handleViewProfile(result.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {result.photo_url ? (
                          <img
                            src={result.photo_url}
                            alt={result.display_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
                            <Users className="w-6 h-6 text-textSecondary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-text">{result.display_name}</h3>
                          <p className="text-textSecondary text-sm">{result.nick}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-surface2 text-textSecondary'
                          }`}>
                            {result.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-textSecondary">
                        {result.short_id && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {result.short_id}
                          </div>
                        )}
                        {result.free_fire_id && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            ID: {result.free_fire_id}
                          </div>
                        )}
                        {result.role_function && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {roleFunctionLabels[result.role_function] || result.role_function}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          )
        ) : (
          <EmptyState
            icon={Search}
            title="Busque jogadores"
            description="Use o campo acima para buscar membros da guilda."
          />
        )}
      </div>
    </div>
  )
}
