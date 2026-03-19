import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserProfile, ThemeId, ClassName, Specialization } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    let { data, error } = (await supabase
      .from('profiles')
      .select('*, classes!profiles_current_class_id_fkey(*)')
      .eq('user_id', userId)
      .maybeSingle()) as any;
      
    if (error) {
      console.error("Profile fetch error with join, falling back to simple fetch:", error);
      const fallback = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      data = fallback.data;
    }

    // Se o usuário apagou o perfil na mão no DB para testar a anamnese:
    if (!data) {
      toast('Criando novo perfil de usuário...');
      setLoading(true);
      const res = await supabase.from('profiles').insert({
         user_id: userId,
         name: 'Aventureiro',
         username: `user_${userId.substring(0,8)}`
      }).select().single();
      data = res.data;
    }

    if (data) {
      const p: UserProfile = {
        id: data.id,
        email: data.email || '',
        username: data.username || '',
        name: data.name,
        avatarUrl: data.avatar_url || undefined,
        bannerUrl: data.banner_url || undefined,
        frameUrl: data.avatar_frame && data.avatar_frame !== 'none' ? data.avatar_frame : undefined,
        isPremium: data.plan && data.plan !== 'free',
        avatarGlowColor: data.avatar_glow_color || undefined,
        nameColor: data.name_color || undefined,
        profileFont: data.profile_font || undefined,
        bio: data.bio || undefined,
        theme: (data.theme || 'dark-red') as ThemeId,
        xp: data.xp,
        level: data.level,
        className: data.class_name as ClassName,
        specialization: data.specialization as Specialization,
        strAttr: data.str_attr,
        endAttr: data.end_attr,
        vitAttr: data.vit_attr,
        agiAttr: data.agi_attr,
        streak: data.streak,
        plan: data.plan as UserProfile['plan'],
        anamnesisComplete: data.anamnesis_complete,
        current_class_id: data.current_class_id,
        currentClass: data.classes ? {
          name: data.classes.name,
          archetype: data.classes.archetype,
          rarity: data.classes.rarity,
          bonus_type: data.classes.bonus_type,
          bonus_value: data.classes.bonus_value,
          icon_emoji: data.classes.icon_emoji,
        } : null,
        role: data.role || 'user',
        has_seen_tutorial: data.has_seen_tutorial || false,
        name_effect: data.name_effect || {},
        profile_gradient: data.profile_gradient || '',
        profile_wallpaper_url: data.profile_wallpaper_url || '',
        avatar_frame: data.avatar_frame || 'none',
        is_owner: data.is_owner || false,
      };
      setProfile(p);

      // Sync theme
      document.documentElement.setAttribute('data-theme', p.theme);
      localStorage.setItem('qf-theme', p.theme);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          window.location.href = '/reset-password';
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
