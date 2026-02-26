import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import { chartConfig } from '@/lib/chart-config'
import { formatCurrency } from '@/lib/errand-utils'

interface CategoryDonutChartProps {
  data: Array<{ name: string; value: number; fill: string }>
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cost by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              formatter={(value: string, _entry: unknown) => {
                const item = data.find((d) => d.name === value)
                return `${value} ${item ? formatCurrency(item.value) : ''}`
              }}
            />
            <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-lg font-bold">
              {formatCurrency(total)}
            </text>
            <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-xs">
              Total
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
