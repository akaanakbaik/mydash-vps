param(
  [ValidateSet('check','install')]
  [string]$Mode = 'check',
  [string]$InstallDir = "$PWD\mydash-vps",
  [string]$Repo = 'https://github.com/akaanakbaik/mydash-vps.git',
  [string]$Branch = 'main',
  [ValidateRange(1,65535)]
  [int]$Port = 4300,
  [switch]$Yes
)
$ErrorActionPreference = 'Stop'
function Get-ValueOrNA([object]$Value) {
  if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) { return 'Not available' }
  return [string]$Value
}
function Get-CommandStatus([string]$Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}
function Stop-WithMessage([string]$Message, [int]$Code = 1) {
  Write-Error $Message
  exit $Code
}
$os = Get-CimInstance Win32_OperatingSystem
$computer = Get-CimInstance Win32_ComputerSystem
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$dockerReady = Get-CommandStatus 'docker'
$composeReady = $false
if ($dockerReady) { $composeReady = ((docker compose version 2>$null) -match 'Docker Compose') }
$dockerState = if (-not $dockerReady) { 'missing' } elseif (-not (docker info 2>$null)) { 'installed-but-not-running' } else { 'ready' }
$portInUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
Write-Output 'MyDash preflight scan'
[ordered]@{
  OS = $os.Caption
  'OS version' = $os.Version
  Kernel = $os.BuildNumber
  Architecture = $computer.SystemType
  'CPU cores' = $computer.NumberOfLogicalProcessors
  Virtualization = if ($computer.HypervisorPresent) { 'hypervisor-present' } else { 'unknown' }
  Filesystem = $disk.FileSystem
  'Disk total' = if ($disk.Size) { '{0:N1} GB' -f ($disk.Size / 1GB) } else { 'Not available' }
  'Disk used' = if ($disk.Size) { '{0:N1} GB' -f (($disk.Size - $disk.FreeSpace) / 1GB) } else { 'Not available' }
  'Disk available' = if ($disk.FreeSpace) { '{0:N1} GB' -f ($disk.FreeSpace / 1GB) } else { 'Not available' }
  'Disk usage' = if ($disk.Size) { '{0:N1}%' -f ((1 - ($disk.FreeSpace / $disk.Size)) * 100) } else { 'Not available' }
  Memory = if ($computer.TotalPhysicalMemory) { '{0:N1} GB' -f ($computer.TotalPhysicalMemory / 1GB) } else { 'Not available' }
  Firewall = (Get-NetFirewallProfile | Where-Object Enabled | ForEach-Object Name) -join ', '
  Docker = $dockerState
  Compose = if ($composeReady) { 'docker compose v2' } else { 'missing' }
  "Port $Port" = if ($null -ne $portInUse) { 'in-use' } else { 'available' }
}.GetEnumerator() | ForEach-Object { '{0,-22} {1}' -f $_.Key, (Get-ValueOrNA $_.Value) }
if ($Mode -eq 'check') {
  if ($dockerState -eq 'ready' -and $composeReady) { Write-Output 'Result: compatible for Docker Compose deployment.' } else { Write-Output 'Result: scan completed. Install and start Docker Desktop with Compose v2 before -Mode install.' }
  exit 0
}
$dockerState -eq 'ready' -or (Stop-WithMessage 'Docker Desktop is required and must be running. No package changes were made.' 3)
$composeReady -or (Stop-WithMessage 'Docker Compose v2 is required. No package changes were made.' 3)
(Get-CommandStatus 'git') -or (Stop-WithMessage 'Git is required for repository synchronization.' 3)
if ($null -ne $portInUse -and -not $Yes) {
  $answer = Read-Host "Port $Port is in use. Continue without changing the listener? [y/N]"
  if ($answer -ne 'y') { exit 4 }
}
$parent = Split-Path -Parent $InstallDir
New-Item -ItemType Directory -Force -Path $parent | Out-Null
if (Test-Path (Join-Path $InstallDir '.git')) {
  Write-Output 'Synchronizing existing checkout.'
  git -C $InstallDir fetch --depth=1 origin $Branch
  git -C $InstallDir checkout $Branch
  git -C $InstallDir reset --hard "origin/$Branch"
} elseif (Test-Path $InstallDir) {
  Stop-WithMessage "Install directory exists and is not a git checkout: $InstallDir" 5
} else {
  Write-Output 'Cloning MyDash repository.'
  git clone --depth=1 --branch $Branch $Repo $InstallDir
}
Set-Location $InstallDir
Test-Path 'docker-compose.yml' -or (Stop-WithMessage 'docker-compose.yml was not found after repository sync.' 6)
if (-not (Test-Path '.env')) { if (Test-Path '.env.example') { Copy-Item '.env.example' '.env' } else { New-Item '.env' -ItemType File | Out-Null } }
$content = Get-Content '.env' -Raw
if ($content -match '(?m)^BACKEND_PORT=') { $content = [regex]::Replace($content, '(?m)^BACKEND_PORT=.*$', "BACKEND_PORT=$Port") } else { $content += "`nBACKEND_PORT=$Port`n" }
Set-Content '.env' $content -NoNewline
docker compose up -d --build
docker compose ps
Write-Output 'MyDash install completed.'
