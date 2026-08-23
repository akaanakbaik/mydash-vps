import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
export function LoginCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full max-w-md', className)}>
      <div className="skeuo-raised rounded-3xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="accent-glow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,hsl(var(--color-primary)),hsl(var(--color-accent)))]">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Welcome Back</h1>
          <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Sign in to My Dash</p>
        </div>
        {children}
      </div>
    </div>
  );
}
export function LoginForm({
  email, password, showPassword, rememberMe, isLoading, error,
  onEmailChange, onPasswordChange, onTogglePassword, onRememberMeChange, onSubmit,
}: {
  email: string; password: string; showPassword: boolean; rememberMe: boolean; isLoading: boolean; error: string | null;
  onEmailChange: (v: string) => void; onPasswordChange: (v: string) => void; onTogglePassword: () => void; onRememberMeChange: (v: boolean) => void; onSubmit: () => void;
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      {error && (
        <div className="skeuo-inset flex items-center gap-2 rounded-xl border-[hsl(var(--color-danger))]/30 bg-[hsl(var(--color-danger))]/10 p-3 text-xs text-[hsl(var(--color-danger))]" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-[hsl(var(--color-text))]">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => { onEmailChange(e.target.value); }}
          placeholder="Enter your email" autoComplete="email" autoFocus
          className="skeuo-inset w-full rounded-xl border border-[hsl(var(--color-border))] px-3.5 py-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-all focus:border-[hsl(var(--color-primary))]/70 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
          aria-label="Email" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-[hsl(var(--color-text))]">Password</label>
        <div className="relative">
          <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { onPasswordChange(e.target.value); }}
            placeholder="Enter your password" autoComplete="current-password"
            className="skeuo-inset w-full rounded-xl border border-[hsl(var(--color-border))] px-3.5 py-3 pr-10 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-all focus:border-[hsl(var(--color-primary))]/70 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
            aria-label="Password" />
          <button type="button" onClick={onTogglePassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[hsl(var(--color-muted))] transition-colors hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={rememberMe} onChange={(e) => { onRememberMeChange(e.target.checked); }}
            className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" />
          <span className="text-xs text-[hsl(var(--color-muted))]">Remember me</span>
        </label>
        <button type="button" className="text-xs font-medium text-[hsl(var(--color-primary))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] rounded">
          Forgot password?
        </button>
      </div>
      <button type="submit" disabled={isLoading || !password}
        className="interactive-surface flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--color-primary)),hsl(var(--color-accent)))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_hsl(var(--color-primary)/0.18)] transition-all hover:brightness-110 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
export function LoginStatus({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  return (
    <div className={cn(
      'skeuo-inset flex items-center gap-2 rounded-xl p-3 text-xs',
      type === 'success' && 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
      type === 'error' && 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
      type === 'info' && 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
    )} role="status">
      {type === 'success' && <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {type === 'error' && <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span>{message}</span>
    </div>
  );
}
