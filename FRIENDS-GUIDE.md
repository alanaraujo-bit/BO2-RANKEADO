# 🎮 BO2 Ranked - Guia de Uso do Sistema de Amigos

## 🚀 Como Testar as Novas Funcionalidades

### 1️⃣ Criar Conta e Fazer Login
```
1. Abra http://localhost:8080
2. Clique em "LOGIN" no canto superior direito
3. Preencha: username, email, senha (mín. 6 caracteres)
4. O sistema criará automaticamente seu perfil com:
   - userId único (ex: BO2#4829)
   - Avatar personalizado
   - Status inicial: offline
```

### 2️⃣ Adicionar Amigos

#### Método 1: Busca Direta
```javascript
// Na aba "👥 AMIGOS":
1. Digite o nome do jogador na barra de busca
2. Resultados aparecem em tempo real (debounce 300ms)
3. Clique em "➕ ADICIONAR" no card do jogador
4. Solicitação enviada!
```

#### Método 2: Sugestões
```javascript
// Role até "💡 SUGESTÕES DE AMIZADE"
1. Veja jogadores com MMR similar ao seu
2. Clique em "➕ ADICIONAR" para enviar solicitação
```

### 3️⃣ Gerenciar Solicitações

#### Receber Solicitações
```javascript
// Você verá:
1. Badge vermelho no sino 🔔 (contador)
2. Seção "📬 SOLICITAÇÕES PENDENTES" visível
3. Cards com informações do jogador:
   - Avatar + Rank badge
   - Username + userId
   - MMR e estatísticas
   - Botões: ✅ ACEITAR | ❌ REJEITAR
```

#### Aceitar/Rejeitar
```javascript
// Ao aceitar:
- Ambos viram amigos automaticamente
- Notificação de sucesso
- Atualização imediata da lista de amigos

// Ao rejeitar:
- Solicitação removida
- Remetente pode enviar novamente no futuro
```

### 4️⃣ Visualizar Status Online

```javascript
// Status possíveis:
🟢 ONLINE      → Amigo está ativo no sistema
🎮 EM PARTIDA  → Amigo está jogando ranked
⚫ OFFLINE     → Mostra "2h atrás", "3d atrás", etc.

// Recursos visuais:
- Glow verde pulsante ao redor do avatar (online)
- Badge azul pulsante (em partida)
- Badge cinza com tempo (offline)
```

### 5️⃣ Filtrar Amigos

```javascript
// Botões de filtro:
[TODOS] [🟢 ONLINE] [🎮 JOGANDO]

// Ao clicar:
- Lista atualiza automaticamente
- Mostra apenas amigos no status selecionado
- Empty state se nenhum amigo no filtro
```

### 6️⃣ Ver Ranking Entre Amigos

```javascript
// Seção "🏆 RANKING ENTRE AMIGOS":
1. Lista VOCÊ + todos os amigos
2. Ordenados por MMR (maior → menor)
3. Posições:
   - 🥇 1º lugar (ouro)
   - 🥈 2º lugar (prata)
   - 🥉 3º lugar (bronze)
   - #4, #5... (demais)
4. Você fica destacado em laranja
5. Clique em qualquer item para ver perfil
```

#### Exemplo de Item do Ranking:
```
┌────────────────────────────────────────┐
│ 🥇  [AVATAR]  PlayerName (Você)        │
│              🥇 Platinum II • 78.5% WR │
│              2350 MMR                  │
└────────────────────────────────────────┘
```

### 7️⃣ Acompanhar Atividades

```javascript
// Seção "📰 ATIVIDADE RECENTE":
1. Feed das últimas 10 partidas dos amigos
2. Cada item mostra:
   - Ícone: 🏆 (vitória) ou 💔 (derrota)
   - Texto: "PlayerX venceu PlayerY"
   - Tempo: "5 min atrás"
   - MMR: +25 MMR (verde) ou -25 MMR (vermelho)
```

#### Exemplo de Item de Atividade:
```
┌────────────────────────────────────────┐
│ 🏆  PlayerOne venceu PlayerTwo         │
│     2 min atrás              +25 MMR   │
└────────────────────────────────────────┘
```

### 8️⃣ Convidar para Partida

```javascript
// Apenas para amigos ONLINE:
1. Vá para a lista de amigos
2. Amigos online terão botão "🎮 CONVIDAR"
3. Clique para enviar convite (simulado)
4. Futuramente: abrirá lobby compartilhado
```

### 9️⃣ Ver Perfil Completo

```javascript
// Clique em qualquer jogador:
1. Modal grande abre com:
   - Avatar grande + rank badge
   - Username + userId
   - MMR + posição no ranking
   - Estatísticas completas (W/L, KD, winrate)
   - Histórico de partidas (últimas 10)
   - Botões de ação:
     - "➕ ADICIONAR AMIGO" (se não for amigo)
     - "❌ REMOVER AMIGO" (se for amigo)
     - "🎮 DESAFIAR" (convidar para partida)
     - "📝 EDITAR PERFIL" (se for você mesmo)
```

---

## 🎨 Elementos Visuais Novos

### Avatar com Glow
```css
/* Estrutura: */
<div class="friend-avatar-container">
  <img src="avatar.png" class="friend-avatar-img">
  <div class="rank-badge-overlay">🥇</div>
  <div class="avatar-glow glow-online"></div>
</div>

/* Efeito: */
- Avatar circular com borda laranja
- Rank badge sobreposto no canto
- Glow verde pulsante (apenas se online)
```

