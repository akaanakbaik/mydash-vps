import { cn } from '../../utils/cn.js';
interface LogoProps {
  collapsed?: boolean;
  className?: string;
}
export function Logo({ collapsed, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={collapsed ? 28 : 32}
        height={collapsed ? 28 : 32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="My Dash Logo"
        role="img"
      >
        <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
        <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.15)" />
        <path
          d="M8 18L12 10L16 16L20 8L24 14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 22L12 18L16 22L20 18L24 22"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(217, 91%, 60%)" />
            <stop offset="1" stopColor="hsl(262, 83%, 58%)" />
          </linearGradient>
        </defs>
      </svg>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-[hsl(var(--color-text))]">My Dash</span>
          <span className="text-[10px] font-medium text-[hsl(var(--color-muted))] tracking-wider">v1.0</span>
        </div>
      )}
    </div>
  );
}
