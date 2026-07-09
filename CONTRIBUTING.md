# Contributing to MyDash

First off, thank you for considering contributing to MyDash! We welcome contributions from everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected to see**
- **Include screenshots or terminal output if applicable**
- **Include environment details** (OS, Node.js version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the test suite: `pnpm test`
5. Run linting: `pnpm lint`
6. Run typecheck: `pnpm typecheck`
7. Run build: `pnpm build`
8. Commit your changes (`git commit -m 'Add some feature'`)
9. Push to the branch (`git push origin feature/your-feature`)
10. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### Getting Started

```bash
# Clone the repository
git clone https://github.com/akaanakbaik/mydash-vps.git
cd mydash-vps

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development servers
pnpm dev
```

### Project Structure

```
mydash-vps/
├── packages/
│   ├── backend/          # Express + Drizzle + WebSocket backend
│   ├── frontend/         # React + Vite + Tailwind CSS frontend
│   ├── shared/           # Shared types, DTOs, and contracts
│   └── agent/            # AI agent integration
├── docker-compose.yml    # PostgreSQL + Redis + Backend
├── Dockerfile            # Production build
└── docs/                 # Architecture and implementation docs
```

## Coding Guidelines

### General

- Follow the existing code style
- Write clean, self-documenting code
- No code comments in source files
- No TODO or FIXME placeholders
- Keep functions small and focused

### TypeScript

- Use strict TypeScript with full type safety
- No `any` type except when truly necessary
- Prefer `interface` over `type` for object types
- Use `const` over `let` where possible
- Use async/await over raw promises

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Run `pnpm test` before committing

### Commits

- Use clear, descriptive commit messages
- Reference issues and pull requests where applicable

## Architecture

MyDash follows Clean Architecture with Event-Driven Design:

- **Presentation Layer**: React frontend with realtime WebSocket updates
- **Application Layer**: Use cases and application services
- **Domain Layer**: Business logic and domain entities
- **Infrastructure Layer**: Database, Redis, external services

Refer to [ARCHITECTURE.md](ARCHITECTURE.md) for the full architecture specification.

## Questions?

Feel free to open an issue with your question or reach out to the repository maintainer.
