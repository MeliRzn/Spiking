import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Upload, History, Trophy, User, Shield, Users, Search as SearchIcon } from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/upload', icon: Upload, label: 'Enviar' },
  { path: '/history', icon: History, label: 'Histórico' },
  { path: '/ranking', icon: Trophy, label: 'Ranking' },
  { path: '/lines', icon: Users, label: 'Linhas' },
  { path: '/search', icon: SearchIcon, label: 'Buscar' },
  { path: '/profile', icon: User, label: 'Perfil' },
]

export function BottomNav({ isAdmin = false }) {
  const location = useLocation()
  const navigate = useNavigate()

  const items = isAdmin 
    ? [...navItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong z-50 pb-safe">
      <div className="max-w-[480px] mx-auto px-2 pt-2">
        <div className="flex justify-around items-center h-16">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-textSecondary hover:text-text hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-6 h-6', isActive && 'scale-110')} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
