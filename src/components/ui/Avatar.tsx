import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string | null
  name?: string | null
  className?: string
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex h-9 w-9 select-none items-center justify-center overflow-hidden rounded-full bg-primary-100 align-middle',
        className,
      )}
    >
      {src && <AvatarPrimitive.Image src={src} className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
