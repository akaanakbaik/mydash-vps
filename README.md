<div align="center">
  <h1>MyDash VPS</h1>
  <p><strong>Modern self-hosted VPS management dashboard built with Clean Architecture</strong></p>

  <p>
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
    <img src="https://img.shields.io/badge/tests-344%20passing-brightgreen" alt="Tests" />
    <img src="https://img.shields.io/badge/coverage-30%25-yellow" alt="Coverage" />
  </p>
</div>

## Overview

MyDash is a production-ready, self-hosted VPS management dashboard that provides real-time monitoring, health scoring, automated notifications, and intelligent insights for your servers.

Built with **Clean Architecture**, **Event-Driven Design**, and **Domain-Driven Design** principles, MyDash offers a modular, maintainable, and scalable platform for managing infrastructure.

## Features

- **Real-Time Monitoring** — CPU, memory, disk, and network metrics with live WebSocket updates
- **Health Score Engine** — Advanced server health assessment based on multiple metrics
- **Notification System** — Multi-channel notifications via Telegram and WhatsApp
- **Automation Engine** — Trigger-condition-action workflows for automated responses
- **Analytics Engine** — Trend analysis, anomaly detection, and statistical summaries
- **Docker Management** — Container monitoring and management
- **Tunnel Management** — Secure server tunnels with automatic failover (Instatunnel + LocalTunnel)
- **GitHub Integration** — Repository management and deployment hooks
- **Plugin System** — Extensible plugin architecture
- **Role-Based Access Control** — Fine-grained permissions and workspace isolation
- **Audit Logging** — Complete history of all system operations
- **AI-Powered Analysis** — Optional AI integration for intelligent recommendations
- **Responsive Design** — Mobile-first dark theme dashboard

## Architecture

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
- **Deterministic Data Flow** — Every metric follows a predictable path through validation, normalization, monitoring, health, analytics, notification, and automation
- **Self-Healing** — Automatic recovery for connections, queues, and workers
- **Observability** — Structured logging with correlation IDs, health checks, and metrics

## Tech Stack

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
| Package Manager | pnpm 11 |
| Testing | Vitest 4 |
| Linting | ESLint 9, Prettier 3 |

## Folder Structure

```
mydash-vps/
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
├── docker-compose.yml         # Development/infrastructure services
├── Dockerfile                 # Production multi-stage build
├── ARCHITECTURE.md            # Full architecture specification
└── docs/                      # Detailed implementation documentation
```

## Quick Start

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9 (`npm install -g pnpm`)
- **PostgreSQL** >= 16
- **Redis** >= 7
- **Docker** (optional, for containerized dependencies)

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

# Start development servers
pnpm dev
```

The backend API starts at `http://localhost:4000` and the frontend at `http://localhost:5173`.

### Production Deployment

```bash
# Build all packages
pnpm build

# Start production server
docker compose up -d
```

## Environment Variables

Key environment variables (see [.env.example](.env.example) for full list):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `NODE_ENV` | No | Environment (development/production) |
| `BACKEND_PORT` | No | API server port (default: 4000) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:5173) |
| `LOG_LEVEL` | No | Logging level (default: info) |

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

## API

The API is available at `/api/v1` with the following endpoints:

- `POST /api/v1/auth/login` — User login
- `POST /api/v1/auth/logout` — User logout
- `GET /api/v1/auth/session` — Session validation
- `GET /api/v1/dashboard` — Dashboard data
- `GET /api/v1/servers` — Server list
- `GET /api/v1/monitoring` — Monitoring metrics
- `GET /api/v1/analytics` — Analytics summaries
- `GET /api/v1/health` — Health scores
- `GET /api/v1/notifications` — Notification management
- `GET /api/v1/automation` — Automation workflows
- `GET /api/v1/backup` — Backup management
- `GET /api/v1/docker` — Docker containers
- `GET /api/v1/tunnel` — Tunnel configuration
- `GET /api/v1/github` — GitHub integration
- `GET /api/v1/security` — Security events
- `GET /api/v1/audit` — Audit logs
- `GET /api/v1/settings` — System settings
- `GET /api/v1/sessions` — Active sessions
- `GET /api/v1/roles` — Role management

System health endpoints (no auth required):
- `GET /health` — Health check
- `GET /ready` — Readiness check
- `GET /live` — Liveness check
- `GET /version` — Version info

## Security

- JWT-based authentication with configurable expiry
- Role-based access control with granular permissions
- HTTP security headers via Helmet.js (HSTS, frameguard, referrer policy)
- Configurable CORS origin whitelist
- Rate limiting on all API routes (100 req/min by default)
- Input validation with JSON body size limits
- SQL injection protection via Drizzle ORM parameterized queries
- Workspace isolation for multi-tenant deployments
- Correlation ID tracking for request tracing

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with modern open-source tools and libraries. Special thanks to the maintainers of React, Express, Drizzle ORM, Redis, and the entire open-source ecosystem.

---

<div align="center">
  <p>Built with ❤️ for the self-hosting community</p>
</div>
