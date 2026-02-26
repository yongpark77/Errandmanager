import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { MobileHeader } from './mobile-header'
import { SidebarSheet } from './sidebar-sheet'
import { useIsMobile, useIsTablet, useIsDesktop, useIsWideDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isWide = useIsWideDesktop()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      {isDesktop && <Sidebar />}

      {/* Tablet hamburger header */}
      {isTablet && <SidebarSheet />}

      {/* Mobile header */}
      {isMobile && <MobileHeader />}

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-200',
          isDesktop && (isWide ? 'ml-60' : 'ml-16'),
          isMobile && 'pb-20',
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </div>
  )
}
