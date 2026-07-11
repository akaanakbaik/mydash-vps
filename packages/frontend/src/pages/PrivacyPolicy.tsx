import { Shield, Lock, Database, Eye, Cookie, UserCheck, Mail, Server, Trash2, FileJson } from 'lucide-react';
const sections = [
  {
    icon: Shield,
    title: '1. Introduction',
    content: 'My Dash ("the Platform", "we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our self-hosted VPS management dashboard. Since My Dash is self-hosted software, you maintain complete control and ownership of your data. This policy outlines our principles and practices regarding data collection, usage, and protection. By using the Platform, you agree to the practices described in this policy.',
  },
  {
    icon: Server,
    title: '2. Data Ownership and Control',
    content: 'My Dash is self-hosted software deployed on your own infrastructure. All data collected, processed, and stored by the Platform remains exclusively on your servers under your control. We do not have access to your instance, your data, your configuration, or your users. You are the sole data controller and data processor for your instance. We have no ability to view, access, modify, or transmit any data from your installation. Your data never leaves your infrastructure unless you explicitly configure integrations with third-party services.',
  },
  {
    icon: Database,
    title: '3. Information We Process',
    content: 'The Platform processes the following types of information necessary for its operation: (a) Server metrics including CPU usage, memory consumption, disk utilization, network traffic, and system load; (b) Authentication data including hashed passwords, JWT tokens, and session identifiers; (c) Configuration settings including notification endpoints, automation rules, monitoring thresholds, and user preferences; (d) Operational logs including system events, user actions, automation executions, and error records; (e) User profile information including display names and role assignments. All sensitive data such as passwords are hashed using bcrypt before storage. API tokens and secrets are encrypted at rest.',
  },
  {
    icon: UserCheck,
    title: '4. How We Use Information',
    content: 'The information processed by the Platform is used exclusively for: (a) Providing real-time server monitoring and health assessment; (b) Executing automated workflows and notification delivery; (c) Generating analytics, trends, and anomaly detection reports; (d) Maintaining system security through audit logging and access control; (e) Facilitating backups, restores, and disaster recovery operations; (f) Managing Docker containers, tunnels, and GitHub integrations; (g) Improving the user experience through personalization and preferences. We do not use your data for advertising, profiling, training AI models, or any purpose not explicitly listed here.',
  },
  {
    icon: Eye,
    title: '5. Third-Party Services',
    content: 'The Platform may integrate with third-party services that you explicitly configure: (a) Telegram API - used to send notifications if you provide a bot token and chat ID; (b) WhatsApp API (Baileys) - used to send notifications if you configure a WhatsApp account; (c) Ngrok - used to create public tunnels to your instance if you enable tunneling; (d) GitHub API - used for repository management if you configure a GitHub token; (e) Docker Hub - used for container image management if you configure registry access. Each integration requires your explicit action to configure. Data sent to these services is limited to what is necessary for the specific feature. Review each service privacy policy independently.',
  },
  {
    icon: Cookie,
    title: '6. Cookies and Local Storage',
    content: 'The Platform uses browser local storage and session storage to: (a) Persist authentication tokens across page refreshes; (b) Remember user preferences such as theme selection and sidebar state; (c) Cache frequently accessed data to improve performance. We do not use third-party cookies, tracking cookies, or any form of cross-site tracking mechanism. All stored data remains in your browser and is not accessible to us or any third party. You can clear this data at any time through your browser settings without affecting the core functionality of the Platform.',
  },
  {
    icon: Lock,
    title: '7. Data Security',
    content: 'We implement comprehensive security measures to protect your data: (a) Passwords are hashed using bcrypt with a cost factor of 12; (b) JWT tokens are signed using HS256 and have configurable expiration; (c) HTTP traffic can be secured with HTTPS when configured behind a reverse proxy; (d) SQL injection is prevented through Drizzle ORM parameterized queries; (e) Rate limiting protects against brute force and DDoS attacks; (f) CORS is enforced to prevent unauthorized cross-origin requests; (g) Helmet.js middleware sets secure HTTP headers; (h) Session management includes token rotation and forced expiration. However, the security of your instance ultimately depends on your own infrastructure security practices, including OS hardening, firewall configuration, network security, and timely software updates.',
  },
  {
    icon: Trash2,
    title: '8. Data Retention and Deletion',
    content: 'You have full control over data retention policies within your instance. By default: (a) Monitoring metrics are retained for 30 days with 1-minute granularity; (b) Analytics summaries are retained indefinitely until manually cleaned; (c) Audit logs are retained for 90 days; (d) Automation execution history is retained for 30 days; (e) Notification delivery logs are retained for 7 days. You can configure retention periods through the Platform settings or directly in the database. To permanently delete all data, simply delete your instance database and configuration files. There is no way for us to delete data on your behalf since we have no access to your instance.',
  },
  {
    icon: FileJson,
    title: '9. Data Portability',
    content: 'You can export your data at any time through: (a) The Platform backup feature which creates a complete database dump; (b) Direct database access via PostgreSQL tools like pg_dump; (c) API endpoints that return all configurable settings and data in JSON format; (d) The export functionality in Settings for specific data categories. Exported data can be imported into another My Dash instance or used for external analysis. We do not charge for data export or impose restrictions on how you use your exported data.',
  },
  {
    icon: Mail,
    title: '10. Contact and Complaints',
    content: 'If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact the developer:',
    extra: (
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-4">
          <p className="text-sm font-medium text-[hsl(var(--color-text))]">Developer Information</p>
          <div className="mt-2 space-y-2 text-sm text-[hsl(var(--color-muted))]">
            <p>Name: Aka</p>
            <p>Origin: Sumatera Barat, Indonesia</p>
            <p>Contact: <a href="https://t.me/akamodebaik" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--color-primary))] hover:underline">t.me/akamodebaik</a></p>
            <p>Portfolio: <a href="https://akadev.me" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--color-primary))] hover:underline">akadev.me</a></p>
          </div>
        </div>
        <p className="text-xs text-[hsl(var(--color-muted))]">
          We are committed to resolving any privacy concerns promptly. You also have the right to lodge a complaint with your local data protection authority.
        </p>
      </div>
    ),
  },
];
export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))]/10">
          <Shield className="h-8 w-8 text-[hsl(var(--color-primary))]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--color-text))] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-base text-[hsl(var(--color-muted))]">
          Last updated: July 10, 2026 - Version 1.0
        </p>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[hsl(var(--color-primary))]" />
      </div>
      <div className="mb-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 sm:p-6">
        <p className="text-sm leading-relaxed text-[hsl(var(--color-muted))]">
          My Dash is a self-hosted VPS management dashboard. Because you host it yourself, you maintain complete control
          over your data. This Privacy Policy explains our principles regarding data handling, your rights, and how we
          protect your information. We believe in minimal data collection, maximum transparency, and giving you full
          control over your privacy.
        </p>
      </div>
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-5 sm:p-6 transition-colors hover:border-[hsl(var(--color-border))]/80"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--color-primary))]/10">
                <section.icon className="h-5 w-5 text-[hsl(var(--color-primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-[hsl(var(--color-text))]">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--color-muted))]">{section.content}</p>
                {section.extra}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6 text-center">
        <p className="text-sm text-[hsl(var(--color-muted))]">
          Your privacy matters. We are committed to transparency, security, and giving you full control over your data.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[hsl(var(--color-muted))]">
          <Lock className="h-3.5 w-3.5" />
          <span>My Dash v1.0 - Self-hosted. Private by design.</span>
        </div>
      </div>
    </div>
  );
}
