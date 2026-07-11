import { useAuthStore } from '@/store/authStore'

/** Render children only when the current user holds the given permission. */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  if (permission && !hasPermission(permission)) return <>{fallback}</>
  return <>{children}</>
}
