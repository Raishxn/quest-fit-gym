import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldAlert, Users, Search, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function GuildsPage() {
  const { user } = useAuth();
  
  // Guild state can be expanded, simply keeping it as mock/placeholder structure for now
  const [hasGuild, setHasGuild] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkGuild();
    }
  }, [user]);

  const checkGuild = async () => {
    setLoading(true);
    // Real implementation would check guild_members table
    const { data } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', user!.id)
      .maybeSingle();

    setHasGuild(!!data);
    setLoading(false);
  };

  const GuildLobby = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Você não está em uma Guilda</CardTitle>
          <CardDescription>Junte-se a guerreiros e conquiste as Missões de Guilda juntos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar guildas pelo nome ou tag..." className="pl-9 bg-secondary border-border" />
          </div>
          <div className="pt-4 space-y-3">
             <div className="p-4 rounded-xl border border-border bg-secondary/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                     <Shield className="text-blue-500 w-5 h-5"/>
                   </div>
                   <div>
                     <p className="font-bold text-sm">Guerreiros da Luz <span className="text-xs text-muted-foreground ml-1">[GLZ]</span></p>
                     <p className="text-xs text-muted-foreground">Membros: 12/50 • Poder: 8.5K</p>
                   </div>
                </div>
                <Button size="sm" variant="secondary">Solicitar</Button>
             </div>
             
             <div className="p-4 rounded-xl border border-border bg-secondary/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                     <Shield className="text-red-500 w-5 h-5"/>
                   </div>
                   <div>
                     <p className="font-bold text-sm">Legião de Titãs <span className="text-xs text-muted-foreground ml-1">[LTN]</span></p>
                     <p className="text-xs text-muted-foreground">Membros: 48/50 • Poder: 24.2K</p>
                   </div>
                </div>
                <Button size="sm" variant="secondary">Solicitar</Button>
             </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Criar Nova Guilda
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const GuildDashboard = () => (
    <div className="space-y-6">
       <Card className="bg-card border-border overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-900 to-purple-900 relative">
          <div className="absolute -bottom-6 left-6 w-16 h-16 bg-background rounded-xl flex items-center justify-center border-4 border-card">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <CardHeader className="pt-10">
          <CardTitle className="flex items-center gap-2">
            Guerreiros da Luz <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">[GLZ]</span>
          </CardTitle>
          <CardDescription>A glória nos aguarda em cada repetição.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Poder da Guilda</p>
              <p className="text-xl font-bold text-glow">8,540</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Membros</p>
              <p className="text-xl font-bold">12/50</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="missions">
        <TabsList className="w-full">
          <TabsTrigger value="missions" className="flex-1">Missões de Guilda</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Membros</TabsTrigger>
        </TabsList>
        <TabsContent value="missions" className="mt-4">
          <Card className="bg-card border-border">
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary"/> Desafio Semanal</CardTitle>
               <CardDescription>Completar 100 treinos coletivamente.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="bg-secondary h-4 rounded-full overflow-hidden mb-2">
                   <div className="bg-primary h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                   <span>45 Treinos</span>
                   <span>100 Treinos</span>
                </div>
             </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <Card className="bg-card border-border">
             <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">E</div>
                      <div>
                         <p className="text-sm font-bold">Erick <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 rounded ml-1">Líder</span></p>
                         <p className="text-xs text-muted-foreground">Poder: 1.2K</p>
                      </div>
                   </div>
                </div>
                {/* Outros membros aqui */}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <Shield className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-blue-500" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>Guildas</h1>
          <p className="text-muted-foreground">A união faz a força</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Carregando Guilda...</p>
        </div>
      ) : hasGuild ? (
        <GuildDashboard />
      ) : (
        <GuildLobby />
      )}
    </div>
  );
}
