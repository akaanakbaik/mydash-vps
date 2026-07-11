import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { ArrowLeft, RefreshCw, Terminal, Search, Trash2, AlertTriangle, Info, Bug, XCircle, Download, Filter } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { apiClient } from '../api/client.js';
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: 'system' | 'docker' | 'nginx';
}
const levelColors: Record<string, string> = {
  error: 'text-[hsl(var(--color-danger))]',
  warning: 'text-[hsl(var(--color-warning))]',
  info: 'text-[hsl(var(--color-primary))]',
  debug: 'text-[hsl(var(--color-muted))]',
};
const levelBgColors: Record<string, string> = {
  error: 'bg-[hsl(var(--color-danger))]/10',
  warning: 'bg-[hsl(var(--color-warning))]/10',
  info: 'bg-[hsl(var(--color-primary))]/5',
  debug: 'bg-transparent',
};
const levelIcons: Record<string, typeof AlertTriangle> = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  debug: Bug,
};
export function LogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ logs: LogEntry[] }>('/logs/all');
      if (res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchLogs();
    const interval = setInterval(() => { void fetchLogs(); }, 5000);
    return () => { clearInterval(interval); };
  }, []);
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);
  const filteredLogs = useMemo(() => {
    let items = logs;
    if (filter !== 'all') items = items.filter((l) => l.level === filter);
    if (sourceFilter !== 'all') items = items.filter((l) => l.source === sourceFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((l) => l.message.toLowerCase().includes(q));
    }
    return items;
  }, [logs, filter, sourceFilter, search]);
  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warningCount = logs.filter((l) => l.level === 'warning').length;
  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))]"
          aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">System Logs</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Real-time log viewer — auto-refresh every 5s</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', errorCount > 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]')}>
            {String(errorCount)} errors
          </span>
          <span className={cn('text-xs font-medium', warningCount > 0 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-muted))]')}>
            {String(warningCount)} warnings
          </span>
          <button onClick={() => { void fetchLogs(); }} disabled={loading}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))]"
            aria-label="Refresh logs">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>
      {}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: 'Total', count: logs.length, color: 'text-[hsl(var(--color-text))]' },
          { label: 'Error', count: errorCount, color: 'text-[hsl(var(--color-danger))]' },
          { label: 'Warning', count: warningCount, color: 'text-[hsl(var(--color-warning))]' },
          { label: 'Info', count: logs.filter((l) => l.level === 'info').length, color: 'text-[hsl(var(--color-primary))]' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-3 py-2">
            <span className="text-xs text-[hsl(var(--color-muted))]">{stat.label}</span>
            <span className={cn('text-sm font-bold', stat.color)}>{String(stat.count)}</span>
          </div>
        ))}
      </div>
      {}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'error', 'warning', 'info', 'debug'].map((lvl) => (
            <button key={lvl} type="button" onClick={() => { setFilter(lvl); }}
              className={cn('rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                filter === lvl ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]'
              )}>
              {lvl === 'all' ? 'All' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
          <div className="mx-1 w-px bg-[hsl(var(--color-border))]" />
          {['all', 'system', 'docker', 'nginx'].map((src) => (
            <button key={src} type="button" onClick={() => { setSourceFilter(src); }}
              className={cn('rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                sourceFilter === src ? 'bg-[hsl(var(--color-accent))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]'
              )}>
              {src === 'all' ? 'All' : src.charAt(0).toUpperCase() + src.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }}
              placeholder="Search logs..." aria-label="Search logs"
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-1.5 pl-8 pr-2.5 text-xs text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none"
            />
          </div>
          <button onClick={() => { setAutoScroll(!autoScroll); }}
            className={cn('rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border',
              autoScroll ? 'border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'border-[hsl(var(--color-border))] text-[hsl(var(--color-muted))]'
            )}>
            Auto-scroll
          </button>
          <button onClick={() => {
            setFilter('all'); setSourceFilter('all'); setSearch('');
          }}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]"
            aria-label="Reset filters" title="Reset filters">
            <Filter className="h-4 w-4" />
          </button>
          {}
          <button onClick={() => {
            const text = filteredLogs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `mydash-logs-${new Date().toISOString().slice(0, 10)}.txt`;
            a.click(); URL.revokeObjectURL(url);
          }}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]"
            aria-label="Export logs" title="Export logs">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => { setLogs([]); }}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger))]/10"
            aria-label="Clear logs">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {}
      <div
        ref={terminalRef}
        className="relative overflow-y-auto rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] font-mono text-xs"
        style={{ height: '60vh', maxHeight: '700px' }}
        role="log"
        aria-live="polite"
        aria-label="System logs terminal"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-8">
            <Terminal className="h-8 w-8 text-[hsl(var(--color-muted))]" />
            <p className="text-sm font-medium text-[hsl(var(--color-text))]">No log entries</p>
            <p className="text-xs text-[hsl(var(--color-muted))]">Try adjusting filters or wait for new log data</p>
          </div>
        ) : (
          <div className="p-2 space-y-px">
            {filteredLogs.map((log) => {
              const Icon = levelIcons[log.level] || Info;
              return (
                <div key={log.id}
                  className={cn(
                    'flex items-start gap-2 rounded px-2 py-1 transition-colors hover:bg-[hsl(var(--color-border))]/20',
                    levelBgColors[log.level],
                  )}
                >
                  {}
                  <span className="shrink-0 text-[10px] leading-5 text-[hsl(var(--color-muted))] font-mono w-28">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {}
                  <span className={cn('shrink-0', levelColors[log.level])}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {}
                  <span className="shrink-0 rounded bg-[hsl(var(--color-border))] px-1 py-0.5 text-[10px] font-medium text-[hsl(var(--color-muted))] uppercase">
                    {log.source}
                  </span>
                  {}
                  <span className={cn('shrink-0 text-[10px] font-medium w-14', levelColors[log.level])}>
                    {log.level.toUpperCase()}
                  </span>
                  {}
                  <span className="flex-1 text-xs leading-5 text-[hsl(var(--color-text))] break-all whitespace-pre-wrap">
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {}
        {!autoScroll && filteredLogs.length > 0 && (
          <div className="sticky bottom-2 flex justify-center">
            <button onClick={() => { setAutoScroll(true); }}
              className="rounded-full bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] px-3 py-1 text-xs text-[hsl(var(--color-muted))] shadow-lg hover:text-[hsl(var(--color-text))]"
            >
              ↓ Scroll to bottom
            </button>
          </div>
        )}
      </div>
      {}
      <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--color-muted))]">
        <span>
          Showing {String(filteredLogs.length)} of {String(logs.length)} entries
          {loading && ' (refreshing...)'}
        </span>
        <span className="font-mono">
          {new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
        </span>
      </div>
    </PageContainer>
  );
}
