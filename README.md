<div align="center">
  <h1>🚀 MyDash VPS</h1>
  <p><strong>Modern self-hosted VPS management dashboard built with Clean Architecture</strong></p>

  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps">
      <img src="https://img.shields.io/badge/GitHub-akaanakbaik%2Fmydash--vps-181717?logo=github" alt="GitHub" />
    </a>
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Express-5-000000?logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/WebSocket-010101?logo=socket.io" alt="WebSocket" />
    <br/>
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build" />
    <img src="https://img.shields.io/badge/tests-345%20passing-brightgreen" alt="Tests" />
    <img src="https://img.shields.io/badge/PM2-auto--restart-2B037A?logo=pm2" alt="PM2" />
    <img src="https://img.shields.io/badge/Ngrok-tunnel-1F1E1F?logo=ngrok" alt="Ngrok" />
  </p>

  <br/>

  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps">
      <strong>📦 View on GitHub →</strong>
    </a>
    &nbsp;|&nbsp;
    <a href="https://github.com/akaanakbaik/mydash-vps/releases">
      <strong>🏷️ Releases →</strong>
    </a>
    &nbsp;|&nbsp;
    <a href="https://github.com/akaanakbaik/mydash-vps/issues">
      <strong>🐛 Report Issue →</strong>
    </a>
  </p>
</div>

---

## ✨ Features

- **Real-Time Monitoring** — CPU, memory, disk, and network metrics with live WebSocket updates
- **Health Score Engine** — Advanced server health assessment based on multiple metrics
- **Notification System** — Multi-channel notifications via Telegram and WhatsApp
- **Automation Engine** — Trigger-condition-action workflows for automated responses
- **Analytics Engine** — Trend analysis, anomaly detection, and statistical summaries
- **Docker Management** — Container monitoring and management
- **Tunnel Management** — Secure server tunnels with automatic failover
- **GitHub Integration** — Repository management and deployment hooks
- **Plugin System** — Extensible plugin architecture
- **Role-Based Access Control** — Fine-grained permissions and workspace isolation
- **Audit Logging** — Complete history of all system operations
- **AI-Powered Analysis** — Optional AI integration for intelligent recommendations
- **Responsive Design** — Mobile-first dark theme dashboard

## 🏗️ Architecture

MyDash is designed around **Clean Architecture** with **Event-Driven Communication**.

```
┌──────────────────────────────────────────────────┐
│                  Presentation                     │
│          React + Tailwind CSS + WebSocket         │
├──────────────────────────────────────────────────┤
│                Application Layer                  │
│           Use Cases + Command/Query Bus           │
├──────────────────────────────────────────────────┤
│                  Domain Layer                     │
│         Business Logic + Domain Entities          │
├──────────────────────────────────────────────────┤
│                   Event Bus                       │
├──────────────────────────────────────────────────┤
│               Infrastructure Layer                │
│     PostgreSQL + Redis + External Services        │
└──────────────────────────────────────────────────┘
```

### Key Principles

- **High Cohesion, Low Coupling** — Each module has a single responsibility
- **Event-Driven** — All state changes flow through the Event Bus
- **Deterministic Data Flow** — Every metric follows a predictable path
- **Self-Healing** — Automatic recovery for connections, queues, and workers
- **Observability** — Structured logging with correlation IDs, health checks, and metrics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS 4, Vite 6 |
| State | Zustand 5, TanStack React Query 5 |
| Routing | React Router 7 |
| Backend | Express 5, TypeScript |
| Database | PostgreSQL 16, Drizzle ORM |
| Cache | Redis 7 |
| Realtime | WebSocket (ws) |
| Auth | JWT (jose) |
| Monitoring | Built-in collectors |
| Notifications | Telegram, WhatsApp (Baileys) |
| Container | Docker |
| Process Manager | PM2 5 |
| Package Manager | pnpm 11 |
| Testing | Vitest 4 |
| Linting | ESLint 9, Prettier 3 |

## 📁 Folder Structure

```
mydash-vps/
├── ecosystem.config.js        # PM2 process manager config
├── start.sh                   # Start all services with PM2
├── stop.sh                    # Stop all services
├── restart.sh                 # Restart all services
├── status.sh                  # Show PM2 status + Ngrok URL
├── logs.sh                    # View PM2 logs
├── packages/
│   ├── backend/               # Express + Drizzle + WebSocket backend
│   │   ├── src/
│   │   │   ├── api/           # HTTP routes and middleware
│   │   │   ├── application/   # Use cases and application services
│   │   │   ├── bootstrap/     # Startup and lifecycle management
│   │   │   ├── configuration/ # Environment configuration
│   │   │   ├── di/            # Dependency injection composition
│   │   │   ├── domain/        # Domain entities and repository contracts
│   │   │   ├── eventBus/      # Event bus contracts
│   │   │   ├── infrastructure/# Database, Redis, monitoring implementations
│   │   │   ├── logging/       # Structured logging
│   │   │   ├── modules/       # Module registry and lifecycle
│   │   │   ├── persistence/   # PostgreSQL connection, pool, migrations
│   │   │   ├── runtime/       # Redis, queues, workers, scheduler
│   │   │   └── transport/     # HTTP and WebSocket servers
│   ├── frontend/              # React + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── pages/         # Route pages (17 pages)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API and mock services
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── realtime/      # WebSocket client
│   │   │   └── utils/         # Utility functions
│   ├── shared/                # Shared types, DTOs, contracts
│   └── agent/                 # AI agent integration
├── docker-compose.yml         # Docker services (PostgreSQL, Redis)
├── Dockerfile                 # Production multi-stage build
├── ARCHITECTURE.md            # Full architecture specification
└── docs/                      # Detailed implementation documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9 (`npm install -g pnpm`)
- **PostgreSQL** >= 16
- **Redis** >= 7
- **Docker** (optional, for containerized dependencies)
- **PM2** (optional, for process management: `npm install -g pm2`)

### Installation

```bash
# Clone the repository
git clone https://github.com/akaanakbaik/mydash-vps.git
cd mydash-vps

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### Development

