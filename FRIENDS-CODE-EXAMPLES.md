# 💻 BO2 Ranked - Exemplos de Código do Sistema de Amigos

## 📚 Índice
1. [Estrutura de Dados](#estrutura-de-dados)
2. [Métodos Principais](#métodos-principais)
3. [Componentes UI](#componentes-ui)
4. [Estilos CSS](#estilos-css)
5. [Integrações](#integrações)

---

## 1. Estrutura de Dados

### Player Model (data.js)
```javascript
{
  username: "PlayerOne",                    // Username único
  userId: "BO2#4829",                       // ID único gerado
  avatarUrl: "https://robohash.org/...",   // URL do avatar
  status: "online",                         // online | offline | in-match
  lastOnline: 1697802400000,               // timestamp
  mmr: 2350,                                // MMR atual
  rank: "Platinum II",                      // Rank calculado
  level: 42,                                // Nível do jogador
  wins: 118,                                // Vitórias totais
  losses: 32,                               // Derrotas totais
  totalKills: 5420,                         // Kills totais
  totalDeaths: 3180,                        // Deaths totais
  winStreak: 5,                             // Sequência atual
  bestStreak: 12,                           // Melhor sequência
  gamesPlayed: 150,                         // Total de partidas
  createdAt: 1697716000000,                // Data de criação
  lastPlayed: 1697802000000,               // Última partida
  achievements: [],                         // Array de conquistas
  friends: [                                // Lista de amigos
    "PlayerTwo",
    "PlayerThree"
  ],
  friendRequests: {                         // Solicitações
    sent: [                                 // Enviadas
      { to: "PlayerFour", timestamp: 1697800000000 }
    ],
    received: [                             // Recebidas
      { from: "PlayerFive", timestamp: 1697801000000 }
    ]
  },
  seasonStats: {                            // Stats por temporada
    1: {
      wins: 118,
      losses: 32,
      mmr: 2350
    }
  }
}
```

---

## 2. Métodos Principais

### 2.1 Enviar Solicitação de Amizade
```javascript
/**
 * Envia solicitação de amizade
 * @param {string} targetUsername - Username do jogador alvo
 */
async sendFriendRequest(targetUsername) {
  try {
    // 1. Buscar dados dos dois usuários
    const userData = await getUserData(currentUser);
    const targetUser = await getUserData(targetUsername);
    
    if (!targetUser) {
      alert('Jogador não encontrado!');
      return;
    }

    // 2. Validações
    if (this.friends.includes(targetUsername)) {
      alert('Você já é amigo deste jogador!');
      return;
    }

    // 3. Inicializar estruturas se necessário
    const userRequests = userData.friendRequests || { sent: [], received: [] };
    const targetRequests = targetUser.friendRequests || { sent: [], received: [] };

    // 4. Verificar duplicatas
    if (userRequests.sent.some(req => req.to === targetUsername)) {
      alert('Solicitação já enviada!');
      return;
    }

    // 5. Adicionar solicitação
    userRequests.sent.push({ 
      to: targetUsername, 
      timestamp: Date.now() 
    });
    
    targetRequests.received.push({ 
      from: currentUser, 
      timestamp: Date.now() 
    });

    // 6. Salvar ambos os usuários
    await updateUserData(currentUser, { friendRequests: userRequests });
    await updateUserData(targetUsername, { friendRequests: targetRequests });

    // 7. Feedback
    alert(`✅ Solicitação enviada para ${targetUsername}!`);
    
  } catch (error) {
    console.error('Error sending friend request:', error);
    alert('❌ Erro ao enviar solicitação!');
  }
}
```

### 2.2 Aceitar Solicitação
```javascript
/**
 * Aceita solicitação de amizade
 * @param {string} fromUsername - Username de quem enviou
 */
async acceptFriendRequest(fromUsername) {
  try {
    // 1. Buscar dados
    const myData = await getUserData(currentUser);
    const friendData = await getUserData(fromUsername);

    // 2. Adicionar aos amigos
    const myFriends = myData.friends || [];
    const friendFriends = friendData.friends || [];

    myFriends.push(fromUsername);
    friendFriends.push(currentUser);

    // 3. Remover das solicitações
    const myRequests = myData.friendRequests || { sent: [], received: [] };
    myRequests.received = myRequests.received.filter(
      req => req.from !== fromUsername
    );

    const friendRequests = friendData.friendRequests || { sent: [], received: [] };
    friendRequests.sent = friendRequests.sent.filter(
      req => req.to !== currentUser
    );

    // 4. Atualizar ambos
    await updateUserData(currentUser, {
      friends: myFriends,
      friendRequests: myRequests
    });

    await updateUserData(fromUsername, {
      friends: friendFriends,
      friendRequests: friendRequests
    });

    // 5. Feedback e refresh
    alert(`✅ Agora você é amigo de ${fromUsername}!`);
    await this.init();
    
  } catch (error) {
    console.error('Error accepting friend request:', error);
    alert('❌ Erro ao aceitar solicitação!');
  }
}
```

### 2.3 Sistema de Status
```javascript
/**
 * Simula atualizações de status (será real-time no futuro)
 */
async simulateStatusUpdates() {
  for (const friendUsername of this.friends) {
    const friendData = await getUserData(friendUsername);
    
    // 10% de chance de mudar status
    if (friendData && Math.random() < 0.1) {
      const statuses = ['online', 'offline', 'in-match'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      friendData.status = newStatus;
      friendData.lastOnline = Date.now();
      
      await updateUserData(friendUsername, friendData);
    }
  }
  
  // Refresh UI
  this.updateFriendsUI();
}

/**
 * Inicia atualizações automáticas
 */
startStatusUpdates() {
  this.statusUpdateInterval = setInterval(() => {
    this.simulateStatusUpdates();
  }, 10000); // A cada 10 segundos
}
```

### 2.4 Filtrar Amigos
```javascript
/**
 * Filtra lista de amigos por status
 * @param {string} filter - 'all' | 'online' | 'playing'
 */
async filterFriends(filter) {
  // Atualizar botão ativo
  document.querySelectorAll('.friend-filter-buttons .filter-btn-small').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  const friendsList = document.getElementById('friendsList');
  
  if (this.friends.length === 0) {
    friendsList.innerHTML = '<div class="empty-state">Você ainda não tem amigos</div>';
    return;
  }

  let filteredFriends = this.friends;
  
  // Aplicar filtro
  if (filter === 'online') {
    filteredFriends = [];
    for (const username of this.friends) {
      const userData = await getUserData(username);
      if (userData && userData.status === 'online') {
        filteredFriends.push(username);
      }
    }
  } else if (filter === 'playing') {
    filteredFriends = [];
    for (const username of this.friends) {
      const userData = await getUserData(username);
      if (userData && userData.status === 'in-match') {
        filteredFriends.push(username);
      }
    }
  }

  // Renderizar
  if (filteredFriends.length === 0) {
    const emptyText = filter === 'online' ? 'online' : 
                      filter === 'playing' ? 'jogando' : '';
    friendsList.innerHTML = `<div class="empty-state">Nenhum amigo ${emptyText}</div>`;
  } else {
    const friendsHTML = await Promise.all(
      filteredFriends.map(username => this.createFriendCard(username))
    );
    friendsList.innerHTML = friendsHTML.join('');
  }
}
```

---

## 3. Componentes UI

### 3.1 Friend Card Completo
```javascript
/**
 * Cria card de amigo com todas as informações
 * @param {string} username - Username do amigo
 * @returns {Promise<string>} HTML do card
 */
async createFriendCard(username) {
  const playerData = await getUserData(username);
  if (!playerData) return '';

  const rankData = getRankFromMMR(playerData.mmr || 1000);
  const winrate = playerData.wins && playerData.totalMatches 
    ? ((playerData.wins / playerData.totalMatches) * 100).toFixed(1)
    : '0';
  
  const status = playerData.status || 'offline';
  const lastOnline = playerData.lastOnline || Date.now();
  const avatarUrl = playerData.avatarUrl || 
    `https://robohash.org/${username}?set=set4&size=200x200`;

  return `
    <div class="friend-card ${status === 'online' ? 'friend-online' : ''}" 
         onclick="friendsSystem.openPlayerProfile('${username}')">
      
      <!-- Avatar com Glow -->
      <div class="friend-avatar-container">
        <img src="${avatarUrl}" 
             alt="${username}" 
             class="friend-avatar-img" 
             onerror="this.src='https://robohash.org/${username}?set=set4&size=200x200'">
        <div class="rank-badge-overlay">${rankData.icon}</div>
        <div class="avatar-glow ${status === 'online' ? 'glow-online' : ''}"></div>
      </div>
      
      <!-- Informações -->
      <div class="friend-info">
        <div class="friend-username">${username}</div>
        <div class="friend-user-id">${playerData.userId || 'BO2#0000'}</div>
        ${this.getStatusBadge(status, lastOnline)}
        <div class="friend-rank">${rankData.name}</div>
        <div class="friend-stats">
          <span>🎮 ${playerData.totalMatches || 0}</span>
          <span>📊 ${winrate}%</span>
          <span>🏆 ${playerData.mmr || 1000}</span>
        </div>
      </div>
      
      <!-- Ações -->
      <div class="friend-quick-actions">
        <button class="btn-view-profile" 
                onclick="event.stopPropagation(); friendsSystem.openPlayerProfile('${username}')">
          👁️ PERFIL
        </button>
        ${status === 'online' ? `
          <button class="btn-invite-match" 
                  onclick="event.stopPropagation(); alert('🎮 Convite enviado!')">
            🎮 CONVIDAR
          </button>
        ` : ''}
      </div>
    </div>
  `;
}
```

### 3.2 Status Badge
```javascript
/**
 * Gera badge de status HTML
 * @param {string} status - Status do jogador
 * @param {number} lastOnline - Timestamp da última vez online
 * @returns {string} HTML do badge
 */
getStatusBadge(status, lastOnline) {
  const statusConfig = {
    'online': { 
      icon: '🟢', 
      text: 'ONLINE', 
      class: 'status-online' 
    },
    'in-match': { 
      icon: '🎮', 
      text: 'EM PARTIDA', 
      class: 'status-playing' 
    },
    'offline': { 
      icon: '⚫', 
      text: this.getOfflineText(lastOnline), 
      class: 'status-offline' 
    }
  };
  
  const config = statusConfig[status] || statusConfig['offline'];
  
  return `
    <span class="status-badge ${config.class}">
      ${config.icon} ${config.text}
    </span>
  `;
}

/**
 * Calcula texto "X horas/dias atrás"
 */
getOfflineText(lastOnline) {
  if (!lastOnline) return 'OFFLINE';
  
  const hours = Math.floor((Date.now() - lastOnline) / (1000 * 60 * 60));
  
  if (hours < 1) return 'OFFLINE';
  if (hours < 24) return `${hours}h atrás`;
  
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}
```

### 3.3 Ranking Item
```javascript
/**
 * Carrega e renderiza ranking entre amigos
 */
async loadFriendsRanking() {
  const rankingDiv = document.getElementById('friendsRanking');
  
  if (this.friends.length === 0) {
    rankingDiv.innerHTML = '<div class="empty-state">Adicione amigos para ver o ranking!</div>';
    return;
  }

  // Buscar dados de todos os amigos + você
  const friendsData = [];
  
  for (const username of this.friends) {
    const userData = await getUserData(username);
    if (userData) friendsData.push(userData);
  }

  const currentUserData = await getUserData(currentUser);
  if (currentUserData) friendsData.push(currentUserData);

  // Ordenar por MMR
  friendsData.sort((a, b) => (b.mmr || 1000) - (a.mmr || 1000));

  // Gerar HTML
  const rankingHTML = friendsData.map((player, index) => {
    const rankData = getRankFromMMR(player.mmr || 1000);
    const isCurrentUser = player.username === currentUser;
    const winrate = player.wins && player.totalMatches 
      ? ((player.wins / player.totalMatches) * 100).toFixed(1)
      : '0';

    const positionIcon = 
      index === 0 ? '🥇' : 
      index === 1 ? '🥈' : 
      index === 2 ? '🥉' : 
      `#${index + 1}`;

    return `
      <div class="ranking-item ${isCurrentUser ? 'ranking-current-user' : ''}" 
           onclick="friendsSystem.openPlayerProfile('${player.username}')">
        
        <div class="ranking-position">${positionIcon}</div>
        
        <div class="ranking-avatar-small">
          <img src="${player.avatarUrl || 'https://robohash.org/' + player.username + '?set=set4&size=200x200'}" 
               alt="${player.username}" 
               onerror="this.src='https://robohash.org/${player.username}?set=set4&size=200x200'">
        </div>
        
        <div class="ranking-info">
          <div class="ranking-username">
            ${player.username} ${isCurrentUser ? '(Você)' : ''}
          </div>
          <div class="ranking-stats">
            ${rankData.icon} ${rankData.name} • ${winrate}% WR
          </div>
        </div>
        
        <div class="ranking-mmr">
          ${player.mmr || 1000} <span>MMR</span>
        </div>
      </div>
    `;
  }).join('');

  rankingDiv.innerHTML = rankingHTML;
}
```

---

## 4. Estilos CSS

### 4.1 Friend Card
```css
.friend-card {
  background: linear-gradient(135deg, rgba(20, 20, 25, 0.95), rgba(30, 30, 35, 0.95));
  border: 2px solid rgba(255, 122, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.friend-card:hover {
  border-color: var(--primary-orange);
  transform: translateY(-5px);
  box-shadow: 0 0 30px rgba(255, 122, 0, 0.4), 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Destaque para amigos online */
.friend-online {
  border-color: rgba(0, 255, 100, 0.5);
  box-shadow: 0 0 20px rgba(0, 255, 100, 0.2);
}

.friend-online:hover {
  border-color: rgba(0, 255, 100, 0.8);
  box-shadow: 0 0 30px rgba(0, 255, 100, 0.4);
}
```

### 4.2 Avatar com Glow
```css
.friend-avatar-container {
  position: relative;
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.friend-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid var(--primary-orange);
  object-fit: cover;
  position: relative;
  z-index: 2;
}

.rank-badge-overlay {
  position: absolute;
  bottom: -5px;
  right: -5px;
  font-size: 1.5em;
  background: rgba(20, 20, 25, 0.95);
  border: 2px solid var(--primary-orange);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 122, 0, 0.3) 0%, transparent 70%);
  opacity: 0;
  z-index: 1;
  animation: avatarPulse 2s ease-in-out infinite;
}

.glow-online {
  background: radial-gradient(circle, rgba(0, 255, 100, 0.4) 0%, transparent 70%);
  opacity: 1;
}

@keyframes avatarPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}
```

### 4.3 Status Badges
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
}

.status-online {
  background: rgba(0, 255, 100, 0.2);
  border: 1px solid rgba(0, 255, 100, 0.5);
  color: #00FF64;
  box-shadow: 0 0 10px rgba(0, 255, 100, 0.3);
}

.status-playing {
  background: rgba(0, 170, 255, 0.2);
  border: 1px solid rgba(0, 170, 255, 0.5);
  color: #00AAFF;
  animation: statusPulse 1.5s ease-in-out infinite;
}

.status-offline {
  background: rgba(100, 100, 100, 0.2);
  border: 1px solid rgba(150, 150, 150, 0.3);
  color: var(--text-muted);
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(0, 170, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 170, 255, 0.6); }
}
```

---

## 5. Integrações

### 5.1 Migração de Dados Antigos
```javascript
// Em data.js - getPlayer()
getPlayer(username) {
  const player = this.players[username];
  
  // Migrar players antigos para nova estrutura
  if (player && !player.userId) {
    player.userId = this.generateUserId();
    player.avatarUrl = this.generateAvatar(username);
    player.status = 'offline';
    player.lastOnline = Date.now();
    player.friends = player.friends || [];
    
    // Converter friendRequests de array para objeto
    if (Array.isArray(player.friendRequests)) {
      player.friendRequests = {
        sent: [],
        received: player.friendRequests.map(req => ({
          from: req.from,
          timestamp: req.timestamp
        }))
      };
    } else {
      player.friendRequests = player.friendRequests || { sent: [], received: [] };
    }
    
    this.save();
  }
  
  return player;
}
```

### 5.2 Geração de ID Único
```javascript
// Em data.js
generateUserId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BO2#${num}`;
}

generateAvatar(username) {
  // RoboHash API - gera avatar único por username
  return `https://robohash.org/${username}?set=set4&size=200x200`;
  
  // Alternativas:
  // return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  // return `https://ui-avatars.com/api/?name=${username}&background=FF7A00`;
}
```

---

**Documentação completa do código! Use como referência para entender ou modificar o sistema.** 💻
