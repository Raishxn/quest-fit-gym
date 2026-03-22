import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sword, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function PvPChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { creatorScore: number; targetScore: number }>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    setLoading(true);
    // Fetch challenges where user is creator or target
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:profiles!creator_id (username, name, avatar_url, level),
        target:profiles!target_id (username, name, avatar_url, level)
      `)
      .or(`creator_id.eq.${user?.id},target_id.eq.${user?.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges', error);
      toast.error('Erro ao carregar desafios PvP');
    } else if (data) {
      setChallenges(data);
      
      const newScores: Record<string, { creatorScore: number; targetScore: number }> = {};
      const activeOrCompleted = data.filter(c => c.status === 'active' || c.status === 'completed');
      
      for (const challenge of activeOrCompleted) {
        // Query sessions for creator
        const { data: creatorSessions } = await supabase.from('workout_sessions')
          .select('id, total_volume_kg')
          .eq('user_id', challenge.creator_id)
          .gte('started_at', challenge.start_date)
          .lte('started_at', challenge.end_date)
          .eq('status', 'completed');
          
        // Query sessions for target
        const { data: targetSessions } = await supabase.from('workout_sessions')
          .select('id, total_volume_kg')
          .eq('user_id', challenge.target_id)
          .gte('started_at', challenge.start_date)
          .lte('started_at', challenge.end_date)
          .eq('status', 'completed');

        let creatorScore = 0;
        let targetScore = 0;

        if (challenge.type === 'volume_week') {
          creatorScore = creatorSessions?.reduce((acc, s) => acc + Number(s.total_volume_kg || 0), 0) || 0;
          targetScore = targetSessions?.reduce((acc, s) => acc + Number(s.total_volume_kg || 0), 0) || 0;
        } else {
          creatorScore = creatorSessions?.length || 0;
          targetScore = targetSessions?.length || 0;
        }

        newScores[challenge.id] = { creatorScore, targetScore };
      }
      
      setScores(newScores);
    }
    setLoading(false);
  };

  const handleResponse = async (challengeId: string, accept: boolean) => {
    setProcessingId(challengeId);
    
    if (accept) {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'active' })
        .eq('id', challengeId);
        
      if (!error) {
        toast.success('Desafio aceito! Que vença o melhor. ⚔️');
        loadChallenges();
      } else {
         toast.error('Erro ao aceitar desafio.');
      }
    } else {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);
      
      if (!error) {
         toast.info('Desafio recusado.');
         loadChallenges();
      } else {
         toast.error('Erro ao recusar desafio.');
      }
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border">
          Você não possui nenhum desafio PvP ativo no momento. Vá ao Hall da Fama e desafie alguém!
        </p>
      ) : (
        challenges.map(challenge => {
          const isCreator = challenge.creator_id === user?.id;
          const opponent = isCreator ? challenge.target : challenge.creator;
          const isPending = challenge.status === 'pending';
          const isActive = challenge.status === 'active';
          
          const myScore = isCreator ? scores[challenge.id]?.creatorScore || 0 : scores[challenge.id]?.targetScore || 0;
          const opScore = isCreator ? scores[challenge.id]?.targetScore || 0 : scores[challenge.id]?.creatorScore || 0;

          const unit = challenge.type === 'volume_week' ? 'kg' : 'treinos';

          return (
             <Card key={challenge.id} className="bg-card border-border overflow-hidden">
               <CardHeader className="pb-3">
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 text-primary font-display font-bold">
                     <Sword className="w-5 h-5" />
                     <span>Vs. {opponent?.name}</span>
                   </div>
                   <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                     isPending ? 'bg-warning/20 text-warning' : 
                     isActive ? 'bg-primary/20 text-primary animate-pulse' : 
                     'bg-secondary text-muted-foreground'
                   }`}>
                     {isPending ? 'Pendente' : isActive ? 'Em Andamento' : 'Concluído'}
                   </span>
                 </div>
                 <div className="text-sm text-muted-foreground mt-1">
                   Desafio de {challenge.type === 'volume_week' ? 'Maior Volume (7 Dias)' : 'Mais Treinos (7 Dias)'}
                 </div>
               </CardHeader>
               
               <CardContent>
                 {(isActive || challenge.status === 'completed') && (
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border mt-2 space-y-4 relative overflow-hidden">
                       <div className="flex justify-between items-end relative z-10">
                         <div className="text-center">
                           <p className="text-xs text-muted-foreground mb-1">Você</p>
                           <p className={`font-mono font-bold text-2xl ${myScore >= opScore ? 'text-primary' : 'text-muted-foreground'}`}>
                             {myScore.toLocaleString()} <span className="text-xs font-sans font-normal opacity-70">{unit}</span>
                           </p>
                         </div>
                         <div className="text-center w-20 flex flex-col justify-center items-center">
                            <span className="text-xl opacity-30">⚔️</span>
                            {isActive && <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">{myScore > opScore ? 'Vencendo' : myScore < opScore ? 'Perdendo' : 'Empate'}</div>}
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-muted-foreground mb-1">{opponent?.name}</p>
                           <p className={`font-mono font-bold text-2xl ${opScore >= myScore ? 'text-destructive' : 'text-muted-foreground'}`}>
                             {opScore.toLocaleString()} <span className="text-xs font-sans font-normal opacity-70">{unit}</span>
                           </p>
                         </div>
                       </div>
                       
                       <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                          {myScore === 0 && opScore === 0 ? (
                            <div className="w-1/2 h-full bg-border" />
                          ) : (
                            <>
                              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(myScore / (myScore + opScore)) * 100}%` }} />
                              <div className="bg-destructive h-full transition-all duration-1000" style={{ width: `${(opScore / (myScore + opScore)) * 100}%` }} />
                            </>
                          )}
                       </div>
                    </div>
                 )}
               </CardContent>

               {isPending && !isCreator && (
                 <CardFooter className="flex gap-3 pt-0">
                   <Button 
                     className="flex-1 bg-green-500 hover:bg-green-600 text-white" 
                     onClick={() => handleResponse(challenge.id, true)}
                     disabled={!!processingId}
                   >
                     {processingId === challenge.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Aceitar</>}
                   </Button>
                   <Button 
                     variant="destructive" 
                     className="flex-1"
                     onClick={() => handleResponse(challenge.id, false)}
                     disabled={!!processingId}
                   >
                     {processingId === challenge.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Recusar</>}
                   </Button>
                 </CardFooter>
               )}
               {isPending && isCreator && (
                  <CardFooter className="pt-0">
                     <p className="w-full text-center text-xs text-muted-foreground">Aguardando o adversário aceitar a batalha...</p>
                  </CardFooter>
               )}
             </Card>
          );
        })
      )}
    </div>
  );
}
