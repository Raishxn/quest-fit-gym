<p align="center">
  <h1 align="center">⚔️ Quest Fit Gym</h1>
  <p align="center"><strong>Level up your body. Conquer your limits.</strong></p>
  <p align="center">
    Aplicação web gamificada de acompanhamento fitness que transforma treinos em uma jornada RPG.<br/>
    Open-source • Gratuito • Feito com ❤️ pela comunidade
  </p>
</p>

---

## 📸 Visão Geral

Quest Fit Gym combina o tracking rigoroso de treinos e dieta com mecânicas de RPG para tornar a rotina na academia viciante. Cada sessão gera XP, cada exercício tem um rank de Ferro a Transcendente, e cada dia de streak te mantém motivado.

## ✨ Features

### 🏋️ Treino
- **Sessão de treino ativa** com timer em tempo real
- Adicione exercícios de uma **base de dados com 100+ exercícios**
- Registro de séries com tipos: **Warmup, Working, Backoff**
- Cálculo automático de **backoff sets** (75% da última working)
- **Ranks por exercício**: Ferro → Bronze → Prata → Ouro → Platina → Diamante → Mestre → Grão-Mestre → Lendário → Transcendente
- **Personal Records** tracking
- Suporte a treino **Solo** ou em **Party** com amigos

### 🎵 Playlists de Treino
- Crie **programas de treino** completos (Push Pull Legs, Upper Lower, etc.)
- Organize por **dias com exercícios planejados**
- Configure séries, reps e tempo de descanso padrão
- Arquive e restaure playlists antigas

### 🥗 Dieta & Nutrição
- 7 categorias de refeição (Café da Manhã → Ceia)
- **Busca inteligente de alimentos** com macros por 100g
- **Cadastro de alimentos personalizados**
- Ring chart de progresso: Calorias, Proteína, Gordura, Carboidratos
- Tracking de **consumo de água** diário
- **Metas automáticas** calculadas pela Anamnese (BMR/TDEE)

### 🏃 Cardio
- 8 tipos de cardio: Corrida, Bike, Natação, Caminhada, Elíptico, Remo, Pular Corda, Outro
- Registro de duração, distância e calorias

### 📊 Progresso
- **Progressão por exercício** com comparação de cargas
- **Séries por grupo muscular** com visualização em barras
- **Histórico de peso corporal** com variação
- **Gasto calórico** (TDEE + treino + cardio)
- **Relatório Semanal** automático aos sábados
- Filtros: Semanal, Mensal, Período Personalizado

### ⚔️ Sistema RPG
- **XP & Nível**: Iniciante → Aprendiz → Guerreiro → Veterano → Elite → Lendário → Imortal
- **Atributos**: STR (Força), END (Resistência), VIT (Vitalidade), AGI (Agilidade)
- **Classes RPG** com 8 arquétipos e sistema de raridade
- **Ranking Geral (Overall Mastery)**: Ferro IV → Transcendente I com Pontos de Maestria
- **Conquistas** com ícones e recompensas de XP

### 🎯 Missões
- **Missões Diárias** com reset automático
- **Missões Semanais** e **Mensais**
- **Missões Master** desbloqueadas por rank
- **Missões Globais** da comunidade com progresso coletivo
- Countdown de reset em tempo real

### 🏰 Social
- **Amigos**: Buscar, enviar solicitações, aceitar/recusar
- **Guildas**: Criar, buscar, entrar, sair com dashboard e membros
- **Party**: Lobby para treinar com amigos em sessão conjunta
- **Ranking Hall da Fama**: 5 categorias × 3 escopos (Global, Regional, Amigos)

### 👑 VIP / Cosméticos
- **Aura Glow** no avatar com cor personalizada
- **Cor metálica do nome**
- **Moldura (Frame)** personalizada PNG/GIF
- **Avatar/Banner GIF** animado
- Planos: Free, VIP, VIP+, PRO *(100% cosmético, sem P2W)*