```bash
# Start PostgreSQL and Redis via Docker
docker compose up -d postgres redis

# Start development servers (backend + frontend)
pnpm dev
```

The backend API starts at `http://localhost:4000` and the frontend at `http://localhost:5173`.

### Production with PM2 (Auto-Restart)

```bash
# Build all packages
pnpm build

# Start all services with PM2 (auto-restart on crash)
bash start.sh

# Check status (shows Ngrok URL if tunnel is active)
bash status.sh

# View logs
bash logs.sh         # all logs
bash logs.sh backend # backend only
bash logs.sh ngrok   # ngrok only

# Monitor processes in real-time
pm2 monit

# Restart all services
bash restart.sh

# Stop all services
bash stop.sh
```

### Docker Deployment

```bash
# Full production stack
docker compose up -d
```

## 🌐 Public URL (Ngrok Tunnel)

When running with `bash start.sh`, the backend is exposed via Ngrok. Get the URL with:

```bash
bash status.sh
```

Or check the Ngrok dashboard at `http://127.0.0.1:4040`.

### API Endpoints (all behind Ngrok)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/ready` | GET | No | Readiness check |
| `/live` | GET | No | Liveness check |
| `/version` | GET | No | Version info |
| `/api/v1/auth/login` | POST | No | Login (body: `{ "password": "admin123" }`) |
| `/api/v1/auth/session` | GET | JWT | Session validation |
| `/api/v1/auth/logout` | POST | JWT | Logout |
| `/api/v1/dashboard` | GET | JWT | Dashboard data |
| `/api/v1/servers` | GET | JWT | Server list |
| `/api/v1/monitoring` | GET | JWT | Monitoring metrics |
| `/api/v1/analytics` | GET | JWT | Analytics summaries |
| `/api/v1/health/score` | GET | JWT | Health scores |
| `/api/v1/notifications` | GET | JWT | Notification management |
| `/api/v1/automation` | GET | JWT | Automation workflows |
| `/api/v1/backup` | GET | JWT | Backup management |
| `/api/v1/docker` | GET | JWT | Docker containers |
| `/api/v1/tunnel` | GET | JWT | Tunnel configuration |
| `/api/v1/github` | GET | JWT | GitHub integration |
| `/api/v1/security` | GET | JWT | Security events |
| `/api/v1/audit` | GET | JWT | Audit logs |
| `/api/v1/settings` | GET | JWT | System settings |
| `/api/v1/profile` | GET | JWT | User profile |
| `/api/v1/sessions` | GET | JWT | Active sessions |
| `/api/v1/roles` | GET | JWT | Role management |
| `/ws` | WebSocket | JWT | Real-time events |

### Example: Test Login

```bash
# Via Ngrok public URL
curl -X POST https://your-ngrok-url.ngrok-free.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'

# Via localhost
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

## 🔐 Environment Variables

Key environment variables (see [.env.example](.env.example) for full list):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT token signing |
| `NODE_ENV` | No | `development` | Environment mode |
| `BACKEND_PORT` | No | `4000` | API server port |
| `HOST` | No | `0.0.0.0` | Server bind address |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Logging level |
| `DB_MAX_CONNECTIONS` | No | `20` | PostgreSQL pool size |
| `SESSION_LIFETIME_HOURS` | No | `24` | JWT session duration |
| `RATE_LIMIT_PER_MINUTE` | No | `60` | API rate limit |

## 🧪 Testing

```bash
# Run all tests (345+ tests)
pnpm test

# Run with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Build all packages
pnpm build
```

## 🔒 Security

- JWT-based authentication with configurable expiry
- Role-based access control with granular permissions
- HTTP security headers via Helmet.js (HSTS, frameguard, referrer policy)
- Configurable CORS origin whitelist
- Rate limiting on all API routes
- Input validation with JSON body size limits
- SQL injection protection via Drizzle ORM parameterized queries
- Workspace isolation for multi-tenant deployments
- Correlation ID tracking for request tracing

## 📦 Release History

- **v0.2.0-rc2** — API stability: all routes return graceful empty data, PM2 auto-restart, bash scripts
- **v0.2.0-rc1** — Login flow, database seed, config consistency
- **v0.1.0** — Initial foundation: architecture, infrastructure, realtime

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with modern open-source tools and libraries. Special thanks to the maintainers of React, Express, Drizzle ORM, Redis, and the entire open-source ecosystem.

---

<div align="center">
  <p>
    <a href="https://github.com/akaanakbaik/mydash-vps">
      <strong>📦 GitHub Repository →</strong>
    </a>
    &nbsp;|&nbsp;
    <a href="https://github.com/akaanakbaik/mydash-vps/releases">
      <strong>🏷️ Releases →</strong>
    </a>
    &nbsp;|&nbsp;
    <a href="https://github.com/akaanakbaik/mydash-vps/issues/new">
      <strong>🐛 Report Issue →</strong>
    </a>
  </p>
  <p>Built with ❤️ for the self-hosting community</p>
</div>
