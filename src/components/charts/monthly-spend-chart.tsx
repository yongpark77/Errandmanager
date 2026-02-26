import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { chartConfig, CATEGORY_COLORS } from '@/lib/chart-config'

interface MonthlySpendChartProps {
  data: Array<Record<string, unknown>>
  stacked?: boolean
}

export function MonthlySpendChart({ data, stacked = false }: MonthlySpendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No spend data yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {stacked ? (
              Object.keys(CATEGORY_COLORS).map((cat) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} radius={cat === 'other' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))
            ) : (
              <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
