import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, Gift, ArrowRight } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@rewardgo.test', password: '' },
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token.access_token)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      navigate('/')
    },
    onError: () => toast.error('Invalid credentials'),
  })

  return (
    <div>
      {/* Mobile brand (brand panel is hidden < lg) */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
          <Gift className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">RewardGo</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your admin dashboard to continue</p>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        <div>
          <Label>Email address</Label>
          <div className="group relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input {...register('email')} type="email" placeholder="you@example.com" className="h-11 pl-10" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label>Password</Label>
          <div className="group relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
          Keep me signed in
        </label>

        <Button
          type="submit"
          className="group h-11 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          loading={mutation.isPending}
        >
          Sign in
          {!mutation.isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </form>

      <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500">Demo credentials</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          admin@rewardgo.test · <span className="font-mono">Password@123</span>
        </p>
      </div>
    </div>
  )
}
