import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brand } from './brand';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  onNavigate?: () => void;
}

/** The shared navigation list, reused by the desktop rail and the mobile drawer. */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Menu
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="relative size-[18px] shrink-0" />
              <span className="relative">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Fixed desktop sidebar rail. */
export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Brand />
      </div>
      <SidebarNav />
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4">
          <p className="text-xs font-semibold text-foreground">Frontend demo</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            All data persists locally in your browser via localStorage.
          </p>
        </div>
      </div>
    </aside>
  );
}
