import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useFeaturesByProject(projectId: string) {
  return useQuery({
    queryKey: ['features', 'project', projectId],
    queryFn: () => window.api.features.getByProject(projectId),
    enabled: !!projectId
  })
}

export function useFeature(id: string) {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: () => window.api.features.get(id),
    enabled: !!id
  })
}

export function useCreateFeature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => window.api.features.create(data),
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['features', 'project', variables.projectId] })
      }
    }
  })
}

export function useUpdateFeature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => window.api.features.update(id, data),
    // Optimistic Update can be added here for drag-and-drop
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feature', variables.id] })
      // We'd ideally need the projectId to invalidate the list
    }
  })
}
