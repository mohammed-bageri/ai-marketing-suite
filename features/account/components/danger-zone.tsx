'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

export function DangerZone() {
  const router = useRouter()

  async function deleteAccount() {
    const { error } = await authClient.deleteUser()
    if (error) {
      toast.error(error.message ?? 'Could not delete account')
      return
    }
    toast.success('Account deleted')
    router.push('/login')
    router.refresh()
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all generated content and images. This cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-destructive border-destructive/40">
              <Trash2 />
              Delete account
            </Button>
          }
          title="Delete your account?"
          description="This permanently removes your account and every generation and image. This cannot be undone."
          confirmLabel="Delete account"
          onConfirm={deleteAccount}
        />
      </CardContent>
    </Card>
  )
}
