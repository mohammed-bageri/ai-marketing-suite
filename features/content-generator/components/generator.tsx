'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ContentView } from '@/features/content-generator/components/content-view'
import { useGenerateContent } from '@/features/content-generator/hooks/use-generate-content'
import { ImagePanel } from '@/features/image/components/image-panel'
import { CopyButton } from '@/components/shared/copy-button'
import { EmptyState } from '@/components/shared/empty-state'
import { FormSelect } from '@/components/shared/form-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadText } from '@/lib/download'
import { slugify } from '@/lib/format'
import {
  contentTypeLabels,
  contentTypes,
  createContentSchema,
  toneLabels,
  tones,
  type CreateContentInput
} from '@/lib/schemas/content'
import type { GenerationDTO } from '@/lib/types'

const toneOptions = tones.map((tone) => ({ value: tone, label: toneLabels[tone] }))

export function Generator() {
  const [result, setResult] = useState<GenerationDTO | null>(null)
  const generate = useGenerateContent()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateContentInput>({
    resolver: zodResolver(createContentSchema),
    defaultValues: { contentType: 'blog', tone: 'professional', topic: '', audience: '' }
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const row = await generate.mutateAsync(values)
      setResult(row)
      toast.success('Content generated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>New content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Content type</Label>
              <Controller
                control={control}
                name="contentType"
                render={({ field }) => (
                  <Tabs value={field.value} onValueChange={field.onChange}>
                    <TabsList className="grid w-full grid-cols-2">
                      {contentTypes.map((type) => (
                        <TabsTrigger key={type} value={type}>
                          {contentTypeLabels[type]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Launching our AI analytics beta"
                {...register('topic')}
              />
              {errors.topic && <p className="text-destructive text-xs">{errors.topic.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
              <Input id="audience" placeholder="e.g. B2B SaaS founders" {...register('audience')} />
              {errors.audience && (
                <p className="text-destructive text-xs">{errors.audience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Controller
                control={control}
                name="tone"
                render={({ field }) => (
                  <FormSelect
                    id="tone"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={toneOptions}
                  />
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="min-w-0">
        {generate.isPending && !result ? (
          <Card>
            <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-sm">
              <Loader2 className="size-6 animate-spin" />
              Writing your content…
            </CardContent>
          </Card>
        ) : result ? (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div className="space-y-1">
                <CardTitle>{contentTypeLabels[result.contentType as 'blog']}</CardTitle>
                {result.topic && <p className="text-muted-foreground text-sm">{result.topic}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <CopyButton value={result.plainText} label="Copy all" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadText(
                      `${slugify(result.topic ?? result.contentType)}.md`,
                      result.plainText
                    )
                  }
                >
                  <Download />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContentView contentType={result.contentType} result={result.result} />
              <Separator />
              <ImagePanel generationId={result.id} />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-6">
              <EmptyState
                icon={Sparkles}
                title="Your content will appear here"
                description="Fill in the topic, audience, and tone, then generate ready-to-use marketing copy."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
