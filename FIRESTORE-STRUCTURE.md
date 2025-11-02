# 🗄️ ESTRUTURA DO FIRESTORE

## 📊 Collections Principais

### 1. **`players`** (Jogadores)
Documentos identificados pelo **nome do jogador**.

```javascript
{
  name: "alanzeira_AP",           // Nome do jogador
  guid: "5962719",                 // GUID do Plutonium
  lastSeen: "2025-11-02T...",      // Última vez visto
  lastJoin: "2025-11-02T...",      // Última entrada
  lastQuit: "2025-11-02T...",      // Última saída
  lastMatch: "matchId123",         // ID da última partida
  updatedAt: 1730500000000,        // Timestamp de atualização
  
  // Subcollection: matches (histórico de partidas)
  matches: [
    {
      matchId: "xyz123",
      timestamp: "2025-11-02T...",
      stats: {
        kills: 25,
        deaths: 10,
        assists: 8,
        kd_ratio: 2.5,
        headshots: 8,
        headshot_ratio: 32.0,
        best_streak: 9,
        damage_dealt: 3500,
        damage_taken: 2000,
        // ... todas as stats da partida
      },
      map: "mp_hijacked",
      mode: "tdm",
      winner: "allies",
      duration: 630
    }
  ]
}
```

---

### 2. **`matches`** (Partidas)
Documentos com ID gerado automaticamente.

```javascript
{
  match_info: {
    map: "mp_hijacked",
    mode: "tdm",
    players: "12 players"
  },
  total_kills: 75,
  total_deaths: 75,
  team_scores: {
    allies: 45,
    axis: 30
  },
  winner_team: "allies",
  duration: 630,
  timestamp: "2025-11-02T...",
  createdAt: 1730500000000,
  
  players: [
    {
      player: "alanzeira_AP",
      team: "allies",
      kills: 25,
      deaths: 10,
      assists: 8,
      kd_ratio: 2.5,
      headshots: 8,
      headshot_ratio: 32.0,
      best_streak: 9,
      damage_dealt: 3500,
      damage_taken: 2000,
      suicides: 0,
      teamkills: 0,
      first_blood: true,
      is_mvp: true,
      favorite_weapon: "an94_mp",
      weapons_stats: {
        "an94_mp": {
          kills: 20,
          headshots: 6,
          damage: 2800
        }
      },
      hit_locations: {
        "head": 8,
        "torso_upper": 25,
        "torso_lower": 10
      }
    }
    // ... outros jogadores
  ]
}
```

---

### 3. **`kills`** (Kills Individuais)
Documentos com ID gerado automaticamente.

```javascript
{
  killer: "alanzeira_AP",
  killer_guid: "5962719",
  killer_team: "allies",
  victim: "samuwuu",
  victim_guid: "6120270",
  victim_team: "axis",
  weapon: "dsr50_mp",
  damage: "98",
  means_of_death: "MOD_RIFLE_BULLET",
  hitloc: "head",
  headshot: true,
  is_suicide: false,
  is_world_kill: false,
  is_teamkill: false,
  timestamp: "2025-11-02T...",
  createdAt: 1730500000000
}
```

---

### 4. **`events`** (Eventos Genéricos)
Outros eventos (chat, weapon_change, match_start, etc).

```javascript
{
  type: "chat_message",
  data: {
    player: "alanzeira_AP",
    guid: "5962719",
    message: "gg"
  },
  timestamp: "2025-11-02T...",
  createdAt: 1730500000000
}
```

---

## 🔍 Queries Úteis

### Buscar todas as partidas de um jogador:
```javascript
const matches = await db.collection('players')
  .doc('alanzeira_AP')
  .collection('matches')
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get();
```

### Buscar últimas partidas:
```javascript
const matches = await db.collection('matches')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

### Buscar partidas de um mapa específico:
```javascript
const matches = await db.collection('matches')
  .where('match_info.map', '==', 'mp_hijacked')
  .orderBy('createdAt', 'desc')
  .get();
```

### Buscar kills de um jogador:
```javascript
const kills = await db.collection('kills')
  .where('killer', '==', 'alanzeira_AP')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();
```

### Calcular estatísticas globais de um jogador:
```javascript
const playerDoc = await db.collection('players').doc('alanzeira_AP').get();
const matchesSnapshot = await db.collection('players')
  .doc('alanzeira_AP')
  .collection('matches')
  .get();

const totalStats = {
  matches: matchesSnapshot.size,
  totalKills: 0,
  totalDeaths: 0,
  totalAssists: 0
};

matchesSnapshot.forEach(doc => {
  const stats = doc.data().stats;
  totalStats.totalKills += stats.kills;
  totalStats.totalDeaths += stats.deaths;
  totalStats.totalAssists += stats.assists;
});

const globalKD = totalStats.totalKills / totalStats.totalDeaths;
```

---

## 📈 Índices Recomendados

Configure estes índices no Firebase Console para queries rápidas:

### Collection: `matches`
- `createdAt` (Descending)
- `match_info.map` + `createdAt` (Descending)
- `match_info.mode` + `createdAt` (Descending)
- `winner_team` + `createdAt` (Descending)

### Collection: `kills`
- `createdAt` (Descending)
- `killer` + `createdAt` (Descending)
- `victim` + `createdAt` (Descending)
- `weapon` + `createdAt` (Descending)

### Collection: `players/{playerId}/matches`
- `timestamp` (Descending)
- `map` + `timestamp` (Descending)

---

## 🔒 Regras de Segurança

Veja o arquivo `firestore.rules` para as regras de segurança recomendadas.

---

## 🚀 Benefícios desta Estrutura

✅ **Queries rápidas** - Dados organizados por entidade  
✅ **Histórico por jogador** - Fácil ver evolução  
✅ **Análise de partidas** - Dados completos de cada match  
✅ **Estatísticas agregadas** - Calcular rankings facilmente  
✅ **Escalável** - Subcollections não afetam queries principais  
✅ **Flexível** - Fácil adicionar novos tipos de eventos  

---

## 💡 Próximos Passos

1. ✅ **Deploy do código** - Atualizar API com nova estrutura
2. ✅ **Configurar índices** - Firebase Console → Firestore → Indexes
3. ✅ **Testar queries** - Validar performance
4. ✅ **Criar dashboard** - Exibir estatísticas no frontend
