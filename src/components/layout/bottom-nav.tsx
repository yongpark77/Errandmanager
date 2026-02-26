import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, PlusCircle, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_TABS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Errands', icon: ClipboardList, path: '/errands' },
  { label: 'Add', icon: PlusCircle, path: '/add', isFab: true },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Settings', icon: Settings, path: '/settings' },
] as const

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_TABS.map((tab) => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)

          if (tab.isFab) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex items-center justify-center -mt-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                <tab.icon className="h-7 w-7" />
              </Link>
            )
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {isActive && <div className="w-4 h-0.5 bg-primary rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
