import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Heart, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle,
  Cpu, Server, HardDrive, Network, Container, Globe,
  Shield, RefreshCw, BarChart3, Search,
} from 'lucide-react';
import { ChartPlaceholder } from './ChartPlaceholder.js';
import { Skeleton, SkeletonBlock } from '../shared/Skeleton.js';
import type { HealthGrade, TrendDirection } from '../../services/mockHealthScore.js';

/* ─────────── Health Grade helpers ─────────── */

function gradeColor(grade: HealthGrade): string {
  switch (grade) {
    case 'A+': return 'text-[hsl(var(--color-success))]';
    case 'A': return 'text-[hsl(var(--color-success))]';
    case 'B': return 'text-[hsl(var(--color-warning))]';
    case 'C': return 'text-[hsl(var(--color-warning))]';
    case 'D': return 'text-[hsl(var(--color-danger))]';
    case 'F': return 'text-[hsl(var(--color-danger))]';
  }
}

function gradeBg(grade: HealthGrade): string {
  switch (grade) {
    case 'A+': return 'bg-[hsl(var(--color-success))]/20';
    case 'A': return 'bg-[hsl(var(--color-success))]/15';
    case 'B': return 'bg-[hsl(var(--color-warning))]/15';
    case 'C': return 'bg-[hsl(var(--color-warning))]/20';
    case 'D': return 'bg-[hsl(var(--color-danger))]/15';
    case 'F': return 'bg-[hsl(var(--color-danger))]/20';
  }
}

function trendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up': return <TrendingUp className="h-3.5 w-3.5" />;
    case 'down': return <TrendingDown className="h-3.5 w-3.5" />;
    case 'stable': return <Minus className="h-3.5 w-3.5" />;
  }
}

function trendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'up': return 'text-[hsl(var(--color-success))]';
    case 'down': return 'text-[hsl(var(--color-danger))]';
    case 'stable': return 'text-[hsl(var(--color-muted))]';
  }
}

/* ─────────── Health Badge ─────────── */

interface HealthBadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const badgeColors: Record<string, string> = {
  primary: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  danger: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  info: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
};

export function HealthBadge({ label, variant = 'primary', className }: HealthBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>
      {label}
    </span>
  );
}

/* ─────────── Health Status ─────────── */

interface HealthStatusProps {
  status: 'healthy' | 'warning' | 'critical' | 'inactive';
  label?: string;
  className?: string;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  healthy: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Healthy' },
  warning: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Warning' },
  critical: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Critical' },
  inactive: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Inactive' },
};

export function HealthStatus({ status, label, className }: HealthStatusProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}

/* ─────────── Health Gauge Placeholder ─────────── */

interface HealthGaugePlaceholderProps {
  score: number;
  grade: HealthGrade;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'h-24 w-24',
  md: 'h-32 w-32',
  lg: 'h-40 w-40',
};

const gaugeStrokeMap: Record<string, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

function gaugeColor(score: number): string {
  if (score >= 85) return 'hsl(var(--color-success))';
  if (score >= 70) return 'hsl(var(--color-warning))';
  if (score >= 55) return 'hsl(var(--color-warning))';
  return 'hsl(var(--color-danger))';
}

