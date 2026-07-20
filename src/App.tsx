import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { useApplyTheme } from '@/hooks/useTheme'
import { useBootstrapAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Loader2 } from 'lucide-react'

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const UsersPage = lazy(() => import('@/pages/Users/UsersPage'))
const UserDetailPage = lazy(() => import('@/pages/Users/UserDetailPage'))
const AccessControlPage = lazy(() => import('@/pages/AccessControl/AccessControlPage'))
const TasksPage = lazy(() => import('@/pages/Tasks/TasksPage'))
const OfferwallsPage = lazy(() => import('@/pages/Offerwalls/OfferwallsPage'))
const PromoCodesPage = lazy(() => import('@/pages/PromoCodes/PromoCodesPage'))
const EventsPage = lazy(() => import('@/pages/Events/EventsPage'))
const ReferralsPage = lazy(() => import('@/pages/Referrals/ReferralsPage'))
const LeaderboardPage = lazy(() => import('@/pages/Leaderboard/LeaderboardPage'))
const SupportPage = lazy(() => import('@/pages/Support/SupportPage'))
const WalletPage = lazy(() => import('@/pages/Wallet/WalletPage'))
const WithdrawalMethodsPage = lazy(() => import('@/pages/WithdrawalMethods/WithdrawalMethodsPage'))
const WithdrawalsPage = lazy(() => import('@/pages/Withdrawals/WithdrawalsPage'))
const TransactionsPage = lazy(() => import('@/pages/Transactions/TransactionsPage'))
const NotificationsPage = lazy(() => import('@/pages/Notifications/NotificationsPage'))
const AdvertisementsPage = lazy(() => import('@/pages/Advertisements/AdvertisementsPage'))
const BannersPage = lazy(() => import('@/pages/Banners/BannersPage'))
const CmsPagesPage = lazy(() => import('@/pages/Cms/CmsPagesPage'))
const ReportsPage = lazy(() => import('@/pages/Reports/ReportsPage'))
const AppManagerPage = lazy(() => import('@/pages/AppManager/AppManagerPage'))
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'))
const SystemPage = lazy(() => import('@/pages/System/SystemPage'))
const AuditLogsPage = lazy(() => import('@/pages/AuditLogs/AuditLogsPage'))
const FraudPage = lazy(() => import('@/pages/Fraud/FraudPage'))
const BackupsPage = lazy(() => import('@/pages/Backups/BackupsPage'))
const ApiMonitorPage = lazy(() => import('@/pages/ApiMonitor/ApiMonitorPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  useApplyTheme()
  const { loading } = useBootstrapAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/access-control" element={<AccessControlPage />} />
            <Route path="/roles" element={<Navigate to="/access-control" replace />} />
            <Route path="/permissions" element={<Navigate to="/access-control" replace />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/offerwalls" element={<OfferwallsPage />} />
            <Route path="/promo-codes" element={<PromoCodesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
            <Route path="/withdrawal-methods" element={<WithdrawalMethodsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/advertisements" element={<AdvertisementsPage />} />
            <Route path="/banners" element={<BannersPage />} />
            <Route path="/cms-pages" element={<CmsPagesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/app-manager" element={<AppManagerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/fraud" element={<FraudPage />} />
            <Route path="/backups" element={<BackupsPage />} />
            <Route path="/api-monitor" element={<ApiMonitorPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
