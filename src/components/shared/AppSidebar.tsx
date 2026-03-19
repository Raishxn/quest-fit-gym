import { Home, Dumbbell, ListMusic, Salad, Activity, TrendingUp, Trophy, Users, User, Settings, Swords, Target, Shield, MessageSquare } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { XPBar } from '@/components/rpg/XPBar';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { PlanBadge } from '@/components/shared/PlanBadge';

const navItems = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Treino', url: '/workout', icon: Dumbbell },
  { title: 'Missões', url: '/missions', icon: Target },
  { title: 'Guildas', url: '/guilds', icon: Shield },
  { title: 'Playlists', url: '/playlists', icon: ListMusic },
  { title: 'Dieta', url: '/diet', icon: Salad },
  { title: 'Cardio', url: '/cardio', icon: Activity },
  { title: 'Progresso', url: '/progress', icon: TrendingUp },
  { title: 'Ranking', url: '/ranking', icon: Trophy },
  { title: 'Social', url: '/friends', icon: Users },
  { title: 'Feedback', url: '/feedback', icon: MessageSquare },
  { title: 'Perfil', url: '/profile', icon: User },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Swords className="h-7 w-7 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-display text-xl font-bold text-primary text-glow">
              QuestFit
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        {profile && !collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 overflow-hidden relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div>
                  <p className={`font-semibold text-sm ${profile.isPremium ? 'text-primary' : ''} drop-shadow-sm`}>{profile.name}</p>
                  <LevelBadge level={profile.level} className={profile.currentClass?.name || profile.className} size="sm" />
                </div>
              </div>
            </div>
            <XPBar xp={profile.xp} level={profile.level} compact />
          </div>
        )}
        {profile && collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 overflow-hidden relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
