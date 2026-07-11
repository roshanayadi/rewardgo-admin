import { api, unwrap } from './client'
import type { AuthResponse, User } from '@/types'

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    unwrap<AuthResponse>(api.post('/auth/login', payload)),

  googleLogin: (token: string) =>
    unwrap<AuthResponse>(api.post('/auth/google/login', { token })),

  logout: () => api.post('/auth/logout'),

  profile: () => unwrap<User>(api.get('/auth/profile')),

  updateProfile: (payload: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>) =>
    unwrap<User>(api.put('/auth/profile', payload)),

  changePassword: (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }) => api.put('/auth/change-password', payload),
}
