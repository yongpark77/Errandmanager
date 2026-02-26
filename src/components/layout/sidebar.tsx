import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, Plus, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { useIsWideDesktop } from '@/hooks/use-media-query'
import { NAV_ITEMS } from '@/lib/constants'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const isWide = useIsWideDesktop()
  const [expanded, setExpanded] = useState(isWide)

  useEffect(() => {
    setExpanded(isWide)
  }, [isWide])

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-all duration-200',
        expanded ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 h-14 shrink-0', !expanded && 'justify-center px-2')}>
        <ClipboardList className="h-6 w-6 text-sidebar-primary shrink-0" />
        {expanded && <span className="font-bold text-lg text-sidebar-foreground">Errand Manager</span>}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          const link = (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                !expanded && 'justify-center px-2'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {expanded && <span>{item.label}</span>}
            </Link>
          )

          if (!expanded) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }
          return link
        })}
      </nav>

      {/* New Errand button */}
      <div className="px-3 pb-2">
        {expanded ? (
          <Button asChild className="w-full">
            <Link to="/add">
              <Plus className="h-4 w-4 mr-2" />
              New Errand
            </Link>
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button asChild size="icon" className="w-full">
                <Link to="/add">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Errand</TooltipContent>
          </Tooltip>
        )}
      </div>

      <Separator />

      {/* User + toggle */}
      <div className={cn('px-3 py-3 space-y-2', !expanded && 'px-2')}>
        {expanded ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', !expanded && 'px-0')}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <PanelLeftClose className="h-4 w-4 mr-2" />
              Collapse
            </>
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
