import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CompletionRateCardProps {
  completionRate: number
  totalCompletions: number
  avgDelay: number
}

export function CompletionRateCard({ completionRate, totalCompletions, avgDelay }: CompletionRateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Completion Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">On-time Rate</span>
            <span className="font-bold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalCompletions}</p>
            <p className="text-xs text-muted-foreground">Total Completions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{avgDelay > 0 ? avgDelay.toFixed(1) : '0'}</p>
            <p className="text-xs text-muted-foreground">Avg. Delay (days)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
