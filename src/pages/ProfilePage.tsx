import { motion } from 'framer-motion';
import { User, Dumbbell, Activity, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { XPBar } from '@/components/rpg/XPBar';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { AttributeBars } from '@/components/rpg/AttributeBars';
import { mockAchievements } from '@/lib/mock-data';

export default function ProfilePage() {
  const { profile } = useAuth();
  if (!profile) return null;

  const unlockedAchievements = mockAchievements.filter((a) => a.unlockedAt);
  const stats = [
    { label: 'Total Treinos', value: '0', icon: Dumbbell },
    { label: 'Volume Total', value: '0kg', icon: TrendingUp },
    { label: 'Streak Atual', value: `${profile.streak} dias`, icon: Calendar },
    { label: 'Cardio Total', value: '0h', icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-rpg relative">
            <div className="absolute -bottom-8 left-6">
              <div className="h-20 w-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary glow-primary">
                {profile.name.charAt(0)}
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
              </div>
              <LevelBadge level={profile.level} className={profile.className} />
            </div>
            <XPBar xp={profile.xp} level={profile.level} />
          </CardContent>
        </Card>
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
          {stats.map((stat) => (
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
            <CardTitle className="text-sm font-display">🏆 Conquistas ({unlockedAchievements.length}/{mockAchievements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockAchievements.map((ach) => (
                <div key={ach.key} className={`p-3 rounded-lg text-center space-y-1 transition-all ${ach.unlockedAt ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30 opacity-40 grayscale'}`}>
                  <span className="text-2xl">{ach.iconEmoji}</span>
                  <p className="text-xs font-display font-bold">{ach.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                  {ach.xpReward > 0 && <p className="text-[10px] font-mono text-primary">+{ach.xpReward} XP</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
