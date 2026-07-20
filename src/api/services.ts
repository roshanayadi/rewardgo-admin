import { api, unwrap, unwrapList } from './client'
import { createCrudApi } from './crud'
import type {
  Advertisement,
  Banner,
  DashboardStats,
  ListParams,
  Notification,
  Offerwall,
  Permission,
  Reward,
  RewardRedemption,
  Role,
  Setting,
  SystemHealth,
  Task,
  Transaction,
  User,
  Withdrawal,
} from '@/types'

/* Simple CRUD resources */
export const usersApi = createCrudApi<User>('users')
export const tasksApi = createCrudApi<Task>('tasks')
export const offerwallsApi = createCrudApi<Offerwall>('offerwalls')
export const rewardsApi = createCrudApi<Reward>('rewards')
export const adsApi = createCrudApi<Advertisement>('advertisements')
export const bannersApi = createCrudApi<Banner>('banners')
export const rolesApi = createCrudApi<Role>('roles')
export const permissionsApi = createCrudApi<Permission>('permissions')

/* Users extras */
export const usersExtraApi = {
  updateStatus: (payload: { user_id?: number; ids?: number[]; status: string }) =>
    api.patch('/admin/users/status', payload),
  adjustCoins: (id: number, payload: { amount: number; type: 'add' | 'deduct'; note?: string }) =>
    api.post(`/admin/users/${id}/adjust-coins`, payload),
}

/* Dashboard */
export const dashboardApi = {
  stats: () => unwrap<DashboardStats>(api.get('/admin/dashboard')),
}

/* Transactions (read-only, admin) */
export const transactionsApi = {
  list: (params?: ListParams) => unwrapList<Transaction>(api.get('/admin/transactions', { params })),
  get: (uuid: string) => unwrap<Transaction>(api.get(`/admin/transactions/${uuid}`)),
}

/* Withdrawals (admin) */
export const withdrawalsApi = {
  list: (params?: ListParams) => unwrapList<Withdrawal>(api.get('/admin/withdrawals', { params })),
  get: (uuid: string) => unwrap<Withdrawal>(api.get(`/admin/withdrawals/${uuid}`)),
  approve: (uuid: string, admin_note?: string) =>
    api.patch(`/admin/withdrawals/${uuid}/approve`, { admin_note }),
  reject: (uuid: string, admin_note?: string) =>
    api.patch(`/admin/withdrawals/${uuid}/reject`, { admin_note }),
}

/* Reward redemptions (admin) */
export const redemptionsApi = {
  list: (params?: ListParams) =>
    unwrapList<RewardRedemption>(api.get('/admin/rewards/redemptions', { params })),
  process: (id: number, payload: { status: string; admin_note?: string; code?: string }) =>
    api.patch(`/admin/rewards/redemptions/${id}/process`, payload),
}

/* Notifications (admin) */
export const notificationsApi = {
  ...createCrudApi<Notification>('notifications'),
}

/* Reports */
export const reportsApi = {
  users: (params?: { from?: string; to?: string }) =>
    unwrap<any>(api.get('/admin/reports/users', { params })),
  earnings: (params?: { from?: string; to?: string }) =>
    unwrap<any>(api.get('/admin/reports/earnings', { params })),
  withdrawals: (params?: { from?: string; to?: string }) =>
    unwrap<any>(api.get('/admin/reports/withdrawals', { params })),
}

/* Settings */
export const settingsApi = {
  all: () => unwrap<Record<string, Setting[]>>(api.get('/admin/settings')),
  public: () => unwrap<Record<string, unknown>>(api.get('/settings')),
  update: (settings: { key: string; value: unknown }[]) =>
    api.put('/admin/settings', { settings }),
}

/* Email / SMTP settings */
export const emailSettingsApi = {
  show: () => unwrap<Record<string, any>>(api.get('/admin/email-settings')),
  update: (payload: Record<string, unknown>) => api.put('/admin/email-settings', payload),
  test: (email: string) => api.post('/admin/email-settings/test', { email }),
}

/* Withdrawal Methods (admin CRUD) */
export const withdrawalMethodsApi = createCrudApi<import('@/types').WithdrawalMethod>('withdrawal-methods')

/* Games (admin CRUD) */
export const gamesApi = createCrudApi<import('@/types').Game>('games')

/* Referrals */
export const referralsApi = {
  list: (params?: ListParams) => unwrapList<any>(api.get('/admin/referrals', { params })),
  forUser: (userId: number, params?: ListParams) =>
    unwrapList<any>(api.get(`/admin/users/${userId}/referrals`, { params })),
}

/* Support Tickets */
export const supportApi = {
  list: (params?: ListParams) => unwrapList<any>(api.get('/admin/support-tickets', { params })),
  get: (id: number) => unwrap<any>(api.get(`/admin/support-tickets/${id}`)),
  reply: (id: number, admin_reply: string) => api.post(`/admin/support-tickets/${id}/reply`, { admin_reply }),
  updateStatus: (id: number, status: string) => api.patch(`/admin/support-tickets/${id}/status`, { status }),
  remove: (id: number) => api.delete(`/admin/support-tickets/${id}`),
}