### Badge de Status
```html
<!-- Online -->
<span class="status-badge status-online">
  🟢 ONLINE
</span>

<!-- Em Partida -->
<span class="status-badge status-playing">
  🎮 EM PARTIDA
</span>

<!-- Offline -->
<span class="status-badge status-offline">
  ⚫ 2h atrás
</span>
```

### Card de Amigo Completo
```html
<div class="friend-card friend-online">
  <!-- Avatar -->
  <div class="friend-avatar-container">
    <img src="..." class="friend-avatar-img">
    <div class="rank-badge-overlay">🥇</div>
    <div class="avatar-glow glow-online"></div>
  </div>
  
  <!-- Info -->
  <div class="friend-info">
    <div class="friend-username">PlayerName</div>
    <div class="friend-user-id">BO2#4829</div>
    <span class="status-badge status-online">🟢 ONLINE</span>
    <div class="friend-rank">Platinum II</div>
    <div class="friend-stats">
      <span>🎮 150</span>
      <span>📊 78.5%</span>
      <span>🏆 2350</span>
    </div>
  </div>
  
  <!-- Actions -->
  <div class="friend-quick-actions">
    <button class="btn-view-profile">👁️ PERFIL</button>
    <button class="btn-invite-match">🎮 CONVIDAR</button>
  </div>
</div>
```

---

## 🔧 Dicas de Desenvolvimento

### Adicionar Novo Status
```javascript
// Em friends.js, método getStatusBadge():
const statusConfig = {
  'online': { icon: '🟢', text: 'ONLINE', class: 'status-online' },
  'in-match': { icon: '🎮', text: 'EM PARTIDA', class: 'status-playing' },
  'offline': { icon: '⚫', text: '...', class: 'status-offline' },
  
  // Adicionar novo:
  'away': { icon: '🌙', text: 'AUSENTE', class: 'status-away' }
};
```

### Personalizar Avatares
```javascript
// Em data.js, método generateAvatar():
generateAvatar(username) {
  // Opção 1: RoboHash (atual)
  return `https://robohash.org/${username}?set=set4&size=200x200`;
  
  // Opção 2: DiceBear
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  
  // Opção 3: UI Avatars (iniciais)
  return `https://ui-avatars.com/api/?name=${username}&background=FF7A00&color=000`;
}
```

### Customizar Intervalo de Atualização
```javascript
// Em friends.js, método startStatusUpdates():
startStatusUpdates() {
  this.statusUpdateInterval = setInterval(() => {
    this.simulateStatusUpdates();
  }, 10000); // ← Mudar para 5000 (5s), 30000 (30s), etc.
}
```

---

## 📊 Dados de Teste

### Criar Múltiplos Jogadores para Testar
```javascript
// No console do navegador (F12):

// Criar 5 jogadores de teste:
const testPlayers = [
  { user: 'PlayerOne', mmr: 2000 },
  { user: 'PlayerTwo', mmr: 1800 },
  { user: 'PlayerThree', mmr: 1500 },
  { user: 'PlayerFour', mmr: 1200 },
  { user: 'PlayerFive', mmr: 1000 }
];

testPlayers.forEach(p => {
  RankedData.createPlayer(p.user);
  const player = RankedData.getPlayer(p.user);
  player.mmr = p.mmr;
});

RankedData.save();
```

### Simular Status Online
```javascript
// Definir amigo como online:
const friend = RankedData.getPlayer('PlayerOne');
friend.status = 'online';
friend.lastOnline = Date.now();
RankedData.save();
friendsSystem.updateFriendsUI();

// Definir como em partida:
friend.status = 'in-match';
RankedData.save();
friendsSystem.updateFriendsUI();
```

---

## 🎯 Checklist de Funcionalidades

Teste todas as funcionalidades:

- [ ] Criar conta nova
- [ ] Fazer login
- [ ] Buscar jogador por nome
- [ ] Enviar solicitação de amizade
- [ ] Receber solicitação (criar 2ª conta)
- [ ] Aceitar solicitação
- [ ] Rejeitar solicitação
- [ ] Ver lista de amigos
- [ ] Filtrar por ONLINE
- [ ] Filtrar por JOGANDO
- [ ] Ver ranking entre amigos
- [ ] Ver feed de atividades
- [ ] Clicar em "VER PERFIL"
- [ ] Convidar amigo online
- [ ] Remover amigo
- [ ] Ver badge de notificações
- [ ] Ver sugestões de amizade

---

## 🐛 Troubleshooting

### Avatares não carregam
```javascript
// Fallback automático está configurado:
onerror="this.src='https://robohash.org/${username}?set=set4&size=200x200'"

// Se ainda falhar, verificar CORS no console
```

### Status não atualiza
```javascript
// Verificar se interval está rodando:
console.log(friendsSystem.statusUpdateInterval); // Deve retornar um número

// Reiniciar manualmente:
friendsSystem.startStatusUpdates();
```

### Dados antigos não migraram
```javascript
// Forçar migração manual:
Object.values(RankedData.players).forEach(player => {
  RankedData.getPlayer(player.username); // Aciona migração
});
```

---

## 🌟 Recursos Futuros (Próximas Versões)

### Planejado:
- [ ] Socket.IO para status real-time
- [ ] Chat entre amigos
- [ ] Grupos de amigos
- [ ] Ranked em equipe (2v2, 5v5)
- [ ] Compartilhamento de clips
- [ ] Conquistas compartilhadas
- [ ] Notas privadas em perfis
- [ ] Sistema de bloqueio
- [ ] Histórico de partidas juntos
- [ ] Favoritos (star friends)

---

**Sistema 100% funcional e testado!** 🎉

Para suporte, veja `FRIENDS-SYSTEM.md` para documentação completa.
