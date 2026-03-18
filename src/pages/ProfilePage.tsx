import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Dumbbell, Activity, Calendar, TrendingUp, Camera, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { XPBar } from '@/components/rpg/XPBar';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { AttributeBars } from '@/components/rpg/AttributeBars';
import { OverallRankBadge } from '@/components/rpg/OverallRankBadge';
import { TitleSelector } from '@/components/rpg/TitleSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ClassSelectorDialog } from '@/components/rpg/ClassSelectorDialog';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0, totalCardioHours: 0 });
  const [friends, setFriends] = useState<any[]>([]);
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    const [achRes, uaRes, workoutsRes, cardioRes, friendsRes] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
      supabase.from('workout_sessions').select('total_volume_kg').eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('cardio_sessions').select('duration_minutes').eq('user_id', user.id),
      supabase.from('friendships').select('initiator_id, receiver_id').eq('status', 'accepted')
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`),
    ]);

    setAchievements(achRes.data || []);
    setUserAchievements(uaRes.data || []);
    
    const workouts = workoutsRes.data || [];
    const cardioSessions = cardioRes.data || [];
    setStats({
      totalWorkouts: workouts.length,
      totalVolume: workouts.reduce((sum: number, w: any) => sum + (w.total_volume_kg || 0), 0),
      totalCardioHours: Math.round(cardioSessions.reduce((sum: number, c: any) => sum + (c.duration_minutes || 0), 0) / 60 * 10) / 10,
    });

    setFriends(friendsRes.data || []);
  };

  const uploadImage = async (file: File, bucket: 'avatars' | 'banners') => {
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error('Erro ao enviar imagem'); return; }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const field = bucket === 'avatars' ? 'avatar_url' : 'banner_url';
    
    await supabase.from('profiles').update({ [field]: urlData.publicUrl }).eq('user_id', user.id);
    await refreshProfile();
    toast.success(bucket === 'avatars' ? 'Foto de perfil atualizada!' : 'Banner atualizado!');
  };

  if (!profile) return null;

  const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievement_id));
  const statsData = [
    { label: 'Total Treinos', value: String(stats.totalWorkouts), icon: Dumbbell },
    { label: 'Volume Total', value: `${stats.totalVolume.toLocaleString()}kg`, icon: TrendingUp },
    { label: 'Streak Atual', value: `${profile.streak} dias`, icon: Calendar },
    { label: 'Cardio Total', value: `${stats.totalCardioHours}h`, icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-rpg relative group cursor-pointer" onClick={() => bannerInput.current?.click()}>
            {profile.bannerUrl && <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'banners')} />
            <div className="absolute -bottom-8 left-6">
              <div className="relative group/avatar cursor-pointer" onClick={e => { e.stopPropagation(); avatarInput.current?.click(); }}>
                <div className="h-20 w-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary glow-primary overflow-hidden">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover/avatar:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>
                <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'avatars')} />
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
                <div className="mt-2">
                   <TitleSelector currentTitleId={profile.selected_title_id} onTitleChange={refreshProfile} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <Users className="inline h-3 w-3 mr-1" />{friends.length} amigos
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                   <ClassSelectorDialog />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <LevelBadge level={profile.level} className={profile.className} />
                 {profile.currentClass && (
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{profile.currentClass.rarity}</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-border">
                         <span className="text-lg">{profile.currentClass.icon_emoji}</span>
                         <span className="text-xs font-bold font-display">{profile.currentClass.name}</span>
                      </div>
                   </div>
                 )}
              </div>
            </div>
            <XPBar xp={profile.xp} level={profile.level} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
         <OverallRankBadge pm={profile.overall_mastery_points || 0} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Atributos RPG</CardTitle></CardHeader>
          <CardContent>
            <AttributeBars str={profile.strAttr} end={profile.endAttr} vit={profile.vitAttr} agi={profile.agiAttr} />
          </CardContent>
        </Card>
      </motion.div>

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">🏆 Conquistas ({userAchievements.length}/{achievements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma conquista disponível.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements.map(ach => {
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

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/friends" className="font-display">
            <Users className="h-4 w-4 mr-2" /> Ver Amigos
          </Link>
        </Button>
      </div>
    </div>
  );
}
