import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrandForm } from '@/components/errands/errand-form'
import { useCreateErrand } from '@/hooks/use-errands'

export default function AddErrandPage() {
  const navigate = useNavigate()
  const createErrand = useCreateErrand()

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Errand</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrandForm
            submitLabel="Create Errand"
            loading={createErrand.isPending}
            onCancel={() => navigate(-1)}
            onSubmit={(data) => {
              createErrand.mutate(data, {
                onSuccess: () => navigate('/errands'),
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
