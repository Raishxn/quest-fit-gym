import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    const { data: friendships } = await supabase.from('friendships').select('*')
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (!friendships) return;

    const accepted = friendships.filter(f => f.status === 'accepted');
    const pReceived = friendships.filter(f => f.status === 'pending' && f.receiver_id === user.id);
    const pSent = friendships.filter(f => f.status === 'pending' && f.initiator_id === user.id);

    // Get profiles for friends
    const friendIds = accepted.map(f => f.initiator_id === user.id ? f.receiver_id : f.initiator_id);
    const pendingReceivedIds = pReceived.map(f => f.initiator_id);
    const pendingSentIds = pSent.map(f => f.receiver_id);

    const allIds = [...new Set([...friendIds, ...pendingReceivedIds, ...pendingSentIds])];
    if (allIds.length === 0) {
      setFriends([]);
      setPendingReceived([]);
      setPendingSent([]);
      return;
    }

    const { data: profiles } = await supabase.from('profiles').select('user_id, name, username, xp, level, class_name, avatar_url').in('user_id', allIds);
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    setFriends(friendIds.map(id => ({ ...profileMap.get(id), friendship: accepted.find(f => f.initiator_id === id || f.receiver_id === id) })).filter(f => f.name));
    setPendingReceived(pReceived.map(f => ({ ...profileMap.get(f.initiator_id), friendshipId: f.id })).filter(f => f.name));
    setPendingSent(pendingSentIds.map(id => profileMap.get(id)).filter(Boolean));
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    const { data } = await supabase.from('profiles').select('user_id, name, username, xp, level, class_name')
      .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);
    setSearchResults(data || []);
  };

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    const { error } = await supabase.from('friendships').insert({ initiator_id: user.id, receiver_id: receiverId });
    if (error) {
      if (error.code === '23505') toast.error('Solicitação já enviada');
      else toast.error('Erro ao enviar solicitação');
      return;
    }
    toast.success('Solicitação enviada! ⚔️');
    setSearchResults([]);
    setSearchQuery('');
    loadFriends();
  };

  const respondRequest = async (friendshipId: string, accept: boolean) => {
    if (!user) return;
    await supabase.from('friendships').update({
      status: accept ? 'accepted' : 'rejected',
    }).eq('id', friendshipId);
    toast.success(accept ? 'Amizade aceita! 🤝' : 'Solicitação recusada');
    loadFriends();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Amigos
        </h1>
        <p className="text-muted-foreground">Encontre guerreiros e treine junto!</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Buscar Guerreiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Nome ou username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()} />
              <Button onClick={searchUsers}><Search className="h-4 w-4" /></Button>
            </div>
            {searchResults.map(result => (
              <div key={result.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {result.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-muted-foreground">@{result.username} • Nv.{result.level} {result.class_name}</p>
                </div>
                <Button size="sm" onClick={() => sendRequest(result.user_id)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Received */}
      {pendingReceived.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">📩 Solicitações Recebidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingReceived.map(req => (
                <div key={req.friendshipId} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {req.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{req.name}</p>
                    <p className="text-xs text-muted-foreground">@{req.username}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-success" onClick={() => respondRequest(req.friendshipId, true)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => respondRequest(req.friendshipId, false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Friends List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Meus Amigos ({friends.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground italic">Nenhum amigo ainda — busque guerreiros acima!</p>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : friend.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username} • Nv.{friend.level} {friend.class_name}</p>
                  </div>
                  <span className="font-mono text-xs text-primary">{friend.xp?.toLocaleString()} XP</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
