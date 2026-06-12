'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

const emailSchema = z.string().email('Enter a valid email')

/** Only allow same-site relative paths — blocks open-redirect to external URLs. */
function safeRedirect(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value
  return '/dashboard'
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = safeRedirect(params.get('redirect'))

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => clearInterval(timer.current ?? undefined), [])

  function startCooldown() {
    setCooldown(30)
    clearInterval(timer.current ?? undefined)
    timer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) clearInterval(timer.current ?? undefined)
        return c - 1
      })
    }, 1000)
  }

  async function sendCode() {
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message)
      return
    }
    setSending(true)
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: parsed.data,
      type: 'sign-in'
    })
    setSending(false)
    if (error) {
      toast.error(error.message ?? 'Could not send the code')
      return
    }
    setStep('otp')
    startCooldown()
    toast.success(`We sent a code to ${parsed.data}`)
  }

  async function verify(code: string) {
    setVerifying(true)
    const { error } = await authClient.signIn.emailOtp({ email, otp: code })
    setVerifying(false)
    if (error) {
      toast.error(error.message ?? 'Invalid or expired code')
      setOtp('')
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  if (step === 'email') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and we’ll send you a one-time code.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void sendCode()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={sending}>
            {sending && <Loader2 className="animate-spin" />}
            Send code
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={verify}
          disabled={verifying}
          autoFocus
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {verifying && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Verifying…
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStep('email')
            setOtp('')
          }}
        >
          <ArrowLeft />
          Use a different email
        </Button>
        <Button variant="ghost" size="sm" disabled={cooldown > 0 || sending} onClick={sendCode}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
