import { Home, Dumbbell, Salad, Trophy, User, Target, Shield } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const items = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Treino', url: '/workout', icon: Dumbbell },
  { title: 'Missões', url: '/missions', icon: Target },
  { title: 'Guildas', url: '/guilds', icon: Shield },
  { title: 'Dieta', url: '/diet', icon: Salad },
  { title: 'Ranking', url: '/ranking', icon: Trophy },
  { title: 'Perfil', url: '/profile', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span className="text-[10px] font-medium">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
