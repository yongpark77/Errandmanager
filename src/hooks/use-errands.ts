import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import * as api from '@/api/errands'
import type { ErrandInsert, ErrandUpdate } from '@/types/errand'
import { toast } from 'sonner'

export function useErrands() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['errands', user?.id],
    queryFn: () => api.fetchErrands(user!.id),
    enabled: !!user,
  })
}

export function useErrand(id: string) {
  return useQuery({
    queryKey: ['errand', id],
    queryFn: () => api.fetchErrand(id),
    enabled: !!id,
  })
}

export function useCreateErrand() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: Omit<ErrandInsert, 'user_id'>) =>
      api.createErrand({ ...data, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      toast.success('Errand created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateErrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ErrandUpdate }) =>
      api.updateErrand(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['errand', data.id] })
      toast.success('Errand updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteErrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteErrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      toast.success('Errand deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCompleteErrand() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (params: {
      errandId: string
      completedDate: string
      scheduledDate: string
      cost: number
      notes: string
      nextDue: string
      estimatedCost?: number
    }) =>
      api.completeErrand(params.errandId, user!.id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['errand'] })
      queryClient.invalidateQueries({ queryKey: ['completion-history'] })
      queryClient.invalidateQueries({ queryKey: ['all-completion-history'] })
      toast.success('Errand marked as completed')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteMultipleErrands() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteMultipleErrands,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      toast.success('Errands deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
