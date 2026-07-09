import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore.js';
import { getPageLabel } from '../components/layout/NavigationRegistry.js';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export interface LayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breadcrumbs: { path: string; label: string }[];
}

export function useLayout(): LayoutState {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => { setWidth(window.innerWidth); }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const isDesktop = width >= TABLET_BREAKPOINT;

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = [{ path: '/', label: 'Dashboard' }];
  let accumulated = '';
  for (const part of pathParts) {
    accumulated += `/${part}`;
    breadcrumbs.push({ path: accumulated, label: getPageLabel(accumulated) || part });
  }

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const closeMobileDrawer = useAppStore((s) => s.closeMobileDrawer);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile) {
        closeMobileDrawer();
      }
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    },
    [isMobile, toggleSidebar, closeMobileDrawer],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [handleKeyDown]);

  return { isMobile, isTablet, isDesktop, breadcrumbs };
}
