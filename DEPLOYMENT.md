# Deployment Guide

## Prerequisites

- Docker Engine >= 24
- Docker Compose >= 2.24
- Domain name (optional, for production)
- SSL certificate (optional, for production)

## Production Deployment

### 1. Clone and Configure

```bash
git clone https://github.com/akaanakbaik/mydash-vps.git
cd mydash-vps
cp .env.example .env
```

### 2. Set Required Environment Variables

Edit `.env` and ensure these are set:

```bash
# Required — generate a strong random secret
JWT_SECRET=$(openssl rand -base64 48)

# Required — update with your actual database URL
DATABASE_URL=postgresql://mydash:your_password@postgres:5432/mydash

# Required — update with your actual Redis URL
REDIS_URL=redis://:your_redis_password@redis:6379/0

# Set to production
NODE_ENV=production

# Set your domain origin
CORS_ORIGIN=https://your-domain.com
```

### 3. Start Services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** — Primary database
- **Redis 7** — Cache, pub/sub, sessions
- **MyDash Backend** — API server on port 4000

### 4. Verify Deployment

```bash
# Check all services are running
docker compose ps

# Check health endpoint
curl http://localhost:4000/health

# Check readiness
curl http://localhost:4000/ready

# Check liveness
curl http://localhost:4000/live
```

## Architecture

```
                    ┌──────────────┐
                    │  Nginx/Caddy │ (optional reverse proxy)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  MyDash API  │ :4000
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼────┐ ┌─────▼─────┐
       │ PostgreSQL │ │ Redis  │ │  Frontend │
       │   :5432    │ │ :6379  │ │  (static) │
       └────────────┘ └────────┘ └───────────┘
```

## Health Endpoints

| Endpoint | Purpose | Expected Status |
|----------|---------|----------------|
| `GET /health` | Service health | 200 OK |
| `GET /ready` | Readiness (db + redis) | 200 OK |
| `GET /live` | Liveness (process alive) | 200 OK |
| `GET /version` | Version info | 200 OK |
| `GET /api/v1/auth/session` | Auth check | 200 OK |

## Graceful Shutdown

The backend implements a proper graceful shutdown sequence:

1. Stop accepting new HTTP requests
2. Drain queued jobs
3. Stop scheduler
4. Stop event bus
5. Stop WebSocket server
6. Shut down modules
7. Close PostgreSQL connection pool
8. Close Redis connection
9. Exit process

Send `SIGTERM` or `SIGINT` to trigger graceful shutdown:

```bash
docker compose stop backend
```

## Logging

Logs are output as structured JSON to stdout/stderr:

```json
{"timestamp":"2026-07-09T12:00:00.000Z","level":"info","service":"system","message":"Application started successfully"}
```

View logs:

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend
```

## Backup & Restore

### Database Backup

```bash
docker compose exec postgres pg_dump -U mydash mydash > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
cat backup.sql | docker compose exec -T postgres psql -U mydash mydash
```

### Redis Backup

Redis data is persisted to a Docker volume (`redis_data`). To back up:

```bash
docker compose exec redis redis-cli SAVE
docker cp $(docker compose ps -q redis):/data/dump.rdb ./redis_backup.rdb
```

## Rollback

### Rollback Application

```bash
# Revert to previous Docker image
docker compose down backend
# Restore previous version
git checkout <previous-tag>
docker compose build backend
docker compose up -d backend
```

### Rollback Database

```bash
# Restore from backup
docker compose exec -T postgres psql -U mydash -d mydash -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cat backup.sql | docker compose exec -T postgres psql -U mydash mydash
```

## Resource Requirements

| Service | Min | Recommended |
|---------|-----|-------------|
| PostgreSQL | 256 MB RAM, 0.5 CPU | 512 MB RAM, 1 CPU |
| Redis | 128 MB RAM, 0.25 CPU | 256 MB RAM, 0.5 CPU |
| Backend | 512 MB RAM, 1 CPU | 1 GB RAM, 2 CPU |
| Total | ~1 GB RAM | ~2 GB RAM |

## Monitoring

The MyDash dashboard includes built-in monitoring for:
- Server metrics (CPU, memory, disk, network)
- Health scores
- Service status
- Real-time WebSocket updates

## Security Checklist

- [ ] JWT_SECRET is set to a strong random value
- [ ] REDIS_PASSWORD is set
- [ ] DB_PASSWORD is set to a strong password
- [ ] CORS_ORIGIN is set to your actual frontend domain
- [ ] SSL/TLS is configured on reverse proxy
- [ ] NODE_ENV is set to production
- [ ] Firewall restricts access to ports 5432 and 6379
- [ ] Regular backups are configured
- [ ] Log monitoring is set up
