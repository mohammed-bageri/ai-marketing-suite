import { PageHeader } from '@/components/shared/page-header'
import { HistoryList } from '@/features/history/components/history-list'

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        description="Every generation in one place. Open one to view its content and image, copy, download, or delete."
      />
      <HistoryList />
    </>
  )
}
