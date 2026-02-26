import { getCategoryConfig } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CategoryIconProps {
  category: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function CategoryIcon({ category, size = 'md', showLabel = false }: CategoryIconProps) {
  const config = getCategoryConfig(category)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  }

  const containerClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-14 w-14',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn('rounded-lg flex items-center justify-center', containerClasses[size], config.bg)}>
        <Icon className={cn(sizeClasses[size], config.color)} />
      </div>
      {showLabel && <span className="text-sm font-medium">{config.label}</span>}
    </div>
  )
}
