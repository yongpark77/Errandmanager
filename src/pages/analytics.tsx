import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useErrands } from '@/hooks/use-errands'
import { useAllCompletionHistory } from '@/hooks/use-completion-history'
import { useAnalyticsData, type PeriodKey } from '@/hooks/use-analytics'
import { formatCurrency } from '@/lib/errand-utils'
import { chartConfig, CATEGORY_COLORS, COMPLETION_COLORS, completionChartConfig } from '@/lib/chart-config'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: errands, isLoading: errandsLoading } = useErrands()
  const { data: history, isLoading: historyLoading } = useAllCompletionHistory()
  const [period, setPeriod] = useState<PeriodKey>('6m')
  const analytics = useAnalyticsData(history, errands, period)

  const isLoading = errandsLoading || historyLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-center py-12">No data available yet. Complete some errands to see analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
          <TabsList>
            <TabsTrigger value="30d">30d</TabsTrigger>
            <TabsTrigger value="3m">3m</TabsTrigger>
            <TabsTrigger value="6m">6m</TabsTrigger>
            <TabsTrigger value="12m">12m</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Spent"
          value={formatCurrency(analytics.totalSpent)}
          change={analytics.spentChange}
          invertColor
        />
        <KpiCard
          icon={<Calendar className="h-4 w-4" />}
          label="Avg. Monthly"
          value={formatCurrency(analytics.avgMonthly)}
          change={analytics.avgChange}
          invertColor
        />
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          change={analytics.rateChange}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg. Delay"
          value={`${analytics.avgDelay.toFixed(1)} days`}
        />
      </div>

      {/* Cost Analysis Section */}
      <h2 className="text-lg font-semibold">Cost Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlySpendData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={analytics.monthlySpendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {Object.keys(CATEGORY_COLORS).map((cat) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} name={cat.charAt(0).toUpperCase() + cat.slice(1)} />
                  ))}
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryDonutData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie
                    data={analytics.categoryDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {analytics.categoryDonutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-lg font-bold">
                    {formatCurrency(analytics.totalSpent)}
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-xs">
                    Total
                  </text>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Errands */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Errands by Cost</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topErrands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={{ total: { label: 'Total', color: 'var(--color-primary)' } }} className="h-[280px] w-full">
                <BarChart data={analytics.topErrands} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Cost Matrix Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Cost Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            {Object.keys(analytics.costMatrix).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                      <TableHead key={cat} className="text-right">{cat.charAt(0).toUpperCase() + cat.slice(1)}</TableHead>
                    ))}
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(analytics.costMatrix).map(([month, cats]) => {
                    const total = Object.values(cats).reduce((s, v) => s + v, 0)
                    return (
                      <TableRow key={month}>
                        <TableCell className="font-medium">{month}</TableCell>
                        {Object.keys(CATEGORY_COLORS).map((cat) => (
                          <TableCell key={cat} className="text-right text-sm">
                            {cats[cat] ? formatCurrency(cats[cat]) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-sm">{formatCurrency(total)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion Analysis Section */}
      <h2 className="text-lg font-semibold">Completion Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Completion Rate Line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlyCompletionData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={{ rate: { label: 'Completion Rate', color: '#22c55e' } }} className="h-[280px] w-full">
                <LineChart data={analytics.monthlyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Completion Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completion Timing</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.completionDonutData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={completionChartConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie
                    data={analytics.completionDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {analytics.completionDonutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-lg font-bold">
                    {analytics.totalCompletions}
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-xs">
                    Total
                  </text>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Completion Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Completion by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryCompletionData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ChartContainer config={completionChartConfig} className="h-[280px] w-full">
                <BarChart data={analytics.categoryCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="onTime" fill={COMPLETION_COLORS['on-time']} name="On Time" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill={COMPLETION_COLORS['late']} name="Late" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="early" fill={COMPLETION_COLORS['early']} name="Early" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  change,
  invertColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change?: number
  invertColor?: boolean
}) {
  const isPositive = (change ?? 0) > 0
  const showChange = change !== undefined && change !== 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
        {showChange && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span
              className={`text-xs font-medium ${
                invertColor
                  ? (isPositive ? 'text-red-600' : 'text-green-600')
                  : (isPositive ? 'text-green-600' : 'text-red-600')
              }`}
            >
              {isPositive ? '+' : ''}{change!.toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
