import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Send, Mail, ShieldCheck } from 'lucide-react'
import { emailSettingsApi } from '@/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface EmailForm {
  email_notifications_enabled: boolean
  mail_mailer: string
  mail_host: string
  mail_port: string
  mail_username: string
  mail_password: string
  mail_encryption: string
  mail_from_address: string
  mail_from_name: string
}

const EMPTY: EmailForm = {
  email_notifications_enabled: true,
  mail_mailer: 'smtp',
  mail_host: '',
  mail_port: '587',
  mail_username: '',
  mail_password: '',
  mail_encryption: 'tls',
  mail_from_address: '',
  mail_from_name: '',
}

export function EmailSettingsTab() {
  const { data, refetch } = useQuery({ queryKey: ['email-settings'], queryFn: emailSettingsApi.show })
  const [form, setForm] = useState<EmailForm>(EMPTY)
  const [hasPassword, setHasPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    if (!data) return
    setForm({
      email_notifications_enabled:
        data.email_notifications_enabled === true || data.email_notifications_enabled === 'true',
      mail_mailer: data.mail_mailer || 'smtp',
      mail_host: data.mail_host || '',
      mail_port: data.mail_port || '587',
      mail_username: data.mail_username || '',
      mail_password: '',
      mail_encryption: data.mail_encryption || 'tls',
      mail_from_address: data.mail_from_address || '',
      mail_from_name: data.mail_from_name || '',
    })
    setHasPassword(!!data.has_password)
  }, [data])

  const set = <K extends keyof EmailForm>(k: K, v: EmailForm[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = useMutation({
    mutationFn: () => emailSettingsApi.update({ ...form }),
    onSuccess: () => {
      toast.success('Email settings saved')
      refetch()
    },
  })

  const test = useMutation({
    mutationFn: () => emailSettingsApi.test(testEmail),
    onSuccess: () => toast.success('Test email sent — check the inbox'),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send test email'),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Email Notifications (SMTP)</CardTitle>
            <p className="mt-0.5 text-xs text-slate-400">
              Configure the mail server used to send transactional emails
            </p>
          </div>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Master toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
                <Mail className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Notifications</p>
                <p className="text-xs text-slate-400">Master switch for all event emails (welcome, withdrawals, etc.)</p>
              </div>
            </div>
            <Switch
              checked={form.email_notifications_enabled}
              onCheckedChange={(v) => set('email_notifications_enabled', v)}
            />
          </div>

          {/* SMTP fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>SMTP Host</Label>
              <Input value={form.mail_host} onChange={(e) => set('mail_host', e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <Label>Port</Label>
              <Input value={form.mail_port} onChange={(e) => set('mail_port', e.target.value)} placeholder="587" />
            </div>
            <div>
              <Label>Encryption</Label>
              <Select className="w-full" value={form.mail_encryption} onChange={(e) => set('mail_encryption', e.target.value)}>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </Select>
            </div>
            <div>
              <Label>Username</Label>
              <Input value={form.mail_username} onChange={(e) => set('mail_username', e.target.value)} placeholder="you@gmail.com" autoComplete="off" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                Password
                {hasPassword && <Badge tone="green">saved</Badge>}
              </Label>
              <Input
                type="password"
                value={form.mail_password}
                onChange={(e) => set('mail_password', e.target.value)}
                placeholder={hasPassword ? '•••••••• (leave blank to keep)' : 'App password'}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label>From Address</Label>
              <Input value={form.mail_from_address} onChange={(e) => set('mail_from_address', e.target.value)} placeholder="no-reply@rewardgo.com" />
            </div>
            <div>
              <Label>From Name</Label>
              <Input value={form.mail_from_name} onChange={(e) => set('mail_from_name', e.target.value)} placeholder="RewardGo" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-slate-500">Save your settings first, then send a test email to verify delivery.</p>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="max-w-xs flex-1"
            />
            <Button variant="secondary" loading={test.isPending} disabled={!testEmail} onClick={() => test.mutate()}>
              <Send className="h-4 w-4" /> Send Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event list */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Event Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: 'Welcome Email', desc: 'Sent when a new user registers' },
              { title: 'Withdrawal Approved', desc: 'Sent when an admin approves a withdrawal' },
              { title: 'Withdrawal Rejected', desc: 'Sent when a withdrawal is rejected (with refund)' },
              { title: 'Admin Notification', desc: 'Optional email when sending a user notification' },
            ].map((ev) => (
              <div key={ev.title} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ev.title}</p>
                  <p className="text-xs text-slate-400">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            All emails are queued and sent asynchronously for fast, non-blocking processing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
