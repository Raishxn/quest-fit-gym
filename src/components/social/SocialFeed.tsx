import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, MessageCircle, Send, Loader2, Dumbbell, Timer, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function SocialFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);

    const { data: postsData, error } = await supabase
      .from('social_posts')
      .select('*')
      .not('workout_summary', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      toast.error('Erro ao carregar o feed');
      setLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for authors
    const authorIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, username, avatar_url, level, class_name, plan')
      .in('user_id', authorIds);
    const profileMap = new Map((profilesData || []).map(p => [p.user_id, p]));

    // Fetch likes & comments
    const postIds = postsData.map(p => p.id);
    const [{ data: likesData }, { data: commentsData }] = await Promise.all([
      supabase.from('social_likes').select('post_id, user_id').in('post_id', postIds),
      supabase.from('social_comments').select('*, profiles(name, username, avatar_url)').in('post_id', postIds).order('created_at', { ascending: true }),
    ]);

    const enriched = postsData.map(post => ({
      ...post,
      profiles: profileMap.get(post.user_id) || null,
      social_likes: (likesData || []).filter(l => l.post_id === post.id),
      social_comments: (commentsData || []).filter(c => c.post_id === post.id),
    }));

    setPosts(enriched);
    setLoading(false);
  };

  const toggleLike = async (postId: string, hasLiked: boolean) => {
    if (!user) return;
    if (hasLiked) {
      await supabase.from('social_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('social_likes').insert({ post_id: postId, user_id: user.id });
    }
    loadPosts();
  };

  const handleComment = async (postId: string) => {
    const comment = newComments[postId];
    if (!comment?.trim() || !user) return;

    const { error } = await supabase.from('social_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: comment.trim(),
    });

    if (error) {
      toast.error('Erro ao comentar');
    } else {
      setNewComments({ ...newComments, [postId]: '' });
      loadPosts();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center text-sm text-muted-foreground">
        <Dumbbell className="h-4 w-4 inline mr-1.5 text-primary" />
        O feed mostra sessões de treino compartilhadas pelos seus amigos.
        <br />
        <span className="text-xs">Finalize um treino na aba <strong>Treino</strong> para compartilhar.</span>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => {
          const author = post.profiles;
          const hasLiked = post.social_likes?.some((l: any) => l.user_id === user?.id);
          const likesCount = post.social_likes?.length || 0;
          const commentsCount = post.social_comments?.length || 0;
          const ws = post.workout_summary as any;

          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                {/* Author header */}
                <CardHeader className="pb-3 flex flex-row items-start gap-4 space-y-0">
                  <div
                    className="h-12 w-12 shrink-0 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 cursor-pointer"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    {author?.avatar_url ? (
                      <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-primary text-xl">{author?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="font-bold cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${post.user_id}`)}
                      >
                        {author?.name}
                      </p>
                      <span className="text-xs text-muted-foreground">@{author?.username}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-primary/80 font-medium">Nv. {author?.level} {author?.class_name}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Workout Summary Card */}
                  {ws && (
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-display font-bold text-sm">
                        <Dumbbell className="h-5 w-5" /> Sessão de Treino Finalizada
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { icon: Timer, label: 'Duração', value: `${ws.duration_min || 0} min` },
                          { icon: BarChart3, label: 'Volume', value: `${(ws.total_volume_kg || 0).toLocaleString()} kg` },
                          { icon: Dumbbell, label: 'Séries', value: ws.total_sets || 0 },
                          { icon: Zap, label: 'XP Ganho', value: `+${ws.xp_gained || 0}` },
                        ].map(s => (
                          <div key={s.label} className="bg-background/50 rounded-lg p-2.5 text-center border border-border/50">
                            <s.icon className="h-4 w-4 mx-auto text-primary/70 mb-1" />
                            <p className="font-bold font-mono text-sm">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caption if any */}
                  {post.content && (
                    <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                  )}

                  {/* Image if any */}
                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={post.image_url} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-2 border-t border-border">
                    <button
                      className={`flex items-center gap-1.5 text-sm transition-colors ${hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                      onClick={() => toggleLike(post.id, hasLiked)}
                    >
                      <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !expandedComments[post.id] })}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{commentsCount}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  <AnimatePresence>
                    {expandedComments[post.id] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 space-y-4">
                        <div className="space-y-3">
                          {post.social_comments?.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                                {comment.profiles?.avatar_url ? (
                                  <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-primary text-xs">{comment.profiles?.name?.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 bg-secondary/30 rounded-lg p-2.5">
                                <p className="text-xs font-bold">{comment.profiles?.name}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Escreva um comentário..."
                            value={newComments[post.id] || ''}
                            onChange={e => setNewComments({ ...newComments, [post.id]: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                            className="bg-background"
                          />
                          <Button size="icon" variant="secondary" onClick={() => handleComment(post.id)} disabled={!newComments[post.id]?.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <Dumbbell className="h-10 w-10 mx-auto opacity-30" />
            <p className="font-medium">Nenhuma sessão compartilhada ainda.</p>
            <p className="text-sm">Finalize um treino e escolha compartilhar para aparecer aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}
