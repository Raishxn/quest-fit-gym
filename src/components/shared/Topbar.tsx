import { Flame, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { XPBar } from '@/components/rpg/XPBar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from '@/components/shared/NotificationDropdown';

export function Topbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-4">
      <SidebarTrigger className="shrink-0" />

      {profile && (
        <>
          {/* Streak */}
          <div className="flex items-center gap-1 text-sm font-display font-bold">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-mono">{profile.streak}</span>
          </div>

          {/* XP Bar (desktop only) */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <XPBar xp={profile.xp} level={profile.level} compact className="w-full" />
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Sign Out */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            {profile.name.charAt(0)}
          </div>
        </>
      )}
    </header>
  );
}
