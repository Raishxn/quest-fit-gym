import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors dark:bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header/Topbar for Admin */}
          <header className="h-16 border-b border-border/50 flex items-center px-6 sticky top-0 bg-background/95 backdrop-blur z-10 shrink-0">
            <h1 className="text-xl font-display font-bold">Painel de Controle</h1>
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
