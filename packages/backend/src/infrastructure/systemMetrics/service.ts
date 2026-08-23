import { hostname, type, release, platform, uptime, cpus, totalmem, freemem, loadavg, networkInterfaces } from 'os';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
export interface SystemData {
  hostname: string;
  os: string;
  platform: string;
  release: string;
  architecture: string;
  virtualization: string;
  filesystem: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  diskTopDirectories: { path: string; bytes: number }[];
  cpuModel: string;
  cpuCores: number;
  cpuSpeed: number;
  cpuUsagePercent: number;
  loadAverage1m: number;
  loadAverage5m: number;
  loadAverage15m: number;
  totalRamMB: number;
  usedRamMB: number;
  freeRamMB: number;
  ramUsagePercent: number;
  swapTotalMB: number;
  swapUsedMB: number;
  totalDiskMB: number;
  usedDiskMB: number;
  freeDiskMB: number;
  diskUsagePercent: number;
  diskReadBps: number;
  diskWriteBps: number;
  diskIoAvailable: boolean;
  inodeUsagePercent: number;
  inodeUsageAvailable: boolean;
  bootTime: string;
  agentVersion: string;
  network: {
    interface: string;
    ipv4: string;
    ipv6: string;
    rxBytes: number;
    txBytes: number;
    rxSpeed: number;
    txSpeed: number;
    rateAvailable: boolean;
    packetLossPercent: number;
    latencyMs: number;
    packetLossAvailable: boolean;
    latencyAvailable: boolean;
  };
  networkInterfaces: { name: string; rxBytes: number; txBytes: number }[];
  processes: number;
  services: Record<string, string>;
  serviceDetails: { name: string; activeState: string; enabledState: string; observedAt: number; cpuPercent?: number; memoryBytes?: number; uptimeSeconds?: number; ports?: number[] }[];
  docker: { containers: { id: string; name: string; image: string; status: string; cpuPercent: number; memoryPercent: number; memoryBytes: number; ports: string; restartCount: number; created: string; startedAt: string; healthStatus: string; uptimeSeconds?: number }[]; images: { id: string; repository: string; tag: string; size: number; created: string }[]; volumes: { name: string; driver: string; mountPoint: string; size: number | null; status: string }[]; networks: { name: string; driver: string; subnet: string; containers: number }[]; totalCpu: number; totalMemory: number; containerCount: number; runningCount: number; stoppedCount: number; health: 'healthy' | 'degraded' | 'unhealthy' | 'unavailable' };
}
function emptyDockerSnapshot(): SystemData['docker'] {
  return { containers: [], images: [], volumes: [], networks: [], totalCpu: 0, totalMemory: 0, containerCount: 0, runningCount: 0, stoppedCount: 0, health: 'unavailable' };
}
function parseDockerSnapshot(value: unknown): SystemData['docker'] {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const numberOrNull = (input: unknown): number | null => typeof input === 'number' && Number.isFinite(input) ? input : null;
  const stringOrEmpty = (input: unknown): string => typeof input === 'string' ? input : '';
  const containers = Array.isArray(raw.containers) ? raw.containers.flatMap((input) => {
    if (!input || typeof input !== 'object') return [];
    const item = input as Record<string, unknown>;
    const id = stringOrEmpty(item.id);
    const name = stringOrEmpty(item.name);
    if (!id || !name) return [];
    return [{ id, name, image: stringOrEmpty(item.image), status: stringOrEmpty(item.status) || 'unknown', cpuPercent: numberOrNull(item.cpuPercent) ?? 0, memoryPercent: numberOrNull(item.memoryPercent) ?? 0, memoryBytes: numberOrNull(item.memoryBytes) ?? 0, ports: stringOrEmpty(item.ports), restartCount: numberOrNull(item.restartCount) ?? 0, created: stringOrEmpty(item.created), startedAt: stringOrEmpty(item.startedAt), healthStatus: stringOrEmpty(item.healthStatus) || 'unknown' }];
  }).slice(0, 128) : [];
  const images = Array.isArray(raw.images) ? raw.images.flatMap((input) => {
    if (!input || typeof input !== 'object') return [];
    const item = input as Record<string, unknown>;
    const id = stringOrEmpty(item.id);
    if (!id) return [];
    return [{ id, repository: stringOrEmpty(item.repository), tag: stringOrEmpty(item.tag), size: numberOrNull(item.size) ?? 0, created: stringOrEmpty(item.created) }];
  }).slice(0, 128) : [];
  const volumes = Array.isArray(raw.volumes) ? raw.volumes.flatMap((input) => {
    if (!input || typeof input !== 'object') return [];
    const item = input as Record<string, unknown>;
    const name = stringOrEmpty(item.name);
    if (!name) return [];
    return [{ name, driver: stringOrEmpty(item.driver), mountPoint: stringOrEmpty(item.mountPoint), size: numberOrNull(item.size), status: stringOrEmpty(item.status) || 'unknown' }];
  }).slice(0, 128) : [];
  const networks = Array.isArray(raw.networks) ? raw.networks.flatMap((input) => {
    if (!input || typeof input !== 'object') return [];
    const item = input as Record<string, unknown>;
    const name = stringOrEmpty(item.name);
    if (!name) return [];
    return [{ name, driver: stringOrEmpty(item.driver), subnet: stringOrEmpty(item.subnet), containers: numberOrNull(item.containers) ?? 0 }];
  }).slice(0, 128) : [];
  const health = raw.health === 'healthy' || raw.health === 'degraded' || raw.health === 'unhealthy' ? raw.health : containers.length > 0 ? containers.some((item) => item.healthStatus === 'unhealthy') ? 'unhealthy' : containers.some((item) => item.healthStatus === 'starting' || item.healthStatus === 'unknown') ? 'degraded' : 'healthy' : 'unavailable';
  return { containers, images, volumes, networks, totalCpu: numberOrNull(raw.totalCpu) ?? containers.reduce((sum, item) => sum + item.cpuPercent, 0), totalMemory: numberOrNull(raw.totalMemory) ?? 0, containerCount: numberOrNull(raw.containerCount) ?? containers.length, runningCount: numberOrNull(raw.runningCount) ?? containers.filter((item) => item.status === 'running').length, stoppedCount: numberOrNull(raw.stoppedCount) ?? containers.filter((item) => item.status !== 'running').length, health };
}
function readHostSnapshot(): SystemData | null {
  try {
    const raw = JSON.parse(readFileSync('/host-run/mydash-host-metrics/metrics.json', 'utf-8')) as Record<string, unknown>;
    const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : 0;
    if (!Number.isFinite(updatedAt) || Date.now() / 1000 - updatedAt > 180) return null;
    const networkRaw = raw.network && typeof raw.network === 'object' ? raw.network as Record<string, unknown> : {};
    const numberOrZero = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
    const diskTopDirectories = Array.isArray(raw.diskTopDirectories) ? raw.diskTopDirectories.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const path = typeof entry.path === 'string' ? entry.path : '';
      const bytes = numberOrZero(entry.bytes);
      return path.startsWith('/') && bytes >= 0 ? [{ path, bytes }] : [];
    }).slice(0, 12) : [];
    const networkInterfaces = Array.isArray(raw.networkInterfaces) ? raw.networkInterfaces.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const name = typeof entry.name === 'string' ? entry.name : '';
      return name ? [{ name, rxBytes: numberOrZero(entry.rxBytes), txBytes: numberOrZero(entry.txBytes) }] : [];
    }).slice(0, 32) : [];
    const serviceDetails = Array.isArray(raw.serviceDetails) ? raw.serviceDetails.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const name = typeof entry.name === 'string' ? entry.name : '';
      if (!name) return [];
      return [{ name, activeState: typeof entry.activeState === 'string' ? entry.activeState : 'unknown', enabledState: typeof entry.enabledState === 'string' ? entry.enabledState : 'unknown', observedAt: numberOrZero(entry.observedAt), cpuPercent: numberOrZero(entry.cpuPercent), memoryBytes: numberOrZero(entry.memoryBytes), uptimeSeconds: numberOrZero(entry.uptimeSeconds), ports: Array.isArray(entry.ports) ? entry.ports.filter((port): port is number => typeof port === 'number' && Number.isFinite(port)) : [] }];
    }).slice(0, 32) : [];
    const textOrEmpty = (value: unknown) => typeof value === 'string' ? value : '';
    return {
      hostname: textOrEmpty(raw.hostname) || hostname(),
      os: textOrEmpty(raw.os) || 'Ubuntu',
      platform: textOrEmpty(raw.platform) || 'linux',
      release: textOrEmpty(raw.release) || release(),
      architecture: textOrEmpty(raw.architecture) || process.arch,
      virtualization: textOrEmpty(raw.virtualization) || 'unknown',
      filesystem: textOrEmpty(raw.filesystem) || 'unknown',
      uptimeSeconds: numberOrZero(raw.uptimeSeconds),
      uptimeFormatted: textOrEmpty(raw.uptimeFormatted) || 'Unavailable',
      diskTopDirectories,
      cpuModel: textOrEmpty(raw.cpuModel) || 'Unavailable',
      cpuCores: numberOrZero(raw.cpuCores),
      cpuSpeed: numberOrZero(raw.cpuSpeed),
      cpuUsagePercent: numberOrZero(raw.cpuUsagePercent),
      loadAverage1m: numberOrZero(raw.loadAverage1m),
      loadAverage5m: numberOrZero(raw.loadAverage5m),
      loadAverage15m: numberOrZero(raw.loadAverage15m),
      totalRamMB: numberOrZero(raw.totalRamMB),
      usedRamMB: numberOrZero(raw.usedRamMB),
      freeRamMB: numberOrZero(raw.freeRamMB),
      ramUsagePercent: numberOrZero(raw.ramUsagePercent),
      swapTotalMB: numberOrZero(raw.swapTotalMB),
      swapUsedMB: numberOrZero(raw.swapUsedMB),
      totalDiskMB: numberOrZero(raw.totalDiskMB),
      usedDiskMB: numberOrZero(raw.usedDiskMB),
      freeDiskMB: numberOrZero(raw.freeDiskMB),
      diskUsagePercent: numberOrZero(raw.diskUsagePercent),
      diskReadBps: numberOrZero(raw.diskReadBps),
      diskWriteBps: numberOrZero(raw.diskWriteBps),
      diskIoAvailable: raw.diskIoAvailable === true,
      inodeUsagePercent: numberOrZero(raw.inodeUsagePercent),
      inodeUsageAvailable: raw.inodeUsageAvailable === true,
      bootTime: textOrEmpty(raw.bootTime),
      agentVersion: textOrEmpty(raw.agentVersion) || 'host-agent',
      network: {
        interface: textOrEmpty(networkRaw.interface),
        ipv4: textOrEmpty(networkRaw.ipv4),
        ipv6: textOrEmpty(networkRaw.ipv6),
        rxBytes: numberOrZero(networkRaw.rxBytes),
        txBytes: numberOrZero(networkRaw.txBytes),
        rxSpeed: numberOrZero(networkRaw.rxSpeed),
        txSpeed: numberOrZero(networkRaw.txSpeed),
        rateAvailable: networkRaw.rateAvailable === true,
        packetLossPercent: numberOrZero(networkRaw.packetLossPercent),
        latencyMs: numberOrZero(networkRaw.latencyMs),
        packetLossAvailable: networkRaw.packetLossAvailable === true,
        latencyAvailable: networkRaw.latencyAvailable === true,
      },
      networkInterfaces,
      processes: numberOrZero(raw.processes),
      services: raw.services && typeof raw.services === 'object' ? Object.fromEntries(Object.entries(raw.services as Record<string, unknown>).filter(([, value]) => typeof value === 'string')) as Record<string, string> : {},
      serviceDetails,
      docker: parseDockerSnapshot(raw.docker),
    };
  } catch {
    return null;
  }
}
function bytesToMB(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
function getDiskUsage(): { totalMB: number; usedMB: number; freeMB: number; usagePercent: number } {
  try {
    const output = execSync('df -BG /', { encoding: 'utf-8', timeout: 3000 });
    const lines = output.trim().split('\n');
    if (lines.length >= 2) {
      const parts = lines[1].split(/\s+/);
      if (parts.length >= 6) {
        const total = parseInt(parts[1].replace('G', '')) * 1024;
        const used = parseInt(parts[2].replace('G', '')) * 1024;
        const free = parseInt(parts[3].replace('G', '')) * 1024;
        const pct = parseInt(parts[4].replace('%', ''));
        return { totalMB: total, usedMB: used, freeMB: free, usagePercent: pct };
      }
    }
  } catch {
  }
  return { totalMB: 102400, usedMB: 0, freeMB: 102400, usagePercent: 0 };
}
function getCpuUsage(): number {
  try {
    const cpusCount = cpus().length;
    const load1 = loadavg()[0];
    if (cpusCount > 0 && load1 > 0) {
      return Math.min(Math.round((load1 / cpusCount) * 100), 100);
    }
  } catch {
  }
  return 0;
}
function getProcessCount(): number {
  try {
    const output = execSync('ps aux --no-headers | wc -l', { encoding: 'utf-8', timeout: 3000 });
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}
function getBootTime(): string {
  try {
    const output = execSync("uptime -s", { encoding: 'utf-8', timeout: 3000 });
    return output.trim();
  } catch {
    const bootMs = Date.now() - uptime() * 1000;
    return new Date(bootMs).toISOString();
  }
}
function getCpuSpeedFromProc(): number {
  try {
    const output = execSync('cat /proc/cpuinfo | grep "cpu MHz" | head -1', { encoding: 'utf-8', timeout: 2000 });
    const match = output.match(/cpu MHz\s+:\s+([\d.]+)/);
    if (match) return Math.round(parseFloat(match[1]) * 100) / 100;
  } catch {
  }
  return 0;
}
function getCpuModelFromProc(): string {
  try {
    const output = execSync('cat /proc/cpuinfo | grep "model name" | head -1', { encoding: 'utf-8', timeout: 2000 });
    const match = output.match(/model name\s+:\s+(.+)/);
    if (match) return match[1].trim();
  } catch {
  }
  return 'Unknown CPU';
}
function getNetworkInfo(): { interface: string; ipv4: string; ipv6: string; rxBytes: number; txBytes: number; rxSpeed: number; txSpeed: number; rateAvailable: boolean; packetLossPercent: number; latencyMs: number; packetLossAvailable: boolean; latencyAvailable: boolean } {
  try {
    const nets = networkInterfaces();
    const results: { interface: string; ipv4: string; ipv6: string; rxBytes: number; txBytes: number; rxSpeed: number; txSpeed: number; rateAvailable: boolean; packetLossPercent: number; latencyMs: number; packetLossAvailable: boolean; latencyAvailable: boolean } = { interface: '', ipv4: '', ipv6: '', rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0, rateAvailable: false, packetLossPercent: 0, latencyMs: 0, packetLossAvailable: false, latencyAvailable: false };
    let bestCandidate = { name: '', ipv4: '', ipv6: '', score: -1 };
    for (const [name, netList] of Object.entries(nets)) {
      if (!netList) continue;
      for (const net of netList) {
        if (net.internal) continue;
        let score = 0;
        if (/^(ens|eth|enp)[0-9]/.test(name)) score = 10;
        else if (/^br-/.test(name)) score = 1; 
        else if (/^docker/.test(name)) score = 0;
        else score = 5;
        if (net.family === 'IPv4' && score > bestCandidate.score) {
          bestCandidate = { name, ipv4: net.address, ipv6: bestCandidate.ipv6, score };
        }
        if (net.family === 'IPv6' && score >= bestCandidate.score && !bestCandidate.ipv6) {
          bestCandidate.ipv6 = net.address;
        }
      }
    }
    results.interface = bestCandidate.name;
    results.ipv4 = bestCandidate.ipv4;
    results.ipv6 = bestCandidate.ipv6;
    const speed = computeNetworkSpeed(results);
    results.rxSpeed = speed.rxSpeed;
    results.txSpeed = speed.txSpeed;
    results.rateAvailable = speed.rateAvailable;
    try {
      const netDev = execSync('cat /proc/net/dev | tail -n +3', { encoding: 'utf-8', timeout: 2000 });
      const lines = netDev.trim().split('\n');
      for (const line of lines) {
        const iface = line.trim().split(':')[0].trim();
        if (iface === results.interface) {
          const afterColon = line.substring(line.indexOf(':') + 1).trim().split(/\s+/);
          if (afterColon.length >= 9) {
            results.rxBytes = parseInt(afterColon[0]) || 0;
            results.txBytes = parseInt(afterColon[8]) || 0;
          }
          break;
        }
      }
    } catch {
    }
    return results;
  } catch {
    return { interface: 'eth0', ipv4: '127.0.0.1', ipv6: '::1', rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0, rateAvailable: false, packetLossPercent: 0, latencyMs: 0, packetLossAvailable: false, latencyAvailable: false };
  }
}
let prevNetReading = { rxBytes: 0, txBytes: 0, timestamp: 0 };
function computeNetworkSpeed(current: { rxBytes: number; txBytes: number }): { rxSpeed: number; txSpeed: number; rateAvailable: boolean } {
  const now = Date.now();
  if (prevNetReading.timestamp === 0) {
    prevNetReading = { rxBytes: current.rxBytes, txBytes: current.txBytes, timestamp: now };
    return { rxSpeed: 0, txSpeed: 0, rateAvailable: false };
  }
  const dtSec = (now - prevNetReading.timestamp) / 1000;
  if (dtSec <= 0) return { rxSpeed: 0, txSpeed: 0, rateAvailable: false };
  const dRx = current.rxBytes - prevNetReading.rxBytes;
  const dTx = current.txBytes - prevNetReading.txBytes;
  prevNetReading = { rxBytes: current.rxBytes, txBytes: current.txBytes, timestamp: now };
  return {
    rxSpeed: Math.max(0, Math.round((dRx / (1024 * 1024)) / dtSec * 100) / 100),
    txSpeed: Math.max(0, Math.round((dTx / (1024 * 1024)) / dtSec * 100) / 100),
    rateAvailable: true,
  };
}
export function collectSystemMetrics(): SystemData {
  const hostSnapshot = readHostSnapshot();
  if (hostSnapshot) return hostSnapshot;
  const cpusList = cpus();
  const cpu = cpusList.length > 0 ? cpusList[0] : null;
  const totalMem = totalmem();
  const freeMem = freemem();
  const usedMem = totalMem - freeMem;
  const totalMB = bytesToMB(totalMem);
  const usedMB = bytesToMB(usedMem);
  const disk = getDiskUsage();
  const load = loadavg();
  const net = getNetworkInfo();
  const seconds = uptime();
  const procCount = getProcessCount();
  const bootTime = getBootTime();
  return {
    hostname: hostname(),
    os: `${type()} ${release()}`,
    platform: platform(),
    release: release(),
    architecture: process.arch,
    virtualization: 'unknown',
    filesystem: 'unknown',
    uptimeSeconds: seconds,
    uptimeFormatted: formatUptime(seconds),
    diskTopDirectories: [],
    cpuModel: cpu ? cpu.model.trim() : getCpuModelFromProc(),
    cpuCores: cpusList.length,
    cpuSpeed: cpu && cpu.speed > 0 ? cpu.speed : getCpuSpeedFromProc(),
    cpuUsagePercent: getCpuUsage(),
    loadAverage1m: Math.round(load[0] * 100) / 100,
    loadAverage5m: Math.round(load[1] * 100) / 100,
    loadAverage15m: Math.round(load[2] * 100) / 100,
    totalRamMB: totalMB,
    usedRamMB: usedMB,
    freeRamMB: bytesToMB(freeMem),
    ramUsagePercent: totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0,
    swapTotalMB: 0,
    swapUsedMB: 0,
    totalDiskMB: disk.totalMB,
    usedDiskMB: disk.usedMB,
    freeDiskMB: disk.freeMB,
    diskUsagePercent: disk.usagePercent,
    diskReadBps: 0,
    diskWriteBps: 0,
    diskIoAvailable: false,
    inodeUsagePercent: 0,
    inodeUsageAvailable: false,
    bootTime,
    agentVersion: '1.0.0',
    network: net,
    networkInterfaces: [],
    processes: procCount,
    services: {},
    serviceDetails: [],
    docker: emptyDockerSnapshot(),
  };
}
