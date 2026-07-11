export interface TunnelOverview { status: 'connected' | 'disconnected' | 'reconnecting'; provider: string; domain: string; publicUrl: string; ssl: boolean; latency: number; uptime: string; reconnectCount: number; trafficIn: number; trafficOut: number; }
export interface TunnelReconnect { id: number; timestamp: string; reason: string; duration: number; success: boolean; }
export interface TunnelTimelinePoint { timestamp: string; latency: number; traffic: number; }
export interface TunnelData { overview: TunnelOverview; reconnectHistory: TunnelReconnect[]; timeline: TunnelTimelinePoint[]; filterOptions: { id: string; label: string }[]; }
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockTunnelData(): TunnelData { return {
  overview: { status: 'connected', provider: 'Cloudflare Tunnel', domain: 'mydash.example.com', publicUrl: 'https://mydash.example.com', ssl: true, latency: 5.1, uptime: '14d 6h 32m', reconnectCount: 2, trafficIn: 512000, trafficOut: 256000 },
  reconnectHistory: [
    { id: 1, timestamp: minutesAgo(1440), reason: 'Connection timeout after 30s idle', duration: 45, success: true },
    { id: 2, timestamp: minutesAgo(4320), reason: 'DNS resolution failure', duration: 120, success: true },
    { id: 3, timestamp: minutesAgo(10080), reason: 'Provider maintenance window', duration: 300, success: true },
    { id: 4, timestamp: minutesAgo(20160), reason: 'Network interface flapped', duration: 60, success: false },
  ],
  timeline: Array.from({ length: 168 }).map((_, i) => ({ timestamp: minutesAgo(168 - i), latency: 3 + Math.sin(i * 0.1) * 2 + Math.random() * 2, traffic: 50 + Math.sin(i * 0.05) * 20 + Math.random() * 10 })),
  filterOptions: [{ id: 'all', label: 'All Events' }, { id: 'success', label: 'Success' }, { id: 'failed', label: 'Failed' }],
}; }
