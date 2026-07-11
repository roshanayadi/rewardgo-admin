import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = Dropdown.Root
export const DropdownMenuTrigger = Dropdown.Trigger

export function DropdownMenuContent({
  className,
  align = 'end',
  children,
}: {
  className?: string
  align?: 'start' | 'center' | 'end'
  children: React.ReactNode
}) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in dark:border-slate-800 dark:bg-slate-900',
          className,
        )}
      >
        {children}
      </Dropdown.Content>
    </Dropdown.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Dropdown.Item>) {
  return (
    <Dropdown.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-3 py-2 text-xs font-semibold text-slate-400', className)} {...props} />
}

export function DropdownMenuSeparator() {
  return <Dropdown.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
}
