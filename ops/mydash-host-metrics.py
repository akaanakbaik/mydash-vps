#!/usr/bin/env python3
import json
import os
import re
import shutil
import socket
import subprocess
import tempfile
import time
from pathlib import Path

OUTPUT = Path('/run/mydash-host-metrics/metrics.json')
PREVIOUS_NETWORK = Path('/run/mydash-host-metrics/network-previous.json')

def command(args):
    try:
        return subprocess.check_output(args, text=True, stderr=subprocess.DEVNULL, timeout=3).strip()
    except Exception:
        return ''

def finite(value, fallback=None):
    try:
        number = float(value)
        if number == number and abs(number) != float('inf'):
            return number
    except Exception:
        pass
    return fallback

def cpu_snapshot():
    def read():
        line = Path('/proc/stat').read_text().splitlines()[0].split()[1:]
        values = [int(item) for item in line]
        return values, sum(values)
    first, first_total = read()
    time.sleep(0.2)
    second, second_total = read()
    delta_total = second_total - first_total
    delta_idle = (second[3] + second[4]) - (first[3] + first[4])
    usage = 0 if delta_total <= 0 else max(0, min(100, round((1 - delta_idle / delta_total) * 100, 2)))
    return usage

def cpu_info():
    text = Path('/proc/cpuinfo').read_text()
    model_match = re.search(r'^model name\s*:\s*(.+)$', text, re.MULTILINE)
    mhz_values = [float(value) for value in re.findall(r'^cpu MHz\s*:\s*([\d.]+)$', text, re.MULTILINE)]
    cores = len(re.findall(r'^processor\s*:', text, re.MULTILINE))
    speed = round(sum(mhz_values) / len(mhz_values), 2) if mhz_values else None
    return model_match.group(1).strip() if model_match else None, cores or None, speed

def memory_info():
    values = {}
    for line in Path('/proc/meminfo').read_text().splitlines():
        parts = line.split()
        if len(parts) >= 2:
            values[parts[0].rstrip(':')] = int(parts[1]) * 1024
    total = values.get('MemTotal')
    available = values.get('MemAvailable')
    if total is None or available is None:
        return None
    used = max(0, total - available)
    return {'totalMB': round(total / 1048576), 'usedMB': round(used / 1048576), 'freeMB': round(available / 1048576), 'usagePercent': round(used / total * 100, 2)}

def interface_name():
    route = command(['ip', 'route', 'get', '1.1.1.1'])
    match = re.search(r'\bdev\s+(\S+)', route)
    return match.group(1) if match else 'ens3'

def network_info():
    interface = interface_name()
    address_text = command(['ip', '-4', '-o', 'addr', 'show', 'dev', interface])
    address_match = re.search(r'inet\s+(\d+\.\d+\.\d+\.\d+)', address_text)
    ipv4 = address_match.group(1) if address_match else None
    rx_bytes = 0
    tx_bytes = 0
    for line in Path('/proc/net/dev').read_text().splitlines():
        if ':' not in line:
            continue
        name, values = line.split(':', 1)
        if name.strip() == interface:
            fields = values.split()
            if len(fields) >= 9:
                rx_bytes = int(fields[0])
                tx_bytes = int(fields[8])
            break
    now = time.time()
    previous = None
    try:
        previous = json.loads(PREVIOUS_NETWORK.read_text())
    except Exception:
        previous = None
    rx_speed = None
    tx_speed = None
    rate_available = False
    if isinstance(previous, dict) and previous.get('interface') == interface:
        elapsed = now - finite(previous.get('timestamp'), now)
        previous_rx = finite(previous.get('rxBytes'))
        previous_tx = finite(previous.get('txBytes'))
        if elapsed > 0 and previous_rx is not None and previous_tx is not None:
            rx_speed = round(max(0, rx_bytes - previous_rx) / elapsed / 1048576, 3)
            tx_speed = round(max(0, tx_bytes - previous_tx) / elapsed / 1048576, 3)
            rate_available = True
    temporary_previous = PREVIOUS_NETWORK.with_suffix('.tmp')
    temporary_previous.write_text(json.dumps({'interface': interface, 'rxBytes': rx_bytes, 'txBytes': tx_bytes, 'timestamp': now}))
    os.replace(temporary_previous, PREVIOUS_NETWORK)
    return {'interface': interface, 'ipv4': ipv4, 'ipv6': None, 'rxBytes': rx_bytes, 'txBytes': tx_bytes, 'rxSpeed': rx_speed, 'txSpeed': tx_speed, 'rateAvailable': rate_available}

SERVICE_NAMES = ['nginx', 'wings', 'pteroq', 'docker', 'cloudflared-kafa-store2', 'mydash-vps-backend', 'mydash-vps-postgres', 'mydash-vps-redis', 'mydash-cloudflared']

