import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="p-2 bg-secondary rounded-full hover:bg-secondary/80"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Termos de Uso</h1>
      </div>
      <div className="prose prose-invert prose-sm max-w-none space-y-4">
        <p><strong>Última atualização:</strong> 19 de março de 2026</p>

        <h2 className="text-lg font-bold mt-6">1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar o QuestFit ("Aplicativo"), você concorda com estes Termos de Uso. Se não concordar, por favor não utilize o Aplicativo.</p>

        <h2 className="text-lg font-bold mt-6">2. Descrição do Serviço</h2>
        <p>O QuestFit é uma plataforma gamificada de fitness que permite registrar treinos, dieta e cardio, acompanhar progressos e participar de sistemas de ranking, missões e guildas em formato de RPG.</p>

        <h2 className="text-lg font-bold mt-6">3. Cadastro e Conta</h2>
        <p>Você deve fornecer informações verdadeiras ao criar sua conta. É sua responsabilidade manter a confidencialidade de suas credenciais de acesso. Contas que violem estes termos podem ser suspensas ou encerradas.</p>

        <h2 className="text-lg font-bold mt-6">4. Uso Aceitável</h2>
        <p>Você concorda em não utilizar o Aplicativo para fins ilegais, disseminar conteúdo ofensivo, explorar bugs ou vulnerabilidades, ou interferir no funcionamento do serviço.</p>

        <h2 className="text-lg font-bold mt-6">5. Conteúdo do Usuário</h2>
        <p>Todo conteúdo que você publica (fotos de perfil, nomes, bio) é de sua responsabilidade. O QuestFit se reserva o direito de remover conteúdo que viole estes termos.</p>

        <h2 className="text-lg font-bold mt-6">6. Compras e Assinaturas</h2>
        <p>Planos VIP e Pro são processados via Stripe. Ao adquirir uma assinatura, você concorda com os termos de cobrança recorrente. Gift Codes possuem validade e condições específicas no momento da emissão.</p>

        <h2 className="text-lg font-bold mt-6">7. Moeda Virtual (QuestCoins)</h2>
        <p>QuestCoins são uma moeda virtual sem valor monetário real. Não podem ser trocadas por dinheiro, transferidas entre contas ou reembolsadas. O QuestFit pode ajustar a economia virtual a qualquer momento.</p>

        <h2 className="text-lg font-bold mt-6">8. Limitação de Responsabilidade</h2>
        <p>O QuestFit é uma ferramenta de acompanhamento e não substitui orientação profissional de educadores físicos ou nutricionistas. Use as funcionalidades de treino e dieta sob sua própria responsabilidade.</p>

        <h2 className="text-lg font-bold mt-6">9. Modificações</h2>
        <p>Podemos atualizar estes termos a qualquer momento. O uso continuado do Aplicativo após alterações constitui aceitação dos novos termos.</p>

        <h2 className="text-lg font-bold mt-6">10. Contato</h2>
        <p>Para dúvidas sobre estes termos, entre em contato através da página de Feedback no aplicativo.</p>
      </div>
    </div>
  );
}
