import { DangerZone } from '@/features/account/components/danger-zone'
import { ProfileForm } from '@/features/account/components/profile-form'
import { UsageSummary } from '@/features/account/components/usage-summary'
import { PageHeader } from '@/components/shared/page-header'

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Account" description="Manage your profile and review your usage." />
      <ProfileForm />
      <UsageSummary />
      <DangerZone />
    </>
  )
}
