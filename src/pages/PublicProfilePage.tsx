import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Activity, Calendar, TrendingUp, Users, Infinity as InfinityIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { XPBar } from '@/components/rpg/XPBar';
import { AttributeBars } from '@/components/rpg/AttributeBars';
import { OverallRankBadge } from '@/components/rpg/OverallRankBadge';
import { toast } from 'sonner';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [p, setP] = useState<any>(null);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0, totalCardioHours: 0 });
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [selectedTitleName, setSelectedTitleName] = useState('');

  // Redirect to own profile
  useEffect(() => {
    if (userId && user && userId === user.id) {
      navigate('/profile', { replace: true });
    }
  }, [userId, user]);

  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  const loadAll = async (uid: string) => {
    setLoading(true);
    const [profileRes, workoutsRes, cardioRes, achRes, userAchRes, friendRes, classProgressRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', uid).single(),
      supabase.from('workout_sessions').select('total_volume_kg').eq('user_id', uid).eq('status', 'completed'),
      supabase.from('cardio_sessions').select('duration_minutes').eq('user_id', uid),
      supabase.from('achievements').select('*').order('xp_reward', { ascending: false }),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', uid),
      user ? supabase.from('friendships').select('*')
        .eq('status', 'accepted')
        .or(`and(initiator_id.eq.${user.id},receiver_id.eq.${uid}),and(initiator_id.eq.${uid},receiver_id.eq.${user.id})`) : Promise.resolve({ data: [] }),
      supabase.from('user_class_progress').select('*, classes(*)').eq('user_id', uid).eq('is_active', true).maybeSingle(),
    ]);

    if (!profileRes.data) {
      toast.error('Perfil não encontrado');
      navigate(-1);
      return;
    }

    setP(profileRes.data);

    const titleId = (profileRes.data as any).selected_title_id;
    if (titleId) {
       const titleRes = await supabase.from('titles' as any).select('name').eq('id', titleId).single();
       if (titleRes.data) setSelectedTitleName((titleRes.data as unknown as {name: string}).name);
    }

    const workouts = workoutsRes.data || [];
    const cardio = cardioRes.data || [];
    setStats({
      totalWorkouts: workouts.length,
      totalVolume: workouts.reduce((s: number, w: any) => s + (w.total_volume_kg || 0), 0),
      totalCardioHours: Math.round(cardio.reduce((s: number, c: any) => s + (c.duration_minutes || 0), 0) / 60 * 10) / 10,
    });

    setAllAchievements(achRes.data || []);
    setUnlockedIds(new Set((userAchRes.data || []).map((ua: any) => ua.achievement_id)));

    if (friendRes.data && friendRes.data.length > 0) {
      setIsFriend(true);
      setFriendshipId(friendRes.data[0].id);
    }

    if (classProgressRes.data) {
      setCurrentClass((classProgressRes.data as any).classes);
    }

    // Check pending request
    if (user) {
      const { data: pending } = await supabase.from('friendships').select('*')
        .eq('initiator_id', user.id).eq('receiver_id', uid).eq('status', 'pending');
      if (pending && pending.length > 0) setPendingRequest(true);
    }

    setLoading(false);
  };

  const sendFriendRequest = async () => {
    if (!user || !userId) return;
    const { error } = await supabase.from('friendships').insert({
      initiator_id: user.id,
      receiver_id: userId,
      status: 'pending',
    });
    if (error) toast.error('Erro ao enviar solicitação');
    else { setPendingRequest(true); toast.success('Solicitação de amizade enviada!'); }
  };

  const removeFriend = async () => {
    if (!friendshipId) return;
    await supabase.from('friendships').delete().eq('id', friendshipId);
    setIsFriend(false);
    setFriendshipId(null);
    toast.success('Amizade removida.');
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  if (!p) return null;

  const nameEffect = p.name_effect || {};
  const isPremium = ['vip', 'vip_plus', 'pro'].includes(p.plan);
  const profileGradient = p.profile_gradient || '';
  const wallpaperUrl = p.profile_wallpaper_url || '';
  const nameStyle: React.CSSProperties = {
    ...(nameEffect.fontFamily ? { fontFamily: nameEffect.fontFamily } : {}),
    ...(nameEffect.gradient ? {
      background: `linear-gradient(${nameEffect.gradient.direction || 'to right'}, ${nameEffect.gradient.color1 || '#fff'}, ${nameEffect.gradient.color2 || '#8b5cf6'})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } : nameEffect.color ? { color: nameEffect.color } : {}),
    ...(nameEffect.glow ? { textShadow: `0 0 12px ${nameEffect.glowColor || nameEffect.color || '#fff'}`, ...(nameEffect.gradient ? { filter: `drop-shadow(0 0 8px ${nameEffect.gradient.color1 || '#fff'})` } : {}) } : {}),
  };

  const statsData = [
    { label: 'Total Treinos', value: String(stats.totalWorkouts), icon: Dumbbell },
    { label: 'Volume Total', value: `${stats.totalVolume.toLocaleString()}kg`, icon: TrendingUp },
    { label: 'Streak Atual', value: `${p.streak || 0} dias`, icon: Calendar },
    { label: 'Cardio Total', value: `${stats.totalCardioHours}h`, icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <Card className="overflow-hidden relative">
          {/* VIP Wallpaper behind card */}
          {wallpaperUrl && (
            <img src={wallpaperUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0" />
          )}
          {/* VIP Gradient overlay */}
          {profileGradient && (
            <div className="absolute inset-0 pointer-events-none z-0" style={{ background: profileGradient, opacity: 0.15 }} />
          )}
          {/* Banner */}
          <div className="h-32 bg-gradient-rpg relative">
            {p.banner_url && (
              <img src={p.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute -bottom-8 left-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                    : p.name?.charAt(0)}
                </div>
                {p.avatar_frame && p.avatar_frame !== 'none' && (
                  <img src={p.avatar_frame} alt="Frame" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] object-contain pointer-events-none z-10 scale-110 drop-shadow-lg" />
                )}
              </div>
            </div>
          </div>

          <CardContent className="pt-12 pb-4 space-y-3 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1
                    className={`text-2xl font-display font-bold ${nameEffect.rainbow ? 'animate-rainbow' : ''}`}
                    style={nameStyle}
                  >
                    {p.name}
                  </h1>
                  <PlanBadge plan={p.plan} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground text-sm">@{p.username}</p>
                  {p.is_owner && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full border border-primary/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                      <InfinityIcon className="w-3 h-3 text-primary animate-pulse" /> DONO
                    </div>
                  )}
                </div>
                {selectedTitleName && <p className="text-xs font-bold text-primary mt-1 border border-primary/20 bg-primary/10 inline-block px-2 py-0.5 rounded shadow-sm">{selectedTitleName}</p>}
                {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <LevelBadge level={p.level} className={p.class_name} />
                {currentClass && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{currentClass.rarity}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-border">
                      <span className="text-lg">{currentClass.icon_emoji}</span>
                      <span className="text-xs font-bold font-display">{currentClass.name}</span>
                    </div>
                  </div>
                )}
                {user && (
                  isFriend ? (
                    <Button size="sm" variant="outline" className="text-xs" onClick={removeFriend}>
                      <Users className="h-3 w-3 mr-1" /> Amigos
                    </Button>
                  ) : pendingRequest ? (
                    <Button size="sm" variant="outline" className="text-xs" disabled>
                      Solicitação enviada
                    </Button>
                  ) : (
                    <Button size="sm" className="text-xs" onClick={sendFriendRequest}>
                      <Users className="h-3 w-3 mr-1" /> Adicionar amigo
                    </Button>
                  )
                )}
              </div>
            </div>
            <XPBar xp={p.xp || 0} level={p.level || 1} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Overall Rank */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <OverallRankBadge pm={p.overall_mastery_points || 0} />
      </motion.div>

      {/* RPG Attributes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Atributos RPG</CardTitle></CardHeader>
          <CardContent>
            <AttributeBars str={p.str_attr || 0} end={p.end_attr || 0} vit={p.vit_attr || 0} agi={p.agi_attr || 0} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statsData.map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 text-center space-y-1">
                <stat.icon className="h-5 w-5 mx-auto text-primary" />
                <p className="font-mono text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">🏆 Conquistas ({unlockedIds.size}/{allAchievements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {allAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma conquista disponível.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allAchievements.map(ach => {
                  const unlocked = unlockedIds.has(ach.id);
                  return (
                    <div key={ach.id} className={`p-3 rounded-lg text-center space-y-1 transition-all ${unlocked ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30 opacity-40 grayscale'}`}>
                      <span className="text-2xl">{ach.icon_emoji}</span>
                      <p className="text-xs font-display font-bold">{ach.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                      {ach.xp_reward > 0 && <p className="text-[10px] font-mono text-primary">+{ach.xp_reward} XP</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
