import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const profileForm = useForm({
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })
  const passwordForm = useForm({
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const updateProfile = useMutation({
    mutationFn: (v: { name: string; phone: string }) => authApi.updateProfile(v),
    onSuccess: (u) => {
      setUser(u)
      toast.success('Profile updated')
    },
  })

  const changePassword = useMutation({
    mutationFn: (v: any) => authApi.changePassword(v),
    onSuccess: () => {
      toast.success('Password changed')
      passwordForm.reset()
    },
    onError: () => toast.error('Failed — check your current password'),
  })

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <Avatar src={user?.avatar} name={user?.name} className="h-20 w-20" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{user?.name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <div className="mt-3 flex gap-1">
              {user?.roles?.map((r) => (
                <Badge key={r} tone="red">
                  {r}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v as any))} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label>Name</Label>
                <Input {...profileForm.register('name')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Phone</Label>
                <Input {...profileForm.register('phone')} />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ''} disabled />
              </div>
              <div className="col-span-2">
                <Button type="submit" loading={updateProfile.isPending}>
                  Update Profile
                </Button>
              </div>
            </form>

            <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

            <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Change Password</h4>
            <form onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Current Password</Label>
                <Input type="password" {...passwordForm.register('current_password')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>New Password</Label>
                <Input type="password" {...passwordForm.register('password')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Confirm Password</Label>
                <Input type="password" {...passwordForm.register('password_confirmation')} />
              </div>
              <div className="col-span-2">
                <Button type="submit" variant="secondary" loading={changePassword.isPending}>
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
