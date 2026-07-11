import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/api/services'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import type { User } from '@/types'

export interface UserFormValues {
  name: string
  email: string
  phone?: string
  role: string
  status: string
  password?: string
  password_confirmation?: string
  avatar?: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: User | null
  loading?: boolean
  onSubmit: (values: UserFormValues) => void
}

export function UserFormModal({ open, onOpenChange, user, loading, onSubmit }: Props) {
  const isEdit = !!user
  const { data: roles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => rolesApi.list({ per_page: 100 }),
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>()

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        role: user?.roles?.[0] ?? 'user',
        status: user?.status ?? 'active',
        password: '',
        password_confirmation: '',
        avatar: user?.avatar ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const password = watch('password')

  const submit = (v: UserFormValues) => {
    const payload: any = {
      name: v.name,
      email: v.email,
      phone: v.phone || null,
      status: v.status,
      roles: [v.role],
      avatar: v.avatar || null,
    }
    // Only send password when provided (required on create).
    if (v.password) {
      payload.password = v.password
      payload.password_confirmation = v.password_confirmation
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? 'Edit User' : 'Add User'} className="max-w-2xl">
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label>Name *</Label>
            <Input {...register('name', { required: true })} placeholder="Full name" />
            {errors.name && <p className="mt-1 text-xs text-red-600">Name is required</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Email *</Label>
            <Input type="email" {...register('email', { required: true })} placeholder="user@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">Email is required</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Phone</Label>
            <Input {...register('phone')} placeholder="Optional" />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Role</Label>
            <Select className="w-full" {...register('role')}>
              {(roles?.data ?? []).map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Status</Label>
            <Select className="w-full" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Avatar URL</Label>
            <Input {...register('avatar')} placeholder="https://..." />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>{isEdit ? 'New Password' : 'Password *'}</Label>
            <Input
              type="password"
              {...register('password', { required: !isEdit })}
              placeholder={isEdit ? 'Leave blank to keep' : '••••••••'}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">Password is required</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              {...register('password_confirmation', {
                validate: (v) => !password || v === password || 'Passwords do not match',
              })}
              placeholder="Repeat password"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
            )}
          </div>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
