# 🗺️ Roadmap de Melhorias de Experiência do Usuário (UX) e Engajamento

Este documento lista ideias e funcionalidades focadas em **retenção, gamificação e usabilidade** para tornar o QuestFit um hábito diário viciante.

---

## 🚀 1. Onboarding e Primeiros Passos (Adoção)
Para evitar que o usuário desista nos primeiros 5 minutos:
- [ ] **Tutorial Interativo (Tooltips):** Um guia passo-a-passo na primeira vez que o usuário abre o app, ensinando onde criar treino e dieta.
- [ ] **"A Primeira Missão":** Uma jornada inicial garantida (Ex: "Complete seu perfil", "Adicione 1 treino", "Beba 1L de água") que dá uma recompensa imediata (ex: 100 QuestCoins e um título "Iniciante Promissor").
- [ ] **Empty States Animados:** Quando o usuário não tem amigos ou treinos, em vez de uma tela em branco, mostrar ilustrações RPG legais (Ex: um herói descansando) com um botão gigante de "Adicionar agora".

## 🎮 2. Gamificação e Retenção (O Vício Sustentável)
- [ ] **Recompensas de Check-in Diário (Daily Login):** Ganhe bônus crescente por logar dias seguidos. (Ex: Dia 1 = 10 moedas, Dia 7 = Baú de Cosméticos).
- [ ] **Eventos Sazonais:** "Halloween Boss" ou "Desafio de Natal" onde todos recebem quests temáticas com durações por tempo limitado.
- [ ] **Títulos Dinâmicos e Conquistas Ocultas:** Títulos que o usuário não sabe como desbloquear até conseguir (Ex: Treinar às 4 da manhã dá o título "O Corvo da Madrugada").
- [ ] **Feedback Celebratório (Confetes):** Ao bater um Personal Record (PR) ou subir de classe, a tela inteira comemorar com efeitos visuais e sonoros impactantes.

## 👥 3. Social e Competição Saudável
- [ ] **Timeline do Herói (Feed de Atividades):** Um feed real onde vejo: "Erick acaba de bater 100kg no Supino" ou "Mago_Fit alcançou nível 20!". Com botões para reagir (🔥, 💪, 🛡️).
- [ ] **Desafios entre Amigos (PvP Assíncrono):** "Desafio de quem levanta mais peso no total essa semana" ou "Quem faz mais cardio".
- [ ] **Chat Integrado das Guildas:** Chat em tempo real dentro da página da Guilda para marcar treinos e compartilhar resultados de Bosses/Raids.

## 🏋️ 4. Quality of Life (Conforto Tático nos Treinos)
- [ ] **Calculadora de Anilhas Automática:** Ao invés do usuário ter que calcular quantas anilhas botar na barra de 100kg, o app mostra o desenho (Ex: 1x20kg, 1x10kg, 1x5kg de cada lado).
- [ ] **Temporizador de Descanso com Notificação Sonora/Vibração:** Durante o treino, ao marcar uma série, um timer com anel de progresso começa, apitando quando é hora da próxima série.
- [ ] **Scanner de Código de Barras (Dieta):** Facilita infinitamente a adição de alimentos industriais (abriria a câmera do celular no PWA).
- [ ] **Suporte Offline Parcial (PWA):** O usuário começa o treino na academia (onde a internet é ruim) e o app salva as anotações no cache local do celular, sincronizando com o Supabase quando chegar em casa.

## 📊 5. Visualização e Relatórios
- [ ] **Recap Automático Semanal/Mensal:** Igual ao "Spotify Wrapped", mostrando um resumo muito bonito (gerável em imagem para postar no Instagram) com os maiores PRs da semana, calorias gastas, e chefões derrotados.
- [ ] **Heatmap de Consistência (GitHub style):** Um pequeno mapa de quadrados verdes no perfil mostrando os dias do ano que o usuário treinou, para estimular não quebrar a "corrente" (streak).

## 🛡️ 6. Assinaturas e Cosméticos (Valorização do VIP)
- [ ] **Customização do Pet Companion:** Um "bichinho" (Dragão pequeno, Lobo, Coruja) que fica no canto do perfil e evolui conforme você ganha XP. O modelo VIP pode permitir skins diferentes pro Pet.
- [ ] **Passe de Batalha (Battle Pass Mensal):** Uma trilha gratuita e uma trilha VIP de recompensas puramente cosméticas baseadas no XP ganho naquele mês específico.

---

### 🗺️ Sugestão de Ordem de Prioridade (O que fazer primeiro):
*Foque na base primeiro para segurar o usuário!*
1. **Temporizador de Descanso** (Resolve dores reais na hora H)
2. **Onboarding / "A Primeira Missão"** (Garante aderência nos primeiros 10 minutos)
3. **Heatmap de Consistência & Confetes de PR** (Motivação barata de implementar que dá muito engajamento visual)
