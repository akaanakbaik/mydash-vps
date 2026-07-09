import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCard, LoginForm } from '../components/widgets/auth.js';
import { useLogin } from '../hooks/useAuth.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const handleSubmit = () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError(null);
    loginMutation.mutate(
      { username, password, rememberMe },
      {
        onSuccess: () => {
          void navigate('/');
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Invalid username or password');
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen bg-[hsl(var(--color-bg))]">
      {/* Brand/Illustration Section */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--color-primary))]/5 to-[hsl(var(--color-accent))]/5 p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))] shadow-2xl">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">My Dash</h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">
            All-in-one VPS monitoring, analytics, and automation dashboard.
            Manage your infrastructure from a single unified interface.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">99.9%</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">Uptime</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">24/7</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">Monitoring</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">Real-time</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">Analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
        <LoginCard>
          <LoginForm
            username={username}
            password={password}
            showPassword={showPassword}
            rememberMe={rememberMe}
            isLoading={loginMutation.isPending}
            error={error}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onTogglePassword={() => { setShowPassword(!showPassword); }}
            onRememberMeChange={setRememberMe}
            onSubmit={handleSubmit}
          />
        </LoginCard>
      </div>
    </div>
  );
}