def service_states():
    states = {}
    details = []
    for name in SERVICE_NAMES:
        active = command(['systemctl', 'is-active', name]) or 'unknown'
        enabled = command(['systemctl', 'is-enabled', name]) or 'unknown'
        states[name] = active
        details.append({'name': name, 'activeState': active, 'enabledState': enabled, 'observedAt': time.time()})
    return states, details

def disk_top_directories():
    entries = []
    for path in ['/var', '/usr', '/home', '/root', '/opt', '/srv', '/tmp']:
        output = command(['du', '-x', '-B1', '-s', path])
        parts = output.split(None, 1)
        if len(parts) != 2:
            continue
        size = finite(parts[0])
        measured_path = parts[1].strip()
        if size is None or measured_path != path:
            continue
        entries.append({'path': path, 'bytes': int(size)})
    entries.sort(key=lambda item: item['bytes'], reverse=True)
    return entries[:12]

def network_interfaces():
    entries = []
    for line in Path('/proc/net/dev').read_text().splitlines():
        if ':' not in line:
            continue
        name, values = line.split(':', 1)
        interface = name.strip()
        fields = values.split()
        if len(fields) < 9:
            continue
        entries.append({'name': interface, 'rxBytes': int(fields[0]), 'txBytes': int(fields[8])})
    return entries

def distro_name():
    values = {}
    for line in Path('/etc/os-release').read_text().splitlines():
        if '=' in line:
            key, value = line.split('=', 1)
            values[key] = value.strip().strip('"')
    return values.get('PRETTY_NAME') or values.get('NAME') or 'Unknown Linux'

def filesystem_name():
    output = command(['df', '-PT', '/'])
    rows = output.splitlines()
    if len(rows) > 1:
        fields = rows[1].split()
        if len(fields) >= 2:
            return fields[1]
    return None

def swap_info():
    values = {}
    for line in Path('/proc/meminfo').read_text().splitlines():
        parts = line.split()
        if len(parts) >= 2 and parts[0].rstrip(':') in ['SwapTotal', 'SwapFree']:
            values[parts[0].rstrip(':')] = int(parts[1]) * 1024
    total = values.get('SwapTotal', 0)
    free = values.get('SwapFree', 0)
    return {'totalMB': round(total / 1048576), 'usedMB': round(max(0, total - free) / 1048576)}

def snapshot():
    model, cores, speed = cpu_info()
    memory = memory_info()
    disk = shutil.disk_usage('/')
    swap = swap_info()
    boot = command(['uptime', '-s']) or None
    uptime_text = command(['uptime', '-p']) or None
    load = os.getloadavg()
    uptime_seconds = finite(command(['cat', '/proc/uptime']).split()[0] if command(['cat', '/proc/uptime']) else None)
    services, service_details = service_states()
    return {
        'hostname': socket.gethostname(),
        'os': distro_name(),
        'platform': 'linux',
        'release': os.uname().release,
        'architecture': os.uname().machine,
        'virtualization': command(['systemd-detect-virt']) or 'unknown',
        'filesystem': filesystem_name(),
        'cpuModel': model,
        'cpuCores': cores,
        'cpuSpeed': speed,
        'cpuUsagePercent': cpu_snapshot(),
        'loadAverage1m': round(load[0], 2),
        'loadAverage5m': round(load[1], 2),
        'loadAverage15m': round(load[2], 2),
        'totalRamMB': memory['totalMB'] if memory else None,
        'usedRamMB': memory['usedMB'] if memory else None,
        'freeRamMB': memory['freeMB'] if memory else None,
        'ramUsagePercent': memory['usagePercent'] if memory else None,
        'swapTotalMB': swap['totalMB'],
        'swapUsedMB': swap['usedMB'],
        'totalDiskMB': round(disk.total / 1048576),
        'usedDiskMB': round((disk.total - disk.free) / 1048576),
        'freeDiskMB': round(disk.free / 1048576),
        'diskUsagePercent': round((disk.total - disk.free) / disk.total * 100, 2) if disk.total else None,
        'bootTime': boot,
        'uptimeSeconds': uptime_seconds,
        'uptimeFormatted': uptime_text,
        'network': network_info(),
        'networkInterfaces': network_interfaces(),
        'diskTopDirectories': disk_top_directories(),
        'processes': len(list(Path('/proc').glob('[0-9]*'))),
        'services': services,
        'serviceDetails': service_details,
        'agentVersion': 'host-agent-1.0.0',
        'updatedAt': time.time(),
    }

def write_snapshot(data):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix='mydash-host-metrics-', dir=str(OUTPUT.parent))
    try:
        with os.fdopen(descriptor, 'w') as handle:
            json.dump(data, handle, separators=(',', ':'))
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, OUTPUT)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

write_snapshot(snapshot())
