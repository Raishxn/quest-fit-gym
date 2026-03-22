import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Swords, Shield, Trophy, Activity, Users, Heart, Sparkles, Star } from 'lucide-react';

export default function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && session) {
      navigate('/home', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-7 h-7 text-primary animate-pulse" />
            <span className="font-display font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">QUESTFIT</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold hover:text-primary transition-colors">Login</Button>
            <Button onClick={() => navigate('/register')} className="font-bold hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
              Começar Aventura
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8 relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-black tracking-widest uppercase shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <Sparkles className="w-4 h-4" /> 100% Gratuito Para Sempre
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter text-white drop-shadow-2xl leading-[1.1]">
               Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-yellow-500 animate-gradient-x">Jornada Épica</span><br />
               Começa na Vida Real
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
               Transforme seus treinos e dieta em um <strong className="text-white">RPG viciante</strong>. Suba de nível, complete missões e conquiste classes lendárias sem pagar absolutamente nada para jogar.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            <Button size="lg" className="h-16 px-10 text-xl font-black w-full sm:w-auto bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.8)] transition-all duration-300 rounded-2xl" onClick={() => navigate('/register')}>
               Criar meu Herói <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-8 text-lg font-bold w-full sm:w-auto border-2 hover:bg-white/5 rounded-2xl transition-all" onClick={() => window.location.href = '#features'}>
               Como Funciona?
            </Button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="pt-10 flex justify-center items-center gap-8 text-muted-foreground text-sm font-medium">
             <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Treinos Ilimitados</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Dieta Ilimitada</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Sem Pay-to-Win</div>
          </motion.div>
        </div>

        {/* The "Why it's free" Section */}
        <div className="max-w-5xl mx-auto mt-32 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2rem] blur opacity-25"></div>
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 p-8 md:p-12 rounded-[2rem] text-center shadow-2xl">
            <Heart className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">Feito de Fã para Fãs. Nosso Pacto com Você.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Nossa missão é ajudar você a evoluir na vida real. Por isso, <strong>todas as funcionalidades principais do QuestFit são e sempre serão gratuitas</strong>. O jogo nunca será "Pay-to-Win" (Pagar para Vencer). 
            </p>
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 bg-secondary/50 p-4 rounded-xl border border-border">
              <Star className="w-6 h-6 text-yellow-500" />
              <p className="font-medium text-sm sm:text-base">
                Os planos VIP existentes são <strong className="text-white">puramente cosméticos</strong> (bordas mágicas, títulos coloridos e auras) e servem exclusivamente para cobrir os custos de manter os servidores online e com qualidade!
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-7xl mx-auto mt-40">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-black mb-4">Funcionalidades do Jogo</h2>
              <p className="text-xl text-muted-foreground">Tudo o que você precisa para forjar seu corpo, direto na palma da mão.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
             {[
               {
                 icon: <Activity className="w-8 h-8 text-blue-400" />,
                 title: "Treinos Inteligentes",
                 desc: "Acompanhe séries, peso e repetições. O sistema sugere cargas de acordo com seu histórico e evolução."
               },
               {
                 icon: <Shield className="w-8 h-8 text-orange-400" />,
                 title: "Suba de Patente",
                 desc: "De Ferro a Transcendente. Aumente seu PR nos exercícios e veja seu rank de maestria evoluir."
               },
               {
                 icon: <Trophy className="w-8 h-8 text-yellow-400" />,
                 title: "Missões Diárias",
                 desc: "Cumpra desafios semanais, mensais e diários (gerados automaticamente via seus treinos) para ganhar recompensas."
               },
               {
                 icon: <Swords className="w-8 h-8 text-red-500" />,
                 title: "Sistema de Classes",
                 desc: "Escolha sua classe (Guerreiro, Mago, Arqueiro) e desbloqueie evoluções reais baseadas no seu tipo favorito de treino."
               },
               {
                 icon: <Users className="w-8 h-8 text-emerald-400" />,
                 title: "Guildas PvP e PvE",
                 desc: "Junte-se aos seus amigos, complete raids em equipe e suba no quadro de líderes do seu estado."
               },
               {
                 icon: <img src="/questcoin.png" alt="Coins" className="w-8 h-8 object-contain drop-shadow" />,
                 title: "Visual Épico",
                 desc: "Seja VIP para personalizar seu perfil com bordas animadas de fogo/gelo, textos brilhantes e apoie nosso servidor!"
               }
             ].map((feat, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card/40 backdrop-blur-sm border border-border/60 p-8 rounded-3xl hover:bg-card/80 hover:border-primary/30 hover:shadow-[0_10px_40px_-15px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 group"
               >
                 <div className="w-16 h-16 bg-background/80 border border-border/80 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                   {feat.icon}
                 </div>
                 <h3 className="text-2xl font-bold font-display mb-3">{feat.title}</h3>
                 <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-5xl mx-auto mt-40 text-center bg-card border border-primary/20 p-12 md:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
           
           <h2 className="text-4xl md:text-5xl font-display font-black mb-6 relative z-10 text-white">Pronto para a Batalha?</h2>
           <p className="text-xl md:text-2xl text-muted-foreground mb-10 relative z-10 max-w-2xl mx-auto">
             Sua conta é 100% gratuita. Junte-se a milhares de heróis que já estão subindo de nível na vida real.
           </p>
           <Button size="lg" className="h-16 px-12 text-xl font-black relative z-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:scale-105 transition-all duration-300 rounded-2xl" onClick={() => navigate('/register')}>
              Criar Conta Gratuita
           </Button>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-border mt-20 py-10 text-center relative z-10 bg-background/95">
         <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
           <Swords className="w-5 h-5" />
           <span className="font-display font-bold tracking-widest uppercase">QuestFit RPG</span>
         </div>
         <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} QuestFit RPG. Feito com paixão. Gratuito para sempre.</p>
      </footer>
    </div>
  );
}

// Dummy standard component so lucide-react icon is available above
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
