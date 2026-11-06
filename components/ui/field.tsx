import * as React from 'react'
import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-group" className={cn('flex w-full flex-col gap-4', className)} {...props} />
}

function Field({ className, orientation = 'vertical', ...props }: React.ComponentProps<'div'> & {
  orientation?: 'vertical' | 'horizontal' | 'responsive'
}) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      role="group"
      className={cn(
        'group/field flex w-full gap-2 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center',
        className,
      )}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return <label data-slot="field-label" className={cn('text-sm font-medium text-foreground', className)} {...props} />
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="field-description" className={cn('text-xs leading-5 text-muted-foreground', className)} {...props} />
}

export { Field, FieldDescription, FieldGroup, FieldLabel }
