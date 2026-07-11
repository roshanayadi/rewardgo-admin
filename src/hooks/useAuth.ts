import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { tokenStore } from '@/api/client'
import { useEffect } from 'react'

/**
 * On app boot, if a token exists, hydrate the current user from /auth/profile.
 * Keeps roles/permissions fresh for the permission-based UI.
 */
export function useBootstrapAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const hasToken = !!tokenStore.get()

  const query = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.profile,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
  }, [query.data, setUser])

  useEffect(() => {
    if (query.isError) logout()
  }, [query.isError, logout])

  return {
    loading: hasToken && query.isLoading,
  }
}
