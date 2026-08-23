import { type ReactNode, useEffect } from 'react';
import { useNavigation } from 'react-router-dom';
import { Sidebar } from '../layout/Sidebar.js';
import { Header } from '../layout/Header.js';
import { Footer } from '../layout/Footer.js';
import { useAppStore } from '../../stores/appStore.js';
import { useLayout } from '../../hooks/useLayout.js';
interface AppShellProps {
  children: ReactNode;
}
export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const { isMobile } = useLayout();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const closeMobileDrawer = useAppStore((state) => state.closeMobileDrawer);
  useEffect(() => {
    if (isMobile) closeMobileDrawer();
  }, [isMobile, closeMobileDrawer]);
  return (
    <div className="relative flex h-screen overflow-hidden bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))]">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_100%_0%,hsl(var(--color-accent)/0.06),transparent_30rem)]">
        <Header />
        {isLoading && <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-[hsl(var(--color-primary))]/20" role="progressbar" aria-label="Loading page"><span className="route-progress block h-full w-1/3 rounded-full bg-[hsl(var(--color-primary))]" /></div>}
        <main className="app-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden px-3 pb-5 pt-3 sm:px-5 sm:pb-7 sm:pt-5 lg:px-7" id="main-content" role="main" aria-label="Main content" aria-busy={isLoading}>
          {children}
        </main>
        <Footer />
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[hsl(var(--color-surface))] focus:px-4 focus:py-2 focus:text-sm focus:text-[hsl(var(--color-text))] focus:shadow-lg focus:ring-2 focus:ring-[hsl(var(--color-primary))]">Skip to main content</a>
    </div>
  );
}
