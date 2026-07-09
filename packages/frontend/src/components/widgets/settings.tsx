import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { Save, AlertTriangle, CheckCircle, X, RotateCcw, type LucideIcon } from 'lucide-react';

export function SettingsSection({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-[hsl(var(--color-text))]">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-[hsl(var(--color-muted))]">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 sm:p-5', className)}>
      {children}
    </div>
  );
}

export function SettingsGroup({ label, description, children, className }: { label: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4', className)}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--color-text))]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[hsl(var(--color-muted))]">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsToggle({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-1', disabled && 'opacity-50')}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--color-text))]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[hsl(var(--color-muted))]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => { onChange(!value); }}
        className={cn(
          'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] focus-visible:ring-offset-2',
          value ? 'bg-[hsl(var(--color-primary))]' : 'bg-[hsl(var(--color-border))]',
        )}
        aria-label={label}
      >
        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', value ? 'translate-x-5' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export function SettingsInput({ label, value, onChange, type = 'text', placeholder, disabled, className }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-[hsl(var(--color-text))]">{label}</label>
      <input type={type} value={String(value)} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder} disabled={disabled}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50"
        aria-label={label} />
    </div>
  );
}

export function SettingsSelect({ label, value, onChange, options, disabled, className }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; disabled?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-[hsl(var(--color-text))]">{label}</label>
      <select value={value} onChange={(e) => { onChange(e.target.value); }} disabled={disabled}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50"
        aria-label={label}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

export function SettingsTextarea({ label, value, onChange, placeholder, disabled, className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-[hsl(var(--color-text))]">{label}</label>
      <textarea value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder} disabled={disabled} rows={3}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50 resize-y"
        aria-label={label} />
    </div>
  );
}

export function SettingsButton({ children, variant = 'primary', onClick, disabled, className }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger'; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] disabled:opacity-50',
        variant === 'primary' && 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary))]/90',
        variant === 'secondary' && 'border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]',
        variant === 'danger' && 'bg-[hsl(var(--color-danger))] text-white hover:bg-[hsl(var(--color-danger))]/90',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SettingsDangerZone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border-2 border-[hsl(var(--color-danger))]/30 bg-[hsl(var(--color-danger))]/5 p-4 sm:p-5', className)}>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-[hsl(var(--color-danger))]" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-[hsl(var(--color-danger))]">Danger Zone</h4>
      </div>
      {children}
    </div>
  );
}

export function SettingsSaveBar({ hasChanges, onSave, onReset, saving }: { hasChanges: boolean; onSave: () => void; onReset: () => void; saving?: boolean }) {
  if (!hasChanges) return null;
  return (
    <div className="sticky bottom-0 mt-6 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Save className="h-4 w-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          <span className="text-xs text-[hsl(var(--color-muted))]">You have unsaved changes</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]">
            <RotateCcw className="mr-1 inline h-3 w-3" aria-hidden="true" />Reset
          </button>
          <button type="button" onClick={onSave} disabled={saving}
            className="rounded-lg bg-[hsl(var(--color-primary))] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[hsl(var(--color-primary))]/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsSidebarItem({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
        active
          ? 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))] font-medium'
          : 'text-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))]',
      )}
      aria-current={active ? 'true' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function SettingsStatus({ status, className }: { status: string; className?: string }) {
  const isSuccess = status === 'success' || status === 'saved';
  const isError = status === 'error' || status === 'failed';
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', isSuccess ? 'text-[hsl(var(--color-success))]' : isError ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]', className)}>
      {isSuccess && <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />}
      {isError && <X className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{status}</span>
    </div>
  );
}
