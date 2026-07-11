<div align="center">
  <h1>My Dash VPS</h1>
  <p><strong>Self-hosted VPS Management Dashboard</strong></p>

  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps">
      <img src="https://img.shields.io/badge/GitHub-akaanakbaik%2Fmydash--vps-181717?logo=github" alt="GitHub" />
    </a>
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Bun-1.3-FBBF24?logo=bun" alt="Bun" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build" />
    <br/>
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/WebSocket-010101?logo=socket.io" alt="WebSocket" />
    <img src="https://img.shields.io/badge/Ngrok-tunnel-1F1E1F?logo=ngrok" alt="Ngrok" />
    <img src="https://img.shields.io/badge/mobile--friendly-responsive-00C853" alt="Mobile Friendly" />
  </p>

  <br/>

  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps"><strong>View on GitHub</strong></a>
    &middot;
    <a href="https://t.me/akamodebaik"><strong>Contact Developer</strong></a>
    &middot;
    <a href="https://akadev.me"><strong>Portfolio</strong></a>
  </p>
</div>

---

## Overview

My Dash is a modern, self-hosted VPS management dashboard built with Clean Architecture principles. Monitor your servers in real-time, automate workflows, receive notifications, analyze metrics, and manage your infrastructure from one beautiful, responsive dashboard.

