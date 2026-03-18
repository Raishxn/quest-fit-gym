import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldAlert, Search, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { CreateGuildDialog } from '@/components/guild/CreateGuildDialog';

export default function GuildsPage() {
  const { user } = useAuth();
  const [myGuild, setMyGuild] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allGuilds, setAllGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: memberData } = (await supabase
        .from('guild_members' as any)
        .select('guild_id, role')
        .eq('user_id', user!.id)
        .maybeSingle()) as any;

      if (memberData) {
        const { data: guildData } = await supabase
          .from('guilds' as any)
          .select('*')
          .eq('id', memberData.guild_id)
          .single();
        setMyGuild(guildData);

        const { data: membersData } = await supabase
          .from('guild_members' as any)
          .select('*, profiles(name, username)')
          .eq('guild_id', memberData.guild_id);
        setMembers(membersData || []);
      } else {
        setMyGuild(null);
        // Supabase foreign key count query trick is usually profiles(count)
        // We'll keep it simple for now and just fetch guilds.
        const { data: guildsData } = await supabase
          .from('guilds' as any)
          .select('*');
        setAllGuilds(guildsData || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const joinGuild = async (guildId: string) => {
    const { error } = await supabase.from('guild_members' as any).insert({ guild_id: guildId, user_id: user!.id });
    if (error) toast.error('Erro ao entrar na guilda');
    else { toast.success('Você entrou na guilda!'); loadData(); }
  };

  const leaveGuild = async () => {
    const { error } = await supabase.from('guild_members' as any).delete().eq('user_id', user!.id);
    if (error) toast.error('Erro ao sair da guilda');
    else { toast.success('Você saiu da guilda.'); loadData(); }
  };

  const filteredGuilds = allGuilds.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.tag.toLowerCase().includes(search.toLowerCase())
  );

  const GuildLobby = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Você não está em uma Guilda</CardTitle>
          <CardDescription>Junte-se a guerreiros e conquiste a glória.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar guildas pelo nome ou tag..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border" 
            />
          </div>
          <div className="pt-4 space-y-3">
             {filteredGuilds.length === 0 ? (
               <p className="text-center text-muted-foreground py-4">Nenhuma guilda encontrada.</p>
             ) : (
               filteredGuilds.map(guild => (
                 <div key={guild.id} className="p-4 rounded-xl border border-border bg-secondary/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                         <Shield className="text-blue-500 w-5 h-5"/>
                       </div>
                       <div>
                         <p className="font-bold text-sm">{guild.name} <span className="text-xs text-muted-foreground ml-1">[{guild.tag}]</span></p>
                         <p className="text-xs text-muted-foreground">Poder: {guild.power || 0}</p>
                       </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => joinGuild(guild.id)}>Entrar</Button>
                 </div>
               ))
             )}
          </div>
        </CardContent>
        <CardFooter>
          <CreateGuildDialog onCreated={loadData}>
            <Button className="w-full">Criar Nova Guilda</Button>
          </CreateGuildDialog>
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
        <CardHeader className="pt-10 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {myGuild.name} <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">[{myGuild.tag}]</span>
              </CardTitle>
              <CardDescription className="mt-1">{myGuild.description || "Sem descrição"}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={leaveGuild}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Poder da Guilda</p>
              <p className="text-xl font-bold text-glow">{myGuild.power || 0}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Membros</p>
              <p className="text-xl font-bold">{members.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList className="w-full">
          <TabsTrigger value="members" className="flex-1">Membros</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <Card className="bg-card border-border">
             <CardContent className="pt-6 space-y-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {member.profiles?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <p className="text-sm font-bold">
                             {member.profiles?.name || 'Desconhecido'} 
                             {member.role === 'leader' && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 rounded ml-2">Líder</span>}
                           </p>
                           <p className="text-xs text-muted-foreground">Membro Rank Geral</p>
                        </div>
                     </div>
                  </div>
                ))}
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
      ) : myGuild ? (
        <GuildDashboard />
      ) : (
        <GuildLobby />
      )}
    </div>
  );
}
