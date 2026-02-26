import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/components/errands/category-icon'
import { StatusBadge } from '@/components/errands/status-badge'
import { CompleteDialog } from '@/components/errands/complete-dialog'
import { MonthlySpendChart } from '@/components/charts/monthly-spend-chart'
import { CategoryDonutChart } from '@/components/charts/category-donut-chart'
import { CompletionRateCard } from '@/components/charts/completion-rate-card'
import { useAuth } from '@/contexts/auth-context'
import { useErrands, useCompleteErrand } from '@/hooks/use-errands'
import { useAllCompletionHistory } from '@/hooks/use-completion-history'
import { useAnalyticsData } from '@/hooks/use-analytics'
import { calculateErrandStatus, getGreeting, formatCurrency, getIntervalLabel, getCompletionStatus } from '@/lib/errand-utils'
import { formatDate } from '@/lib/date-utils'
import { CATEGORIES, getCategoryConfig } from '@/lib/constants'
import { AlertTriangle, Clock, CheckCircle, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react'
import type { Errand, ErrandWithStatus, CompletionHistory } from '@/types/errand'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data: errands, isLoading } = useErrands()
  const { data: allHistory } = useAllCompletionHistory()
  const completeErrand = useCompleteErrand()
  const [completeTarget, setCompleteTarget] = useState<Errand | null>(null)

  const errandsWithStatus = useMemo(() => {
    if (!errands) return []
    return errands.map((e) => calculateErrandStatus(e, profile?.remind_days_before ?? 3))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  }, [errands, profile])

  const statusCounts = useMemo(() => {
    const overdue = errandsWithStatus.filter((e) => e.status === 'overdue').length
    const dueSoon = errandsWithStatus.filter((e) => ['due-today', 'due-tomorrow', 'due-soon'].includes(e.status)).length
    const onTrack = errandsWithStatus.filter((e) => e.status === 'on-track').length
    return { overdue, dueSoon, onTrack }
  }, [errandsWithStatus])

  const upcoming = errandsWithStatus.slice(0, 5)

  const categoryCounts = useMemo(() => {
    if (!errands) return []
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: errands.filter((e) => e.category === cat.value).length,
    }))
  }, [errands])

  const recentActivity = useMemo(() => {
    if (!allHistory || !errands) return []
    return allHistory.slice(0, 5).map((h) => {
      const errand = errands.find((e) => e.id === h.errand_id)
      const completionStatus = getCompletionStatus(h.completed_date, h.scheduled_date)
      return { ...h, errandName: errand?.name ?? 'Unknown', completionStatus }
    })
  }, [allHistory, errands])

  const handleComplete = (data: { completedDate: string; cost: number; notes: string; nextDue: string; estimatedCost?: number }) => {
    if (!completeTarget) return
    completeErrand.mutate({
      errandId: completeTarget.id,
      scheduledDate: completeTarget.next_due,
      ...data,
    }, { onSuccess: () => setCompleteTarget(null) })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {profile?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-muted-foreground">Here's your errand overview</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{statusCounts.overdue}</p>
              <p className="text-sm text-red-600">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{statusCounts.dueSoon}</p>
              <p className="text-sm text-orange-600">Due Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{statusCounts.onTrack}</p>
              <p className="text-sm text-green-600">On Track</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Upcoming</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/errands">
              See All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No errands yet. Add your first one!</p>
          ) : (
            <div className="divide-y">
              {upcoming.map((errand) => (
                <UpcomingRow key={errand.id} errand={errand} onComplete={() => setCompleteTarget(errand)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoryCounts.map((cat) => (
            <Link key={cat.value} to={`/errands?category=${cat.value}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <CategoryIcon category={cat.value} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} errands</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{activity.errandName}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {formatDate(activity.completed_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.cost > 0 && (
                      <span className="text-sm font-medium">{formatCurrency(activity.cost)}</span>
                    )}
                    <Badge
                      variant="secondary"
                      className={activity.completionStatus.type === 'on-time'
                        ? 'bg-green-100 text-green-700'
                        : activity.completionStatus.type === 'late'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'}
                    >
                      {activity.completionStatus.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Charts */}
      <DashboardCharts errands={errands} allHistory={allHistory} />

      {/* Pro Tip */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-blue-900 text-sm">Pro Tip</p>
            <p className="text-sm text-blue-700">
              Click the + New Errand button to add a new recurring errand. Stay ahead of deadlines and avoid surprise costs.
            </p>
          </div>
        </CardContent>
      </Card>

      {completeTarget && (
        <CompleteDialog
          errand={completeTarget}
          open={!!completeTarget}
          onOpenChange={(open) => !open && setCompleteTarget(null)}
          onConfirm={handleComplete}
          loading={completeErrand.isPending}
        />
      )}
    </div>
  )
}

function DashboardCharts({ errands, allHistory }: { errands: Errand[] | undefined; allHistory: CompletionHistory[] | undefined }) {
  const analytics = useAnalyticsData(allHistory, errands, '6m')
  if (!analytics) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MonthlySpendChart data={analytics.monthlySpendData} />
      <CategoryDonutChart data={analytics.categoryDonutData} />
      <CompletionRateCard
        completionRate={analytics.completionRate}
        totalCompletions={analytics.totalCompletions}
        avgDelay={analytics.avgDelay}
      />
    </div>
  )
}

function UpcomingRow({ errand, onComplete }: { errand: ErrandWithStatus; onComplete: () => void }) {
  return (
    <Link
      to={`/errands/${errand.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <CategoryIcon category={errand.category} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{errand.name}</p>
        <p className="text-xs text-muted-foreground">
          {getIntervalLabel(errand.interval_type, errand.interval_value)} &middot; Due {formatDate(errand.next_due)}
        </p>
      </div>
      <StatusBadge status={errand.status} label={errand.statusLabel} />
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 hidden sm:inline-flex"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onComplete() }}
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    </Link>
  )
}
