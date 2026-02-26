import { useLocation } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/errands': 'Errands',
  '/add': 'New Errand',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function MobileHeader() {
  const location = useLocation()

  const getTitle = () => {
    if (location.pathname.startsWith('/errands/')) return 'Errand Detail'
    if (location.pathname.startsWith('/edit/')) return 'Edit Errand'
    return PAGE_TITLES[location.pathname] ?? 'Errand Manager'
  }

  return (
    <header className="sticky top-0 z-40 bg-background border-b px-4 h-14 flex items-center gap-3">
      <ClipboardList className="h-5 w-5 text-primary" />
      <h1 className="font-semibold text-lg">{getTitle()}</h1>
    </header>
  )
}
