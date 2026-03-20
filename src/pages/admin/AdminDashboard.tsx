import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, Target, TrendingUp, Dumbbell, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  workoutsToday: number;
  dau: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    workoutsToday: 0,
    dau: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Total users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Active subscriptions
        const { count: subsCount } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Workouts completed today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: workoutsCount } = await supabase
          .from("workout_sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("started_at", todayStart.toISOString());

        // DAU: distinct users with workout sessions today
        const { data: dauData } = await supabase
          .from("workout_sessions")
          .select("user_id")
          .gte("started_at", todayStart.toISOString());
        const uniqueDau = new Set(dauData?.map((d) => d.user_id) || []).size;

        setStats({
          totalUsers: usersCount || 0,
          activeSubscriptions: subsCount || 0,
          workoutsToday: workoutsCount || 0,
          dau: uniqueDau,
        });
      } catch (e) {
        console.error("Erro ao buscar stats:", e);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Usuários Totais",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Assinaturas VIP/Pro",
      value: stats.activeSubscriptions,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Treinos Hoje",
      value: stats.workoutsToday,
      icon: Dumbbell,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Usuários Ativos (DAU)",
      value: stats.dau,
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  const quickActions = [
    { label: "Gerar Gift Code", href: "/admin/gift-codes" },
    { label: "Buscar Usuário", href: "/admin/users" },
    { label: "Gerenciar Exercícios", href: "/admin/exercises" },
    { label: "Loja (Shop)", href: "/admin/shop" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Overview do Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a) ao painel administrativo supremo,{" "}
          {user?.user_metadata?.name || "Administrador"}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-border relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center justify-between">
                {card.title}
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${loading ? "animate-pulse text-muted-foreground" : ""}`}>
                {loading ? "···" : card.value.toLocaleString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-6 bg-secondary/10 border border-border rounded-xl">
        <h2 className="text-lg font-bold font-display flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Ações Rápidas
        </h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="p-4 bg-background border border-border rounded-lg text-center text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
