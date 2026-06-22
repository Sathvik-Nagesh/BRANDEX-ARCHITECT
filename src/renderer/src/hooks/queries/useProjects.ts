import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.projects.list()
  })
}

export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: ['projects', 'client', clientId],
    queryFn: () => window.api.projects.getByClient(clientId),
    enabled: !!clientId
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => window.api.projects.get(id),
    enabled: !!id
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => window.api.projects.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: ['projects', 'client', variables.clientId] })
      }
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => window.api.projects.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    }
  })
}
