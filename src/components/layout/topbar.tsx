import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brand } from './brand';
import { SidebarNav } from './sidebar';
import { ThemeToggle } from './theme-toggle';

interface TopbarProps {
  userEmail?: string;
}

export function Topbar({ userEmail = 'admin@adventaholdings.com' }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 lg:px-8">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="lg:hidden">
        <Brand />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-sm">
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="hidden text-sm font-medium text-foreground sm:inline">Admin</span>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent hideClose side="left" className="max-w-[17rem] p-0">

          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex h-16 items-center border-b border-border px-5">
            <Brand />
          </div>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
