import { LayoutDashboard, ClipboardList, BarChart3, Settings, Car, Home, CreditCard, Heart, MoreHorizontal } from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Errands', icon: ClipboardList, path: '/errands' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Settings', icon: Settings, path: '/settings' },
] as const

export const CATEGORIES = [
  { value: 'vehicle' as const, label: 'Vehicle', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50', chartColor: '#3b82f6' },
  { value: 'home' as const, label: 'Home', icon: Home, color: 'text-green-500', bg: 'bg-green-50', chartColor: '#22c55e' },
  { value: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50', chartColor: '#a855f7' },
  { value: 'health' as const, label: 'Health', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', chartColor: '#ef4444' },
  { value: 'other' as const, label: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50', chartColor: '#6b7280' },
] as const

export const BREAKPOINTS = {
  sm: 768,
  md: 1024,
  lg: 1280,
} as const

export const getCategoryConfig = (category: string) =>
  CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[4]
