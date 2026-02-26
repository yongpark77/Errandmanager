import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import * as api from '@/api/profile'
import type { ProfileUpdate } from '@/types/errand'
import { toast } from 'sonner'

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => api.fetchProfile(user!.id),
    enabled: !!user,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: (data: ProfileUpdate) => api.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      refreshProfile()
      toast.success('Profile updated')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
