'use client'

import { Download, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

import { FormSelect } from '@/components/shared/form-select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { downloadImage } from '@/lib/download'
import { imageStyleLabels, imageStyles, type ImageStyle } from '@/lib/schemas/image'
import type { GenerationImageDTO } from '@/lib/types'
import { useGenerateImage, useGenerationImages } from '@/features/image/hooks/use-images'

const styleOptions = imageStyles.map((style) => ({
  value: style,
  label: imageStyleLabels[style]
}))

export function ImagePanel({
  generationId,
  initialImages
}: {
  generationId: string
  initialImages?: GenerationImageDTO[]
}) {
  const { data: images = [] } = useGenerationImages(generationId, initialImages)
  const generate = useGenerateImage(generationId)
  const [style, setStyle] = useState<ImageStyle>('minimal')
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = images.find((img) => img.id === activeId) ?? images[0] ?? null
  const isGenerating = generate.isPending

  async function run() {
    try {
      const image = await generate.mutateAsync(style)
      setActiveId(image.id)
      toast.success('Image generated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image generation failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium">Matching image</span>
        <div className="flex items-center gap-2">
          <FormSelect
            value={style}
            onValueChange={(v) => setStyle(v as ImageStyle)}
            options={styleOptions}
            className="w-40"
          />
          <Button onClick={run} disabled={isGenerating} size="sm">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {images.length ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border">
        {isGenerating ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 text-sm">
            <Loader2 className="size-6 animate-spin" />
            Creating your image…
          </div>
        ) : active ? (
          <Image
            src={active.url}
            alt="Generated illustration"
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2 px-6 text-center text-sm">
            <ImageIcon className="size-6" />
            No image yet — pick a style and generate one.
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              className={cn(
                'relative size-14 overflow-hidden rounded-md border transition',
                active?.id === img.id ? 'ring-foreground ring-2' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt={img.style} fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Style: {imageStyleLabels[active.style]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadImage(active.url, `image-${active.id}.png`)}
          >
            <Download />
            Download
          </Button>
        </div>
      )}
    </div>
  )
}
