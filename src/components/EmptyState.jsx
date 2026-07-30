import { cn } from '../lib/utils'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-textSecondary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-textSecondary text-sm mb-6 max-w-xs">{description}</p>
      {action && action}
    </div>
  )
}
