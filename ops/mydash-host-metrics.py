#!/usr/bin/env python3
import json
import os
import re
import shutil
import socket
import subprocess
import tempfile
import time
from datetime import datetime
from pathlib import Path

OUTPUT = Path('/run/mydash-host-metrics/metrics.json')
PREVIOUS_NETWORK = Path('/run/mydash-host-metrics/network-previous.json')
PREVIOUS_DISK = Path('/run/mydash-host-metrics/disk-previous.json')

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
    ping_output = command(['ping', '-n', '-c', '1', '-W', '1', '1.1.1.1'])
    latency_match = re.search(r'time[=<]([0-9.]+)\s*ms', ping_output)
    latency_ms = round(float(latency_match.group(1)), 2) if latency_match else 0
    latency_available = latency_match is not None
    return {'interface': interface, 'ipv4': ipv4, 'ipv6': None, 'rxBytes': rx_bytes, 'txBytes': tx_bytes, 'rxSpeed': rx_speed, 'txSpeed': tx_speed, 'rateAvailable': rate_available, 'packetLossPercent': 0 if latency_available else 100, 'latencyMs': latency_ms, 'packetLossAvailable': latency_available, 'latencyAvailable': latency_available}

def disk_io_info():
    source = command(['findmnt', '-n', '-o', 'SOURCE', '/'])
    device = re.sub(r'\d+$', '', source.rsplit('/', 1)[-1])
    if not device:
        return {'readBps': 0, 'writeBps': 0, 'available': False}
    stats = {}
    for line in Path('/proc/diskstats').read_text().splitlines():
        fields = line.split()
        if len(fields) >= 14 and fields[2] == device:
            stats = {'readSectors': finite(fields[5], 0), 'writeSectors': finite(fields[9], 0)}
            break
    if not stats:
        return {'readBps': 0, 'writeBps': 0, 'available': False}
    now = time.time()
    previous = None
    try:
        previous = json.loads(PREVIOUS_DISK.read_text())
    except Exception:
        previous = None
    read_bps = 0
    write_bps = 0
    available = False
    if isinstance(previous, dict) and previous.get('device') == device:
        elapsed = now - finite(previous.get('timestamp'), now)
        if elapsed > 0:
            read_bps = max(0, (stats['readSectors'] - finite(previous.get('readSectors'), stats['readSectors'])) * 512 / elapsed)
            write_bps = max(0, (stats['writeSectors'] - finite(previous.get('writeSectors'), stats['writeSectors'])) * 512 / elapsed)
            available = True
    temporary_previous = PREVIOUS_DISK.with_suffix('.tmp')
    temporary_previous.write_text(json.dumps({'device': device, **stats, 'timestamp': now}))
    os.replace(temporary_previous, PREVIOUS_DISK)
    return {'readBps': round(read_bps, 2), 'writeBps': round(write_bps, 2), 'available': available}

SERVICE_NAMES = ['nginx', 'wings', 'pteroq', 'docker']

def parse_size(value):
    match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(B|KiB|MiB|GiB|TiB|KB|MB|GB|TB)', value or '', re.IGNORECASE)
    if not match:
        return 0
    number = float(match.group(1))
    unit = match.group(2).lower()
    multipliers = {'b': 1, 'kib': 1024, 'mib': 1048576, 'gib': 1073741824, 'tib': 1099511627776, 'kb': 1000, 'mb': 1000000, 'gb': 1000000000, 'tb': 1000000000000}
    return int(number * multipliers.get(unit, 1))

def parse_percent(value):
    result = finite(str(value).replace('%', '').strip())
    return max(0, min(100, result or 0))

def docker_started_seconds(value):
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return max(0, int(time.time() - parsed.timestamp()))
    except Exception:
        return 0

