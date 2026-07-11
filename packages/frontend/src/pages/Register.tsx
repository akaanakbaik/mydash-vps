import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', displayName: '', role: 'general' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setError(null);
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || formData.email.split('@')[0],
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (data?.success || data?.data) {
        setSuccess(true);
        setTimeout(() => { void navigate('/login'); }, 2000);
      } else {
        setError(data?.error?.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-bg))] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--color-success))]/20">
            <UserPlus className="h-8 w-8 text-[hsl(var(--color-success))]" />
          </div>
          <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">Registration Successful!</h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">Redirecting to login page...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-[hsl(var(--color-bg))]">
      {}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--color-primary))]/5 to-[hsl(var(--color-accent))]/5 p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))] shadow-2xl">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">My Dash</h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">
            Create an account to start monitoring your VPS infrastructure.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <ShieldIcon className="mt-0.5 h-5 w-5 text-[hsl(var(--color-primary))]" />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text))]">Role-Based Access</p>
                <p className="text-xs text-[hsl(var(--color-muted))]">Owner, Admin, and General roles</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <ActivityIcon className="mt-0.5 h-5 w-5 text-[hsl(var(--color-success))]" />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text))]">Real-Time Monitoring</p>
                <p className="text-xs text-[hsl(var(--color-muted))]">Live metrics, charts, and alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--color-primary))]/10">
              <UserPlus className="h-7 w-7 text-[hsl(var(--color-primary))]" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Create Account</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Register a new user account</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1.5">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
                <input
                  type="text" value={formData.displayName}
                  onChange={(e) => { setFormData({ ...formData, displayName: e.target.value }); }}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2.5 pl-10 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
                <input
                  type="email" value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2.5 pl-10 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
                <input
                  type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); }}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
                <button
                  type="button" onClick={() => { setShowPassword(!showPassword); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
                <input
                  type="password" value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); }}
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2.5 pl-10 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => { setFormData({ ...formData, role: e.target.value }); }}
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2.5 px-3 text-sm text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
              >
                <option value="general">General</option>
                <option value="admin">Administrator</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            {error && (
              <div className="rounded-lg bg-[hsl(var(--color-danger))]/10 px-4 py-2.5 text-xs text-[hsl(var(--color-danger))]">
                {error}
              </div>
            )}
            <button
              type="button" onClick={handleSubmit} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--color-primary))] py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="text-center text-xs text-[hsl(var(--color-muted))]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[hsl(var(--color-primary))] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
