'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function CopyButton({
  value,
  label = 'Copy',
  size = 'sm',
  variant = 'outline',
  className
}: {
  value: string
  label?: string
  size?: 'sm' | 'default' | 'icon'
  variant?: 'outline' | 'ghost' | 'secondary'
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {size !== 'icon' && label}
    </Button>
  )
}
