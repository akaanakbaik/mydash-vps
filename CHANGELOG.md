# Changelog

## [1.0.0-rc1] — 2026-07-09

### Added
- First release candidate of MyDash VPS
- Complete VPS management dashboard
- Real-time monitoring with WebSocket updates
- Health score engine for server health assessment
- Notification system with Telegram and WhatsApp providers
- Automation engine with trigger-condition-action workflows
- Analytics engine with trend analysis and anomaly detection
- Docker container management
- Tunnel management (Instatunnel + LocalTunnel fallback)
- GitHub integration
- Plugin system
- Role-based access control
- Audit logging
- AI-powered analysis (optional)

### Architecture
- Clean Architecture with Domain-Driven Design
- Event-Driven Architecture with Event Bus
- PostgreSQL with Drizzle ORM
- Redis for caching, pub/sub, and realtime state
- WebSocket for realtime dashboard updates
- Monorepo with pnpm workspaces

### Security
- JWT-based authentication with jose library
- Role-based authorization with permission validation
- Helmet.js HTTP security headers
- CORS with configurable origin
- Rate limiting on all API routes
- Input validation and size limits
- Graceful shutdown with resource cleanup
- Structured logging with correlation IDs

### Performance
- Lazy-loaded frontend pages with code splitting
- Optimized bundle sizes (262 kB gzipped total JS)
- Connection pooling for PostgreSQL
- Redis caching layer
- Batch event processing
- Automatic cleanup of stale connections

### Testing
- 344 unit tests across 37 test files
- Lint-free codebase (ESLint, zero errors)
- Full type safety (TypeScript strict mode)
- Build pipeline validation