**Developer:** Aka &mdash; Sumatera Barat, Indonesia
**Contact:** [t.me/akamodebaik](https://t.me/akamodebaik)
**Portfolio:** [akadev.me](https://akadev.me)

---

## Features

| Category | Features |
|----------|----------|
| **Monitoring** | Real-time CPU, RAM, Disk, Network metrics with live WebSocket updates. 24-hour timeline with 1-minute granularity. System health scoring engine. |
| **Analytics** | Trend analysis, anomaly detection, statistical summaries, resource efficiency scoring, forward-looking predictions. |
| **Notifications** | Multi-channel delivery via Telegram and WhatsApp. Template engine, deduplication, rate limiting, retry with backoff. |
| **Automation** | Trigger-condition-action workflow engine. Scheduled automation with cron support. Execution history with detailed logs. |
| **Backup** | Automated database backups with configurable schedules. Retention policies. One-click restore. |
| **Docker** | Container monitoring, management, and lifecycle controls. Real-time container stats. |
| **Tunnel** | Ngrok tunnel management with automatic failover and status monitoring. |
| **GitHub** | Repository management, deployment hooks, and integration controls. |
| **Security** | Brute force detection, threat monitoring, security event tracking. |
| **Audit** | Complete history of all system operations with search and filtering. |
| **Roles and Users** | Role-based access control with granular permissions. User management with workspace isolation. |
| **AI Assistant** | Optional AI-powered analysis for intelligent recommendations and insights. |
| **Quick Search** | Ctrl+K to instantly search and navigate to any page. |
| **Mobile Friendly** | Fully responsive design. Touch-friendly interactions on all screen sizes. |
| **Dark/Light** | Full dark and light theme support with smooth transitions. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS 4, Vite 6, Zustand 5, TanStack React Query 5, React Router 7 |
| Backend | Express 5, TypeScript 5.8 |
| Database | PostgreSQL 16, Drizzle ORM 0.45 |
| Cache and Queue | Redis 7 (pub/sub, streams, locks, presence) |
| Realtime | WebSocket (ws) with event-driven architecture |
| Auth | JWT (jose) with bcrypt password hashing |
| Monitoring | Built-in collectors (CPU, RAM, Disk, Network, Docker, Tunnel) |
| Notifications | Telegram (grammy), WhatsApp (Baileys) |
| Container | Docker with docker-compose |
| Runtime | **Bun 1.3** &mdash; fast all-in-one JS runtime |
| Testing | Vitest 4 |
| Linting | ESLint 9, Prettier 3 |

---

## Quick Start

### Prerequisites

- **Bun >= 1.3** &mdash; install: `curl -fsSL https://bun.sh/install | bash`
- PostgreSQL >= 16 (optional &mdash; auto-detected, falls back to SQLite)
- Redis >= 7 (optional &mdash; auto-detected, runs without cache)
- Docker (optional, for containerized dependencies)

### One-Click Setup

```bash
git clone https://github.com/akaanakbaik/mydash-vps.git
cd mydash-vps
bash start.sh
```

The installer will:
1. Check for Bun &mdash; if missing, asks to install automatically
2. Detect your system (OS, architecture, virtualization, resources)
3. Check port availability &mdash; auto-assigns free ports
4. Detect running PostgreSQL instances &mdash; checks fullness, falls back to SQLite
5. Detect Redis &mdash; runs without cache if unavailable
6. AI-optimize configuration based on available resources
7. Install dependencies, build all packages, run tests
8. Generate `.env` with secure random secrets
9. Start the backend server
10. Expose via ngrok/localtunnel (if available)

**Output:** Dashboard URL + admin login password.

### Development Mode

```bash
docker compose up -d postgres redis   # start dependencies
bun dev                                # run all packages in dev mode
```

Backend: `http://localhost:3000` &middot; Frontend Vite: `http://localhost:5173`

### Production Mode

```bash
bash start.sh
```

### Docker Deployment

```bash
docker compose up -d
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /health | GET | No | Health check |
| /ready | GET | No | Readiness check |
| /live | GET | No | Liveness check |
| /version | GET | No | Version info |
| /api/v1/auth/login | POST | No | Login with password |
| /api/v1/dashboard | GET | JWT | Dashboard overview data |
| /api/v1/servers | GET | JWT | Server list and status |
| /api/v1/monitoring | GET | JWT | Real-time monitoring metrics |
| /api/v1/analytics | GET | JWT | Analytics and trend data |
| /api/v1/notifications | GET | JWT | Notification management |
| /api/v1/automation | GET | JWT | Automation workflows |
| /api/v1/backup | GET | JWT | Backup management |
| /api/v1/docker | GET | JWT | Docker containers |
| /api/v1/tunnel | GET | JWT | Tunnel configuration |
| /api/v1/github | GET | JWT | GitHub integration |
| /api/v1/security | GET | JWT | Security events |
| /api/v1/audit | GET | JWT | Audit logs |
| /api/v1/settings | GET | JWT | System settings |
| /api/v1/profile | GET | JWT | User profile |
| /api/v1/sessions | GET | JWT | Active sessions |
| /api/v1/roles | GET | JWT | Role management |
| /api/v1/logs | GET | JWT | System logs |
| /api/v1/users | GET | JWT | User management |
| /ws | WS | JWT | Real-time WebSocket |

---

## Architecture

```
                             ┌──────────────┐
                             │   Frontend    │
                             │   React 19    │
                             │   Vite 6      │
                             └──────┬───────┘
                                    │ HTTP / WS
                             ┌──────▼───────┐
                             │   Backend     │
                             │   Express 5   │
                             │   Bun Runtime │
                             └──┬───────┬───┘
                                │       │
                    ┌───────────┘       └───────────┐
                    ▼                               ▼
             ┌──────────┐                    ┌──────────┐
             │PostgreSQL│                    │  Redis   │
             │  / SQLite │                    │  Cache   │
             └──────────┘                    └──────────┘
```

---

## Security

- JWT-based authentication with configurable expiry and token rotation
- Role-based access control with granular workspace permissions
- bcrypt password hashing (cost factor 12)
- HTTP security headers via Helmet.js (HSTS, frameguard, referrer policy)
- Configurable CORS origin whitelist
- Rate limiting on all API routes
- SQL injection protection via Drizzle ORM parameterized queries

---

## License

MIT License &mdash; see LICENSE file for details.

---

<div align="center">
  <p><strong>My Dash</strong> &mdash; Built for the self-hosting community</p>
  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps">GitHub</a>
    &middot;
    <a href="https://t.me/akamodebaik">Telegram</a>
    &middot;
    <a href="https://akadev.me">Portfolio</a>
  </p>
  <p>Developer: Aka &mdash; Sumatera Barat, Indonesia</p>
</div>
