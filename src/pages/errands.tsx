import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryIcon } from '@/components/errands/category-icon'
import { StatusBadge } from '@/components/errands/status-badge'
import { ErrandCard } from '@/components/errands/errand-card'
import { CompleteDialog } from '@/components/errands/complete-dialog'
import { DeleteConfirmDialog } from '@/components/errands/delete-confirm-dialog'
import { useAuth } from '@/contexts/auth-context'
import { useErrands, useCompleteErrand, useDeleteErrand, useDeleteMultipleErrands } from '@/hooks/use-errands'
import { calculateErrandStatus, formatCurrency, getIntervalLabel } from '@/lib/errand-utils'
import { formatDate, startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, isSameDay, isSameMonth, subMonths } from '@/lib/date-utils'
import { CATEGORIES } from '@/lib/constants'
import { useIsMobile } from '@/hooks/use-media-query'
import { Plus, Search, List, CalendarIcon, CheckCircle, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Errand, ErrandWithStatus } from '@/types/errand'

export default function ErrandsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  const { data: errands, isLoading } = useErrands()
  const completeErrand = useCompleteErrand()
  const deleteErrand = useDeleteErrand()
  const deleteMultiple = useDeleteMultipleErrands()
  const isMobile = useIsMobile()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [completeTarget, setCompleteTarget] = useState<Errand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'next_due' | 'name' | 'category' | 'estimated_cost'>('next_due')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const errandsWithStatus = useMemo(() => {
    if (!errands) return []
    let filtered = errands.map((e) => calculateErrandStatus(e, profile?.remind_days_before ?? 3))

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q) || e.category.includes(q))
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((e) => e.category === categoryFilter)
    }

    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'category': cmp = a.category.localeCompare(b.category); break
        case 'estimated_cost': cmp = a.estimated_cost - b.estimated_cost; break
        default: cmp = a.daysUntilDue - b.daysUntilDue
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return filtered
  }, [errands, search, categoryFilter, sortBy, sortDir, profile])

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(errandsWithStatus.map((e) => e.id)) : new Set())
  }

  const handleComplete = (data: { completedDate: string; cost: number; notes: string; nextDue: string; estimatedCost?: number }) => {
    if (!completeTarget) return
    completeErrand.mutate({ errandId: completeTarget.id, scheduledDate: completeTarget.next_due, ...data }, {
      onSuccess: () => setCompleteTarget(null),
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteErrand.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) })
  }

  const handleBulkDelete = () => {
    deleteMultiple.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Errands</h1>
          <p className="text-sm text-muted-foreground">{errands?.length ?? 0} errands</p>
        </div>
        <Button onClick={() => navigate('/add')}>
          <Plus className="h-4 w-4 mr-2" />
          New Errand
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search errands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
          <TabsList>
            <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon className="h-4 w-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}

      {/* List / Calendar View */}
      {view === 'list' ? (
        isMobile ? (
          <div className="space-y-3">
            {errandsWithStatus.map((errand) => (
              <ErrandCard
                key={errand.id}
                errand={errand}
                onComplete={() => setCompleteTarget(errand)}
                onDelete={() => setDeleteTarget(errand.id)}
              />
            ))}
            {errandsWithStatus.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No errands found</p>
            )}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === errandsWithStatus.length && errandsWithStatus.length > 0}
                      onCheckedChange={(c) => toggleSelectAll(!!c)}
                    />
                  </TableHead>
                  <TableHead className="w-10" />
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('next_due')}>
                    Next Due {sortBy === 'next_due' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('estimated_cost')}>
                    Cost {sortBy === 'estimated_cost' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {errandsWithStatus.map((errand) => (
                  <TableRow
                    key={errand.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/errands/${errand.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(errand.id)}
                        onCheckedChange={(c) => toggleSelect(errand.id, !!c)}
                      />
                    </TableCell>
                    <TableCell>
                      <CategoryIcon category={errand.category} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium">{errand.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getIntervalLabel(errand.interval_type, errand.interval_value)}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(errand.next_due)}</TableCell>
                    <TableCell>
                      <StatusBadge status={errand.status} label={errand.statusLabel} />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {errand.estimated_cost > 0 ? formatCurrency(errand.estimated_cost) : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCompleteTarget(errand)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/edit/${errand.id}`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(errand.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {errandsWithStatus.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No errands found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        <CalendarView
          errands={errandsWithStatus}
          currentMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          onComplete={setCompleteTarget}
        />
      )}

      {/* Dialogs */}
      {completeTarget && (
        <CompleteDialog
          errand={completeTarget}
          open={!!completeTarget}
          onOpenChange={(open) => !open && setCompleteTarget(null)}
          onConfirm={handleComplete}
          loading={completeErrand.isPending}
        />
      )}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteErrand.isPending}
      />
    </div>
  )
}

function CalendarView({
  errands,
  currentMonth,
  onMonthChange,
  onComplete,
}: {
  errands: ErrandWithStatus[]
  currentMonth: Date
  onMonthChange: (d: Date) => void
  onComplete: (e: Errand) => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const navigate = useNavigate()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  const errandsByDate = useMemo(() => {
    const map = new Map<string, ErrandWithStatus[]>()
    errands.forEach((e) => {
      const key = e.next_due
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [errands])

  const selectedErrands = selectedDate
    ? errands.filter((e) => isSameDay(new Date(e.next_due + 'T00:00:00'), selectedDate))
    : errands.filter((e) => isSameMonth(new Date(e.next_due + 'T00:00:00'), currentMonth))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
            <Button variant="ghost" size="icon" onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted-foreground mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayErrands = errandsByDate.get(dateStr) || []
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative
                    ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-accent' : 'hover:bg-muted'}
                  `}
                >
                  {day.getDate()}
                  {dayErrands.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayErrands.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            e.status === 'overdue' ? 'bg-red-500' :
                            e.status === 'on-track' ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Side panel */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">
          {selectedDate
            ? format(selectedDate, 'EEE, MMM d')
            : `${format(currentMonth, 'MMMM')} Errands`}
        </h3>
        {selectedErrands.length === 0 ? (
          <p className="text-sm text-muted-foreground">No errands</p>
        ) : (
          selectedErrands.map((e) => (
            <ErrandCard key={e.id} errand={e} onComplete={() => onComplete(e)} />
          ))
        )}
      </div>
    </div>
  )
}
