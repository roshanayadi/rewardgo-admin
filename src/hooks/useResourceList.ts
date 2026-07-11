import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ListParams, PaginationMeta } from '@/types'

interface ListResult<T> {
  data: T[]
  meta?: PaginationMeta
}

/**
 * Manages page + search + filter state and wires it to a list fetcher.
 * `fetcher` receives the merged params and returns `{ data, meta }`.
 */
export function useResourceList<T>(
  key: string,
  fetcher: (params: ListParams) => Promise<ListResult<T>>,
  initialFilters: ListParams = {},
) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ListParams>(initialFilters)

  const params: ListParams = { page, per_page: 15, search: search || undefined, ...filters }

  const query = useQuery({
    queryKey: [key, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
  })

  const onSearchChange = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const setFilter = (k: string, v: unknown) => {
    setFilters((f) => ({ ...f, [k]: v === '' ? undefined : v }))
    setPage(1)
  }

  return {
    rows: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    page,
    setPage,
    search,
    onSearchChange,
    filters,
    setFilter,
    refetch: query.refetch,
  }
}
