'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Layers3,
  Loader2,
  LockKeyhole,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { loginSchema, signupSchema, type LoginFormValues, type SignupFormValues } from '@/lib/schemas'

// ─── Reusable Field Components ───────────────────────────────────────────────

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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(id)}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(id)}
          className={`h-11 w-full rounded-xl border bg-white px-4 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 inline-flex items-center px-3.5 text-gray-400 transition hover:text-gray-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Centered Auth Shell ──────────────────────────────────────────────────────

function AuthShell({
  children,
  heading,
  subheading,
  alternate,
  alternateLabel,
  alternateHref,
  onFillDemo,
}: {
  children: React.ReactNode
  heading: string
  subheading: string
  alternate: string
  alternateLabel: string
  alternateHref: string
  onFillDemo?: () => void
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 px-4 py-10">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed -top-40 -left-40 size-[500px] rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 size-[500px] rounded-full bg-violet-200/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="inline-grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Layers3 className="size-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">SyncSpace</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-gray-200/60 backdrop-blur-sm px-8 py-9">
          {/* Heading */}
          <div className="mb-6 flex items-start gap-3">
            <div className="mt-0.5 inline-grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <LockKeyhole className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">{heading}</h1>
              <p className="mt-0.5 text-sm text-gray-500 leading-snug">{subheading}</p>
            </div>
          </div>

          {/* Demo credentials pill (login only) */}
          {onFillDemo && (
            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/80 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-indigo-900">⚡ Admin Demo Account</p>
                  <p className="mt-0.5 font-mono text-xs text-indigo-600">
                    maya@northstar.co · syncspace123
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-autofill-demo"
                  onClick={onFillDemo}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  Auto-Fill
                </button>
              </div>
            </div>
          )}

          {/* Form slot */}
          {children}

          {/* Switch link */}
          <p className="mt-5 text-center text-sm font-medium text-gray-500">
            {alternate}{' '}
            <Link
              href={alternateHref}
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {alternateLabel}
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-gray-400">
          Protected with 256-bit TLS · API on <code className="font-mono">:3001</code>
        </p>
      </div>
    </div>
  )
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

export function SignupForm() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [showNote, setShowNote] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true)
    setShowNote(false)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
        }),
      })

      let data: any = {}
      try { data = await res.json() } catch {}

      if (res.ok) {
        // ✅ Backend responded successfully — store tokens
        if (data.accessToken) localStorage.setItem('syncspace_token', data.accessToken)
        if (data.refreshToken) localStorage.setItem('syncspace_refresh_token', data.refreshToken)
        if (data.user) localStorage.setItem('syncspace_user', JSON.stringify(data.user))
        if (data.workspace) localStorage.setItem('syncspace_workspace', JSON.stringify(data.workspace))
        document.cookie = `syncspace_session=true; path=/; max-age=86400; SameSite=Lax`

        toast(`Account created for ${values.fullName.trim()}! Redirecting to workspace...`)
        router.replace(data.user?.platformRole === 'ADMIN' ? '/admin' : '/dashboard')
        return
      }

      // ❌ Backend returned error (e.g. duplicate email)
      const message =
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Registration failed. This email may already be in use.'
      toast(message)
    } catch (err: unknown) {
      console.error('Registration request failed:', err)
      toast('Unable to reach the server. Please try again when the service is available.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      heading="Create your account"
      subheading="Start a unified workspace for you and your team."
      alternate="Already have an account?"
      alternateLabel="Sign in"
      alternateHref="/login"
    >
      <form
        id="signup-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <AuthField
          id="fullName"
          label="Full name"
          placeholder="Rohit Kumar"
          autoComplete="name"
          register={form.register}
          error={form.formState.errors.fullName?.message}
        />
        <AuthField
          id="email"
          label="Work email"
          type="email"
          placeholder="rohit@northstar.co"
          autoComplete="email"
          register={form.register}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          register={form.register}
          error={form.formState.errors.password?.message}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          register={form.register}
          error={form.formState.errors.confirmPassword?.message}
        />

        {/* Terms checkbox */}
        <div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <input
              id="signup-terms"
              type="checkbox"
              {...form.register('terms')}
              aria-invalid={Boolean(form.formState.errors.terms)}
              className="mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-indigo-600"
            />
            <label htmlFor="signup-terms" className="cursor-pointer leading-snug">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>
          {form.formState.errors.terms?.message && (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">
              {form.formState.errors.terms.message}
            </p>
          )}
          {showNote && (
            <p className="mt-1 text-xs text-gray-400">
              SyncSpace uses 256-bit TLS encryption and strict data privacy policies.
            </p>
          )}
        </div>

        <Button
          id="btn-signup-submit"
          type="submit"
          disabled={loading}
          className="mt-1 h-11 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Creating workspace…</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Create account</span>
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const fillDemoAccount = () => {
    form.setValue('email', 'maya@northstar.co')
    form.setValue('password', 'syncspace123')
    toast('Admin demo credentials filled! Click "Sign in" to continue.')
  }

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.toLowerCase().trim(),
          password: values.password,
        }),
      })

      let data: any = {}
      try { data = await res.json() } catch {}

      if (res.ok) {
        // ✅ Backend auth successful — store session
        if (data.accessToken) localStorage.setItem('syncspace_token', data.accessToken)
        if (data.refreshToken) localStorage.setItem('syncspace_refresh_token', data.refreshToken)
        if (data.user) localStorage.setItem('syncspace_user', JSON.stringify(data.user))
        if (data.workspace) localStorage.setItem('syncspace_workspace', JSON.stringify(data.workspace))
        document.cookie = `syncspace_session=true; path=/; max-age=86400; SameSite=Lax`

        toast(`Welcome back, ${data.user?.name || 'there'}! Redirecting…`)
        router.replace(data.user?.platformRole === 'ADMIN' ? '/admin' : '/dashboard')
        return
      }

      // ❌ Wrong credentials or other backend error
      const message =
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Invalid email or password. Please try again.'
      toast(message)
    } catch (err: unknown) {
      console.error('Login request failed:', err)
      toast('Unable to reach the server. Please try again when the service is available.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      heading="Welcome back"
      subheading="Sign in to your SyncSpace workspace."
      alternate="New to SyncSpace?"
      alternateLabel="Create an account"
      alternateHref="/signup"
      onFillDemo={fillDemoAccount}
    >
      <form
        id="login-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <AuthField
          id="email"
          label="Email address"
          type="email"
          placeholder="maya@northstar.co"
          autoComplete="email"
          register={form.register}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          register={form.register}
          error={form.formState.errors.password?.message}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-medium text-gray-600">
            <input
              type="checkbox"
              {...form.register('remember')}
              className="size-4 rounded border-gray-300 accent-indigo-600"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            id="btn-forgot-password"
            onClick={() => toast('Use password "syncspace123" for seeded demo accounts.')}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline text-xs"
          >
            Forgot password?
          </button>
        </div>

        <Button
          id="btn-login-submit"
          type="submit"
          disabled={loading}
          className="mt-1 h-11 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying credentials…</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Sign in to workspace</span>
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
