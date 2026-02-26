import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import * as api from '@/api/completion-history'
import { toast } from 'sonner'

export function useCompletionHistory(errandId: string) {
  return useQuery({
    queryKey: ['completion-history', errandId],
    queryFn: () => api.fetchCompletionHistory(errandId),
    enabled: !!errandId,
  })
}

export function useAllCompletionHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['all-completion-history', user?.id],
    queryFn: () => api.fetchAllCompletionHistory(user!.id),
    enabled: !!user,
  })
}

export function useDeleteCompletionRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteCompletionRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completion-history'] })
      queryClient.invalidateQueries({ queryKey: ['all-completion-history'] })
      toast.success('Record deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
