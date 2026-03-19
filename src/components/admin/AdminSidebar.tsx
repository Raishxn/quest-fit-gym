import { Home, Users, Gift, Database, ShieldAlert, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  { term: 'Dashboard', href: '/admin', icon: Home },
  { term: 'Usuários', href: '/admin/users', icon: Users },
  { term: 'Códigos (Gift)', href: '/admin/gift-codes', icon: Gift },
  { term: 'Exercícios DB', href: '/admin/exercises', icon: Database },
];

export function AdminSidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b border-border/50">
        <ShieldAlert className="h-6 w-6 text-primary" />
        <span className="font-display font-bold text-xl drop-shadow-md text-primary group-data-[state=collapsed]:hidden">Admin Control</span>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/50">Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.term}>
                  <SidebarMenuButton asChild tooltip={item.term}>
                    <NavLink to={item.href} className={({ isActive }) => (isActive ? 'bg-primary/10 text-primary font-bold' : '')}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.term}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex flex-col gap-2">
           <SidebarMenuButton asChild tooltip="Voltar ao App" onClick={() => navigate('/home')}>
             <div className="flex items-center gap-2 w-full text-muted-foreground hover:text-foreground cursor-pointer">
               <Home className="h-4 w-4" />
               <span className="group-data-[state=collapsed]:hidden text-sm">Voltar ao App</span>
             </div>
           </SidebarMenuButton>
           <SidebarMenuButton asChild tooltip="Sair" onClick={handleSignOut}>
             <div className="flex items-center gap-2 w-full text-destructive hover:text-destructive/80 cursor-pointer">
               <LogOut className="h-4 w-4" />
               <span className="group-data-[state=collapsed]:hidden text-sm">Sair</span>
             </div>
           </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
