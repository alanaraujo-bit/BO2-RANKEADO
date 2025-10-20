# 🏆 SEASONS SYSTEM - QUICK REFERENCE

## 🚀 Start Guide (5 minutos)

### 1. Sistema já está instalado!
```
✅ seasons.js carregado
✅ seasons-ui.js carregado
✅ Página #seasons criada
✅ CSS aplicado
✅ Integração com matches.js ativa
```

### 2. Testar
```
1. Abra index.html
2. Clique em "🏆 TEMPORADAS"
3. Veja temporada ativa "Season 1: Genesis"
4. Registre uma partida
5. Confirme progresso atualizado
```

---

## 📦 API Rápida

### SeasonData (js/seasons.js)

```javascript
// INICIALIZAR (já roda automaticamente)
SeasonData.init();

// TEMPORADA ATIVA
const season = SeasonData.getActiveSeason();
console.log(season.name); // "Season 1: Genesis"

// PROGRESSO DO JOGADOR
const currentPlayerId = RankedData.currentPlayerId;
const progress = SeasonData.getPlayerSeasonProgress(currentPlayerId, season.id);
console.log(progress);
/*
{
    playerId: "Player1",
    mmr: 1025,
    rank: "Silver I",
    wins: 5,
    losses: 2,
    kd: 1.5,
    qualified: false  // precisa 10 partidas
}
*/

// LEADERBOARD TOP 10
const leaderboard = SeasonData.getSeasonLeaderboard(season.id, 10);
leaderboard.forEach((player, index) => {
    console.log(`#${index + 1}: ${player.playerId} - ${player.mmr} MMR`);
});

// CRIAR NOVA TEMPORADA
SeasonData.createSeason({
    name: 'Season 2: Uprising',
    description: 'Nova temporada!',
    startDate: Date.now(),
    endDate: Date.now() + (90 * 24 * 60 * 60 * 1000), // +90 dias
    rewards: {
        top1: { badge: '🏆 TOP 1 S2', icon: '👑', color: '#FFD700' },
        top2: { badge: '🥈 TOP 2 S2', icon: '💎', color: '#C0C0C0' },
        top3: { badge: '🥉 TOP 3 S2', icon: '⭐', color: '#CD7F32' },
        participation: { badge: '🎖️ S2 VETERAN', icon: '⚔️' }
    },
    settings: { minGamesForRank: 10 }
});

// ENCERRAR TEMPORADA
SeasonData.endSeason('season-1');
// → distribui recompensas automaticamente

// REGISTRAR PARTIDA (já integrado!)
// Acontece automaticamente em matches.js
```

### SeasonsUI (js/seasons-ui.js)

```javascript
// INICIALIZAR UI (já roda automaticamente)
SeasonsUI.init();

// REFRESH COMPLETO
SeasonsUI.refresh();

// ATUALIZAR SEÇÕES INDIVIDUAIS
SeasonsUI.updateActiveSeasonDisplay();  // Hero banner
SeasonsUI.updatePlayerProgress();       // Progresso do jogador
SeasonsUI.updateSeasonLeaderboard();    // Top 10
SeasonsUI.updatePastSeasons();          // Histórico
```

---

## 🎯 Casos de Uso

### 1️⃣ Jogador joga partida

```javascript
// MatchSystem.submitMatch() é chamado
// → Partida registrada

// Adversário confirma
// → matches.js: confirmMatch()
//   → MMRSystem.processMatch()
//   → SeasonData.registerSeasonMatch() ← AUTO
//     → Atualiza stats da temporada
//     → Atualiza leaderboard

// Jogador acessa #seasons
// → SeasonsUI.refresh()
//   → Vê progresso atualizado
```

### 2️⃣ Admin cria nova temporada

```javascript
// Opção 1: Via console
SeasonData.createSeason({
    name: 'Season 3: Chaos',
    description: 'O caos reina!',
    startDate: new Date('2025-07-01').getTime(),
    endDate: new Date('2025-09-30').getTime(),
    rewards: { ... },
    settings: { minGamesForRank: 15 }
});

// Opção 2: Via admin UI (futuro)
// admin.html terá formulário
```

### 3️⃣ Consultar dados

```javascript
// Todas as temporadas
const allSeasons = SeasonData.getAllSeasons();

// Temporada específica
const s1 = SeasonData.getSeasonById('season-1');

// Top 100 da temporada
const top100 = SeasonData.getSeasonLeaderboard('season-1', 100);

// Progresso de vários jogadores
['Player1', 'Player2', 'Player3'].forEach(playerId => {
    const progress = SeasonData.getPlayerSeasonProgress(playerId, 'season-1');
    console.log(`${playerId}: ${progress.mmr} MMR`);
});
```

---

## 🔧 Customização

### Mudar Tema da Temporada

```css
/* Em css/styles.css, procure: */

.season-hero {
    background: linear-gradient(...);  /* Mude o gradiente */
}

