import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { useAppStore } from '../../stores/appStore.js';
import { getNavigationByGroup } from './NavigationRegistry.js';
import { X, ExternalLink, User } from 'lucide-react';
import { Logo } from './Logo.js';
interface SidebarProps {
  collapsed: boolean;
}
export function Sidebar({ collapsed }: SidebarProps) {
  const mobileDrawerOpen = useAppStore((s) => s.mobileDrawerOpen);
  const closeMobileDrawer = useAppStore((s) => s.closeMobileDrawer);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const groups = getNavigationByGroup();
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        closeMobileDrawer();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [mobileDrawerOpen, closeMobileDrawer]);
  useEffect(() => {
    if (mobileDrawerOpen && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }
  }, [mobileDrawerOpen]);
  const sidebarContent = (
    <aside
      ref={sidebarRef}
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        'flex flex-col border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center border-b border-[hsl(var(--color-border))]', collapsed ? 'justify-center px-0' : 'px-4')}>
        <Logo collapsed={collapsed} />
      </div>
      {}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-1">
            {!collapsed && (
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--color-muted))]">
                  {group === 'primary' ? 'Main' : group === 'management' ? 'Management' : 'System'}
                </span>
              </div>
            )}
            {collapsed && <div className="h-2" />}
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (mobileDrawerOpen) {
                    closeMobileDrawer();
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'group relative mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-surface))]',
                    isActive
                      ? 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))] font-medium'
                      : 'text-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))]',
                    collapsed && 'justify-center px-0 mx-1',
                  )
                }
                aria-current={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'page' : undefined}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', collapsed ? 'h-5 w-5' : '')} aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      {!collapsed && (
        <div className="border-t border-[hsl(var(--color-border))] px-3 py-3">
          <div className="rounded-lg bg-[hsl(var(--color-bg))] p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20">
                <User className="h-3 w-3 text-[hsl(var(--color-primary))]" />
              </div>
              <span className="text-xs font-medium text-[hsl(var(--color-text))]">Developer</span>
            </div>
            <p className="text-[11px] font-medium text-[hsl(var(--color-text))]">Aka</p>
            <p className="text-[10px] text-[hsl(var(--color-muted))]">Sumatera Barat, Indonesia</p>
            <div className="mt-1.5 flex flex-col gap-1">
              <a href="https://t.me/akamodebaik" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--color-primary))] hover:underline transition-colors">
                <ExternalLink className="h-3 w-3" />
                t.me/akamodebaik
              </a>
              <a href="https://akadev.me" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--color-primary))] hover:underline transition-colors">
                <ExternalLink className="h-3 w-3" />
                akadev.me
              </a>
            </div>
          </div>
        </div>
      )}
      <div className={cn('hidden md:block border-t border-[hsl(var(--color-border))] p-3', collapsed && 'flex justify-center')}>
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Collapse sidebar"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Collapse
          </button>
        )}
      </div>
    </aside>
  );
  return (
    <>
      {}
      <div className="hidden md:flex">{sidebarContent}</div>
      {}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileDrawer}
          aria-hidden="true"
        />
      )}
      {}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 md:hidden transition-transform duration-200 ease-in-out',
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative h-full">
          {sidebarContent}
          {}
          <button
            onClick={closeMobileDrawer}
            className="absolute right-2 top-3 rounded-lg p-1.5 text-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
