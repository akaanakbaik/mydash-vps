# MyDash VPS

**MyDash VPS** adalah dashboard self-hosted untuk memantau VPS secara nyata melalui host agent, backend Express, PostgreSQL, Redis, dan WebSocket. Fokus project ini adalah observability yang transparan: data yang tidak tersedia ditampilkan sebagai `Unavailable`, bukan diisi nol atau nilai simulasi.

| Status | Detail |
| --- | --- |
| Runtime | Bun 1.3.14 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query |
| Backend | Express 5, TypeScript, Drizzle ORM |
| Persistence | PostgreSQL dan Redis |
| Realtime | WebSocket dengan event bus dan cache synchronization |
| Deployment | Docker Compose |
| License | MIT |

## Fitur utama

MyDash menyediakan Overview, Monitoring, Analytics, Health Score, Observability, Notifications, Logs, Servers, Security, Settings, Tunnel, Backup, Docker, Automation, GitHub, Roles, dan Sessions. Halaman Observability menggabungkan event timeline, disk analyzer, service monitor, health score explainability, perbandingan periode, network analytics, serta uptime dan availability history.

Antarmuka menggunakan **modern dark skeuomorphism** dengan surface berlapis, inset well, focus ring, ambient background, dan depth yang terukur. Tema **light white** tersedia melalui tombol tema dan disimpan di browser. Bootstrap tema dijalankan sebelum React mount agar tidak terjadi flash warna saat halaman pertama dibuka.

Sistem notifikasi mendukung unread activity yang tersimpan lokal secara bounded, badge unread, mark-all-read, toast deduplication, severity, auto-dismiss, pause-on-hover, progress indicator, action button, keyboard focus, dan toast yang dipicu oleh event realtime yang relevan. Event dengan frekuensi tinggi seperti metric ingestion tidak dikirim sebagai toast agar tidak menyebabkan spam.

## Data host dan batasan keamanan

Host agent systemd mengumpulkan hostname, OS, distro, kernel, arsitektur, virtualisasi, filesystem, CPU, RAM, swap, disk, interface network, throughput berbasis delta counter, uptime, serta status service. Snapshot ditulis atomik ke `/run/mydash-host-metrics/metrics.json` dan dibaca backend melalui dedicated directory bind mount read-only.

Backend tidak memerlukan Docker socket dan tidak memasang root filesystem host. Karena batasan tersebut, detail per-container seperti CPU, RAM, port, dan uptime container dapat berstatus `Unavailable`. Hal ini disengaja untuk menjaga security boundary dan mencegah dashboard menampilkan data yang tidak benar.

## Instalasi melalui curl

Perintah berikut menjalankan preflight tanpa mengubah sistem:

```bash
curl -fsSL https://testingmyvpsdash.akadev.me/install.sh | bash -s -- --check
```

Instalasi Docker Compose dijalankan dengan:

```bash
curl -fsSL https://testingmyvpsdash.akadev.me/install.sh | bash -s -- --install --yes
```

Parameter yang tersedia adalah `--check`, `--install`, `--yes`, `--dir PATH`, `--repo URL`, `--branch NAME`, dan `--port NUMBER`. Installer memeriksa OS, versi, kernel, arsitektur, CPU, virtualisasi, filesystem, disk, memory, swap, firewall, Docker, Compose, Git, dan konflik port. Installer tidak memasang Docker Engine, Docker Desktop, atau package OS secara otomatis; pengguna harus memasang dan menjalankan prerequisite tersebut terlebih dahulu.

Untuk Windows PowerShell:

```powershell
irm https://testingmyvpsdash.akadev.me/install.ps1 | iex
```

Untuk eksekusi install PowerShell setelah preflight, gunakan script lokal dengan `-Mode install -Yes`. macOS dan Linux memakai Bash installer setelah Docker Engine atau Docker Desktop dengan Compose tersedia. Dukungan aktual bergantung pada arsitektur, versi Docker, permission user, firewall, jaringan, dan konfigurasi host.

## Development

```bash
git clone https://github.com/akaanakbaik/mydash-vps.git
cd mydash-vps
bun install --frozen-lockfile
bun run --cwd packages/shared build
bun run --cwd packages/backend typecheck
bun run --cwd packages/frontend build
bunx vitest run --reporter=dot
```

Docker Compose menjalankan service production-like:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

## Quality gates

GitHub Actions menjalankan lint, shared/backend/frontend typecheck, build setiap package, suite Vitest, validasi `bash -n`, smoke test `--help`, dan preflight installer. Vitest memakai Node untuk test backend dan jsdom hanya untuk test React TSX. Pipeline tidak menonaktifkan test yang gagal dan tidak mengubah health score agar terlihat lebih baik.

## API penting

| Endpoint | Auth | Tujuan |
| --- | --- | --- |
| `/health` | Tidak | Health endpoint service |
| `/ready` | Tidak | Readiness endpoint |
| `/live` | Tidak | Liveness endpoint |
| `/api/v1/dashboard` | JWT | Overview dan ringkasan host |
| `/api/v1/monitoring` | JWT | Metric timeline dan current system data |
| `/api/v1/observability` | JWT | Tujuh modul monitoring detail |
| `/api/v1/logs` | JWT | System logs nyata |
| `/api/v1/notifications` | JWT | Notification summary dan activity |
| `/api/v1/health` | JWT | Health score dan history |
| `/ws` | JWT | Event realtime |

## Repository layout

| Path | Tanggung jawab |
| --- | --- |
| `packages/frontend` | React UI, theme, routing, query hooks, responsive components |
| `packages/backend` | API, use cases, repositories, health logic, monitoring routes |
| `packages/shared` | Shared types dan domain contracts |
| `ops` | Host agent dan systemd service/timer |
| `docs` | Dokumentasi arsitektur dan operasional |
| `.github/workflows` | Quality gates dan CI |

## Tema dan performa

Tema global memakai design token HSL sehingga dark dan light berbagi struktur warna yang sama. Card hanya menggunakan transform, border, opacity, dan shadow pada hover agar tidak menyebabkan layout reflow. Route transition memakai progress bar non-blocking. Polling notification berhenti ketika tab tidak visible. Query cache memakai stale window, garbage collection, structural sharing, serta retry terbatas untuk menghindari request berulang yang tidak berguna.

Mobile layout mempertahankan min-width viewport 320px, touch target minimum, local horizontal scroll untuk data surface, body scroll lock ketika drawer terbuka, Escape untuk menutup drawer, overlay yang accessible, focus return, dan ukuran panel yang dibatasi terhadap viewport.

## Security

MyDash memakai JWT, bcrypt, Helmet, CORS configuration, rate limiting, parameterized Drizzle queries, workspace-aware data access, read-only host snapshot, dan tidak memasang Docker socket. Jangan menaruh secret Telegram, JWT, database password, atau tunnel token ke repository, screenshot, issue, log publik, atau commit.

## License

MyDash dirilis dengan lisensi MIT. Lihat [`LICENSE`](LICENSE). Logo distro pihak ketiga memiliki aturan trademark dan sumber masing-masing; manifest aset visual disimpan terpisah di direktori asset terkait.

## Maintainer

Project ini dikelola oleh **akaanakbaik** dari Indonesia. Repository: [github.com/akaanakbaik/mydash-vps](https://github.com/akaanakbaik/mydash-vps).
