import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, NAV_GROUPS } from '@/constants/nav'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Gift } from 'lucide-react'

export function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const visible = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center gap-2.5 border-b border-slate-100 px-5 dark:border-slate-800', collapsed && 'justify-center px-0')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Gift className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">RewardGo</p>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const items = visible.filter((i) => i.group === group)
          if (!items.length) return null
          return (
            <div key={group}>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
