import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="p-2 bg-secondary rounded-full hover:bg-secondary/80"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Política de Privacidade</h1>
      </div>
      <div className="prose prose-invert prose-sm max-w-none space-y-4">
        <p><strong>Última atualização:</strong> 19 de março de 2026</p>

        <h2 className="text-lg font-bold mt-6">1. Dados que Coletamos</h2>
        <p>Coletamos apenas as informações necessárias para o funcionamento do aplicativo: email, nome, dados de treino (exercícios, séries, pesos), registros de dieta (alimentos, macros), medidas corporais e preferências de perfil (avatar, tema, classe RPG).</p>

        <h2 className="text-lg font-bold mt-6">2. Como Usamos seus Dados</h2>
        <p>Seus dados são utilizados exclusivamente para: calcular progressão de XP/nível, alimentar o sistema de ranking, gerar estatísticas na página de Progresso, e exibir seu perfil público (se habilitado). Nunca vendemos seus dados a terceiros.</p>

        <h2 className="text-lg font-bold mt-6">3. Armazenamento e Segurança</h2>
        <p>Seus dados são armazenados com segurança no Supabase (infraestrutura AWS) com criptografia em trânsito (TLS) e em repouso. Utilizamos Row-Level Security (RLS) para garantir que cada usuário acesse apenas seus próprios dados.</p>

        <h2 className="text-lg font-bold mt-6">4. Compartilhamento de Dados</h2>
        <p>Os únicos dados visíveis para outros usuários são: nome, username, avatar, nível, XP, classe, títulos e ranking — conforme configurado no seu perfil público. Dados de treino, dieta e medidas corporais são sempre privados.</p>

        <h2 className="text-lg font-bold mt-6">5. Pagamentos</h2>
        <p>Pagamentos são processados pelo Stripe. O QuestFit nunca armazena dados de cartão de crédito. Consulte a <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">política de privacidade do Stripe</a> para mais detalhes.</p>

        <h2 className="text-lg font-bold mt-6">6. Seus Direitos (LGPD)</h2>
        <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar, corrigir, exportar e solicitar a exclusão de seus dados pessoais. Para exercer estes direitos, entre em contato pela página de Feedback.</p>

        <h2 className="text-lg font-bold mt-6">7. Cookies e Armazenamento Local</h2>
        <p>Utilizamos localStorage para salvar preferências de tema e sessão de autenticação. Não utilizamos cookies de terceiros para rastreamento.</p>

        <h2 className="text-lg font-bold mt-6">8. Alterações</h2>
        <p>Esta política pode ser atualizada periodicamente. Recomendamos revisá-la regularmente. O uso continuado do Aplicativo constitui aceitação das alterações.</p>
      </div>
    </div>
  );
}
