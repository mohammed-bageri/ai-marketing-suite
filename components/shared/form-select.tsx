'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type SelectOption = { value: string; label: string }

/**
 * Thin wrapper over the Base UI Select that handles placeholder rendering and
 * value→label mapping, so feature forms stay clean. Works with react-hook-form's
 * Controller (`value` + `onValueChange`).
 */
export function FormSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  id,
  className
}: {
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  id?: string
  className?: string
}) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger id={id} className={cn('w-full', className)}>
        <SelectValue>
          {(current) => {
            const selected = options.find((o) => o.value === current)
            return selected ? (
              selected.label
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