export function HealthGaugePlaceholder({ score, grade, size = 'md', className }: HealthGaugePlaceholderProps) {
  const dim = sizeMap[size];
  const strokeWidth = gaugeStrokeMap[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', dim, className)} role="img" aria-label={`Health score: ${String(score)} (${grade})`}>
      <svg viewBox="0 0 100 50" className="h-full w-full" aria-hidden="true">
        <path
          d="M5,50 A45,45 0 1,1 95,50"
          fill="none"
          stroke="hsl(var(--color-border))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M5,50 A45,45 0 1,1 95,50"
          fill="none"
          stroke={gaugeColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className={cn('text-2xl font-bold', gradeColor(grade))}>{score}</span>
        <span className={cn('text-xs font-semibold -mt-0.5', gradeColor(grade))}>{grade}</span>
      </div>
    </div>
  );
}

/* ─────────── Health Empty State ─────────── */

interface HealthEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function HealthEmptyState({ title = 'No health data', description = 'No health score data is available at this time.', className }: HealthEmptyStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Heart className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}

/* ─────────── Card Shell ─────────── */

interface HealthCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function HealthCard({ title, icon, children, className }: HealthCardProps) {
  return (
    <section className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]', className)} aria-label={title}>
      <div className="flex items-center gap-2 border-b border-[hsl(var(--color-border))] px-4 py-3">
        <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

/* ─────────── Health Overview ─────────── */

interface HealthOverviewProps {
  overall: {
    score: number;
    grade: HealthGrade;
    category: string;
    trend: TrendDirection;
    change1h: number;
    change24h: number;
  };
  categoriesCount: number;
  className?: string;
}

export function HealthOverview({ overall, categoriesCount, className }: HealthOverviewProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 sm:gap-6', className)}>
      <HealthGaugePlaceholder score={overall.score} grade={overall.grade} size="md" />
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Health Score</h2>
          <HealthStatus
            status={overall.category === 'excellent' ? 'healthy' : overall.category === 'good' ? 'healthy' : overall.category === 'warning' ? 'warning' : 'critical'}
            label={overall.category.charAt(0).toUpperCase() + overall.category.slice(1)}
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-[hsl(var(--color-muted))]">
          <span className={cn('inline-flex items-center gap-1', trendColor(overall.trend))}>
            {trendIcon(overall.trend)}
            {overall.trend === 'up' ? 'Improving' : overall.trend === 'down' ? 'Declining' : 'Stable'}
          </span>
          <span>1h: <span className={cn('font-medium', overall.change1h >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>{overall.change1h >= 0 ? '+' : ''}{overall.change1h}</span></span>
          <span>24h: <span className={cn('font-medium', overall.change24h >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>{overall.change24h >= 0 ? '+' : ''}{overall.change24h}</span></span>
        </div>
        <p className="text-xs text-[hsl(var(--color-muted))]">
          Evaluated across {categoriesCount} categories
        </p>
      </div>
    </div>
  );
}

/* ─────────── Overall Health Card ─────────── */

interface OverallHealthCardProps {
  overall: {
    score: number;
    grade: HealthGrade;
    category: string;
    trend: TrendDirection;
    change1h: number;
    change24h: number;
  };
  isLoading?: boolean;
}

export function OverallHealthCard({ overall, isLoading }: OverallHealthCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Overall Health" icon={<Heart className="h-4 w-4" />}>
        <div className="flex items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <SkeletonBlock lines={3} className="flex-1" />
        </div>
      </HealthCard>
    );
  }

  return (
    <HealthCard title="Overall Health" icon={<Heart className="h-4 w-4" />}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <HealthGaugePlaceholder score={overall.score} grade={overall.grade} size="lg" />
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
              <p className="text-xs text-[hsl(var(--color-muted))]">Trend</p>
              <p className={cn('text-sm font-semibold inline-flex items-center gap-1', trendColor(overall.trend))}>
                {trendIcon(overall.trend)}
                {overall.trend === 'up' ? 'Improving' : overall.trend === 'down' ? 'Declining' : 'Stable'}
              </p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
              <p className="text-xs text-[hsl(var(--color-muted))]">1h Change</p>
              <p className={cn('text-sm font-semibold', overall.change1h >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
                {overall.change1h >= 0 ? '+' : ''}{overall.change1h}
              </p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
              <p className="text-xs text-[hsl(var(--color-muted))]">24h Change</p>
              <p className={cn('text-sm font-semibold', overall.change24h >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
                {overall.change24h >= 0 ? '+' : ''}{overall.change24h}
              </p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
              <p className="text-xs text-[hsl(var(--color-muted))]">Category</p>
              <p className="text-sm font-semibold text-[hsl(var(--color-text))] capitalize">{overall.category}</p>
            </div>
          </div>
        </div>
      </div>
    </HealthCard>
  );
}

/* ─────────── Health Trend Card ─────────── */

interface HealthTrendCardProps {
  timeline: { timestamp: string; score: number }[];
  isLoading?: boolean;
}

export function HealthTrendCard({ timeline, isLoading }: HealthTrendCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Score Trend" icon={<BarChart3 className="h-4 w-4" />}>
        <Skeleton className="h-32 w-full" />
      </HealthCard>
    );
  }

  const latest = timeline.length > 0 ? timeline[timeline.length - 1].score : null;
  const earliest = timeline.length > 0 ? timeline[0].score : null;
  const change = latest !== null && earliest !== null ? latest - earliest : 0;

  return (
    <HealthCard title="Score Trend" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{latest !== null ? String(latest) : '—'}</span>
        <span className={cn('text-xs font-medium', change > 0 ? 'text-[hsl(var(--color-success))]' : change < 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]')}>
          {change > 0 ? '+' : ''}{change} overall
        </span>
      </div>
      <ChartPlaceholder label="7-Day Health Trend" height="sm" variant="line" />
    </HealthCard>
  );
}

/* ─────────── Health Category Card ─────────── */

interface HealthCategoryCardProps {
  name: string;
  icon: ReactNode;
  score: number;
  grade: HealthGrade;
  impact: number;
  description: string;
  isLoading?: boolean;
}

export function HealthCategoryCard({ name, icon, score, grade, impact, description, isLoading }: HealthCategoryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={3} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 transition-all hover:border-[hsl(var(--color-border))]/80 hover:bg-[hsl(var(--color-border))]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
          <span className="text-sm font-semibold text-[hsl(var(--color-text))]">{name}</span>
        </div>
        <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold', gradeBg(grade), gradeColor(grade))}>{grade}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(score)}</span>
          <span className={cn('text-xs font-medium', impact >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
            {impact >= 0 ? '+' : ''}{impact} pts
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', score >= 80 ? 'bg-[hsl(var(--color-success))]' : score >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-danger))]')}
            style={{ width: `${String(score)}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name}: ${String(score)}%`}
          />
        </div>
        <p className="text-xs text-[hsl(var(--color-muted))] line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

/* ─────────── Specific Category Cards ─────────── */

interface HealthCategoryData {
  score: number;
  grade: HealthGrade;
  impact: number;
  status: string;
  description: string;
}

export function CpuHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="CPU"
      icon={<Cpu className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function MemoryHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Memory"
      icon={<Server className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function DiskHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Disk"
      icon={<HardDrive className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function NetworkHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Network"
      icon={<Network className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function DockerHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Docker"
      icon={<Container className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function TunnelHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Tunnel"
      icon={<Globe className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

export function ServiceHealthCard({ data, isLoading }: { data: HealthCategoryData; isLoading?: boolean }) {
  return (
    <HealthCategoryCard
      name="Service"
      icon={<Activity className="h-4 w-4" />}
      score={data.score}
      grade={data.grade}
      impact={data.impact}
      description={data.description}
      isLoading={isLoading}
    />
  );
}

/* ─────────── Penalty Breakdown Card ─────────── */

interface PenaltyBreakdownCardProps {
  penalties: { factor: string; points: number; description: string; severity: string }[];
  isLoading?: boolean;
}

const severityColors: Record<string, string> = {
  low: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  medium: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  high: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  critical: 'bg-[hsl(var(--color-danger))]/20 text-[hsl(var(--color-danger))]',
};

export function PenaltyBreakdownCard({ penalties, isLoading }: PenaltyBreakdownCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Penalty Breakdown" icon={<AlertTriangle className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </HealthCard>
    );
  }

  const sorted = [...penalties].sort((a, b) => a.points - b.points);

  return (
    <HealthCard title="Penalty Breakdown" icon={<AlertTriangle className="h-4 w-4" />}>
      <div className="space-y-2">
        {sorted.map((p) => (
          <div key={p.factor} className="flex items-start justify-between gap-2 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{p.factor}</span>
                <span className={cn('rounded px-1 py-0.5 text-[10px] font-medium', severityColors[p.severity])}>{p.severity}</span>
              </div>
              <p className="text-xs text-[hsl(var(--color-muted))] truncate">{p.description}</p>
            </div>
            <span className={cn('shrink-0 text-sm font-bold', p.points >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
              {p.points >= 0 ? '+' : ''}{p.points}
            </span>
          </div>
        ))}
      </div>
    </HealthCard>
  );
}

/* ─────────── Recovery Status Card ─────────── */

interface RecoveryStatusCardProps {
  recovery: {
    state: 'stable' | 'recovering' | 'degraded' | 'critical';
    progress: number;
    estimatedRecovery: string;
    lastIncident: string;
    duration: string;
  };
  isLoading?: boolean;
}

const stateConfig: Record<string, { icon: ReactNode; color: string; label: string }> = {
  stable: { icon: <Shield className="h-4 w-4" />, color: 'text-[hsl(var(--color-success))]', label: 'Stable' },
  recovering: { icon: <RefreshCw className="h-4 w-4" />, color: 'text-[hsl(var(--color-warning))]', label: 'Recovering' },
  degraded: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-[hsl(var(--color-warning))]', label: 'Degraded' },
  critical: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-[hsl(var(--color-danger))]', label: 'Critical' },
};

export function RecoveryStatusCard({ recovery, isLoading }: RecoveryStatusCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Recovery Status" icon={<RefreshCw className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </HealthCard>
    );
  }

  const cfg = stateConfig[recovery.state];

  return (
    <HealthCard title="Recovery Status" icon={<RefreshCw className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className={cn('flex items-center gap-2', cfg.color)}>
          {cfg.icon}
          <span className="text-sm font-semibold">{cfg.label}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--color-muted))]">Recovery Progress</span>
            <span className="font-medium text-[hsl(var(--color-text))]">{String(Math.min(recovery.progress, 100))}%</span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', recovery.progress >= 100 ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-warning))]')}
              style={{ width: `${String(Math.min(recovery.progress, 100))}%` }}
              role="progressbar"
              aria-valuenow={recovery.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Recovery: ${String(Math.min(recovery.progress, 100))}%`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Est. Recovery</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{recovery.estimatedRecovery}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Last Incident</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{recovery.lastIncident !== '' ? new Date(recovery.lastIncident).toLocaleDateString() : 'None'}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Duration</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{recovery.duration}</p>
          </div>
        </div>
      </div>
    </HealthCard>
  );
}

/* ─────────── Confidence Score Card ─────────── */

interface ConfidenceScoreCardProps {
  confidence: number;
  isLoading?: boolean;
}

export function ConfidenceScoreCard({ confidence, isLoading }: ConfidenceScoreCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Confidence" icon={<Shield className="h-4 w-4" />}>
        <Skeleton className="h-24 w-full" />
      </HealthCard>
    );
  }

  return (
    <HealthCard title="Confidence" icon={<Shield className="h-4 w-4" />}>
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center h-20 w-20">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--color-border))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={confidence >= 80 ? 'hsl(var(--color-success))' : confidence >= 60 ? 'hsl(var(--color-warning))' : 'hsl(var(--color-danger))'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - confidence / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <span className={cn('absolute text-xl font-bold', confidence >= 80 ? 'text-[hsl(var(--color-success))]' : confidence >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>
            {String(confidence)}%
          </span>
        </div>
        <p className="text-xs text-[hsl(var(--color-muted))] text-center">
          {confidence >= 80 ? 'High confidence — all data sources available' : confidence >= 60 ? 'Moderate confidence — some data sources missing' : 'Low confidence — multiple data sources unavailable'}
        </p>
      </div>
    </HealthCard>
  );
}

/* ─────────── Health Grade Card ─────────── */

interface HealthGradeCardProps {
  grade: HealthGrade;
  score: number;
  isLoading?: boolean;
}

const gradeDescriptions: Record<HealthGrade, { label: string; range: string; color: string }> = {
  'A+': { label: 'Excellent', range: '95-100', color: 'text-[hsl(var(--color-success))]' },
  'A': { label: 'Healthy', range: '85-94', color: 'text-[hsl(var(--color-success))]' },
  'B': { label: 'Good', range: '70-84', color: 'text-[hsl(var(--color-warning))]' },
  'C': { label: 'Warning', range: '55-69', color: 'text-[hsl(var(--color-warning))]' },
  'D': { label: 'Poor', range: '40-54', color: 'text-[hsl(var(--color-danger))]' },
  'F': { label: 'Critical', range: '0-39', color: 'text-[hsl(var(--color-danger))]' },
};

export function HealthGradeCard({ grade, score, isLoading }: HealthGradeCardProps) {
  if (isLoading) {
    return (
      <HealthCard title="Grade" icon={<Activity className="h-4 w-4" />}>
        <Skeleton className="h-24 w-full" />
      </HealthCard>
    );
  }

  const info = gradeDescriptions[grade];

  return (
    <HealthCard title="Grade" icon={<Activity className="h-4 w-4" />}>
      <div className="flex flex-col items-center gap-2">
        <div className={cn('flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold', gradeBg(grade), info.color)}>
          {grade}
        </div>
        <div className="text-center">
          <p className={cn('text-sm font-semibold', info.color)}>{info.label}</p>
          <p className="text-xs text-[hsl(var(--color-muted))]">Range: {info.range} (Score: {String(score)})</p>
        </div>
      </div>
    </HealthCard>
  );
}

/* ─────────── Health Timeline ─────────── */

interface HealthTimelineProps {
  data: { timestamp: string; score: number }[];
  label?: string;
  isLoading?: boolean;
  className?: string;
}

export function HealthTimeline({ data, label = 'Health Timeline', isLoading, className }: HealthTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No timeline data available
      </div>
    );
  }

  const latest = data[data.length - 1];
  const minScore = Math.min(...data.map((d) => d.score));
  const maxScore = Math.max(...data.map((d) => d.score));

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-muted))]">
        <span>Latest: <span className="font-medium text-[hsl(var(--color-text))]">{String(latest.score)}</span></span>
        <span>Range: <span className="font-medium text-[hsl(var(--color-text))]">{String(minScore)}–{String(maxScore)}</span></span>
      </div>
      <ChartPlaceholder label={label} height="md" variant="line" />
    </div>
  );
}

/* ─────────── Health Filter ─────────── */

interface HealthFilterProps {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}

export function HealthFilter({ options, selected, onChange, className }: HealthFilterProps) {
  if (options.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => { onChange(opt.id); }}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            selected === opt.id
              ? 'bg-[hsl(var(--color-primary))] text-white'
              : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]',
          )}
          aria-pressed={selected === opt.id}
          aria-label={`Filter by ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────── Health Search ─────────── */

interface HealthSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function HealthSearch({ value, onChange, placeholder = 'Search health records...', className }: HealthSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder}
      />
    </div>
  );
}
