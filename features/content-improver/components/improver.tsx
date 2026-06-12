'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Loader2, PenLine } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ContentView } from '@/features/content-generator/components/content-view'
import { useImprove } from '@/features/content-improver/hooks/use-improve'
import { CopyButton } from '@/components/shared/copy-button'
import { EmptyState } from '@/components/shared/empty-state'
import { FormSelect } from '@/components/shared/form-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { downloadText } from '@/lib/download'
import {
  improvementGoalLabels,
  improvementGoals,
  improveSchema,
  type ImproveInput
} from '@/lib/schemas/improve'
import type { GenerationDTO } from '@/lib/types'

const goalOptions = improvementGoals.map((goal) => ({
  value: goal,
  label: improvementGoalLabels[goal]
}))

export function Improver() {
  const [result, setResult] = useState<GenerationDTO | null>(null)
  const improve = useImprove()

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ImproveInput>({
    resolver: zodResolver(improveSchema),
    defaultValues: { text: '', goal: 'shorter', audience: '' }
  })

  const goal = watch('goal')

  const onSubmit = handleSubmit(async (values) => {
    const payload: ImproveInput = {
      text: values.text,
      goal: values.goal,
      ...(values.audience ? { audience: values.audience } : {})
    }
    try {
      const row = await improve.mutateAsync(payload)
      setResult(row)
      toast.success('Text improved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Improvement failed')
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Improve text</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="text">Your text</Label>
              <Textarea
                id="text"
                rows={10}
                placeholder="Paste the draft you want to improve…"
                {...register('text')}
              />
              {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Controller
                control={control}
                name="goal"
                render={({ field }) => (
                  <FormSelect
                    id="goal"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={goalOptions}
                  />
                )}
              />
            </div>

            {goal === 'rewrite_audience' && (
              <div className="space-y-2">
                <Label htmlFor="audience">Target audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. enterprise IT buyers"
                  {...register('audience')}
                />
                {errors.audience && (
                  <p className="text-destructive text-xs">{errors.audience.message}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={improve.isPending}>
              {improve.isPending ? <Loader2 className="animate-spin" /> : <PenLine />}
              Improve
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="min-w-0">
        {improve.isPending && !result ? (
          <Card>
            <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-sm">
              <Loader2 className="size-6 animate-spin" />
              Improving your text…
            </CardContent>
          </Card>
        ) : result ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Result</CardTitle>
              <div className="flex gap-2">
                <CopyButton value={result.plainText} label="Copy" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadText('improved.md', result.plainText)}
                >
                  <Download />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ContentView contentType="improvement" result={result.result} />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-6">
              <EmptyState
                icon={PenLine}
                title="Your improved text will appear here"
                description="Paste a draft, choose a goal, and get a polished version plus a summary of what changed."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
