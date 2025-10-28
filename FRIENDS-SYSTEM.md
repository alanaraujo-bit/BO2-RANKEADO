# 🎮 BO2 Ranked - Sistema de Amigos Melhorado

## 📋 Visão Geral

Sistema completo de amizades e rede social para a plataforma BO2 Ranked, com design futurista inspirado no tema Black Ops 2.

---

## ✨ Funcionalidades Implementadas

### 🆔 Sistema de ID Único
- **UserID único**: Cada jogador recebe um ID no formato `BO2#XXXX`
- **Avatar personalizado**: Integração com RoboHash para avatares únicos baseados no username
- **Perfil público**: Sistema completo de visualização de perfis

### 👥 Sistema de Amizade
- **Solicitações bidirecionais**: 
  - Enviadas (`sent`)
  - Recebidas (`received`)
- **Notificações em tempo real**: Badge no sino de notificações
- **Busca avançada**: Buscar por username ou ID
- **Sugestões inteligentes**: Baseadas em MMR similar

### 🌐 Status em Tempo Real
- **Status Online** 🟢: Indicador verde com glow animado
- **Em Partida** 🎮: Indicador azul pulsante
- **Offline** ⚫: Mostra tempo desde última vez online
- **Atualização automática**: Simula mudanças de status a cada 10 segundos

### 🎨 Design Visual Aprimorado

#### Cards de Amigos
- Avatar circular com borda neon laranja
- Glow animado para amigos online
- Badge de rank sobreposto no avatar
- Informações detalhadas: username, userId, rank, MMR, estatísticas
- Botões de ação contextuais (Convidar, Ver Perfil)

#### Badges de Status
```css
🟢 ONLINE      → Verde neon com glow
🎮 EM PARTIDA  → Azul neon pulsante
⚫ OFFLINE     → Cinza com tempo decorrido
```

### 🏆 Ranking Entre Amigos
- Lista de amigos ordenada por MMR
- Destaque visual para o jogador atual
- Posições com medalhas (🥇🥈🥉)
- Avatares e estatísticas detalhadas
- Taxa de vitória (WR) exibida

### 📰 Feed de Atividades
- Últimas 10 partidas dos amigos
- Indicadores de vitória/derrota
- Variação de MMR (+/-25)
- Tempo decorrido desde a partida
- Design com cards interativos

### 🔍 Filtros e Organização
- **Filtrar por status**:
  - Todos
  - Online (🟢)
  - Jogando (🎮)
- Botões estilizados com tema BO2
- Transições suaves

---

## 🛠️ Estrutura de Dados

### Modelo de Usuário Atualizado
```javascript
{
  username: String,
  userId: String,              // "BO2#4829"
  avatarUrl: String,           // RoboHash URL
  status: String,              // 'online', 'offline', 'in-match'
  lastOnline: Number,          // timestamp
  mmr: Number,
  rank: String,
  friends: [String],           // Array de usernames
  friendRequests: {
    sent: [                    // Solicitações enviadas
      { to: String, timestamp: Number }
    ],
    received: [                // Solicitações recebidas
      { from: String, timestamp: Number }
    ]
  },
  // ... outros campos
}
```

---

## 🎨 Temas e Estilos CSS

### Paleta de Cores
- **Laranja Neon**: `#FF7A00` (principal)
- **Verde Online**: `#00FF64` (status online)
- **Azul Jogando**: `#00AAFF` (em partida)
- **Vermelho Erro**: `#FF0033` (negativo)
- **Fundo Escuro**: `rgba(20, 20, 25, 0.95)`

### Efeitos Visuais
- **Glow Effects**: Box-shadow com cores neon
- **Backdrop Blur**: Efeito de vidro fosco
- **Hover Animations**: TranslateY e scale
- **Pulse Animations**: Para status "Em Partida"
- **Gradient Backgrounds**: Diagonais sutis

### Componentes Principais
```css
.friend-card              → Card principal de amigo
.friend-avatar-container  → Container do avatar com glow
.status-badge            → Badge de status (online/offline/playing)
.ranking-item            → Item do ranking entre amigos
.activity-item           → Item do feed de atividades
```

---

## 📱 Funcionalidades Interativas

### Ações do Usuário
1. **Buscar jogadores**: Campo de busca com debounce de 300ms
2. **Enviar solicitação**: Botão "➕ ADICIONAR"
3. **Aceitar/Rejeitar**: Botões na aba de solicitações pendentes
4. **Remover amigo**: Confirmação antes de remover
5. **Ver perfil**: Modal detalhado do jogador
6. **Convidar para partida**: Botão para amigos online
7. **Filtrar amigos**: Por status (todos/online/jogando)

### Notificações
- Badge numérico no sino de notificações
- Contagem de solicitações pendentes
- Auto-oculta quando não há notificações

---

## 🔄 Sistema de Migração

Jogadores antigos são automaticamente atualizados com:
- `userId` gerado automaticamente
- `avatarUrl` baseado no username
- `status` inicializado como 'offline'
- `friendRequests` convertido para novo formato
- `friends` array inicializado se não existir

---

## 🚀 Próximas Melhorias (Opcional)

### Backend Real-Time (Socket.IO)
- Notificações instantâneas de solicitações
- Status online/offline em tempo real
- Convites de partida ao vivo
- Chat entre amigos

### Recursos Adicionais
- Grupos de amigos
- Partidas em grupo (ranked team)
- Histórico de partidas compartilhadas
- Notas personalizadas em amigos
- Bloqueio de jogadores
- Sistema de favoritos

### Integrações
- Discord Rich Presence
- Steam integration
- Twitch status (se streaming)
- Achievements compartilhados

---

## 📊 Métricas de Sucesso

- ✅ Sistema de ID único implementado
- ✅ Avatares personalizados funcionando
- ✅ Status em tempo real (simulado)
- ✅ Ranking entre amigos completo
- ✅ Feed de atividades funcional
- ✅ Design BO2 futurista aplicado
- ✅ Animações suaves implementadas
- ✅ Sistema de filtros operacional
- ✅ Migração automática de dados antigos

---

## 🎯 Como Usar

### Para Adicionar um Amigo
1. Vá para a aba **👥 AMIGOS**
2. Digite o username na barra de busca
3. Clique em **➕ ADICIONAR** no card do jogador
4. Aguarde a aceitação

### Para Aceitar Solicitações
1. Veja o badge vermelho no sino 🔔
2. Clique no sino ou vá para aba Amigos
3. Veja a seção **📬 SOLICITAÇÕES PENDENTES**
4. Clique em **✅ ACEITAR** ou **❌ REJEITAR**

### Para Ver o Ranking
1. Na aba Amigos, role até **🏆 RANKING ENTRE AMIGOS**
2. Veja sua posição destacada
3. Clique em qualquer jogador para ver perfil completo

### Para Acompanhar Atividades
1. Role até **📰 ATIVIDADE RECENTE**
2. Veja as últimas partidas dos seus amigos
3. Confira variações de MMR

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Armazenamento**: LocalStorage (ready for Firebase)
- **Avatares**: RoboHash API
- **Fontes**: Google Fonts (Orbitron, Rajdhana)
- **Animações**: CSS Keyframes + Transitions
- **Ícones**: Emojis nativos

---

## 🎮 Tema Visual BO2

Design inspirado na interface futurista do Call of Duty: Black Ops 2:
- HUD metálico e angular
- Neon laranja predominante
- Efeitos de glow e pulse
- Tipografia militar (Orbitron)
- Backgrounds com padrões diagonais
- Transições rápidas e responsivas

---

**Desenvolvido com 🧡 para a comunidade BO2 Plutonium**