/* System */
export const systemApi = {
  health: () => unwrap<SystemHealth>(api.get('/admin/system/health')),
  statistics: () => unwrap<Record<string, number>>(api.get('/admin/system/statistics')),
  logs: (lines = 100) => unwrap<{ lines: string[] }>(api.get('/admin/system/logs', { params: { lines } })),
  activityLogs: (params?: ListParams) => unwrapList<any>(api.get('/admin/system/activity-logs', { params })),
}

/* Leaderboard */
export interface LeaderboardEntry {
  rank: number
  user_id: number
  name: string
  avatar: string | null
  coins: number
}
export const leaderboardApi = {
  list: (period: 'all' | 'week' | 'month' = 'all') =>
    unwrap<{ period: string; leaders: LeaderboardEntry[]; me: LeaderboardEntry | null }>(
      api.get('/admin/leaderboard', { params: { period } }),
    ),
}

/* Promo codes */
export const promoCodesApi = {
  ...createCrudApi<import('@/types').PromoCode>('promo-codes'),
  usages: (id: number, params?: ListParams) =>
    unwrapList<any>(api.get(`/admin/promo-codes/${id}/usages`, { params })),
}

/* Audit logs */
export const auditLogsApi = {
  list: (params?: ListParams & { action?: string; from?: string; to?: string }) =>
    unwrapList<any>(api.get('/admin/audit-logs', { params })),
  actions: () => unwrap<string[]>(api.get('/admin/audit-logs/actions')),
  export: (params?: Record<string, unknown>) =>
    unwrap<any[]>(api.get('/admin/audit-logs/export', { params })),
}

/* Events & campaigns */
export const eventsApi = createCrudApi<import('@/types').AppEvent>('events')

/* Fraud detection */
export const fraudApi = {
  dashboard: () => unwrap<Record<string, number>>(api.get('/admin/fraud/dashboard')),
  suspicious: (params?: ListParams) => unwrapList<any>(api.get('/admin/fraud/suspicious', { params })),
  events: (userId: number) => unwrap<any>(api.get(`/admin/fraud/users/${userId}/events`)),
  clear: (userId: number) => api.post(`/admin/fraud/users/${userId}/clear`),
  devices: (params?: ListParams & { fingerprint?: string; ip?: string }) =>
    unwrapList<any>(api.get('/admin/fraud/devices', { params })),
  ipList: () => unwrap<any[]>(api.get('/admin/fraud/ip-blacklist')),
  ipAdd: (ip: string, reason?: string) => api.post('/admin/fraud/ip-blacklist', { ip, reason }),
  ipRemove: (id: number) => api.delete(`/admin/fraud/ip-blacklist/${id}`),
}

/* CMS pages */
export const cmsApi = {
  list: () => unwrap<import('@/types').CmsPage[]>(api.get('/admin/cms-pages')),
  create: (payload: Partial<import('@/types').CmsPage>) =>
    unwrap<import('@/types').CmsPage>(api.post('/admin/cms-pages', payload)),
  update: (id: number, payload: Partial<import('@/types').CmsPage>) =>
    unwrap<import('@/types').CmsPage>(api.put(`/admin/cms-pages/${id}`, payload)),
  remove: (id: number) => api.delete(`/admin/cms-pages/${id}`),
}

/* Backups */
export const backupsApi = {
  list: () => unwrap<any[]>(api.get('/admin/backups')),
  create: () => unwrap<any>(api.post('/admin/backups')),
  restore: (id: number) => api.post(`/admin/backups/${id}/restore`),
  remove: (id: number) => api.delete(`/admin/backups/${id}`),
  downloadUrl: (id: number) => `/admin/backups/${id}/download`,
}

/* API monitoring */
export const apiMonitorApi = {
  overview: (hours = 24) =>
    unwrap<Record<string, number>>(api.get('/admin/api-monitor/overview', { params: { hours } })),
  endpoints: (hours = 24) =>
    unwrap<any[]>(api.get('/admin/api-monitor/endpoints', { params: { hours } })),
  requests: (params?: ListParams & { filter?: string }) =>
    unwrapList<any>(api.get('/admin/api-monitor/requests', { params })),
  timeline: (hours = 24) =>
    unwrap<any[]>(api.get('/admin/api-monitor/timeline', { params: { hours } })),
  prune: () => api.post('/admin/api-monitor/prune'),
}

/* Countries */
export const countriesApi = {
  list: () => unwrap<any[]>(api.get('/admin/countries')),
  create: (payload: Record<string, unknown>) => unwrap<any>(api.post('/admin/countries', payload)),
  update: (id: number, payload: Record<string, unknown>) =>
    unwrap<any>(api.put(`/admin/countries/${id}`, payload)),
  remove: (id: number) => api.delete(`/admin/countries/${id}`),
}

/* Extended system tools */
export const systemToolsApi = {
  status: () => unwrap<any>(api.get('/admin/system/status')),
  clearCache: () => api.post('/admin/system/cache-clear'),
  maintenance: (enabled: boolean) => api.post('/admin/system/maintenance', { enabled }),
}
