import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { tokenStore } from '@/api/client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
  hasRole: (role: string | string[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: tokenStore.get(),
      isAuthenticated: !!tokenStore.get(),

      setAuth: (user, token) => {
        tokenStore.set(token)
        set({ user, token, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        tokenStore.clear()
        set({ user: null, token: null, isAuthenticated: false })
      },

      hasRole: (role) => {
        const roles = get().user?.roles ?? []
        const wanted = Array.isArray(role) ? role : [role]
        return wanted.some((r) => roles.includes(r))
      },

      hasPermission: (permission) => {
        const user = get().user
        if (!user) return false
        // Super-admin implicitly has everything.
        if (user.roles?.includes('super-admin')) return true
        return (user.permissions ?? []).includes(permission)
      },
    }),
    {
      name: 'rewardgo_auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
