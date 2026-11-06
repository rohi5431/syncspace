'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import type { AuthSessionResponse, SafeUser } from '@syncspace/contracts'
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...register(id)} className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 ${error ? 'border-red-400' : 'border-gray-200'}`} />
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>}
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...register(id)} className={`h-11 w-full rounded-lg border bg-white px-3.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 ${error ? 'border-red-400' : 'border-gray-200'}`} />
        <button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-gray-400 transition hover:text-gray-700" aria-label={visible ? 'Hide password' : 'Show password'}><span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>{visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function AuthFrame({ children, heading, subheading, alternate, alternateLabel, alternateHref }: { children: React.ReactNode; heading: string; subheading: string; alternate: string; alternateLabel: string; alternateHref: string }) {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-5 sm:px-8"><Brand href="/" /><Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"><ArrowLeft aria-hidden="true" className="size-4" /> Back home</Link></header>
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <section className="w-full max-w-[420px]">
          <div className="mb-8 text-center"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-gray-200 bg-white text-indigo-600"><LockKeyhole aria-hidden="true" className="size-5" /></div><h1 className="text-2xl font-semibold tracking-[-0.04em] text-gray-950">{heading}</h1><p className="mt-2 text-sm leading-6 text-gray-500">{subheading}</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_32px_-24px_rgba(17,24,39,0.24)] sm:p-8">{children}</div>
          <p className="mt-6 text-center text-sm text-gray-600">{alternate} <Link href={alternateHref} className="font-semibold text-indigo-600 hover:text-indigo-700">{alternateLabel}</Link></p>
          <p className="mt-8 text-center text-xs leading-5 text-gray-400">Your password is securely hashed, and sign-in stays protected by HttpOnly session cookies.</p>
        </section>
      </div>
      <footer className="px-5 py-5 text-center text-xs text-gray-400">© 2026 SyncSpace · A focused home for your team&apos;s work</footer>
    </main>
  )
}

export function SignupForm() {
  const [showPasswordNote, setShowPasswordNote] = useState(false)
  const [serverError, setServerError] = useState('')
  const toast = useToast()
  const router = useRouter()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const onSubmit = async (values: SignupFormValues) => {
    setShowPasswordNote(false)
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
      <button type="button" disabled title="Google sign-in is not available yet" className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 opacity-60"><span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-gray-200 text-[11px] font-semibold">G</span> Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-[11px] text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR SIGN UP WITH EMAIL<span className="h-px flex-1 bg-gray-200" /></div>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <AuthField id="fullName" label="Full name" placeholder="Your name" autoComplete="name" register={form.register} error={form.formState.errors.fullName?.message} />
        <AuthField id="email" label="Work email" type="email" placeholder="you@company.com" autoComplete="email" register={form.register} error={form.formState.errors.email?.message} />
        <PasswordField id="password" label="Password" autoComplete="new-password" register={form.register} error={form.formState.errors.password?.message} />
        <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" register={form.register} error={form.formState.errors.confirmPassword?.message} />
        <div>
          <div className="flex items-start gap-2.5 text-xs leading-5 text-gray-600"><input id="signup-terms" type="checkbox" {...form.register('terms')} aria-invalid={Boolean(form.formState.errors.terms)} aria-describedby={form.formState.errors.terms ? 'signup-terms-error' : undefined} className="mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-indigo-600 focus:ring-indigo-500" /><span><label htmlFor="signup-terms" className="cursor-pointer">I agree to the</label>{' '}<button type="button" onClick={() => setShowPasswordNote(true)} className="font-medium text-indigo-600 hover:underline">Terms of Service</button>{' '}and{' '}<button type="button" onClick={() => setShowPasswordNote(true)} className="font-medium text-indigo-600 hover:underline">Privacy Policy</button>.</span></div>
          {form.formState.errors.terms?.message && <p id="signup-terms-error" className="mt-1.5 text-xs text-red-600" role="alert">{form.formState.errors.terms.message}</p>}
          {showPasswordNote && <p className="mt-1.5 text-xs text-gray-500">Legal pages will be available soon.</p>}
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-1 h-11 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{form.formState.isSubmitting ? 'Creating account…' : 'Create account'}</Button>
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
      <button type="button" disabled title="Google sign-in is not available yet" className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 opacity-60"><span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-gray-200 text-[11px] font-semibold">G</span> Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-[11px] text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-gray-200" /></div>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <AuthField id="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" register={form.register} error={form.formState.errors.email?.message} />
        <PasswordField id="password" label="Password" autoComplete="current-password" register={form.register} error={form.formState.errors.password?.message} />
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600"><input type="checkbox" {...form.register('remember')} className="size-4 rounded border-gray-300 accent-indigo-600 focus:ring-indigo-500" /> Remember me</label>
          <button type="button" onClick={() => toast('Password recovery is not available yet.')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</button>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-1 h-11 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{form.formState.isSubmitting ? 'Signing in…' : 'Sign in'} <Mail data-icon="inline-end" /></Button>
      </form>
    </AuthFrame>
  )
}
