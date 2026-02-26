import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, Menu, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function SidebarSheet() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b px-4 h-14 flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-4 h-14">
                <ClipboardList className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Errand Manager</span>
              </div>
              <Separator />
              <nav className="flex-1 py-4 space-y-1 px-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="px-3 pb-2">
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link to="/add">
                    <Plus className="h-4 w-4 mr-2" />
                    New Errand
                  </Link>
                </Button>
              </div>
              <Separator />
              <div className="px-3 py-3 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.name}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <ClipboardList className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg">
          {location.pathname === '/' ? 'Dashboard' : location.pathname.startsWith('/errands') ? 'Errands' : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2)}
        </h1>
      </header>
    </>
  )
}
