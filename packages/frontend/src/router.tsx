import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell.js';
import { ErrorBoundary } from './components/shared/ErrorBoundary.js';
import { SkeletonBlock } from './components/shared/Skeleton.js';

const OverviewPage = lazy(() => import('./pages/Overview.js').then((m) => ({ default: m.OverviewPage })));
const MonitoringPage = lazy(() => import('./pages/Monitoring.js').then((m) => ({ default: m.MonitoringPage })));
const AnalyticsPage = lazy(() => import('./pages/Analytics.js').then((m) => ({ default: m.AnalyticsPage })));
const HealthScorePage = lazy(() => import('./pages/HealthScore.js').then((m) => ({ default: m.HealthScorePage })));
const NotificationPage = lazy(() => import('./pages/Notification.js').then((m) => ({ default: m.NotificationPage })));
const AutomationPage = lazy(() => import('./pages/Automation.js').then((m) => ({ default: m.AutomationPage })));
const ServersPage = lazy(() => import('./pages/Servers.js').then((m) => ({ default: m.ServersPage })));
const BackupPage = lazy(() => import('./pages/Backup.js').then((m) => ({ default: m.BackupPage })));
const DockerPage = lazy(() => import('./pages/Docker.js').then((m) => ({ default: m.DockerPage })));
const TunnelPage = lazy(() => import('./pages/Tunnel.js').then((m) => ({ default: m.TunnelPage })));
const GitHubPage = lazy(() => import('./pages/GitHub.js').then((m) => ({ default: m.GitHubPage })));
const PluginPage = lazy(() => import('./pages/Plugin.js').then((m) => ({ default: m.PluginPage })));
const SecurityPage = lazy(() => import('./pages/Security.js').then((m) => ({ default: m.SecurityPage })));
const AuditPage = lazy(() => import('./pages/Audit.js').then((m) => ({ default: m.AuditPage })));
const SettingsPage = lazy(() => import('./pages/Settings.js').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/Profile.js').then((m) => ({ default: m.ProfilePage })));
const SessionPage = lazy(() => import('./pages/Session.js').then((m) => ({ default: m.SessionPage })));
const RolePage = lazy(() => import('./pages/Role.js').then((m) => ({ default: m.RolePage })));
const LoginPage = lazy(() => import('./pages/Login.js').then((m) => ({ default: m.LoginPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4">
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={10} />
      </div>
    </div>
  );
}

function Suspended({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Layout() {
  return (
    <ErrorBoundary>
      <AppShell>
        <ScrollRestoration />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Suspended><OverviewPage /></Suspended> },
      { path: 'servers', element: <Suspended><ServersPage /></Suspended> },
      { path: 'monitoring', element: <Suspended><MonitoringPage /></Suspended> },
      { path: 'analytics', element: <Suspended><AnalyticsPage /></Suspended> },
      { path: 'health', element: <Suspended><HealthScorePage /></Suspended> },
      { path: 'notifications', element: <Suspended><NotificationPage /></Suspended> },
      { path: 'automation', element: <Suspended><AutomationPage /></Suspended> },
      { path: 'backup', element: <Suspended><BackupPage /></Suspended> },
      { path: 'docker', element: <Suspended><DockerPage /></Suspended> },
      { path: 'tunnel', element: <Suspended><TunnelPage /></Suspended> },
      { path: 'github', element: <Suspended><GitHubPage /></Suspended> },
      { path: 'plugins', element: <Suspended><PluginPage /></Suspended> },
      { path: 'security', element: <Suspended><SecurityPage /></Suspended> },
      { path: 'audit', element: <Suspended><AuditPage /></Suspended> },
      { path: 'settings', element: <Suspended><SettingsPage /></Suspended> },
      { path: 'profile', element: <Suspended><ProfilePage /></Suspended> },
      { path: 'sessions', element: <Suspended><SessionPage /></Suspended> },
      { path: 'roles', element: <Suspended><RolePage /></Suspended> },
    ],
  },
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
  },
]);
