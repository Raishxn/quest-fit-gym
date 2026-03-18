import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, MapPin, Users, Flame, Star, Shield, Dumbbell } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Podium } from '@/components/ranking/Podium';
import { LeaderboardList } from '@/components/ranking/LeaderboardList';
import { InfoTooltip } from '@/components/ui/info-tooltip';

type MainTab = 'level' | 'overall' | 'streak' | 'guilds' | 'exercises';
type SubTab = 'global' | 'regional' | 'friends';

export default function RankingPage() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('level');
  const [subTab, setSubTab] = useState<SubTab>('global');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Exercise specific
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('all');

  useEffect(() => {
    // Carrega a lista de exercícios para o Select
    supabase.from('exercises').select('id, name').order('name')
      .then(({data: exrs}) => {
         if (exrs) {
           setExercisesList(exrs);
           if (exrs.length > 0) setSelectedExerciseId(exrs[0].id);
         }
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadRankings();
  }, [user, mainTab, subTab, selectedExerciseId]);

  const loadRankings = async () => {
    setLoading(true);
    setData([]);

    let query: any = null;

    // 1. Resolve basic query source
    if (mainTab === 'guilds') {
      query = supabase.from('guilds' as any).select('id, name, tag, guild_power, emblem_url').order('guild_power', { ascending: false });
    } else if (mainTab === 'exercises') {
      if (!selectedExerciseId) { setLoading(false); return; }
      query = supabase.from('exercise_ranks')
        .select('user_id, best_weight_kg, best_reps, profiles!inner(username, name, avatar_url, level, class_name)')
        .eq('exercise_id', selectedExerciseId)
        .order('best_weight_kg', { ascending: false });
    } else {
      query = supabase.from('profiles').select('user_id, username, name, xp, level, class_name, avatar_url, overall_mastery_points, overall_rank, streak');
      
      if (mainTab === 'level') query = query.order('level', { ascending: false }).order('xp', { ascending: false });
      if (mainTab === 'overall') query = query.order('overall_mastery_points', { ascending: false });
      if (mainTab === 'streak') query = query.order('streak', { ascending: false });
    }

    // 2. Resolve subTab scopes
    if (subTab === 'regional') {
       // Mock for now: No strict region filtration unless profile has state
    } 
    else if (subTab === 'friends') {
      if (mainTab === 'guilds') {
        // Ignorado: Não faz tanto sentido mostrar guildas amigas.
      } else {
        const { data: friendships } = await supabase.from('friendships').select('initiator_id, receiver_id')
          .eq('status', 'accepted')
          .or(`initiator_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
          
        let friendIds = [user!.id];
        if (friendships) {
          friendIds = [...friendIds, ...friendships.map(f => f.initiator_id === user!.id ? f.receiver_id : f.initiator_id)];
        }
        
        // Profiles is named differently if it's an inner join
        const filterCol = mainTab === 'exercises' ? 'profiles.user_id' : 'user_id';
        query = query.in(filterCol, friendIds);
      }
    }

    // 3. Execute
    const { data: result, error } = await query.limit(50);
    if (error) console.error("Ranking Fetch Error:", error);
    
    // 4. Transform data if needed for uniformity
    if (mainTab === 'exercises' && result) {
      const formatted = result.map((r: any) => ({
        user_id: r.user_id,
        name: r.profiles?.name,
        avatar_url: r.profiles?.avatar_url,
        level: r.profiles?.level,
        class_name: r.profiles?.class_name,
        best_weight_kg: r.best_weight_kg,
        best_reps: r.best_reps,
      }));
      setData(formatted);
    } else {
      setData(result || []);
    }
    
    setLoading(false);
  };

  const getValueDisplay = (entry: any) => {
    switch(mainTab) {
      case 'level': return `Nv. ${entry.level}`;
      case 'overall': return `${entry.overall_mastery_points || 0} PM`;
      case 'streak': return `${entry.streak || 0} Dias`;
      case 'guilds': return `${entry.guild_power || 0} Poder`;
      case 'exercises': return `${entry.best_weight_kg}kg`;
      default: return '';
    }
  };

  const getSecondaryDisplay = (entry: any) => {
    switch(mainTab) {
      case 'level': return `${entry.xp?.toLocaleString() || 0} XP`;
      case 'overall': return entry.overall_rank || 'Ferro IV';
      case 'streak': return entry.class_name ? `Classe: ${entry.class_name}` : '';
      case 'guilds': return `[${entry.tag}]`;
      case 'exercises': return `${entry.best_reps} reps | Nv. ${entry.level}`;
      default: return '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-warning" /> Hall da Fama
          <InfoTooltip title="O Novo Hall da Fama" content="Filtre suas conquistas em diversas categorias. Suba o Escopo para Regional caso queira competir apenas no seu Estado, ou Amigos para bater recordes na bolha."/>
        </h1>
        <p className="text-muted-foreground">Quem dominará o topo do servidor?</p>
      </motion.div>

      {/* Main Categories */}
      <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
        <Button variant={mainTab === 'level' ? 'default' : 'secondary'} size="sm" onClick={() => setMainTab('level')} className="rounded-full flex-1 sm:flex-none">
           <Star className="w-4 h-4 mr-1.5"/> Nível
        </Button>
        <Button variant={mainTab === 'overall' ? 'default' : 'secondary'} size="sm" onClick={() => setMainTab('overall')} className="rounded-full flex-1 sm:flex-none">
           <Crown className="w-4 h-4 mr-1.5"/> Overall
        </Button>
        <Button variant={mainTab === 'streak' ? 'default' : 'secondary'} size="sm" onClick={() => setMainTab('streak')} className="rounded-full flex-1 sm:flex-none">
           <Flame className="w-4 h-4 mr-1.5"/> Ofensiva
        </Button>
        <Button variant={mainTab === 'guilds' ? 'default' : 'secondary'} size="sm" onClick={() => setMainTab('guilds')} className="rounded-full flex-1 sm:flex-none">
           <Shield className="w-4 h-4 mr-1.5"/> Guildas
        </Button>
        <Button variant={mainTab === 'exercises' ? 'default' : 'secondary'} size="sm" onClick={() => setMainTab('exercises')} className="rounded-full flex-1 sm:flex-none">
           <Dumbbell className="w-4 h-4 mr-1.5"/> Exercícios
        </Button>
      </div>

      {mainTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full">
           <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="w-full sm:w-[300px] border-primary/30">
                 <SelectValue placeholder="Selecione um exercício" />
              </SelectTrigger>
              <SelectContent>
                 {exercisesList.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                 ))}
              </SelectContent>
           </Select>
        </motion.div>
      )}

      {/* Sub Scope Tabs */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as SubTab)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-secondary/50">
          <TabsTrigger value="global" className="font-display text-sm"><Globe className="h-3.5 w-3.5 mr-1" /> Global</TabsTrigger>
          <TabsTrigger value="regional" className="font-display text-sm"><MapPin className="h-3.5 w-3.5 mr-1" /> Regional</TabsTrigger>
          <TabsTrigger value="friends" className="font-display text-sm"><Users className="h-3.5 w-3.5 mr-1" /> Amigos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Leaderboard Body */}
      <Card className="border-primary/10 bg-background/50 backdrop-blur-sm min-h-[400px]">
        <CardContent className="pt-6 px-3 sm:px-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-display text-sm animate-pulse">Consultando oráculos das posições...</p>
             </div>
          ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
                <Trophy className="w-12 h-12 opacity-20" />
                <p>Nenhum guerreiro registrado nesta classificação.</p>
                {subTab === 'regional' && <p className="text-xs">O Filtro de Estados e Cidades está em calibração.</p>}
             </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${mainTab}-${subTab}`} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <Podium data={data} getValueKey={getValueDisplay} getSecondaryValueKey={getSecondaryDisplay} />
                <div className="w-full h-px bg-border/50 mb-4" />
                <LeaderboardList data={data} userId={user?.id} getValueKey={getValueDisplay} getSecondaryValueKey={getSecondaryDisplay} />
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
