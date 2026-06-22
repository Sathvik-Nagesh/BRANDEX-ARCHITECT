import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDocuments(projectId: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => window.api.knowledge.documents.getByProject(projectId),
    enabled: !!projectId
  })
}

export function useDecisions(projectId: string) {
  return useQuery({
    queryKey: ['decisions', projectId],
    queryFn: () => window.api.knowledge.decisions.getByProject(projectId),
    enabled: !!projectId
  })
}

export function useMeetings(projectId: string) {
  return useQuery({
    queryKey: ['meetings', projectId],
    queryFn: () => window.api.knowledge.meetings.getByProject(projectId),
    enabled: !!projectId
  })
}

export function useCreateDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => window.api.knowledge.decisions.create(data),
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['decisions', variables.projectId] })
      }
    }
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => window.api.knowledge.meetings.create(data),
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['meetings', variables.projectId] })
      }
    }
  })
}
