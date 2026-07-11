import { Outlet } from 'react-router-dom'
import { Gift, Coins, TrendingUp, ShieldCheck, Users } from 'lucide-react'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=80'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ---------- Brand / hero panel ---------- */}
      <div className="animate-gradient relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-800 via-primary to-primary-600 lg:block">
        {/* Photo overlay */}
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />

        {/* Glow blobs */}
        <div className="animate-glow absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="animate-glow absolute bottom-10 right-0 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" style={{ animationDelay: '2s' }} />

        {/* Floating coins */}
        <div className="animate-floaty absolute right-16 top-24 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
          <Coins className="h-8 w-8 text-white" />
        </div>
        <div className="animate-floaty absolute bottom-40 left-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md" style={{ animationDelay: '1.5s' }}>
          <Gift className="h-7 w-7 text-white" />
        </div>
        <div className="animate-floaty absolute right-28 bottom-52 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md" style={{ animationDelay: '0.8s' }}>
          <TrendingUp className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="animate-fade-up flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Gift className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">RewardGo</span>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Earn. Redeem.
              <br />
              <span className="text-white/90">Grow rewards.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/75">
              The premium control center for your reward earning platform — manage users, tasks,
              offerwalls, withdrawals and more, all in one place.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Users, text: 'Manage thousands of users effortlessly' },
                { icon: TrendingUp, text: 'Real-time earnings & withdrawal analytics' },
                { icon: ShieldCheck, text: 'Role-based access & bank-grade security' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="animate-fade-up flex items-center gap-3"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                    <f.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className="text-sm text-white/85">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up flex items-center gap-8" style={{ animationDelay: '0.5s' }}>
            <Stat value="12K+" label="Active Users" />
            <Stat value="₹2.4M" label="Rewards Paid" />
            <Stat value="99.9%" label="Uptime" />
          </div>
        </div>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="animate-fade-up w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}
