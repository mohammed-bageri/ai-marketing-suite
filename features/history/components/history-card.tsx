'use client'

import { ImageIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/format'
import { contentTypeLabels } from '@/lib/schemas/content'
import type { GenerationListItem } from '@/lib/types'

function itemTitle(item: GenerationListItem): string {
  if (item.topic) return item.topic
  if (item.contentType === 'improvement') return 'Improved text'
  return contentTypeLabels[item.contentType as 'blog']
}

function typeLabel(item: GenerationListItem): string {
  return item.contentType === 'improvement'
    ? 'Improvement'
    : contentTypeLabels[item.contentType as 'blog']
}

export function HistoryCard({
  item,
  onDelete
}: {
  item: GenerationListItem
  onDelete: (id: string) => void | Promise<void>
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border">
      <Link href={`/history/${item.id}`} className="flex flex-1 flex-col">
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <ImageIcon className="size-6" />
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 left-2">
            {typeLabel(item)}
          </Badge>
        </div>
        <div className="space-y-1 p-3">
          <p className="line-clamp-1 text-sm font-medium">{itemTitle(item)}</p>
          <p className="text-muted-foreground line-clamp-2 text-xs">{item.previewText}</p>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between border-t px-3 py-2">
        <span className="text-muted-foreground text-xs">{formatRelativeDate(item.createdAt)}</span>
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              className="text-muted-foreground hover:text-destructive size-7"
            >
              <Trash2 />
            </Button>
          }
          title="Delete this generation?"
          description="This permanently removes the content and its images. This cannot be undone."
          onConfirm={() => onDelete(item.id)}
        />
      </div>
    </div>
  )
}