def docker_snapshot(total_ram_mb):
    empty = {'containers': [], 'images': [], 'volumes': [], 'networks': [], 'totalCpu': 0, 'totalMemory': 0, 'containerCount': 0, 'runningCount': 0, 'stoppedCount': 0, 'health': 'unavailable'}
    if not command(['docker', 'version', '--format', '{{.Server.Version}}']):
        return empty
    ps_lines = command(['docker', 'ps', '-a', '--format', '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.State}}\t{{.Ports}}']).splitlines()
    stats_lines = command(['docker', 'stats', '--no-stream', '--format', '{{.ID}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}']).splitlines()
    stats = {}
    for line in stats_lines:
        parts = line.split('\t')
        if len(parts) >= 4:
            stats[parts[0]] = {'cpu': parse_percent(parts[1]), 'memory': parse_size(parts[2].split('/', 1)[0]), 'memoryPercent': parse_percent(parts[3])}
    inspect_format = '{{.Id}}\t{{.Created}}\t{{.State.StartedAt}}\t{{.RestartCount}}\t{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}'
    container_ids = [line.split('\t', 1)[0] for line in ps_lines if line]
    inspect_lines = command(['docker', 'inspect', '--format', inspect_format, *container_ids]).splitlines() if container_ids else []
    inspected_by_id = {parts[0]: parts[1:] for parts in (line.split('\t') for line in inspect_lines) if len(parts) >= 5}
    containers = []
    for line in ps_lines:
        parts = line.split('\t', 4)
        if len(parts) < 5:
            continue
        container_id, name, image, status, ports = parts
        inspected = inspected_by_id.get(container_id, [])
        created = inspected[0] if len(inspected) > 0 else ''
        started_at = inspected[1] if len(inspected) > 1 else ''
        restart_count = int(finite(inspected[2]) or 0) if len(inspected) > 2 else 0
        health_status = inspected[3] if len(inspected) > 3 else 'none'
        stat = stats.get(container_id, {'cpu': 0, 'memory': 0, 'memoryPercent': 0})
        containers.append({'id': container_id, 'name': name, 'image': image, 'status': status.lower(), 'cpuPercent': stat['cpu'], 'memoryPercent': stat['memoryPercent'], 'memoryBytes': stat['memory'], 'ports': ports or 'none', 'restartCount': restart_count, 'created': created, 'startedAt': started_at, 'healthStatus': health_status, 'uptimeSeconds': docker_started_seconds(started_at)})
    image_lines = command(['docker', 'images', '--format', '{{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}']).splitlines()
    images = []
    for line in image_lines:
        parts = line.split('\t', 4)
        if len(parts) < 5:
            continue
        images.append({'id': parts[0], 'repository': parts[1], 'tag': parts[2], 'size': parse_size(parts[3]), 'created': parts[4]})
    volume_lines = command(['docker', 'volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}']).splitlines()
    volumes = []
    for line in volume_lines:
        parts = line.split('\t', 1)
        if len(parts) == 2:
            mount = command(['docker', 'volume', 'inspect', '--format', '{{.Mountpoint}}', parts[0]])
            size_text = command(['du', '-sb', mount]) if mount.startswith('/var/lib/docker/volumes/') else ''
            size_parts = size_text.split()
            size = int(finite(size_parts[0]) or 0) if size_parts else None
            volumes.append({'name': parts[0], 'driver': parts[1], 'mountPoint': mount, 'size': size, 'status': 'available'})
    network_lines = command(['docker', 'network', 'ls', '--format', '{{.ID}}\t{{.Name}}\t{{.Driver}}']).splitlines()
    networks = []
    for line in network_lines:
        parts = line.split('\t', 2)
        if len(parts) < 3:
            continue
        inspect = command(['docker', 'network', 'inspect', '--format', '{{range .IPAM.Config}}{{.Subnet}}{{end}}\t{{len .Containers}}', parts[0]]).split('\t')
        networks.append({'name': parts[1], 'driver': parts[2], 'subnet': inspect[0] if inspect and inspect[0] else 'none', 'containers': int(finite(inspect[1]) or 0) if len(inspect) > 1 else 0})
    running = sum(1 for item in containers if item['status'] == 'running')
    used_memory = sum(item['memoryBytes'] for item in containers)
    host_memory = max(1, int(total_ram_mb or 0) * 1048576)
    unhealthy = any(item['healthStatus'] == 'unhealthy' for item in containers)
    health = 'unhealthy' if unhealthy else 'healthy'
    return {'containers': containers[:128], 'images': images[:128], 'volumes': volumes[:128], 'networks': networks[:128], 'totalCpu': round(sum(item['cpuPercent'] for item in containers), 2), 'totalMemory': round(used_memory / host_memory * 100, 2), 'containerCount': len(containers), 'runningCount': running, 'stoppedCount': max(0, len(containers) - running), 'health': health}

