import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, User, Settings, Shield, LogOut, Bell, Clock, Users } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider.js';
import { useAppStore } from '../../stores/appStore.js';
import { useLayout } from '../../hooks/useLayout.js';
import { useNotifications } from '../../hooks/useNotification.js';
import { Breadcrumb } from './Breadcrumb.js';
import { cn } from '../../utils/cn.js';
interface MenuItemProps {
  icon: typeof User;
  label: string;
  href: string;
  onClose: () => void;
}
function UserMenuItem({ icon: Icon, label, href, onClose }: MenuItemProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { onClose(); void navigate(href); }}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
      role="menuitem"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
export function Header() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const openMobileDrawer = useAppStore((s) => s.openMobileDrawer);
  const { isMobile, breadcrumbs } = useLayout();
  const { data: notifData } = useNotifications();
  const activities = notifData?.activity ?? [];
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const handleMenuClick = () => {
    if (isMobile) {
      openMobileDrawer();
    } else {
      toggleSidebar();
    }
  };
  const closeMenus = () => {
    setUserMenuOpen(false);
    setNotifOpen(false);
  };
  useEffect(() => {
    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        closeMenus();
        return;
      }
      if (e instanceof MouseEvent) {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
          setUserMenuOpen(false);
        }
        if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
          setNotifOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('keydown', handleClose);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('keydown', handleClose);
    };
  }, []);
  return (
    <header
      className="glass-surface sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--color-border))]/70 px-3 sm:px-5"
      role="banner"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleMenuClick}
          className="rounded-lg p-2 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
          aria-label={isMobile ? 'Open navigation menu' : 'Toggle sidebar'}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Breadcrumb
          items={breadcrumbs.map((b) => ({ path: b.path, label: b.label }))}
          className="hidden sm:flex"
        />
      </div>
      <div className="flex items-center gap-2">
        {}
        <ConnectionIndicator />
        {}
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
        {}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative rounded-lg p-2 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            {activities.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--color-danger))] text-[9px] font-bold text-white">
                {activities.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="skeuo-raised absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl p-3 shadow-2xl">
              <p className="mb-2 px-2 text-xs font-semibold text-[hsl(var(--color-text))]">Recent Activity</p>
              <div className="space-y-1 max-h-[320px] overflow-y-auto app-scrollbar">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((act) => (
                    <div key={act.id} className={cn('rounded-lg p-2 transition-colors hover:bg-[hsl(var(--color-surface-raised)/0.3)]', act.severity === 'critical' || act.severity === 'error' ? 'bg-[hsl(var(--color-danger))]/5' : '')}>
                      <p className="text-xs font-medium text-[hsl(var(--color-text))]">{act.message}</p>
                      <p className="text-[10px] text-[hsl(var(--color-muted))]">{new Date(act.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[hsl(var(--color-muted))]">No recent notifications</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setNotifOpen(false); void navigate('/notifications'); }}
                className="mt-2 w-full rounded-lg py-1.5 text-center text-[10px] font-medium text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))]/5"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
        {}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-[hsl(var(--color-border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20 text-xs font-bold text-[hsl(var(--color-primary))]">
              A
            </div>
            <span className="hidden text-sm text-[hsl(var(--color-text))] sm:inline">admin</span>
          </button>
          {userMenuOpen && (
            <div className="skeuo-raised absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl p-2 shadow-2xl" role="menu">
              <div className="border-b border-[hsl(var(--color-border))] pb-1 mb-1">
                <p className="px-2 text-xs font-medium text-[hsl(var(--color-text))]">Administrator</p>
                <p className="px-2 text-[10px] text-[hsl(var(--color-muted))]">admin@mydash.local</p>
              </div>
              <UserMenuItem icon={User} label="Profile" href="/profile" onClose={closeMenus} />
              <UserMenuItem icon={Shield} label="Security" href="/security" onClose={closeMenus} />
              <UserMenuItem icon={Settings} label="Settings" href="/settings" onClose={closeMenus} />
              <UserMenuItem icon={Clock} label="Sessions" href="/sessions" onClose={closeMenus} />
              <UserMenuItem icon={Users} label="Roles" href="/roles" onClose={closeMenus} />
              <div className="border-t border-[hsl(var(--color-border))] mt-1 pt-1">
                <UserMenuItem icon={LogOut} label="Logout" href="/login" onClose={closeMenus} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
function ConnectionIndicator() {
  const isOnline = useAppStore((s) => s.isOnline);
  return (
    <div
      className={cn(
        'skeuo-inset flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider',
        isOnline
          ? 'text-[hsl(var(--color-success))]'
          : 'text-[hsl(var(--color-danger))]',
      )}
      aria-live="polite"
      aria-label={isOnline ? 'Connected' : 'Disconnected'}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-danger))]')} aria-hidden="true" />
      <span className="hidden sm:inline">{isOnline ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
