import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Overview do Sistema</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo(a) ao painel administrativo supremo, {user?.user_metadata?.name || 'Administrador'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center justify-between">
              Usuários Totais
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">--</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados na plataforma</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center justify-between">
               Receita Estimada (Stripe)
               <Target className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold font-mono">R$ --</div>
             <p className="text-xs text-muted-foreground mt-1">Neste mês</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center justify-between">
              Assinaturas VIP/Pro
               <Activity className="h-4 w-4 text-secondary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold font-mono">--</div>
             <p className="text-xs text-muted-foreground mt-1">Ativas no momento</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-secondary/10 border border-secondary/20 rounded-lg">
        <h2 className="text-lg font-bold font-display text-secondary">Ações Rápidas</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Placeholder for quick links or buttons */}
           <div className="p-4 bg-background border border-border rounded text-center opacity-50">Gerar Gift Code</div>
           <div className="p-4 bg-background border border-border rounded text-center opacity-50">Buscar Usuário</div>
           <div className="p-4 bg-background border border-border rounded text-center opacity-50">Log de Erros</div>
           <div className="p-4 bg-background border border-border rounded text-center opacity-50">Configurações</div>
        </div>
      </div>
    </div>
  );
}
