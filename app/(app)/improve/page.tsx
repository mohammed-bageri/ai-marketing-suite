import { PageHeader } from '@/components/shared/page-header'
import { Improver } from '@/features/content-improver/components/improver'

export default function ImprovePage() {
  return (
    <>
      <PageHeader
        title="Improve text"
        description="Paste an existing draft, choose a goal, and get a sharper version with a summary of changes."
      />
      <Improver />
    </>
  )
}
