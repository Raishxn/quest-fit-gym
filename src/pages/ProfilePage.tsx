import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Dumbbell, Activity, Calendar, TrendingUp, Camera, Users, Pencil, Check, Palette, Sparkles, ImageIcon, Upload, Settings, Infinity as InfinityIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { VIPCustomizerDialog } from '@/components/rpg/VIPCustomizerDialog';
import ImageCropDialog from '@/components/shared/ImageCropDialog';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { UploadOptionsDialog } from '@/components/profile/UploadOptionsDialog';
import { ConsistencyHeatmap } from '@/components/profile/ConsistencyHeatmap';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0, totalCardioHours: 0 });
  const [friends, setFriends] = useState<any[]>([]);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showBannerCrop, setShowBannerCrop] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'avatars' | 'banners' | null>(null);
  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  // VIP name effects
  const [showNameEffects, setShowNameEffects] = useState(false);
  const [nameEffect, setNameEffect] = useState<any>({});
  // Frame selector
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  // GIF separate crop dialogs
  const [showGifAvatarCrop, setShowGifAvatarCrop] = useState(false);
  // VIP Profile Customizer
  const [showProfileCustomizer, setShowProfileCustomizer] = useState(false);
  const [profileGradient, setProfileGradient] = useState('');
  const [wallpaperUrl, setWallpaperUrl] = useState('');
  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
  const [showGifBannerCrop, setShowGifBannerCrop] = useState(false);
  const [selectedTitleName, setSelectedTitleName] = useState('');

  useEffect(() => {
    if (!user) return;
    loadProfileData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setNameEffect(profile.name_effect || {});
      setProfileGradient(profile.profile_gradient || '');
      setWallpaperUrl(profile.profile_wallpaper_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.selected_title_id) {
       supabase.from('titles' as any).select('name').eq('id', profile.selected_title_id).single()
         .then(({ data }) => { if (data) setSelectedTitleName((data as unknown as {name: string}).name); });
    } else {
       setSelectedTitleName('');
    }
  }, [profile?.selected_title_id]);

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

  const uploadImage = async (fileOrBlob: Blob | File, bucket: 'avatars' | 'banners', isGif = false) => {
    if (!user) return;
    
    // Determine extension and content type
    let extension = 'webp';
    let contentType = 'image/webp';
    
    if (isGif) {
      extension = 'gif';
      contentType = 'image/gif';
    } else if (fileOrBlob instanceof File) {
      // Fallback if passing a File that's not explicitly marked as GIF but shouldn't happen here normally
      const extMatch = fileOrBlob.name.match(/\.([^\.]+)$/);
      if (extMatch) {
         extension = extMatch[1].toLowerCase();
      }
      contentType = fileOrBlob.type;
    }

    const path = `${user.id}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(path, fileOrBlob, {
      upsert: true,
      contentType,
    });
    if (error) { toast.error('Erro ao enviar imagem'); return; }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const field = bucket === 'avatars' ? 'avatar_url' : 'banner_url';
    
    await supabase.from('profiles').update({ [field]: urlData.publicUrl }).eq('user_id', user.id);
    await refreshProfile();
    toast.success(bucket === 'avatars' ? 'Foto de perfil atualizada!' : 'Banner atualizado!');
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadTarget('avatars');
    setShowUploadOptions(true);
  };

  const handleBannerClick = () => {
    setUploadTarget('banners');
    setShowUploadOptions(true);
  };

  const saveName = async () => {
    if (!user || !nameInput.trim()) return;
    const { error } = await supabase.from('profiles').update({ name: nameInput.trim() }).eq('user_id', user.id);
    if (error) { console.error('saveName error:', error); toast.error('Erro ao salvar nome'); return; }
    await refreshProfile();
    setEditingName(false);
    toast.success('Nome atualizado!');
  };

  const saveNameEffect = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ name_effect: nameEffect }).eq('user_id', user.id);
    if (error) { console.error('saveNameEffect error:', error); toast.error('Erro ao salvar efeito'); return; }
    await refreshProfile();
    setShowNameEffects(false);
    toast.success('Efeito de nome salvo!');
  };

  const saveFrame = async (frameUrl: string | null) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ avatar_frame: frameUrl || 'none' } as any).eq('user_id', user.id);
    if (error) { console.error('saveFrame error:', error); toast.error('Erro ao salvar moldura'); return; }
    await refreshProfile();
    setShowFrameSelector(false);
    toast.success(frameUrl ? 'Moldura atualizada!' : 'Moldura removida.');
  };

  const saveProfileCustomization = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      profile_gradient: profileGradient,
      profile_wallpaper_url: wallpaperUrl,
    }).eq('user_id', user.id);
    if (error) { console.error('saveProfileCustomization error:', error); toast.error('Erro ao personalizar'); return; }
    await refreshProfile();
    setShowProfileCustomizer(false);
    toast.success('Perfil personalizado!');
  };

  const uploadWallpaper = async (file: File) => {
    if (!user) return;
    setUploadingWallpaper(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/wallpaper_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Erro ao enviar wallpaper'); setUploadingWallpaper(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setWallpaperUrl(urlData.publicUrl);
    setUploadingWallpaper(false);
    toast.success('Wallpaper carregado!');
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
        <Card className="overflow-hidden relative">
          {/* VIP Wallpaper behind card */}
          {wallpaperUrl && (
            <img src={wallpaperUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0" />
          )}
          {/* VIP Gradient overlay */}
          {profileGradient && (
            <div className="absolute inset-0 pointer-events-none z-0" style={{ background: profileGradient, opacity: 0.15 }} />
          )}
          <div className="h-32 bg-gradient-rpg relative group cursor-pointer" onClick={handleBannerClick}>
            {profile.bannerUrl && <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute -bottom-8 left-6">
              <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                <div 
                  className="h-20 w-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary overflow-hidden relative"
                  style={profile.isPremium && profile.avatarGlowColor ? { boxShadow: `0 0 30px ${profile.avatarGlowColor}, inset 0 0 15px ${profile.avatarGlowColor}`, borderColor: profile.avatarGlowColor } : {}}
                >
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                {profile.frameUrl && (
                  <img src={profile.frameUrl} alt="Frame" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] object-contain pointer-events-none z-10 scale-110 drop-shadow-lg" />
                )}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover/avatar:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-4 space-y-3 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="h-8 w-40 font-display font-bold"
                        onKeyDown={e => e.key === 'Enter' && saveName()}
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveName}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1
                        className={`text-2xl font-display font-bold ${nameEffect.rainbow ? 'animate-rainbow' : ''}`}
                        style={{
                          ...(nameEffect.fontFamily ? { fontFamily: nameEffect.fontFamily } : {}),
                          ...(nameEffect.gradient ? {
                            background: `linear-gradient(${nameEffect.gradient.direction || 'to right'}, ${nameEffect.gradient.color1 || '#fff'}, ${nameEffect.gradient.color2 || '#8b5cf6'})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          } : nameEffect.color ? { color: nameEffect.color } : {}),
                          ...(nameEffect.glow ? { textShadow: `0 0 12px ${nameEffect.glowColor || nameEffect.color || 'hsl(var(--primary))'}`, ...(nameEffect.gradient ? { filter: `drop-shadow(0 0 8px ${nameEffect.gradient.color1 || '#fff'})` } : {}) } : {}),
                          ...(profile.isPremium && profile.nameColor && !nameEffect.color && !nameEffect.gradient ? { color: profile.nameColor, textShadow: `0 0 10px ${profile.nameColor}` } : {}),
                        }}
                      >
                        {profile.name}
                      </h1>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                        setNameInput(profile.name);
                        if (profile.isPremium) {
                          setShowNameEffects(true);
                        } else {
                          setEditingName(true);
                        }
                      }}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  <PlanBadge plan={profile.plan} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  {profile.is_owner && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full border border-primary/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                      <InfinityIcon className="w-3 h-3 text-primary animate-pulse" /> DONO
                    </div>
                  )}
                </div>
                {selectedTitleName && <p className="text-xs font-bold text-primary mt-1 border border-primary/20 bg-primary/10 inline-block px-2 py-0.5 rounded shadow-sm">{selectedTitleName}</p>}
                {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
                <div className="mt-2">
                   <TitleSelector currentTitleId={profile.selected_title_id} onTitleChange={refreshProfile} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <Users className="inline h-3 w-3 mr-1" />{friends.length} amigos
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                   <ClassSelectorDialog />
                </div>
              </div>
              <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                 <LevelBadge level={profile.level} className={profile.currentClass?.name || profile.className} />
                 <button
                   className="h-7 w-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center border border-border transition-colors"
                   onClick={() => setShowProfileCustomizer(true)}
                   title="Personalizar perfil"
                 >
                   <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                 </button>
               </div>
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
        <ConsistencyHeatmap userId={user.id} />
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

      <div className="flex justify-center gap-3 pb-6">
        <VIPCustomizerDialog />
        <Button variant="outline" asChild>
          <Link to="/friends" className="font-display">
            <Users className="h-4 w-4 mr-2" /> Ver Amigos
          </Link>
        </Button>
      </div>

      {/* Avatar Crop Dialog */}
      <ImageCropDialog
        open={showAvatarCrop}
        onOpenChange={setShowAvatarCrop}
        onCropComplete={(blob) => uploadImage(blob, 'avatars')}
        aspectRatio={1}
        shape="circle"
        title="Ajustar Foto de Perfil"
        outputWidth={400}
      />

      {/* Banner Crop Dialog */}
      <ImageCropDialog
        open={showBannerCrop}
        onOpenChange={setShowBannerCrop}
        onCropComplete={(blob) => uploadImage(blob, 'banners')}
        aspectRatio={3}
        shape="rect"
        title="Ajustar Banner"
        outputWidth={900}
      />

      {/* Upload Options Dialog (Static vs GIF vs Frame) */}
      <UploadOptionsDialog
        open={showUploadOptions}
        onOpenChange={setShowUploadOptions}
        title={uploadTarget === 'avatars' ? 'Foto de Perfil' : 'Banner do Perfil'}
        target={uploadTarget}
        onSelectStatic={() => {
          if (uploadTarget === 'avatars') setShowAvatarCrop(true);
          if (uploadTarget === 'banners') setShowBannerCrop(true);
        }}
        onSelectGif={() => {
          if (uploadTarget === 'avatars') setShowGifAvatarCrop(true);
          if (uploadTarget === 'banners') setShowGifBannerCrop(true);
        }}
        onSelectFrame={() => setShowFrameSelector(true)}
      />

      {/* GIF Avatar Crop Dialog */}
      <ImageCropDialog
        open={showGifAvatarCrop}
        onOpenChange={setShowGifAvatarCrop}
        onCropComplete={(blob) => uploadImage(blob, 'avatars')}
        aspectRatio={1}
        shape="circle"
        title="Ajustar GIF de Perfil"
        outputWidth={400}
      />

      {/* GIF Banner Crop Dialog */}
      <ImageCropDialog
        open={showGifBannerCrop}
        onOpenChange={setShowGifBannerCrop}
        onCropComplete={(blob) => uploadImage(blob, 'banners')}
        aspectRatio={3}
        shape="rect"
        title="Ajustar GIF do Banner"
        outputWidth={900}
      />

      {/* VIP Name Effects Dialog */}
      <Dialog open={showNameEffects} onOpenChange={setShowNameEffects}>
        <DialogContent className="space-y-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">✨ Nome & Efeitos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name edit */}
            <div className="space-y-2">
              <Label className="text-xs">Nome de Exibição</Label>
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="h-8 font-display font-bold"
                  placeholder="Seu nome"
                />
                <Button size="sm" className="h-8 text-xs" onClick={saveName}>
                  <Check className="h-3 w-3 mr-1" /> Salvar
                </Button>
              </div>
            </div>
            {/* Preview */}
            <div className="bg-secondary/50 rounded-xl p-6 text-center border border-border">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <h2
                className={`text-3xl font-display font-bold ${nameEffect.rainbow ? 'animate-rainbow' : ''}`}
                style={{
                  ...(nameEffect.fontFamily ? { fontFamily: nameEffect.fontFamily } : {}),
                  ...(nameEffect.gradient ? {
                    background: `linear-gradient(${nameEffect.gradient.direction || 'to right'}, ${nameEffect.gradient.color1 || '#fff'}, ${nameEffect.gradient.color2 || '#8b5cf6'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : nameEffect.color ? { color: nameEffect.color } : {}),
                  ...(nameEffect.glow ? { textShadow: `0 0 16px ${nameEffect.glowColor || nameEffect.color || 'hsl(var(--primary))'}`, ...(nameEffect.gradient ? { filter: `drop-shadow(0 0 8px ${nameEffect.gradient.color1 || '#fff'})` } : {}) } : {}),
                }}
              >
                {nameInput || profile.name}
              </h2>
            </div>
            {/* Font */}
            <div className="space-y-2">
              <Label className="text-xs">Fonte</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Padrão', value: '' },
                  { label: 'Inter', value: 'Inter, sans-serif' },
                  { label: 'Cinzel', value: 'Cinzel, serif' },
                  { label: 'Fraktur', value: '"UnifrakturCook", cursive' },
                  { label: 'Minecraft', value: '"Silkscreen", monospace' },
                  { label: 'BubbleGum', value: '"Bubblegum Sans", cursive' },
                ].map(f => (
                  <Button
                    key={f.label}
                    size="sm"
                    variant={nameEffect.fontFamily === f.value ? 'default' : 'outline'}
                    className="text-xs h-7"
                    style={f.value ? { fontFamily: f.value } : {}}
                    onClick={() => setNameEffect({ ...nameEffect, fontFamily: f.value })}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Name Gradient */}
            <div className="space-y-2">
              <Label className="text-xs">Gradiente do Nome</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!nameEffect.gradient}
                  onCheckedChange={v => {
                    if (v) {
                      setNameEffect({ ...nameEffect, gradient: { color1: '#ff6b6b', color2: '#8b5cf6', direction: 'to right' }, color: '' });
                    } else {
                      const { gradient, ...rest } = nameEffect;
                      setNameEffect(rest);
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground">Ativar gradiente</span>
              </div>
              {nameEffect.gradient && (
                <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex gap-2 items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Cor 1</p>
                      <input
                        type="color"
                        value={nameEffect.gradient.color1 || '#ff6b6b'}
                        onChange={e => setNameEffect({ ...nameEffect, gradient: { ...nameEffect.gradient, color1: e.target.value } })}
                        className="h-8 w-12 rounded cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Cor 2</p>
                      <input
                        type="color"
                        value={nameEffect.gradient.color2 || '#8b5cf6'}
                        onChange={e => setNameEffect({ ...nameEffect, gradient: { ...nameEffect.gradient, color2: e.target.value } })}
                        className="h-8 w-12 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Direção</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '→ Esq→Dir', value: 'to right' },
                        { label: '← Dir→Esq', value: 'to left' },
                        { label: '↓ Cima→Baixo', value: 'to bottom' },
                        { label: '↑ Baixo→Cima', value: 'to top' },
                      ].map(d => (
                        <Button
                          key={d.value}
                          size="sm"
                          variant={(nameEffect.gradient?.direction || 'to right') === d.value ? 'default' : 'outline'}
                          className="text-[10px] h-7"
                          onClick={() => setNameEffect({ ...nameEffect, gradient: { ...nameEffect.gradient, direction: d.value } })}
                        >
                          {d.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Color */}
            <div className="space-y-2">
              <Label className="text-xs">Cor do Nome</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={nameEffect.color || '#ffffff'}
                  onChange={e => setNameEffect({ ...nameEffect, color: e.target.value })}
                  className="h-8 w-12 rounded cursor-pointer"
                />
                <Input
                  value={nameEffect.color || ''}
                  onChange={e => setNameEffect({ ...nameEffect, color: e.target.value })}
                  placeholder="#ffffff"
                  className="h-8 w-24 text-xs font-mono"
                />
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setNameEffect({ ...nameEffect, color: '' })}>
                  Reset
                </Button>
              </div>
            </div>
            {/* Glow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Brilho (Glow)</Label>
                <Switch checked={!!nameEffect.glow} onCheckedChange={v => setNameEffect({ ...nameEffect, glow: v })} />
              </div>
              {nameEffect.glow && (
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={nameEffect.glowColor || nameEffect.color || '#8b5cf6'}
                    onChange={e => setNameEffect({ ...nameEffect, glowColor: e.target.value })}
                    className="h-8 w-12 rounded cursor-pointer"
                  />
                  <Input
                    value={nameEffect.glowColor || ''}
                    onChange={e => setNameEffect({ ...nameEffect, glowColor: e.target.value })}
                    placeholder="Cor do glow"
                    className="h-8 w-24 text-xs font-mono"
                  />
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setNameEffect({ ...nameEffect, glowColor: '' })}>
                    Reset
                  </Button>
                </div>
              )}
            </div>
            {/* Rainbow */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Rainbow 🌈</Label>
              <Switch checked={!!nameEffect.rainbow} onCheckedChange={v => setNameEffect({ ...nameEffect, rainbow: v })} />
            </div>
            <Button className="w-full font-display" onClick={saveNameEffect}>✨ Salvar Efeito</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Frame Selector Dialog */}
      <Dialog open={showFrameSelector} onOpenChange={setShowFrameSelector}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display">🖼️ Molduras de Avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[
              { id: 'none', label: 'Nenhuma', preview: null, file: null, vipOnly: false },
              { id: 'gold', label: 'Ouro', preview: '🟡', file: '/frames/gold.png', vipOnly: false },
              { id: 'diamond', label: 'Diamante', preview: '💎', file: '/frames/diamond.png', vipOnly: true },
              { id: 'fire', label: 'Fogo', preview: '🔥', file: '/frames/fire.png', vipOnly: true },
              { id: 'crown', label: 'Coroa', preview: '👑', file: '/frames/crown.png', vipOnly: true },
              { id: 'lightning', label: 'Raio', preview: '⚡', file: '/frames/lightning.png', vipOnly: true },
              { id: 'star', label: 'Estrelas', preview: '⭐', file: '/frames/star.png', vipOnly: true },
              { id: 'dragon', label: 'Dragão', preview: '🐉', file: '/frames/dragon.png', vipOnly: true },
            ].map(frame => {
              const locked = frame.vipOnly && !profile.isPremium;
              const isActive = frame.id === 'none' ? !profile.frameUrl : profile.frameUrl === frame.file;
              return (
                <button
                  key={frame.id}
                  className={`p-3 rounded-xl text-center border-2 transition-all ${
                    isActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  } ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !locked && saveFrame(frame.file)}
                  disabled={locked}
                >
                  <span className="text-2xl">{frame.preview || '❌'}</span>
                  <p className="text-[10px] font-bold mt-1">{frame.label}</p>
                  {locked && <p className="text-[8px] text-muted-foreground">VIP</p>}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* VIP Profile Customizer Dialog */}
      <Dialog open={showProfileCustomizer} onOpenChange={setShowProfileCustomizer}>
        <DialogContent className="space-y-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">🎨 Personalizar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden border border-border h-28">
              {wallpaperUrl && (
                <img src={wallpaperUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              )}
              {profileGradient && (
                <div className="absolute inset-0" style={{ background: profileGradient, opacity: 0.2 }} />
              )}
              <div className="absolute inset-0 bg-card/80" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Preview do cartão do perfil</p>
              </div>
            </div>

            {/* Gradient picker */}
            <div className="space-y-2">
              <Label className="text-xs">Gradiente do Cartão</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Nenhum', value: '' },
                  { label: 'Fogo', value: 'linear-gradient(135deg, #ff4500, #ff8c00, #ffd700)' },
                  { label: 'Oceano', value: 'linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef)' },
                  { label: 'Floresta', value: 'linear-gradient(135deg, #2d6a4f, #40916c, #95d5b2)' },
                  { label: 'Ametista', value: 'linear-gradient(135deg, #7b2cbf, #9d4edd, #c77dff)' },
                  { label: 'Noite', value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
                  { label: 'Ouro', value: 'linear-gradient(135deg, #b8860b, #daa520, #ffd700)' },
                  { label: 'Rosa', value: 'linear-gradient(135deg, #ff006e, #fb5607, #ffbe0b)' },
                  { label: 'Gelo', value: 'linear-gradient(135deg, #a8dadc, #457b9d, #1d3557)' },
                ].map(g => (
                  <button
                    key={g.label}
                    className={`h-12 rounded-lg border-2 transition-all text-[10px] font-bold ${
                      profileGradient === g.value ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                    }`}
                    style={{ background: g.value || 'hsl(var(--card))' }}
                    onClick={() => setProfileGradient(g.value)}
                  >
                    <span className="drop-shadow-lg text-white">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gradient */}
            <div className="space-y-2">
              <Label className="text-xs">Gradiente Customizado</Label>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Cor 1</p>
                    <input
                      type="color"
                      value={(() => { const m = profileGradient.match(/#[0-9a-fA-F]{6}/g); return m?.[0] || '#ff4500'; })()}
                      onChange={e => {
                        const m = profileGradient.match(/#[0-9a-fA-F]{6}/g);
                        const c2 = m?.[1] || '#8b5cf6';
                        setProfileGradient(`linear-gradient(135deg, ${e.target.value}, ${c2})`);
                      }}
                      className="h-8 w-12 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Cor 2</p>
                    <input
                      type="color"
                      value={(() => { const m = profileGradient.match(/#[0-9a-fA-F]{6}/g); return m?.[1] || '#8b5cf6'; })()}
                      onChange={e => {
                        const m = profileGradient.match(/#[0-9a-fA-F]{6}/g);
                        const c1 = m?.[0] || '#ff4500';
                        setProfileGradient(`linear-gradient(135deg, ${c1}, ${e.target.value})`);
                      }}
                      className="h-8 w-12 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground mb-1">Preview</p>
                    <div className="h-8 rounded-lg border border-border" style={{ background: profileGradient || 'hsl(var(--card))' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Wallpaper — visible on all screens inside dialog */}
            <div className="space-y-2">
              <Label className="text-xs">Papel de Parede</Label>
              <p className="text-[10px] text-muted-foreground">Uma imagem que fica por baixo do cartão do perfil (como na Steam).</p>
              {wallpaperUrl && (
                <div className="relative rounded-lg overflow-hidden border border-border h-20">
                  <img src={wallpaperUrl} alt="" className="w-full h-full object-cover" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 text-[10px]"
                    onClick={() => setWallpaperUrl('')}
                  >
                    Remover
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1"
                disabled={uploadingWallpaper}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
                      uploadWallpaper(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="h-3 w-3" />
                {uploadingWallpaper ? 'Enviando...' : 'Enviar Wallpaper'}
              </Button>
            </div>

            <Button className="w-full font-display" onClick={saveProfileCustomization}>
              🎨 Salvar Personalização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

