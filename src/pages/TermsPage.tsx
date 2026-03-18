import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="p-2 bg-secondary rounded-full hover:bg-secondary/80"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Termos de Uso</h1>
      </div>
      <div className="prose prose-invert prose-sm">
        <p>Bem-vindo ao Quest Fit. Ao usar nosso aplicativo, você concorda com estes termos.</p>
        <p>O aplicativo oferece uma experiência gamificada para o seu progresso no fitness. Todos os dados adicionados, como registro de exercícios, são utilizados exclusivamente para calcular sua evolução no jogo de acordo.</p>
      </div>
    </div>
  );
}
