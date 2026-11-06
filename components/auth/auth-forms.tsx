'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import type { AuthSessionResponse, SafeUser } from '@syncspace/contracts'
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Menu } from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { loginSchema, signupSchema, type LoginFormValues, type SignupFormValues } from '@/lib/schemas'
import { apiRequest, ApiError, AUTH_USER_KEY, WORKSPACES_KEY } from '@/lib/api-client'

function AuthField<T extends FieldValues>({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  register,
  autoComplete,
}: {
  id: Path<T>
  label: string
  type?: string
  placeholder?: string
  error?: string
  register: UseFormRegister<T>
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...register(id)} className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 ${error ? 'border-error/60' : 'border-border'}`} />
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  )
}

function PasswordField<T extends FieldValues>({
  id,
  label,
  error,
  register,
  autoComplete,
}: {
  id: Path<T>
  label: string
  error?: string
  register: UseFormRegister<T>
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...register(id)} className={`h-11 w-full rounded-lg border bg-white px-3.5 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 ${error ? 'border-error/60' : 'border-border'}`} />
        <button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-muted-foreground transition hover:text-foreground" aria-label={visible ? 'Hide password' : 'Show password'}><span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>{visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  )
}

function AuthFrame({ children, heading, subheading, alternate, alternateLabel, alternateHref }: { children: React.ReactNode; heading: string; subheading: string; alternate: string; alternateLabel: string; alternateHref: string }) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Brand href="/" />
        <nav aria-label="Product navigation" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="transition hover:text-foreground">Features</Link>
          <Link href="/#how-it-works" className="transition hover:text-foreground">Solutions</Link>
          <Link href="/#pricing" className="transition hover:text-foreground">Pricing</Link>
          <span aria-disabled="true" title="Documentation is coming soon" className="text-muted-foreground/60">Documentation</span>
        </nav>
        <div className="flex items-center gap-2">
          <details className="relative md:hidden">
            <summary aria-label="Open product navigation" className="grid size-9 list-none cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary">
              <Menu aria-hidden="true" className="size-4" />
            </summary>
            <nav aria-label="Mobile product navigation" className="absolute top-full right-0 z-30 mt-2 flex w-52 flex-col rounded-2xl border border-border bg-white p-2 shadow-xl">
              <Link href="/#features" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Features</Link>
              <Link href="/#how-it-works" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Solutions</Link>
              <Link href="/#pricing" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Pricing</Link>
              <span aria-disabled="true" title="Documentation is coming soon" className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground/60">Documentation · coming soon</span>
            </nav>
          </details>
          <Link href="/" aria-label="Back home" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" /> <span className="hidden sm:inline">Back home</span></Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <section className="w-full max-w-[420px]">
          <div className="mb-8 text-center"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-border bg-white text-primary"><LockKeyhole aria-hidden="true" className="size-5" /></div><h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{heading}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{subheading}</p></div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_8px_32px_-24px_rgba(17,24,39,0.24)] sm:p-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{alternate} <Link href={alternateHref} className="font-semibold text-primary hover:text-primary-hover">{alternateLabel}</Link></p>
          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">Your password is securely hashed, and sign-in stays protected by HttpOnly session cookies.</p>
        </section>
      </div>
      <footer className="px-5 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SyncSpace · A focused home for your team&apos;s work</footer>
    </main>
  )
}

export function SignupForm() {
  const [showLegalNote, setShowLegalNote] = useState(false)
  const [serverError, setServerError] = useState('')
  const toast = useToast()
  const router = useRouter()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const onSubmit = async (values: SignupFormValues) => {
    setShowLegalNote(false)
    setServerError('')
    try {
      const result = await apiRequest<AuthSessionResponse>('/auth/register', {
        method: 'POST',
        body: { name: values.fullName, email: values.email, password: values.password },
      })
      await mutate<SafeUser>(AUTH_USER_KEY, result.user, { revalidate: false })
      await mutate(WORKSPACES_KEY, null, { revalidate: false })
      toast('Your account has been created.')
      router.replace('/dashboard')
      router.refresh()
    } catch (cause) {
      setServerError(cause instanceof ApiError ? cause.message : 'Unable to create your account. Please try again.')
    }
  }

  return (
    <AuthFrame heading="Create your account" subheading="Start a shared workspace for the work ahead." alternate="Already have an account?" alternateLabel="Sign in" alternateHref="/login">
      <button type="button" disabled title="Google sign-in is not available yet" className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-border bg-white text-sm font-medium text-muted-foreground opacity-60"><span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-border text-[11px] font-semibold">G</span> Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />OR SIGN UP WITH EMAIL<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <p role="alert" className="rounded-lg border border-error/20 bg-error-soft px-3 py-2 text-sm text-error">{serverError}</p>}
        <AuthField id="fullName" label="Full name" placeholder="Your name" autoComplete="name" register={form.register} error={form.formState.errors.fullName?.message} />
        <AuthField id="email" label="Work email" type="email" placeholder="you@company.com" autoComplete="email" register={form.register} error={form.formState.errors.email?.message} />
        <PasswordField id="password" label="Password" autoComplete="new-password" register={form.register} error={form.formState.errors.password?.message} />
        <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" register={form.register} error={form.formState.errors.confirmPassword?.message} />
        <div>
          <div className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground"><input id="signup-terms" type="checkbox" {...form.register('terms')} aria-invalid={Boolean(form.formState.errors.terms)} aria-describedby={form.formState.errors.terms ? 'signup-terms-error' : undefined} className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary focus:ring-ring" /><span><label htmlFor="signup-terms" className="cursor-pointer">I agree to the</label>{' '}<button type="button" onClick={() => setShowLegalNote(true)} className="font-medium text-primary hover:underline">Terms of Service</button>{' '}and{' '}<button type="button" onClick={() => setShowLegalNote(true)} className="font-medium text-primary hover:underline">Privacy Policy</button>.</span></div>
          {form.formState.errors.terms?.message && <p id="signup-terms-error" className="mt-1.5 text-xs text-error" role="alert">{form.formState.errors.terms.message}</p>}
          {showLegalNote && <p className="mt-1.5 text-xs text-muted-foreground">Legal pages will be available soon.</p>}
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-1 h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{form.formState.isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthFrame>
  )
}

export function LoginForm() {
  const [serverError, setServerError] = useState('')
  const toast = useToast()
  const router = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })
  const onSubmit = async (values: LoginFormValues) => {
    setServerError('')
    try {
      const result = await apiRequest<AuthSessionResponse>('/auth/login', {
        method: 'POST',
        body: { email: values.email, password: values.password, remember: values.remember },
      })
      await mutate<SafeUser>(AUTH_USER_KEY, result.user, { revalidate: false })
      await mutate(WORKSPACES_KEY, null, { revalidate: false })
      toast('You’re signed in.')
      router.replace('/dashboard')
      router.refresh()
    } catch (cause) {
      setServerError(cause instanceof ApiError ? cause.message : 'Unable to sign in. Please try again.')
    }
  }

  return (
    <AuthFrame heading="Welcome back" subheading="Sign in to continue to your workspace." alternate="New to SyncSpace?" alternateLabel="Create an account" alternateHref="/signup">
      <button type="button" disabled title="Google sign-in is not available yet" className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-border bg-white text-sm font-medium text-muted-foreground opacity-60"><span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-border text-[11px] font-semibold">G</span> Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <p role="alert" className="rounded-lg border border-error/20 bg-error-soft px-3 py-2 text-sm text-error">{serverError}</p>}
        <AuthField id="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" register={form.register} error={form.formState.errors.email?.message} />
        <PasswordField id="password" label="Password" autoComplete="current-password" register={form.register} error={form.formState.errors.password?.message} />
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" {...form.register('remember')} className="size-4 rounded border-border accent-primary focus:ring-ring" /> Remember me</label>
          <button type="button" disabled title="Password recovery is not available yet" className="cursor-not-allowed text-xs font-medium text-muted-foreground/60">Forgot password</button>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-1 h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{form.formState.isSubmitting ? 'Signing in…' : 'Sign in'} <Mail data-icon="inline-end" /></Button>
      </form>
    </AuthFrame>
  )
}
