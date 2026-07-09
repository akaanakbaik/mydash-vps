import { type ReactNode, useEffect } from 'react';
import { useNavigation } from 'react-router-dom';
import { Sidebar } from '../layout/Sidebar.js';
import { Header } from '../layout/Header.js';
import { Footer } from '../layout/Footer.js';
import { useAppStore } from '../../stores/appStore.js';
import { useLayout } from '../../hooks/useLayout.js';
import { cn } from '../../utils/cn.js';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const { isMobile } = useLayout();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  // Close mobile drawer on route change
  const closeMobileDrawer = useAppStore((s) => s.closeMobileDrawer);
  useEffect(() => {
    if (isMobile) {
      closeMobileDrawer();
    }
  }, [isMobile, closeMobileDrawer]);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--color-bg))]">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            isLoading && 'opacity-60 transition-opacity duration-200',
          )}
          id="main-content"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>

        <Footer />
      </div>

      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[hsl(var(--color-surface))] focus:px-4 focus:py-2 focus:text-sm focus:text-[hsl(var(--color-text))] focus:shadow-lg focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      >
        Skip to main content
      </a>
    </div>
  );
}
