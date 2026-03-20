import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Swords, Shield, Trophy, Activity, Users } from 'lucide-react';

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
            <Swords className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-wide">QUEST<span className="text-primary">FIT</span></span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold">Login</Button>
            <Button onClick={() => navigate('/register')} className="font-bold hidden sm:flex">Começar Aventura</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8 relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold tracking-widest uppercase mb-4">
              O RPG da Vida Real
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-white drop-shadow-lg">
              Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Jornada Épica</span><br />
              Começa na Vida Real
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme seus treinos e dieta em uma aventura. Ganhe XP, suba de patente nos exercícios, complete missões e conquiste títulos lendários.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:scale-105 transition-all" onClick={() => navigate('/register')}>
              Criar meu Herói <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold w-full sm:w-auto" onClick={() => window.location.href = '#features'}>
              Ver Funcionalidades
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-7xl mx-auto mt-40 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Activity className="w-8 h-8 text-blue-400" />,
              title: "Treinos Inteligentes",
              desc: "Acompanhe séries, peso e repetições. O sistema sugere cargas de acordo com seu histórico."
            },
            {
              icon: <Shield className="w-8 h-8 text-orange-400" />,
              title: "Suba de Patente",
              desc: "De Ferro a Transcendente. Aumente seu PR nos exercícios e veja seu rank evoluir."
            },
            {
              icon: <Trophy className="w-8 h-8 text-yellow-400" />,
              title: "Missões e Recompensas",
              desc: "Cumpra missões diárias geradas automaticamente pelo seu treino e resgate QuestCoins."
            },
            {
              icon: <Swords className="w-8 h-8 text-red-500" />,
              title: "Sistema de Classes",
              desc: "Escolha sua classe (Guerreiro, Mago, Ranger) e ganhe bônus reais para seu objetivo."
            },
            {
              icon: <Users className="w-8 h-8 text-emerald-400" />,
              title: "Guildas PvP e PvE",
              desc: "Junte-se aos seus amigos para derrotar Bosses Mundiais ou competir no Ranking."
            },
            {
              icon: <img src="/questcoin.png" alt="Coins" className="w-8 h-8 object-contain drop-shadow" />,
              title: "Cosméticos VIP",
              desc: "Gaste seus pontos para personalizar seu perfil com bordas, títulos e fontes brilhantes."
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary/20 border border-border/50 p-6 rounded-2xl hover:bg-secondary/40 transition-colors"
            >
              <div className="w-14 h-14 bg-background border border-border rounded-xl flex items-center justify-center mb-4 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-40 text-center bg-gradient-to-t from-primary/10 to-transparent border border-primary/20 p-12 rounded-3xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20 mix-blend-overlay"></div>
           <h2 className="text-4xl font-display font-black mb-6 relative z-10">Pronto para a Batalha?</h2>
           <p className="text-xl text-muted-foreground mb-8 relative z-10">Junte-se a milhares de aventureiros mudando de vida hoje.</p>
           <Button size="lg" className="h-14 px-10 text-lg font-bold relative z-10 shadow-lg hover:shadow-primary/50 transition-shadow" onClick={() => navigate('/register')}>
              Forjar meu Destino
           </Button>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
         <p>© {new Date().getFullYear()} QuestFit RPG. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