### ⚙️ Configurações
- **6 temas** (dark/light × red/orange/gold)
- **7 abas**: Conta, Aparência, Treino, Notificações, Privacidade, Plano, Sobre
- Controle de **visibilidade do perfil** (Público, Só Amigos, Privado)

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS 3, shadcn/ui (Radix UI), CSS Variables |
| **Animações** | Framer Motion |
| **Estado** | Zustand (global), TanStack React Query (server state) |
| **Formulários** | React Hook Form + Zod |
| **Roteamento** | React Router DOM v6 |
| **Gráficos** | Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Ícones** | Lucide React |
| **Notificações** | Sonner (toasts) |
| **Testes** | Vitest + React Testing Library + Playwright (E2E) |

---

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/Raishxn/quest-fit-gym.git
cd quest-fit-gym

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Rode em desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais
| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil RPG do usuário (XP, nível, atributos, plano) |
| `anamnesis` | Dados físicos + metas calculadas |
| `exercises` | Base de exercícios (100+ seed) |
| `workout_programs` | Playlists de treino |
| `workout_days` | Dias dentro de um programa |
| `planned_exercises` | Exercícios planejados em um dia |
| `workout_sessions` | Sessões de treino ativas/completadas |
| `exercise_logs` | Exercícios realizados numa sessão |
| `set_logs` | Séries individuais (peso, reps, tipo) |
| `exercise_ranks` | Rank por exercício (Ferro → Transcendente) |
| `personal_records` | PRs por exercício |
| `foods` | Base de alimentos com macros |
| `diet_days` | Registro diário de dieta |
| `meals` / `meal_items` | Refeições e itens |
| `cardio_sessions` | Sessões de cardio |
| `friendships` | Sistema de amizades |
| `guilds` / `guild_members` | Sistema de guildas |
| `achievements` / `user_achievements` | Conquistas |
| `xp_transactions` | Log de XP |
| `feed_activities` / `feed_reactions` | Feed social |
| `notifications` | Notificações |
| `classes` | Classes RPG com buffs |
| `mission_templates` / `user_missions` / `global_missions` | Sistema de missões |
| `body_measurements` | Histórico de peso corporal |

---

## 📋 Roadmap

### ✅ v1.0.0 Alpha — Core Features
Todas as features de treino, dieta, cardio, RPG, social e missões.

### 🔥 v1.0.1 — Hotfix (Em Andamento)
- [ ] Corrigir seleção de classe RPG (criar tabelas no banco)
- [ ] Preview e crop de avatar/banner antes do upload
- [ ] Settings salvarem na DB

### 📦 v1.1 — Polish
- [ ] Notificações inbox
- [ ] Feed formatado (Quest Log)
- [ ] Tutorial/Onboarding
- [ ] Acessibilidade

### 📦 v1.2 — Social+
- [ ] Chat na Party (realtime)
- [ ] Timeline de amigos
- [ ] Perfil público
- [ ] Menções @username

### 🏪 v1.3 — Quest Store
- [ ] Loja de cosméticos
- [ ] Battle Pass mensal
- [ ] Moeda virtual (Ouro)

### 💳 v1.4 — Monetização Real
- [ ] Integração Stripe/MercadoPago
- [ ] VIP real com verificação RLS
- [ ] Admin dashboard

### 📱 v2.0 — Mobile & PWA
- [ ] Progressive Web App
- [ ] Push notifications
- [ ] Integração wearables
- [ ] QR code check-in

### 🌎 v3.0 — Comunidade
- [ ] Fórum / discussões
- [ ] Ranking estadual real
- [ ] Eventos sazonais
- [ ] Compartilhamento de playlists

---

## 🤝 Contribuindo

Quest Fit Gym é **open-source** e aceita contribuições! Veja nosso guia:

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💖 Apoie o Projeto

Se Quest Fit Gym te ajuda na academia, considere apoiar:

- ⭐ Dê uma estrela no GitHub
- 🗣️ Compartilhe com amigos que treinam
- 💰 Considere um plano VIP quando disponível (R$5,99+)

---

<p align="center">
  <strong>⚔️ Level up your body. Conquer your limits. ⚔️</strong>
</p>
