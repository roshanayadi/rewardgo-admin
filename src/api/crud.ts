import { api, unwrap, unwrapList } from './client'
import type { ListParams, PaginationMeta } from '@/types'

/**
 * Generic admin CRUD service factory. Assumes the standard RewardGo
 * envelope + `/admin/<resource>` routes.
 */
export function createCrudApi<T, TCreate = Partial<T>, TUpdate = Partial<T>>(resource: string) {
  const base = `/admin/${resource}`

  return {
    list: (params?: ListParams) =>
      unwrapList<T>(api.get(base, { params })) as Promise<{ data: T[]; meta?: PaginationMeta }>,

    get: (id: number | string) => unwrap<T>(api.get(`${base}/${id}`)),

    create: (payload: TCreate) => unwrap<T>(api.post(base, payload)),

    update: (id: number | string, payload: TUpdate) => unwrap<T>(api.put(`${base}/${id}`, payload)),

    remove: (id: number | string) => api.delete(`${base}/${id}`),
  }
}
