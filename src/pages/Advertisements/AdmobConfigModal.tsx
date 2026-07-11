import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Smartphone, Apple } from 'lucide-react'
import { settingsApi } from '@/api/services'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import type { AdmobConfig, Setting } from '@/types'

const FORMAT_LABELS: Record<string, string> = {
  banner: 'Banner',
  interstitial: 'Interstitial',
  rewarded: 'Rewarded',
  rewarded_interstitial: 'Rewarded Interstitial',
  native: 'Native',
  app_open: 'App Open',
}

const EMPTY: AdmobConfig = {
  enabled: false,
  test_mode: true,
  android_app_id: '',
  ios_app_id: '',
  formats: {},
}

export function AdmobConfigModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.all, enabled: open })
  const [cfg, setCfg] = useState<AdmobConfig>(EMPTY)

  useEffect(() => {
    if (!data) return
    const setting = Object.values(data).flat().find((s: Setting) => s.key === 'admob_config')
    if (!setting?.value) return
    // Admin settings may return the JSON as a raw string — parse defensively.
    let parsed: unknown = setting.value
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch {
        parsed = null
      }
    }
    const obj = parsed as Partial<AdmobConfig> | null
    if (obj && typeof obj === 'object') {
      setCfg({ ...EMPTY, ...obj, formats: obj.formats ?? {} })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: () => settingsApi.update([{ key: 'admob_config', value: cfg }]),
    onSuccess: () => {
      toast.success('AdMob configuration saved')
      onOpenChange(false)
    },
  })

  const setFormat = (key: string, patch: Partial<AdmobConfig['formats'][string]>) =>
    setCfg((c) => ({ ...c, formats: { ...c.formats, [key]: { ...c.formats[key], ...patch } } }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Google AdMob Configuration" className="max-w-3xl">
        <div className="space-y-5">
          {/* Master toggles */}
          <div className="flex flex-wrap gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="flex flex-1 items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">AdMob Enabled</p>
                <p className="text-xs text-slate-400">Master switch for all ads</p>
              </div>
              <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg((c) => ({ ...c, enabled: v }))} />
            </div>
            <div className="flex flex-1 items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Test Mode</p>
                <p className="text-xs text-slate-400">Serve Google test ads</p>
              </div>
              <Switch checked={cfg.test_mode} onCheckedChange={(v) => setCfg((c) => ({ ...c, test_mode: v }))} />
            </div>
          </div>

          {/* App IDs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Android App ID</Label>
              <Input value={cfg.android_app_id} onChange={(e) => setCfg((c) => ({ ...c, android_app_id: e.target.value }))} placeholder="ca-app-pub-xxx~xxx" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Apple className="h-3.5 w-3.5" /> iOS App ID</Label>
              <Input value={cfg.ios_app_id} onChange={(e) => setCfg((c) => ({ ...c, ios_app_id: e.target.value }))} placeholder="ca-app-pub-xxx~xxx" />
            </div>
          </div>

          {/* Ad formats */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Ad Formats</p>
            <div className="space-y-3">
              {Object.entries(cfg.formats ?? {}).map(([key, f]) => (
                <div key={key} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{FORMAT_LABELS[key] ?? key}</span>
                      <Badge tone={f.enabled ? 'green' : 'gray'}>{f.enabled ? 'On' : 'Off'}</Badge>
                    </div>
                    <Switch checked={f.enabled} onCheckedChange={(v) => setFormat(key, { enabled: v })} />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      className="h-9 text-xs"
                      value={f.android}
                      onChange={(e) => setFormat(key, { android: e.target.value })}
                      placeholder="Android unit ID"
                      disabled={!f.enabled}
                    />
                    <Input
                      className="h-9 text-xs"
                      value={f.ios}
                      onChange={(e) => setFormat(key, { ios: e.target.value })}
                      placeholder="iOS unit ID"
                      disabled={!f.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
              <Save className="h-4 w-4" /> Save Config
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
