/* ------------------------------------------------------------------ */
/*  API envelope                                                        */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  order_by?: string
  order_dir?: 'asc' | 'desc'
  [key: string]: unknown
}

/* ------------------------------------------------------------------ */
/*  Auth                                                                */
/* ------------------------------------------------------------------ */

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
}

export interface Wallet {
  balance: number
  pending_balance: number
  total_earned: number
  total_withdrawn: number
  currency: string
}

export interface User {
  id: number
  uuid: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: string
  referral_code: string | null
  email_verified_at: string | null
  last_login_at: string | null
  roles?: string[]
  permissions?: string[]
  wallet?: Wallet
  created_at: string
}

export interface AuthResponse {
  user: User
  token: AuthToken
}

/* ------------------------------------------------------------------ */
/*  RBAC                                                                */
/* ------------------------------------------------------------------ */

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions?: string[]
  users_count?: number
  created_at?: string
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at?: string
}

/* ------------------------------------------------------------------ */
/*  Earning                                                             */
/* ------------------------------------------------------------------ */

export interface Task {
  id: number
  title: string
  slug: string
  description: string | null
  type: string
  reward_amount: number
  url: string | null
  image: string | null
  daily_limit: number | null
  total_limit: number | null
  status: string
  sort_order: number | null
  created_at: string
}

export interface Offerwall {
  id: number
  name: string
  slug: string
  provider: string | null
  description: string | null
  image: string | null
  url: string | null
  app_id: string | null
  api_key?: string | null
  callback_secret?: string | null
  currency_rate: number
  status: string
  sort_order: number
  created_at: string
}

export interface Reward {
  id: number
  title: string
  slug: string
  description: string | null
  image: string | null
  type: string
  cost: number
  value: number | null
  stock: number | null
  status: string
  sort_order: number
  created_at: string
}

export interface RewardRedemption {
  id: number
  uuid: string
  reward_id: number
  user_id: number
  cost: number
  status: string
  delivery_detail: string | null
  code: string | null
  admin_note: string | null
  processed_at: string | null
  created_at: string
  reward?: Reward
  user?: User
}

/* ------------------------------------------------------------------ */
/*  Finance                                                             */
/* ------------------------------------------------------------------ */

export interface Transaction {
  id: number
  uuid: string
  user_id: number
  type: 'credit' | 'debit'
  source: string
  amount: number
  balance_after: number | null
  status: string
  description: string | null
  meta: Record<string, unknown> | null
  created_at: string
  user?: User
}

export interface Withdrawal {
  id: number
  uuid: string
  user_id: number
  amount: number
  fee: number
  net_amount: number
  method: string
  account_details: Record<string, unknown>
  status: string
  admin_note: string | null
  processed_at: string | null
  created_at: string
  user?: User
}

/* ------------------------------------------------------------------ */
/*  Content                                                             */
/* ------------------------------------------------------------------ */

export interface Notification {
  id: number
  user_id: number | null
  title: string
  body: string | null
  type: string
  image: string | null
  action_url: string | null
  data: Record<string, unknown> | null
  is_broadcast: boolean
  is_read?: boolean
  read_at: string | null
  created_at: string
}

export interface Advertisement {
  id: number
  title: string
  description: string | null
  image: string | null
  type: string
  placement: string | null
  url: string | null
  status: string
  impressions: number
  clicks: number
  starts_at: string | null
  ends_at: string | null
  sort_order: number
  created_at: string
}

export interface Banner {
  id: number
  title: string | null
  image: string
  url: string | null
  position: string
  status: string
  sort_order: number
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface Setting {
  id: number
  key: string
  value: unknown
  type: string
  group: string
  is_public: boolean
}

/* ------------------------------------------------------------------ */
/*  Dashboard / Reports / System                                        */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  total_users: number
  active_users: number
  new_users_today: number
  total_balance: number
  total_earned: number
  total_withdrawn: number
  pending_withdrawals_count: number
  total_transactions: number
  users_last_7_days: { date: string; count: number }[]
}

export interface SystemHealth {
  status: string
  components: Record<string, { status: string; error?: string }>
  php_version: string
  laravel_version: string
  timestamp: string
}

export interface SupportTicket {
  id: number
  uuid: string
  user_id: number | null
  user?: { id: number; name: string; email: string }
  subject: string
  message: string
  category: string
  priority: string
  status: string
  admin_reply: string | null
  replied_by?: string | null
  replied_at: string | null
  created_at: string
}

export interface Referral {
  id: number
  name: string
  email: string
  referral_code: string | null
  total_referrals: number
  earned: number
  joined: string
}

export interface MethodField {
  key: string
  label: string
  type: 'text' | 'email' | 'phone' | 'number'
  required: boolean
  placeholder?: string
}

export interface WithdrawalMethod {
  id: number
  name: string
  slug: string
  logo: string | null
  min_amount: number
  max_amount: number | null
  fee_percent: number
  fee_flat: number
  status: string
  sort_order: number
  instructions: string | null
  fields: MethodField[]
  created_at: string
}

export interface RewardRule {
  minutes: number
  coins: number
}

export interface AdmobFormat {
  enabled: boolean
  android: string
  ios: string
}

export interface AdmobConfig {
  enabled: boolean
  test_mode: boolean
  android_app_id: string
  ios_app_id: string
  formats: Record<string, AdmobFormat>
}

export interface Game {
  id: number
  uuid: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  game_url: string
  status: string
  sort_order: number
  reward_rules: RewardRule[]
  created_at: string
}
