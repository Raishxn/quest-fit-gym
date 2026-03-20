import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bug, ThumbsUp, Plus, X, ChevronUp, MessageCircleCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type FeedbackType = 'suggestion' | 'bug';

interface FeedbackItem {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: string;
  created_at: string;
  profiles?: { name: string; username: string; class_name: string; level: number; avatar_url: string };
  votes: number;
  has_voted: boolean;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<FeedbackType>('suggestion');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Create Dialog State
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<FeedbackType>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadFeedback = async () => {
    if (!user) return;
    setLoading(true);

    const { data: feedbackData, error } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles!feedback_user_id_fkey ( name, username, class_name, level, avatar_url )
      `)
      .eq('type', tab)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      setFetchError(error.message);
      setLoading(false);
      return;
    }
    setFetchError(null);

    const { data: votesData } = await supabase
      .from('feedback_votes')
      .select('feedback_id, user_id');

    if (feedbackData) {
       const mapped: FeedbackItem[] = feedbackData.map((f: any) => {
          const itemVotes = votesData?.filter((v: any) => v.feedback_id === f.id) || [];
          const hasVoted = itemVotes.some((v: any) => v.user_id === user.id);
          return {
             ...f,
             votes: itemVotes.length,
             has_voted: hasVoted
          };
       });
       // Sort by votes (desc)
       mapped.sort((a, b) => b.votes - a.votes);
       setItems(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeedback();
  }, [user, tab]);

  const toggleVote = async (feedbackId: string, hasVoted: boolean) => {
    if (!user) return;
    
    // Optimistic update
    setItems(items.map(item => {
      if (item.id === feedbackId) {
        return { ...item, has_voted: !hasVoted, votes: item.votes + (hasVoted ? -1 : 1) };
      }
      return item;
    }));

    if (hasVoted) {
      await supabase.from('feedback_votes').delete().eq('feedback_id', feedbackId).eq('user_id', user.id);
    } else {
      await supabase.from('feedback_votes').insert({ feedback_id: feedbackId, user_id: user.id });
    }
    // Re-sort after vote without making db call isn't necessary immediately, but good UX
  };

  const handleCreateSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Preencha título e descrição!');
      return;
    }
    const { data, error } = await supabase.from('feedback').insert({
      user_id: user!.id,
      type: createType,
      title: title.trim(),
      description: description.trim()
    }).select().single();

    if (error) {
      toast.error('Erro ao enviar feedback.');
    } else {
      toast.success(createType === 'bug' ? 'Bug reportado com sucesso!' : 'Sugestão enviada com sucesso!');
      setOpenCreate(false);
      setTitle('');
      setDescription('');
      loadFeedback();
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-secondary text-secondary-foreground';
      case 'in_progress': return 'bg-warning/20 text-warning border border-warning/50';
      case 'completed': return 'bg-green-500/20 text-green-500 border border-green-500/50';
      case 'rejected': return 'bg-destructive/20 text-destructive border border-destructive/50';
      default: return 'bg-secondary';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <MessageCircleCode className="h-8 w-8 text-primary" /> Mural da Comunidade
          </h1>
          <p className="text-muted-foreground">Ajude a moldar o futuro do QuestFit.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
           <Button onClick={() => { setCreateType(tab); setOpenCreate(true); }} className="font-bold">
             <Plus className="w-4 h-4 mr-2" />
             {tab === 'bug' ? 'Reportar Bug' : 'Nova Sugestão'}
           </Button>
        </motion.div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FeedbackType)}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="suggestion" className="font-display font-bold"><MessageSquare className="w-4 h-4 mr-2"/> Sugestões</TabsTrigger>
          <TabsTrigger value="bug" className="font-display font-bold"><Bug className="w-4 h-4 mr-2"/> Bug Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4 min-h-[50vh]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive bg-destructive/10 rounded-xl border border-dashed border-destructive/50">
             <MessageSquare className="w-12 h-12 opacity-50 mb-4" />
             <p className="font-bold">Erro ao carregar feedbacks</p>
             <p className="text-sm font-mono mt-2">{fetchError}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
             <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
             <p>Nenhuma {tab === 'bug' ? 'falha reportada' : 'sugestão encontrada'}.</p>
             <p className="text-sm">Seja o primeiro a enviar!</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-0 flex">
                    {/* Voting Column */}
                    <div className="w-16 flex flex-col items-center justify-start py-6 border-r border-border/50 bg-secondary/5">
                       <button 
                         onClick={() => toggleVote(item.id, item.has_voted)}
                         className={`p-2 rounded-full transition-colors ${item.has_voted ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                       >
                         <ChevronUp className="w-6 h-6" />
                       </button>
                       <span className={`font-display font-bold text-lg mt-1 ${item.has_voted ? 'text-primary' : ''}`}>
                         {item.votes}
                       </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start gap-4">
                         <div>
                           <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                               {getStatusLabel(item.status)}
                             </span>
                             <span className="text-xs text-muted-foreground">
                               {new Date(item.created_at).toLocaleDateString()}
                             </span>
                           </div>
                           <h3 className="font-bold text-xl">{item.title}</h3>
                           <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{item.description}</p>
                         </div>
                      </div>

                      {item.profiles && (
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                           {item.profiles.avatar_url ? (
                             <img src={item.profiles.avatar_url} className="w-6 h-6 rounded-full object-cover" />
                           ) : (
                             <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                               {item.profiles.name?.charAt(0)}
                             </div>
                           )}
                           <span className="text-xs text-muted-foreground">Por <strong className="text-foreground">{item.profiles.name}</strong> (@{item.profiles.username})</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {createType === 'bug' ? 'Reportar um Bug 🐛' : 'Sugerir uma Melhoria 💡'}
            </DialogTitle>
            <DialogDescription>
              {createType === 'bug' 
                ? 'Encontrou algum erro no nosso sistema? Descreva-o abaixo para que nossa equipe mágica repare!' 
                : 'Tem uma ideia incrível para o QuestFit? Compartilhe com a comunidade!'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resumo (Título)</Label>
              <Input 
                placeholder={createType === 'bug' ? 'Ex: App crasha ao abrir a guilda' : 'Ex: Adicionar ranking de Mago'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição Detalhada</Label>
              <Textarea 
                placeholder={createType === 'bug' ? 'Passo a passo para reproduzir o problema...' : 'Minha ideia funciona da seguinte forma...'}
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreateSubmit}>Enviar {createType === 'bug' ? 'Report' : 'Sugestão'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
