import { useEffect } from 'react'
import { useForm, type DefaultValues } from 'react-hook-form'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'url' | 'date'
  options?: { label: string; value: string }[]
  placeholder?: string
  colSpan?: 1 | 2
  required?: boolean
}

interface CrudModalProps<T> {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  fields: FieldDef[]
  defaultValues: DefaultValues<T>
  loading?: boolean
  onSubmit: (values: T) => void
  submitLabel?: string
}

export function CrudModal<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  fields,
  defaultValues,
  loading,
  onSubmit,
  submitLabel = 'Save',
}: CrudModalProps<T>) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<T>({ defaultValues })

  useEffect(() => {
    if (open) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} className="max-w-2xl">
        <form onSubmit={handleSubmit((v) => onSubmit(v as T))} className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className={f.colSpan === 2 || f.type === 'textarea' ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
              <Label>
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </Label>
              {f.type === 'textarea' ? (
                <Textarea rows={3} {...register(f.name as any)} placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <Select className="w-full" {...register(f.name as any)}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : f.type === 'switch' ? (
                <div className="flex h-10 items-center">
                  <Switch
                    checked={!!watch(f.name as any)}
                    onCheckedChange={(c) => setValue(f.name as any, c as any)}
                  />
                </div>
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'datetime-local' : 'text'}
                  step={f.type === 'number' ? 'any' : undefined}
                  {...register(f.name as any, f.type === 'number' ? { valueAsNumber: true } : {})}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
