import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ListChecks,
  LayoutGrid,
  SlidersHorizontal,
  Wallet,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Bell,
  BarChart3,
  Megaphone,
  Image,
  Settings,
  Server,
  Share2,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  permission?: string
  group?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, permission: 'dashboard.view', group: 'Main' },

  { label: 'Users', to: '/users', icon: Users, permission: 'users.view', group: 'Management' },
  { label: 'Roles & Permissions', to: '/access-control', icon: ShieldCheck, permission: 'roles.view', group: 'Management' },

  { label: 'Tasks', to: '/tasks', icon: ListChecks, permission: 'tasks.view', group: 'Earning' },
  { label: 'Offerwalls', to: '/offerwalls', icon: LayoutGrid, permission: 'offerwalls.view', group: 'Earning' },

  { label: 'Referrals', to: '/referrals', icon: Share2, permission: 'users.view', group: 'Management' },

  { label: 'Wallet', to: '/wallet', icon: Wallet, permission: 'transactions.view', group: 'Finance' },
  { label: 'Withdrawals', to: '/withdrawals', icon: Banknote, permission: 'withdrawals.view', group: 'Finance' },
  { label: 'Withdraw Methods', to: '/withdrawal-methods', icon: CreditCard, permission: 'withdrawals.view', group: 'Finance' },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight, permission: 'transactions.view', group: 'Finance' },

  { label: 'Notifications', to: '/notifications', icon: Bell, permission: 'notifications.view', group: 'Content' },
  { label: 'Support Tickets', to: '/support', icon: LifeBuoy, permission: 'support.view', group: 'Content' },
  { label: 'Advertisements', to: '/advertisements', icon: Megaphone, permission: 'advertisements.view', group: 'Content' },
  { label: 'Banners', to: '/banners', icon: Image, permission: 'banners.view', group: 'Content' },

  { label: 'Reports', to: '/reports', icon: BarChart3, permission: 'reports.view', group: 'Insights' },
  { label: 'App Manager', to: '/app-manager', icon: SlidersHorizontal, permission: 'settings.view', group: 'System' },
  { label: 'Settings', to: '/settings', icon: Settings, permission: 'settings.view', group: 'System' },
  { label: 'System', to: '/system', icon: Server, permission: 'system.view', group: 'System' },
]

export const NAV_GROUPS = ['Main', 'Management', 'Earning', 'Finance', 'Content', 'Insights', 'System']
