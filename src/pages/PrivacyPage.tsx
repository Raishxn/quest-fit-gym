import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="p-2 bg-secondary rounded-full hover:bg-secondary/80"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Política de Privacidade</h1>
      </div>
      <div className="prose prose-invert prose-sm">
        <p>Valorizamos a privacidade dos seus dados. Esta política descreve como tratamos suas informações.</p>
        <p>Suas medidas e registro de exercícios são mantidos com segurança e nunca compartilhados de forma não-anônima fora das funcionalidades vitais da comunidade do projeto (como Desafios Globais e Guildas).</p>
      </div>
    </div>
  );
}
