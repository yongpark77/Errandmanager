import { useState, useEffect } from 'react'
import { BREAKPOINTS } from '@/lib/constants'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useIsMobile() {
  return !useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`)
}

export function useIsTablet() {
  const aboveSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`)
  const belowMd = !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`)
  return aboveSm && belowMd
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`)
}

export function useIsWideDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
}
