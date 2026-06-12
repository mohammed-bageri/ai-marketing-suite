import { PageHeader } from '@/components/shared/page-header'
import { Generator } from '@/features/content-generator/components/generator'

export default function GeneratePage() {
  return (
    <>
      <PageHeader
        title="Generate content"
        description="Pick a format, describe your topic and audience, and get ready-to-use marketing copy."
      />
      <Generator />
    </>
  )
}
