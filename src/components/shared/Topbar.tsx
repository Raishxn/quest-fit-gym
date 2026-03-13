import { Flame, Bell } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { XPBar } from '@/components/rpg/XPBar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const user = useUserStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-4">
      <SidebarTrigger className="shrink-0" />

      {user && (
        <>
          {/* Streak */}
          <div className="flex items-center gap-1 text-sm font-display font-bold">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-mono">{user.streak}</span>
          </div>

          {/* XP Bar (desktop only) */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <XPBar xp={user.xp} level={user.level} compact className="w-full" />
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            {user.name.charAt(0)}
          </div>
        </>
      )}
    </header>
  );
}
