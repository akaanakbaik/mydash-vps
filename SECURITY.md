# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of MyDash seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the repository owner.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., SQL injection, XSS, privilege escalation)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Preferred Languages

We prefer all communications to be in English.

## Policy

We will:

- Acknowledge receipt of your vulnerability report within 48 hours
- Send a more detailed response within 72 hours indicating next steps
- Keep you informed of the progress towards a fix
- Notify you when the vulnerability is fixed
- Credit you as the finder (if desired)

## Scope

The following are considered out of scope:

- Missing HTTP security headers (unless exploitable)
- Self-XSS
- Rate limiting issues on non-authentication endpoints
- Social engineering attacks
- Physical attacks
- Automated tool scans without proof of exploitability

## Security Measures

MyDash implements the following security measures by default:

- **Authentication**: JWT-based authentication with HS256 signing
- **Authorization**: Role-based access control with permission validation
- **Session Management**: Token-based sessions with configurable expiry
- **HTTP Security**: Helmet.js with HSTS, frameguard, and referrer policy
- **CORS**: Configurable origin whitelist
- **Rate Limiting**: In-memory rate limiter on all API routes
- **Input Validation**: JSON body validation with size limits
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **Dependency Scanning**: Regular audits via pnpm audit
