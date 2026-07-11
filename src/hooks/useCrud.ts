import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface CrudApi<T> {
  create: (payload: any) => Promise<T>
  update: (id: number | string, payload: any) => Promise<T>
  remove: (id: number | string) => Promise<unknown>
}

/** Standard create/update/delete mutations with toast + cache invalidation. */
export function useCrud<T>(queryKey: string, api: CrudApi<T>, label = 'Record') {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] })

  const create = useMutation({
    mutationFn: (payload: any) => api.create(payload),
    onSuccess: () => {
      toast.success(`${label} created`)
      invalidate()
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) => api.update(id, payload),
    onSuccess: () => {
      toast.success(`${label} updated`)
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => api.remove(id),
    onSuccess: () => {
      toast.success(`${label} deleted`)
      invalidate()
    },
  })

  return { create, update, remove, invalidate }
}
