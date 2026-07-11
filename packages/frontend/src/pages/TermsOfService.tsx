import { Shield, FileText, Scale, Eye, Ban, AlertTriangle, Globe, Lock, Gavel, Mail, ExternalLink } from 'lucide-react';
const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: 'By accessing or using My Dash ("the Platform", "we", "us", "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms, you must not access or use the Platform. These Terms apply to all visitors, users, and others who access or use the Platform. We reserve the right to update these Terms at any time without prior notice. Your continued use of the Platform after any changes constitutes acceptance of the new Terms. It is your responsibility to review these Terms periodically.',
  },
  {
    icon: Globe,
    title: '2. Service Description',
    content: 'My Dash is a self-hosted VPS management dashboard that provides real-time monitoring, analytics, automation, notification delivery, and server management capabilities. The Platform is designed to be deployed on your own infrastructure and gives you full control over your data. We provide the software under an open-source license, and you are responsible for your own hosting, maintenance, and security. The Platform includes features such as server monitoring, health scoring, automated backups, Docker management, tunnel management, GitHub integration, notification delivery via Telegram and WhatsApp, analytics with anomaly detection, and role-based access control.',
  },
  {
    icon: Scale,
    title: '3. User Responsibilities',
    content: 'As a user of My Dash, you agree to: (a) Provide accurate and complete information when setting up the Platform; (b) Maintain the confidentiality of your access credentials, including passwords and API tokens; (c) Notify us immediately of any unauthorized use of your account; (d) Use the Platform in compliance with all applicable local, national, and international laws; (e) Not engage in any activity that disrupts or interferes with the Platform or its underlying infrastructure; (f) Not attempt to bypass security measures or access data that does not belong to you; (g) Not use the Platform for any illegal or unauthorized purpose; (h) Not transmit any viruses, malware, or harmful code through the Platform.',
  },
  {
    icon: Lock,
    title: '4. Data and Privacy',
    content: 'Your use of the Platform is subject to our Privacy Policy, which governs how we collect, use, and protect your information. Since My Dash is self-hosted, you retain full ownership and control over all data stored within your instance. However, certain features may process data through external services (e.g., Telegram API, WhatsApp API, Ngrok tunnel) according to your configuration. We do not collect, sell, or share your personal data. You are responsible for securing your own infrastructure, database, and network. We recommend enabling encryption, using strong passwords, keeping your software updated, and regularly backing up your data.',
  },
  {
    icon: Eye,
    title: '5. Intellectual Property',
    content: 'The My Dash software, including its source code, design, architecture, documentation, and visual elements, is licensed under the MIT License. You are free to use, modify, distribute, and sublicense the software in accordance with the license terms. The My Dash name, logo, and brand identity are protected trademarks. You may not use our trademarks without prior written permission. All third-party libraries and dependencies included with the Platform are subject to their respective licenses.',
  },
  {
    icon: Ban,
    title: '6. Prohibited Activities',
    content: 'You may not: (a) Use the Platform for any unlawful purpose or in violation of any applicable regulations; (b) Attempt to gain unauthorized access to any part of the Platform, other user accounts, or connected systems; (c) Interfere with or disrupt the security, integrity, or performance of the Platform; (d) Reverse-engineer, decompile, or disassemble the Platform except as permitted by applicable law; (e) Remove any copyright, trademark, or proprietary notices from the Platform; (f) Use the Platform to distribute malicious software or content; (g) Use automated systems or bots to access the Platform in a manner that exceeds reasonable usage limits; (h) Use the Platform for cryptocurrency mining, DDoS attacks, or other resource-intensive activities not related to server management.',
  },
  {
    icon: AlertTriangle,
    title: '7. Disclaimer of Warranties',
    content: 'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND COURSE OF PERFORMANCE. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS. YOU USE THE PLATFORM AT YOUR OWN RISK. NO ADVICE OR INFORMATION OBTAINED FROM US SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.',
  },
  {
    icon: Shield,
    title: '8. Limitation of Liability',
    content: 'IN NO EVENT SHALL MY DASH, ITS DEVELOPERS, CONTRIBUTORS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM. OUR TOTAL LIABILITY FOR ANY CLAIMS UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE PLATFORM, IF ANY. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF LIABILITY, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.',
  },
  {
    icon: Gavel,
    title: '9. Termination',
    content: 'We reserve the right to terminate or suspend your access to the Platform at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will immediately cease. If you wish to terminate your account, you may simply discontinue using the Platform and delete your instance. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.',
  },
  {
    icon: Mail,
    title: '10. Contact Information',
    content: 'If you have any questions, concerns, or requests regarding these Terms, please contact us through the following channels:',
    extra: (
      <div className="mt-4 space-y-3">
        <a href="https://t.me/akamodebaik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--color-primary))] hover:underline">
          <ExternalLink className="h-4 w-4" />
          Telegram: @akamodebaik
        </a>
        <a href="https://akadev.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--color-primary))] hover:underline">
          <ExternalLink className="h-4 w-4" />
          Portfolio: akadev.me
        </a>
        <p className="text-sm text-[hsl(var(--color-muted))]">
          Developer: Aka - Sumatera Barat, Indonesia
        </p>
      </div>
    ),
  },
];
export function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))]/10">
          <Scale className="h-8 w-8 text-[hsl(var(--color-primary))]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--color-text))] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-base text-[hsl(var(--color-muted))]">
          Last updated: July 10, 2026 - Version 1.0
        </p>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[hsl(var(--color-primary))]" />
      </div>
      <div className="mb-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 sm:p-6">
        <p className="text-sm leading-relaxed text-[hsl(var(--color-muted))]">
          Welcome to My Dash. These Terms of Service govern your use of the My Dash VPS management dashboard platform.
          By installing, accessing, or using the Platform, you agree to be bound by these terms. Please read them carefully.
          If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
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
          By using My Dash, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[hsl(var(--color-muted))]">
          <Shield className="h-3.5 w-3.5" />
          <span>My Dash v1.0 - Built for the self-hosting community</span>
        </div>
      </div>
    </div>
  );
}
