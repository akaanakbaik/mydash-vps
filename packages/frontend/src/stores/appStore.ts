import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  isOnline: boolean;
  toggleSidebar: () => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  isOnline: true,
  toggleSidebar: () => { set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })); },
  openMobileDrawer: () => { set({ mobileDrawerOpen: true }); },
  closeMobileDrawer: () => { set({ mobileDrawerOpen: false }); },
  setOnline: (online: boolean) => { set({ isOnline: online }); },
}));

