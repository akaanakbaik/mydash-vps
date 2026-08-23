import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type Theme = 'dark' | 'light';
interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}
const STORAGE_KEY = 'mydash-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);
function readTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}
function applyTheme(theme: Theme, withTransition: boolean) {
  const root = document.documentElement;
  if (withTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transitioning');
    window.setTimeout(() => root.classList.remove('theme-transitioning'), 220);
  }
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    return;
  }
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    applyTheme(theme, false);
  }, [theme]);
  const toggle = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      return next;
    });
  };
  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
}
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
