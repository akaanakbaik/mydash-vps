import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { Send, Bot, User, X, Loader, Sparkles, Terminal, Copy, Check, Trash2 } from 'lucide-react';
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
interface AIChatbotProps {
  onClose?: () => void;
  className?: string;
  embedded?: boolean;
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function renderMarkdown(text: string): string {
  let html = escapeHtml(text);
  html = html
    .replace(/(?<=\S)\s*###(?=\s)/g, '\n###')
    .replace(/(?<=\S)\s*##(?=\s)/g, '\n##')
    .replace(/(?<=\S)\s*#(?=\s)/g, '\n#')
    .replace(/(?<=\S)\s*- /g, '\n- ')
    .replace(/(?<=\S)\s*\* /g, '\n* ')
    .replace(/(?<=\S)\s*\d+\. /g, '\n$&');
  html = html
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="rounded bg-black/20 p-2 my-1 overflow-x-auto text-[10px] leading-relaxed font-mono"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-black/20 px-1 py-0.5 text-[10px] font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?:^|\n)---(?:\n|$)/g, '<hr class="my-2 border-[hsl(var(--color-border))]" />')
    .replace(/^### (.+)$/gm, '<div class="text-xs font-bold mt-2 mb-1 text-[hsl(var(--color-primary))]">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="text-sm font-bold mt-2 mb-1 text-[hsl(var(--color-primary))]">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="text-base font-bold mt-2 mb-1 text-[hsl(var(--color-primary))]">$1</div>')
    .replace(/^\s*[-*] (.+)$/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="shrink-0 mt-0.5 text-[hsl(var(--color-primary))]">•</span><span>$1</span></div>')
    .replace(/^\s*(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="shrink-0 mt-0.5 text-[hsl(var(--color-primary))] font-medium">$1.</span><span>$2</span></div>')
    .replace(/\n\n/g, '<div class="h-1.5"></div>')
    .replace(/\n/g, '<br />');
  html = html.replace(/^(<br \/>)+/, '');
  return html;
}
export function AIChatbot({ onClose, className, embedded }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya **My Dash AI Assistant**.\n\nSaya bisa bantu kamu dengan:\n- **Cek status server** — CPU, RAM, disk, uptime\n- **Konfigurasi notifikasi** — Telegram & WhatsApp\n- **Kelola plugin** — install, update, hapus\n- **Analisa log** — cari error, warning\n- **Keamanan** — cek firewall, port, sesi\n\nTanya apa saja tentang VPS kamu!', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const context = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[My Dash VPS Assistant]\n## INSTRUKSI\n- Gunakan **Bahasa Indonesia** untuk merespon, kecuali user bertanya dalam bahasa Inggris\n- Gunakan format:\n  - ### untuk judul bagian\n  - **bold** untuk penekanan\n  - \`kode\` untuk istilah teknis\n  - - untuk daftar bullet\n  - 1. untuk daftar bernomor\n  - Beri jarak (newline) antar paragraf\n- Jawab dengan ramah, informatif, dan to the point\n- Jika tidak tahu, akui saja\n## Konteks\n${context}\n## User\n${userMsg.content}\n## AI Assistant\n` }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json() as { status?: boolean; text?: string };
      const reply = json.text || 'Maaf, saya tidak bisa menjawab saat ini.';
      const assistantMsg: Message = { role: 'assistant', content: reply.substring(0, 2000), timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: 'Maaf, saya tidak bisa menjawab saat ini. Silakan coba lagi nanti.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };
  const containerClass = embedded ? className : 'fixed bottom-24 right-6 z-50 w-80 sm:w-96';
  return (
    <div className={cn(containerClass, 'rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] shadow-2xl overflow-hidden')}>
      {}
      <div className="flex items-center justify-between bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">AI Assistant</span>
            <span className="ml-2 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] text-white/80">Think Deeper</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setMessages([{ role: 'assistant', content: 'Halo! Saya **My Dash AI Assistant**.\n\nPercakapan sudah dibersihkan. Ada yang bisa saya bantu?', timestamp: new Date() }]); setError(null); }}
            className="rounded-lg p-1 text-white/60 hover:bg-white/20 hover:text-white transition-colors" aria-label="Clear conversation" title="Clear chat">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {}
      <div className="h-80 overflow-y-auto p-3 space-y-3 scrollbar-thin bg-[hsl(var(--color-bg))]/50">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2 group', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/10 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-[hsl(var(--color-primary))]" />
              </div>
            )}
            <div className={cn('flex flex-col gap-1', msg.role === 'assistant' ? 'items-start' : 'items-end')}>
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] break-words',
                  msg.role === 'user'
                    ? 'bg-[hsl(var(--color-primary))] text-white rounded-br-md'
                    : 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] rounded-bl-md shadow-sm border border-[hsl(var(--color-border))]'
                )}
                dangerouslySetInnerHTML={msg.role === 'assistant' ? { __html: renderMarkdown(msg.content) } : undefined}
              >
                {msg.role === 'user' ? msg.content : null}
              </div>
              {}
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.content, i)}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-[hsl(var(--color-muted))] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]"
                  aria-label="Copy message"
                >
                  {copiedId === i ? (
                    <><Check className="h-3 w-3 text-green-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Copy</>
                  )}
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20 mt-0.5">
                <User className="h-3.5 w-3.5 text-[hsl(var(--color-primary))]" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/10">
              <Bot className="h-3.5 w-3.5 text-[hsl(var(--color-primary))]" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-[hsl(var(--color-surface))] px-4 py-3 shadow-sm border border-[hsl(var(--color-border))]">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500 flex items-center gap-1.5">
            <Terminal className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {}
      <div className="border-t border-[hsl(var(--color-border))] p-3 bg-[hsl(var(--color-surface))]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya sesuatu tentang VPS..."
            disabled={loading}
            className="flex-1 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3.5 py-2.5 text-xs text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            aria-label="Send"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
export function AIChatbotFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-[hsl(var(--color-primary))/30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] active:scale-95 animate-bounce-glow"
      aria-label="Open AI Assistant"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}
