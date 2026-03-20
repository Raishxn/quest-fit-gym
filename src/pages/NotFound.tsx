import { Link } from 'react-router-dom';
import { Home, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="text-8xl font-display font-bold text-primary drop-shadow-lg">404</div>
        <h1 className="text-2xl font-display font-bold">Área Desconhecida</h1>
        <p className="text-muted-foreground">
          Parece que você se perdeu no mapa, aventureiro. Esta região ainda não foi explorada.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/home"><Home className="w-4 h-4 mr-2" />Voltar ao QG</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/missions"><Swords className="w-4 h-4 mr-2" />Ver Missões</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
