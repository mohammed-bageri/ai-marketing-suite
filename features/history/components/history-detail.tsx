'use client'

import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ContentView } from '@/features/content-generator/components/content-view'
import { useDeleteGeneration, useGeneration } from '@/features/history/hooks/use-history'
import { ImagePanel } from '@/features/image/components/image-panel'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CopyButton } from '@/components/shared/copy-button'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { downloadText } from '@/lib/download'
import { formatRelativeDate, slugify } from '@/lib/format'
import { contentTypeLabels } from '@/lib/schemas/content'

export function HistoryDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data, isLoading, isError } = useGeneration(id)
  const remove = useDeleteGeneration()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState title="Generation not found" description="It may have been deleted.">
        <Button variant="outline" render={<Link href="/history" />}>
          Back to history
        </Button>
      </EmptyState>
    )
  }

  const isImprovement = data.contentType === 'improvement'
  const title =
    data.topic || (isImprovement ? 'Improved text' : contentTypeLabels[data.contentType as 'blog'])
  const typeLabel = isImprovement ? 'Improvement' : contentTypeLabels[data.contentType as 'blog']

  async function handleDelete() {
    try {
      await remove.mutateAsync(id)
      toast.success('Deleted')
      router.push('/history')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete')
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/history" />}>
        <ArrowLeft />
        Back to history
      </Button>

      <Card>
        <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{typeLabel}</Badge>
              <span className="text-muted-foreground text-xs">
                {formatRelativeDate(data.createdAt)}
              </span>
            </div>
            <CardTitle>{title}</CardTitle>
            {data.tone && (
              <p className="text-muted-foreground text-sm capitalize">Tone: {data.tone}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <CopyButton value={data.plainText} label="Copy all" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadText(`${slugify(title)}.md`, data.plainText)}
            >
              <Download />
              Download
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 />
                  Delete
                </Button>
              }
              title="Delete this generation?"
              description="This permanently removes the content and its images."
              onConfirm={handleDelete}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ContentView contentType={data.contentType} result={data.result} />
          {!isImprovement && (
            <>
              <Separator />
              <ImagePanel generationId={data.id} initialImages={data.images} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