.reward-top1 {
    border-color: #FFD700;  /* Mude a cor Top 1 */
}
```

### Mudar Recompensas

```javascript
// Em SeasonData.createSeason() ou createDefaultSeason()
rewards: {
    top1: {
        badge: '🏆 MEU TÍTULO CUSTOMIZADO',
        icon: '🔥',  // Emoji ou HTML
        color: '#FF0000'  // Cor HEX
    }
}
```

### Mudar Duração da Temporada

```javascript
// Ao criar temporada
const threMonths = 90 * 24 * 60 * 60 * 1000;
startDate: Date.now(),
endDate: Date.now() + threeMonths
```

### Mudar Requisitos de Qualificação

```javascript
// Ao criar temporada
settings: {
    minGamesForRank: 20  // Aumenta de 10 para 20
}
```

---

## 🐛 Debug

### Console Logs

```javascript
// Ver temporada ativa
console.log('Temporada Ativa:', SeasonData.getActiveSeason());

// Ver progresso do jogador atual
const playerId = RankedData.currentPlayerId;
const seasonId = SeasonData.getActiveSeason()?.id;
console.log('Meu Progresso:', SeasonData.getPlayerSeasonProgress(playerId, seasonId));

// Ver todos os dados
console.log('Todos os Dados:', SeasonData.getAllSeasons());
```

### LocalStorage

```javascript
// Ver dados salvos
const raw = localStorage.getItem('bo2ranked-seasons');
console.log('LocalStorage:', JSON.parse(raw));

// Limpar dados (CUIDADO!)
localStorage.removeItem('bo2ranked-seasons');
SeasonData.init();  // Recria temporada padrão
```

### Problemas Comuns

**Progresso não atualiza:**
```javascript
// Verificar se temporada está ativa
const season = SeasonData.getActiveSeason();
if (!season) {
    console.error('❌ Nenhuma temporada ativa!');
}

// Verificar se SeasonData está carregado
if (typeof SeasonData === 'undefined') {
    console.error('❌ seasons.js não carregado!');
}
```

**Leaderboard vazio:**
```javascript
// Verificar se há jogadores qualificados
const leaderboard = SeasonData.getSeasonLeaderboard('season-1', 100);
console.log('Total de jogadores:', leaderboard.length);

// Jogadores não qualificados não aparecem
// (precisa minGamesForRank partidas)
```

---

## 📁 Estrutura de Dados

### Season Object
```javascript
{
    id: "season-1",
    name: "Season 1: Genesis",
    description: "...",
    startDate: 1704067200000,
    endDate: 1711929600000,
    active: true,
    rewards: { top1, top2, top3, participation },
    settings: { minGamesForRank: 10 }
}
```

### PlayerSeasonProgress Object
```javascript
{
    playerId: "Player1",
    seasonId: "season-1",
    seasonName: "Season 1: Genesis",
    mmr: 1000,
    rank: "Silver I",
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    totalKills: 0,
    totalDeaths: 0,
    kd: 0,
    winRate: 0,
    winStreak: 0,
    bestStreak: 0,
    finalRank: null,
    rewardEarned: null,
    lastMatchDate: null,
    qualified: false
}
```

---

## 🎨 Classes CSS Importantes

```css
/* Principais componentes */
.season-hero           /* Banner principal */
.season-timer          /* Contador */
.reward-card           /* Cards de recompensa */
.progress-stat-card    /* Cards de stats */
.qualification-progress /* Barra de qualificação */
.leaderboard-row       /* Linhas do leaderboard */
.past-season-card      /* Cards de temporadas antigas */

/* Estados */
.qualified             /* Jogador qualificado */
.not-qualified         /* Jogador não qualificado */
.season-ended          /* Temporada encerrada */

/* Posições */
.position-1            /* Top 1 (ouro) */
.position-2            /* Top 2 (prata) */
.position-3            /* Top 3 (bronze) */
```

---

## ⚡ Performance

### Auto-refresh
```javascript
// Timer atualiza a cada 1 hora (não a cada segundo)
setInterval(() => {
    SeasonsUI.updateTimer();
}, 60 * 60 * 1000);

// Para atualizar manualmente:
SeasonsUI.updateTimer();
```

### Lazy Loading
```javascript
// Leaderboard carrega apenas Top 10 por padrão
// Para carregar mais:
const top50 = SeasonData.getSeasonLeaderboard('season-1', 50);
```

---

## 🔐 Segurança

### Validações
```javascript
// Todas as funções validam dados
if (!seasonData.name || !seasonData.startDate) {
    throw new Error('Dados inválidos');
}

// Anti-cheat: progresso só atualiza via registerSeasonMatch()
// Não é possível editar diretamente o LocalStorage sem invalidar
```

---

## 🚀 Deploy

### Checklist
```
✅ Todos os arquivos commitados
✅ seasons.js carregado em index.html
✅ seasons-ui.js carregado em index.html
✅ CSS aplicado
✅ Navegação funcionando
✅ Integração com matches.js ativa
✅ LocalStorage persistindo dados
✅ Responsivo testado
✅ Sem erros no console
```

### Produção
```
1. Test local: Abra index.html → #seasons
2. Commit: git add . && git commit -m "feat: Season system"
3. Push: git push origin main
4. Deploy: Vercel/Netlify auto-deploy
```

---

## 📞 Suporte

**Erros?** Verifique:
1. Console do browser (F12)
2. LocalStorage (`localStorage.getItem('bo2ranked-seasons')`)
3. Ordem de carregamento dos scripts
4. Temporada ativa existe

**Dúvidas?** Consulte:
- SEASONS-DOCUMENTATION.md (completo)
- Código inline (bem comentado)

---

**⚡ Quick Ref Version:** 1.0  
**📅 Updated:** Outubro 2025  
**⏱️ Read Time:** 5 minutos
