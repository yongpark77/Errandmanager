import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PublicRoute } from '@/components/auth/public-route'
import { AppLayout } from '@/components/layout/app-layout'
import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'
import DashboardPage from '@/pages/dashboard'
import ErrandsPage from '@/pages/errands'
import ErrandDetailPage from '@/pages/errand-detail'
import AddErrandPage from '@/pages/add-errand'
import EditErrandPage from '@/pages/edit-errand'
import AnalyticsPage from '@/pages/analytics'
import SettingsPage from '@/pages/settings'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/errands', element: <ErrandsPage /> },
          { path: '/errands/:id', element: <ErrandDetailPage /> },
          { path: '/add', element: <AddErrandPage /> },
          { path: '/edit/:id', element: <EditErrandPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
