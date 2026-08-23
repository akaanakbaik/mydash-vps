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
    if (!password) {
      setError('Please enter password');
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
    <div className="relative flex min-h-screen overflow-hidden bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))]">
      {}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-[hsl(var(--color-border))]/60 bg-[radial-gradient(circle_at_50%_15%,hsl(var(--color-primary)/0.18),transparent_34rem)] p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="accent-glow mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(145deg,hsl(var(--color-primary)),hsl(var(--color-accent)))]">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">My Dash</h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">
            All-in-one VPS monitoring, analytics, and automation dashboard.
            Manage your infrastructure from a single unified interface.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="skeuo-surface rounded-2xl p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">Live</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">System metrics</p>
            </div>
            <div className="skeuo-surface rounded-2xl p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">API</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">Database-backed</p>
            </div>
            <div className="skeuo-surface rounded-2xl p-4">
              <p className="text-lg font-bold text-[hsl(var(--color-text))]">WS</p>
              <p className="text-xs text-[hsl(var(--color-muted))]">Realtime channel</p>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="relative flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_50%_50%,hsl(var(--color-primary)/0.07),transparent_28rem)] px-4 py-10 sm:px-8">
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
