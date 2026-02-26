import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrandForm } from '@/components/errands/errand-form'
import { useErrand, useUpdateErrand } from '@/hooks/use-errands'

export default function EditErrandPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: errand, isLoading } = useErrand(id!)
  const updateErrand = useUpdateErrand()

  if (isLoading || !errand) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Errand</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrandForm
            initialData={errand}
            submitLabel="Save Changes"
            loading={updateErrand.isPending}
            onCancel={() => navigate(-1)}
            onSubmit={(data) => {
              updateErrand.mutate(
                { id: errand.id, data },
                { onSuccess: () => navigate(`/errands/${errand.id}`) }
              )
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
