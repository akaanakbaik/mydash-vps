import { hostname, type, release, platform, uptime, cpus, totalmem, freemem, loadavg, networkInterfaces } from 'os';
import { execSync } from 'child_process';
export interface SystemData {
  hostname: string;
  os: string;
  platform: string;
  release: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
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
  totalDiskMB: number;
  usedDiskMB: number;
  freeDiskMB: number;
  diskUsagePercent: number;
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
  };
  processes: number;
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
function getNetworkInfo(): { interface: string; ipv4: string; ipv6: string; rxBytes: number; txBytes: number; rxSpeed: number; txSpeed: number } {
  try {
    const nets = networkInterfaces();
    const results: { interface: string; ipv4: string; ipv6: string; rxBytes: number; txBytes: number; rxSpeed: number; txSpeed: number } = { interface: '', ipv4: '', ipv6: '', rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0 };
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
    return { interface: 'eth0', ipv4: '127.0.0.1', ipv6: '::1', rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0 };
  }
}
let prevNetReading = { rxBytes: 0, txBytes: 0, timestamp: 0 };
function computeNetworkSpeed(current: { rxBytes: number; txBytes: number }): { rxSpeed: number; txSpeed: number } {
  const now = Date.now();
  if (prevNetReading.timestamp === 0) {
    prevNetReading = { rxBytes: current.rxBytes, txBytes: current.txBytes, timestamp: now };
    return { rxSpeed: 0, txSpeed: 0 };
  }
  const dtSec = (now - prevNetReading.timestamp) / 1000;
  if (dtSec <= 0) return { rxSpeed: 0, txSpeed: 0 };
  const dRx = current.rxBytes - prevNetReading.rxBytes;
  const dTx = current.txBytes - prevNetReading.txBytes;
  prevNetReading = { rxBytes: current.rxBytes, txBytes: current.txBytes, timestamp: now };
  return {
    rxSpeed: Math.max(0, Math.round((dRx / (1024 * 1024)) / dtSec * 100) / 100),
    txSpeed: Math.max(0, Math.round((dTx / (1024 * 1024)) / dtSec * 100) / 100),
  };
}
export function collectSystemMetrics(): SystemData {
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
    uptimeSeconds: seconds,
    uptimeFormatted: formatUptime(seconds),
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
    totalDiskMB: disk.totalMB,
    usedDiskMB: disk.usedMB,
    freeDiskMB: disk.freeMB,
    diskUsagePercent: disk.usagePercent,
    bootTime,
    agentVersion: '1.0.0',
    network: net,
    processes: procCount,
  };
}
