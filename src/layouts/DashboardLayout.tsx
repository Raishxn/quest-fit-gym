import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { Topbar } from '@/components/shared/Topbar';
import { BottomNav } from '@/components/shared/BottomNav';
import { LevelUpTracker } from '@/components/rpg/LevelUpTracker';
import { InteractiveTutorial } from '@/components/home/InteractiveTutorial';

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
      <LevelUpTracker />
      <InteractiveTutorial />
    </SidebarProvider>
  );
}