def process_metrics(service_name):
    pid_text = command(['systemctl', 'show', service_name, '--property=MainPID', '--value'])
    pid = int(finite(pid_text) or 0)
    if pid <= 0:
        return {'cpuPercent': 0, 'memoryBytes': 0, 'uptimeSeconds': 0, 'ports': []}
    values = command(['ps', '-p', str(pid), '-o', 'pcpu=,rss=,etimes=']).split()
    cpu = float(finite(values[0]) or 0) if len(values) > 0 else 0
    memory = int(finite(values[1]) or 0) * 1024 if len(values) > 1 else 0
    uptime_seconds = int(finite(values[2]) or 0) if len(values) > 2 else 0
    ports = []
    for line in command(['ss', '-ltnpH']).splitlines():
        if f'pid={pid},' not in line:
            continue
        local = line.split()[3]
        port = local.rsplit(':', 1)[-1]
        if port.isdigit():
            ports.append(int(port))
    return {'cpuPercent': max(0, min(100, cpu)), 'memoryBytes': max(0, memory), 'uptimeSeconds': max(0, uptime_seconds), 'ports': sorted(set(ports))[:8]}

def service_states(docker_data):
    states = {}
    details = []
    observed_at = time.time()
    for name in SERVICE_NAMES:
        active = command(['systemctl', 'is-active', name]) or 'unknown'
        enabled = command(['systemctl', 'is-enabled', name]) or 'unknown'
        metrics = process_metrics(name)
        states[name] = active
        details.append({'name': name, 'activeState': active, 'enabledState': enabled, 'observedAt': observed_at, **metrics})
    for container in docker_data['containers']:
        name = container['name']
        state = 'active' if container['status'] == 'running' else container['status']
        states[name] = state
        port_values = [int(value) for value in re.findall(r'0\.0\.0\.0:(\d+)->', container['ports'])]
        details.append({'name': name, 'activeState': state, 'enabledState': 'container', 'observedAt': observed_at, 'cpuPercent': container['cpuPercent'], 'memoryBytes': container['memoryBytes'], 'uptimeSeconds': container.get('uptimeSeconds', 0), 'ports': sorted(set(port_values))[:8]})
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

def inode_usage():
    output = command(['df', '-Pi', '/'])
    rows = output.splitlines()
    if len(rows) < 2:
        return {'percent': 0, 'available': False}
    fields = rows[1].split()
    if len(fields) < 6 or not fields[4].endswith('%') or fields[4] == '-':
        return {'percent': 0, 'available': False}
    value = finite(fields[4].rstrip('%'))
    return {'percent': max(0, min(100, value or 0)), 'available': value is not None}


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
    inode = inode_usage()
    swap = swap_info()
    boot = command(['uptime', '-s']) or None
    uptime_text = command(['uptime', '-p']) or None
    load = os.getloadavg()
    uptime_seconds = finite(command(['cat', '/proc/uptime']).split()[0] if command(['cat', '/proc/uptime']) else None)
    docker_data = docker_snapshot(memory['totalMB'] if memory else 0)
    disk_io = disk_io_info()
    services, service_details = service_states(docker_data)
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
        'inodeUsagePercent': inode['percent'],
        'inodeUsageAvailable': inode['available'],
        'diskReadBps': disk_io['readBps'],
        'diskWriteBps': disk_io['writeBps'],
        'diskIoAvailable': disk_io['available'],
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
        'docker': docker_data,
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
