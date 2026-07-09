import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { ArrowLeft, Settings as SettingsIcon, Palette, Bell, Activity, BarChart3, Bot, HardDrive, Package, Terminal, Lock, User, Clock, Cpu, Info } from 'lucide-react';
import {
  SettingsSection, SettingsCard, SettingsToggle,
  SettingsInput, SettingsSelect, SettingsTextarea, SettingsButton,
  SettingsDangerZone, SettingsSaveBar, SettingsSidebarItem, SettingsStatus,
} from '../components/widgets/settings.js';
import { useSettings, useUpdateSettings } from '../hooks/useSettings.js';
import { SkeletonBlock, ErrorState } from '../components/shared/Skeleton.js';

const categoryIcons: Record<string, typeof SettingsIcon> = {
  general: SettingsIcon, appearance: Palette, notification: Bell,
  monitoring: Activity, analytics: BarChart3, automation: Bot,
  backup: HardDrive, docker: Package, tunnel: Terminal,
  security: Lock, account: User, session: Clock,
  advanced: Cpu, about: Info,
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState<Record<string, string | boolean | number>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string | boolean | number>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--color-border))]" />
          <div><SkeletonBlock lines={2} /></div>
        </div>
        <SkeletonBlock lines={10} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Settings</h1>
        </div>
        <ErrorState title="Failed to load settings" action={<button type="button" onClick={() => { void refetch(); }} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Settings</h1>
        </div>
        <p className="text-sm text-[hsl(var(--color-muted))]">No settings data available.</p>
      </PageContainer>
    );
  }

  const categories = data.categories;
  const allSettings = data.settings;

  // Initialize settings state from data once
  if (Object.keys(settings).length === 0 && allSettings.length > 0) {
    const initial: Record<string, string | boolean | number> = {};
    for (const s of allSettings) {
      initial[s.id] = s.value;
    }
    setSettings(initial);
    setOriginalSettings({ ...initial });
    if (categories.length > 0 && !categories.find((c) => c.id === activeCategory)) {
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.id);
    }
  }

  const hasChanges = Object.entries(settings).some(([key, val]) => val !== originalSettings[key]);

  const updateSetting = useCallback((id: string, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSave = () => {
    setSaving(true);
    const updates = Object.entries(settings)
      .filter(([key, val]) => val !== originalSettings[key])
      .map(([id, value]) => ({ id, value }));
    updateSettings.mutate(updates, {
      onSuccess: () => {
        setSaving(false);
        setOriginalSettings({ ...settings });
        setStatus({ type: 'success', message: 'Settings saved successfully' });
        setTimeout(() => { setStatus(null); }, 3000);
      },
      onError: () => {
        setSaving(false);
        setStatus({ type: 'error', message: 'Failed to save settings' });
        setTimeout(() => { setStatus(null); }, 3000);
      },
    });
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
  };

  const currentSettings = allSettings.filter((s) => s.category === activeCategory);

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex items-center gap-4">
        <button type="button" onClick={() => { void navigate('/'); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Settings</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Configure your dashboard</p>
        </div>
        {status && <SettingsStatus status={status.type === 'success' ? 'saved' : 'error'} />}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-52" role="navigation" aria-label="Settings categories">
          <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.id] ?? SettingsIcon;
              return (
                <SettingsSidebarItem
                  key={cat.id}
                  icon={Icon}
                  label={cat.label}
                  active={activeCategory === cat.id}
                  onClick={() => { setActiveCategory(cat.id); }}
                />
              );
            })}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <SettingsSection title={(() => { const c = categories.find((c) => c.id === activeCategory); return c?.label ?? ''; })()} description="Configure settings for this category">
            <div className="space-y-4">
              {currentSettings.length === 0 && (
                <p className="text-sm text-[hsl(var(--color-muted))]">No settings available for this category.</p>
              )}
              {currentSettings.map((s) => (
                <SettingsCard key={s.id}>
                  {s.type === 'toggle' && (
                    <SettingsToggle
                      label={s.label}
                      description={s.description}
                      value={settings[s.id] as boolean}
                      onChange={(v: boolean) => { updateSetting(s.id, v); }}
                    />
                  )}
                  {s.type === 'text' && (
                    <SettingsInput
                      label={s.label}
                      value={settings[s.id] as string}
                      onChange={(v: string) => { updateSetting(s.id, v); }}
                    />
                  )}
                  {s.type === 'number' && (
                    <SettingsInput
                      label={s.label}
                      value={settings[s.id] as number}
                      onChange={(v: string) => { updateSetting(s.id, Number(v)); }}
                      type="number"
                    />
                  )}
                  {s.type === 'select' && s.options && (
                    <SettingsSelect
                      label={s.label}
                      value={settings[s.id] as string}
                      onChange={(v: string) => { updateSetting(s.id, v); }}
                      options={s.options}
                    />
                  )}
                  {s.type === 'textarea' && (
                    <SettingsTextarea
                      label={s.label}
                      value={settings[s.id] as string}
                      onChange={(v: string) => { updateSetting(s.id, v); }}
                    />
                  )}
                </SettingsCard>
              ))}

              {activeCategory === 'advanced' && (
                <SettingsDangerZone>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--color-text))]">Reset All Settings</p>
                      <p className="text-xs text-[hsl(var(--color-muted))]">This will reset all dashboard settings to their default values.</p>
                    </div>
                    <SettingsButton variant="danger" onClick={() => {}}>Reset All Settings</SettingsButton>
                  </div>
                </SettingsDangerZone>
              )}

              {activeCategory === 'about' && (
                <SettingsCard>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-[hsl(var(--color-muted))]">My Dash</span><p className="text-[hsl(var(--color-text))]">VPS Dashboard v1.0.0-beta</p></div>
                    <div><span className="text-[hsl(var(--color-muted))]">Stack</span><p className="text-[hsl(var(--color-text))]">React + TypeScript + Tailwind CSS</p></div>
                    <div><span className="text-[hsl(var(--color-muted))]">License</span><p className="text-[hsl(var(--color-text))]">MIT</p></div>
                  </div>
                </SettingsCard>
              )}
            </div>
          </SettingsSection>

          <SettingsSaveBar hasChanges={hasChanges} onSave={handleSave} onReset={handleReset} saving={saving} />
        </div>
      </div>
    </PageContainer>
  );
}
