import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CategoryIcon } from '@/components/errands/category-icon'
import { StatusBadge } from '@/components/errands/status-badge'
import { CompleteDialog } from '@/components/errands/complete-dialog'
import { DeleteConfirmDialog } from '@/components/errands/delete-confirm-dialog'
import { useErrand, useCompleteErrand, useDeleteErrand } from '@/hooks/use-errands'
import { useCompletionHistory, useDeleteCompletionRecord } from '@/hooks/use-completion-history'
import { useAuth } from '@/contexts/auth-context'
import { calculateErrandStatus, formatCurrency, getIntervalLabel, getCompletionStatus, calculateTotalCost, calculateAverageCost } from '@/lib/errand-utils'
import { formatDate } from '@/lib/date-utils'
import { ArrowLeft, Pencil, Trash2, CheckCircle, Calendar, DollarSign, RefreshCcw, Bell, FileText, History } from 'lucide-react'

export default function ErrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: errand, isLoading } = useErrand(id!)
  const { data: history } = useCompletionHistory(id!)
  const completeErrand = useCompleteErrand()
  const deleteErrand = useDeleteErrand()
  const deleteRecord = useDeleteCompletionRecord()

  const [showComplete, setShowComplete] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading || !errand) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  const errandWithStatus = calculateErrandStatus(errand, profile?.remind_days_before ?? 3)
  const totalCost = calculateTotalCost(history ?? [])
  const avgCost = calculateAverageCost(history ?? [])

  const handleComplete = (data: { completedDate: string; cost: number; notes: string; nextDue: string; estimatedCost?: number }) => {
    completeErrand.mutate({
      errandId: errand.id,
      scheduledDate: errand.next_due,
      ...data,
    }, { onSuccess: () => setShowComplete(false) })
  }

  const handleDelete = () => {
    deleteErrand.mutate(errand.id, { onSuccess: () => navigate('/errands') })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${errand.id}`)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CategoryIcon category={errand.category} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{errand.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{errand.category.charAt(0).toUpperCase() + errand.category.slice(1)}</Badge>
                <StatusBadge status={errandWithStatus.status} label={errandWithStatus.statusLabel} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Fields */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField icon={<RefreshCcw className="h-4 w-4" />} label="Interval" value={getIntervalLabel(errand.interval_type, errand.interval_value)} />
            <InfoField icon={<Calendar className="h-4 w-4" />} label="Next Due" value={formatDate(errand.next_due)} />
            <InfoField icon={<Calendar className="h-4 w-4" />} label="Last Completed" value={errand.last_completed ? formatDate(errand.last_completed) : 'Never'} />
            <InfoField icon={<Bell className="h-4 w-4" />} label="Reminders" value={errand.reminders ? 'Enabled' : 'Disabled'} />
            <InfoField icon={<DollarSign className="h-4 w-4" />} label="Estimated Cost" value={formatCurrency(errand.estimated_cost)} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {errand.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{errand.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Completion History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Completion History
            </CardTitle>
            {(history?.length ?? 0) > 0 && (
              <div className="flex gap-4 text-sm">
                <span>Total: <strong>{formatCurrency(totalCost)}</strong></span>
                <span>Avg: <strong>{formatCurrency(avgCost)}</strong></span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!history || history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No completion history yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Completed</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => {
                  const status = getCompletionStatus(record.completed_date, record.scheduled_date)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{formatDate(record.completed_date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(record.scheduled_date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            status.type === 'on-time' ? 'bg-green-100 text-green-700' :
                            status.type === 'late' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(record.cost)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{record.notes ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteRecord.mutate(record.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => setShowComplete(true)}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Completed
        </Button>
        <Button variant="destructive" onClick={() => setShowDelete(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Dialogs */}
      <CompleteDialog
        errand={errand}
        open={showComplete}
        onOpenChange={setShowComplete}
        onConfirm={handleComplete}
        loading={completeErrand.isPending}
      />
      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        loading={deleteErrand.isPending}
      />
    </div>
  )
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
