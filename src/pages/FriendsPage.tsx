import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Loader2, UserMinus, Clock, Inbox, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FriendProfile {
  user_id: string;
  name: string;
  username: string;
  xp: number;
  level: number;
  class_name: string;
  avatar_url?: string;
  friendshipId?: string;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendProfile[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Set of user IDs that are already friends or have pending requests
  const existingRelationIds = useMemo(() => {
    const ids = new Set<string>();
    friends.forEach(f => ids.add(f.user_id));
    pendingReceived.forEach(f => ids.add(f.user_id));
    pendingSent.forEach(f => ids.add(f.user_id));
    return ids;
  }, [friends, pendingReceived, pendingSent]);

  useEffect(() => {
    if (!user) return;
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    setLoading(true);

    const { data: friendships } = await supabase.from('friendships').select('*')
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (!friendships) {
      setLoading(false);
      return;
    }

    const accepted = friendships.filter(f => f.status === 'accepted');
    const pReceived = friendships.filter(f => f.status === 'pending' && f.receiver_id === user.id);
    const pSent = friendships.filter(f => f.status === 'pending' && f.initiator_id === user.id);

    const friendIds = accepted.map(f => f.initiator_id === user.id ? f.receiver_id : f.initiator_id);
    const pendingReceivedIds = pReceived.map(f => f.initiator_id);
    const pendingSentIds = pSent.map(f => f.receiver_id);

    const allIds = [...new Set([...friendIds, ...pendingReceivedIds, ...pendingSentIds])];
    if (allIds.length === 0) {
      setFriends([]);
      setPendingReceived([]);
      setPendingSent([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase.from('profiles')
      .select('user_id, name, username, xp, level, class_name, avatar_url')
      .in('user_id', allIds);
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    setFriends(
      friendIds.map(id => {
        const profile = profileMap.get(id);
        const friendship = accepted.find(f => f.initiator_id === id || f.receiver_id === id);
        return profile ? { ...profile, friendshipId: friendship?.id } as FriendProfile : null;
      }).filter(Boolean) as FriendProfile[]
    );

    setPendingReceived(
      pReceived.map(f => {
        const profile = profileMap.get(f.initiator_id);
        return profile ? { ...profile, friendshipId: f.id } as FriendProfile : null;
      }).filter(Boolean) as FriendProfile[]
    );

    setPendingSent(
      pSent.map(f => {
        const profile = profileMap.get(f.receiver_id);
        return profile ? { ...profile, friendshipId: f.id } as FriendProfile : null;
      }).filter(Boolean) as FriendProfile[]
    );

    setLoading(false);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearchLoading(true);
    const { data } = await supabase.from('profiles')
      .select('user_id, name, username, xp, level, class_name, avatar_url')
      .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);

    // Filter out users that already have a relationship
    const filtered = (data || []).filter(u => !existingRelationIds.has(u.user_id));
    setSearchResults(filtered as FriendProfile[]);
    setSearchLoading(false);
  };

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    setActionLoading(receiverId);
    const { error } = await supabase.from('friendships').insert({ initiator_id: user.id, receiver_id: receiverId });
    if (error) {
      if (error.code === '23505') toast.error('Solicitação já enviada');
      else toast.error('Erro ao enviar solicitação');
      setActionLoading(null);
      return;
    }
    toast.success('Solicitação enviada! ⚔️');
    setSearchResults(prev => prev.filter(r => r.user_id !== receiverId));
    setSearchQuery('');
    await loadFriends();
    setActionLoading(null);
  };

  const respondRequest = async (friendshipId: string, accept: boolean) => {
    if (!user) return;
    setActionLoading(friendshipId);
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
      toast.success('Amizade aceita! 🤝');
    } else {
      await supabase.from('friendships').delete().eq('id', friendshipId);
      toast.success('Solicitação recusada');
    }
    await loadFriends();
    setActionLoading(null);
  };

  const cancelRequest = async (friendshipId: string) => {
    if (!user) return;
    setActionLoading(friendshipId);
    await supabase.from('friendships').delete().eq('id', friendshipId);
    toast.success('Solicitação cancelada');
    await loadFriends();
    setActionLoading(null);
  };

  const removeFriend = async (friendshipId: string, friendName: string) => {
    if (!user) return;
    setActionLoading(friendshipId);
    await supabase.from('friendships').delete().eq('id', friendshipId);
    toast.success(`${friendName} removido(a) da lista de amigos`);
    await loadFriends();
    setActionLoading(null);
  };

  const totalPending = pendingReceived.length + pendingSent.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando amigos...</p>
      </div>
    );
  }

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
              <Input
                placeholder="Nome ou username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={searchLoading}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <AnimatePresence>
              {searchResults.map(result => (
                <motion.div
                  key={result.user_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {result.avatar_url
                      ? <img src={result.avatar_url} className="w-full h-full object-cover" alt="" />
                      : result.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground">@{result.username} • Nv.{result.level} {result.class_name}</p>
                  </div>
                  <Button size="sm" onClick={() => sendRequest(result.user_id)} disabled={actionLoading === result.user_id}>
                    {actionLoading === result.user_id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><UserPlus className="h-4 w-4 mr-1" /> Adicionar</>
                    }
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {searchResults.length === 0 && searchQuery && !searchLoading && (
              <p className="text-xs text-muted-foreground text-center py-2">Nenhum guerreiro encontrado</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs: Friends / Requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="gap-1.5">
              <Users className="h-4 w-4" />
              Amigos
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <Inbox className="h-4 w-4" />
              Solicitações
              {totalPending > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">{totalPending}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <Card>
              <CardContent className="pt-6 space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground italic">Nenhum amigo ainda — busque guerreiros acima!</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <motion.div
                      key={friend.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                        {friend.avatar_url
                          ? <img src={friend.avatar_url} className="w-full h-full object-cover" alt="" />
                          : friend.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username} • Nv.{friend.level} {friend.class_name}</p>
                      </div>
                      <span className="font-mono text-xs text-primary shrink-0">{friend.xp?.toLocaleString()} XP</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => friend.friendshipId && removeFriend(friend.friendshipId, friend.name)}
                        disabled={actionLoading === friend.friendshipId}
                        title="Remover amigo"
                      >
                        {actionLoading === friend.friendshipId
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <UserMinus className="h-4 w-4" />
                        }
                      </Button>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-4">
              {/* Received */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Inbox className="h-4 w-4" /> Recebidas
                    {pendingReceived.length > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0">{pendingReceived.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingReceived.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma solicitação recebida</p>
                  ) : (
                    pendingReceived.map(req => (
                      <motion.div
                        key={req.friendshipId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                          {req.avatar_url
                            ? <img src={req.avatar_url} className="w-full h-full object-cover" alt="" />
                            : req.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{req.name}</p>
                          <p className="text-xs text-muted-foreground">@{req.username} • Nv.{req.level} {req.class_name}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-500 hover:text-green-400 hover:bg-green-500/10 shrink-0"
                          onClick={() => req.friendshipId && respondRequest(req.friendshipId, true)}
                          disabled={actionLoading === req.friendshipId}
                          title="Aceitar"
                        >
                          {actionLoading === req.friendshipId
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Check className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => req.friendshipId && respondRequest(req.friendshipId, false)}
                          disabled={actionLoading === req.friendshipId}
                          title="Recusar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Sent */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Send className="h-4 w-4" /> Enviadas
                    {pendingSent.length > 0 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{pendingSent.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingSent.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma solicitação enviada</p>
                  ) : (
                    pendingSent.map(req => (
                      <motion.div
                        key={req.user_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                          {req.avatar_url
                            ? <img src={req.avatar_url} className="w-full h-full object-cover" alt="" />
                            : req.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{req.name}</p>
                          <p className="text-xs text-muted-foreground">@{req.username}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="h-3 w-3" /> Pendente
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 text-xs"
                            onClick={() => req.friendshipId && cancelRequest(req.friendshipId)}
                            disabled={actionLoading === req.friendshipId}
                          >
                            {actionLoading === req.friendshipId
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <>Cancelar</>
                            }
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
