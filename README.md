# 🎮 BO2 PLUTONIUM RANKED SYSTEM

Sistema de ranqueamento competitivo para Call of Duty: Black Ops 2 no Plutonium. Um sistema completo de MMR/ELO com ranks visuais, leaderboards, histórico de partidas e sistema de confirmação semi-automático.

![BO2 Ranked](https://img.shields.io/badge/Version-2.0.0-orange) ![Status](https://img.shields.io/badge/Status-Active-success) ![Design](https://img.shields.io/badge/Design-BO2_Inspired-FF7A00)

## ✨ NOVO: DESIGN SYSTEM PROFISSIONAL

**Agora com visual completo inspirado no Call of Duty: Black Ops 2!**

🎨 **Design Highlights:**
- Paleta laranja neon (#FF7A00) + fundo ultra escuro (#0A0A0A)
- Tipografia militar: Orbitron (títulos) + Rajdhana (corpo)
- Cards metálicos com backdrop-filter blur
- Botões com shine effect e animações
- Partículas animadas no background
- HUD elements com glow pulsante
- Scrollbar e cursor customizados
- Transições suaves em todos elementos
- 100% responsivo

📄 **[Ver documentação completa do Design System](DESIGN-SYSTEM.md)**

---

## 🌟 FUNCIONALIDADES

### 🏆 Sistema de Ranks
- **7 Divisões de Rank:**
  - 🥉 Bronze (I, II, III)
  - 🥈 Prata (I, II, III)
  - 🥇 Ouro (I, II, III)
  - 💎 Platina (I, II, III)
  - 💠 Diamante (I, II, III)
  - 👑 Mestre
  - ⚡ Lenda

- **Sistema MMR (Match Making Rating):**
  - MMR inicial: 1000
  - Ganho por vitória: 15-50 MMR (baseado em performance)
  - Perda por derrota: 10-40 MMR
  - Bônus por win streak
  - Multiplicador de performance (K/D)

### 🎮 Sistema de Partidas
- **Registro Semi-Automático:**
  - Jogador reporta resultado
  - Adversário confirma ou rejeita
  - MMR só atualiza após confirmação mútua
  - Upload opcional de screenshot

- **Estatísticas Rastreadas:**
  - Kills/Deaths totais
  - K/D Ratio
  - Win Rate
  - Win Streak
  - Mapa e modo de jogo

### 📊 Perfil do Jogador
- Rank atual com ícone
- MMR e progresso para próximo rank
- Estatísticas completas:
  - Vitórias/Derrotas
  - Win Rate
  - K/D Ratio
  - Streak atual e melhor streak
- Histórico de partidas (últimas 20)

### 🏅 Leaderboards
- **Ranking Global:** Todos os tempos
- **Ranking de Temporada:** Season atual
- Filtros e ordenação
- Top 5 na homepage

### 🎖️ Conquistas
- 🏆 Primeira Vitória
- 🔥 Hat Trick (3 vitórias seguidas)
- 🔥🔥 Dominating (5 vitórias seguidas)
- 🔥🔥🔥 Unstoppable (10 vitórias seguidas)
- 🎮 Veterano (10 partidas)
- 🎮 Dedicado (50 partidas)
- 🎮 Lendário (100 partidas)

---

## 🚀 COMO USAR

### 📥 Instalação
1. Clone ou baixe este repositório
2. Abra `index.html` no navegador
3. Pronto! Não precisa de servidor

### 🎯 Primeiro Acesso
1. Clique em **LOGIN** no canto superior direito
2. Digite seu nome de usuário
3. Clique em **ENTRAR**
4. Seu perfil será criado com 1000 MMR (Silver I)

### 🎮 Registrar uma Partida
1. Vá na aba **JOGAR**
2. Preencha o formulário:
   - Selecione o adversário
   - Escolha o mapa
   - Escolha o modo de jogo
   - Digite seus kills
   - Digite suas deaths
   - Selecione se você venceu ou perdeu
   - (Opcional) Anexe screenshot do placar
3. Clique em **ENVIAR RESULTADO**
4. O adversário receberá uma notificação para confirmar

### ✅ Confirmar uma Partida
1. Quando alguém reportar uma partida contra você:
2. Vá na aba **JOGAR**
3. Veja a seção **AGUARDANDO CONFIRMAÇÃO**
4. Revise as informações
5. Clique em **CONFIRMAR** ou **REJEITAR**
6. Se confirmar, os MMRs serão atualizados automaticamente!

---

## 💡 COMO FUNCIONA O MMR

### 📈 Cálculo de MMR
O sistema usa uma fórmula baseada em ELO com ajustes:

```
Ganho Base = 32 * (1 - Expected Win Rate)
Ganho Final = Ganho Base * Performance Multiplier + Streak Bonus
```

### 🎯 Performance Multiplier
- K/D ≥ 3.0: **1.3x** (Dominante)
- K/D ≥ 2.0: **1.2x** (Excelente)
- K/D ≥ 1.5: **1.1x** (Bom)
- K/D ≥ 1.0: **1.0x** (Médio)
- K/D < 1.0: **0.8-0.9x** (Abaixo da média)

### 🔥 Bônus de Streak
- 10+ vitórias seguidas: **+10 MMR**
- 7-9 vitórias seguidas: **+7 MMR**
- 5-6 vitórias seguidas: **+5 MMR**
- 3-4 vitórias seguidas: **+3 MMR**

### 📊 Exemplo Prático
```
Jogador A: 1200 MMR
Jogador B: 1400 MMR

A vence com 25-10 (K/D 2.5) → Ganho: +35 MMR (1.2x multiplier)
B perde → Perda: -22 MMR

Novo MMR:
A: 1235 MMR
B: 1378 MMR
```

---

## 🛡️ ANTI-CHEAT

### Medidas de Segurança
- ✅ Confirmação mútua obrigatória
- ✅ Screenshot opcional como prova
- ✅ Histórico permanente (não pode deletar)
- ✅ Sistema de reports (futuramente)
- ✅ Detecção de padrões suspeitos (futuramente)

---

## 🗂️ ESTRUTURA DO PROJETO

```
BO2-RANKED/
├── index.html          # Página principal
├── css/
│   └── styles.css     # Estilos (BO2 theme)
├── js/
│   ├── data.js        # Gerenciamento de dados
│   ├── ranks.js       # Sistema de ranks
│   ├── mmr.js         # Cálculo de MMR
│   ├── matches.js     # Sistema de partidas
│   ├── ui.js          # Interface do usuário
│   └── main.js        # Aplicação principal
└── README.md          # Documentação
```

---

## 🎨 DESIGN

- **Tema:** Call of Duty Black Ops 2
- **Cores:** Preto, Laranja (#FF6600), Azul Neon (#00D9FF)
- **Fontes:** Orbitron (títulos), Rajdhana (corpo)
- **Estilo:** Futurístico com efeitos de brilho
- **Responsivo:** Funciona em desktop e mobile

---

## 💾 ARMAZENAMENTO

Os dados são salvos no **LocalStorage** do navegador:
- ✅ Automático (salva a cada mudança)
- ✅ Persistente (não perde ao fechar o navegador)
- ✅ Local (não precisa de servidor)
- ⚠️ Específico do navegador (não sincroniza entre dispositivos)

### Migração para Firebase (Futuro)
O código está estruturado de forma modular para facilitar migração para Firebase:
- `RankedData` → Firebase Realtime Database
- Autenticação → Firebase Auth
- Screenshots → Firebase Storage

---

## 🔧 DEV TOOLS

Console do navegador (F12):

```javascript
// Resetar tudo
devTools.reset()

// Adicionar jogadores de teste
devTools.addTestPlayers()

// Ver dados atuais
devTools.getData()
```

---

## 📱 COMPATIBILIDADE

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Mobile (iOS/Android)

---

## 🚧 ROADMAP

### Versão 1.1
- [ ] Bot de Discord
- [ ] Gráficos de progresso (Chart.js)
- [ ] Mais conquistas
- [ ] Sistema de reports

### Versão 2.0
- [ ] Backend com Firebase
- [ ] Autenticação real
- [ ] Sincronização multi-device
- [ ] API pública
- [ ] Sistema de temporadas automático

---

## 👨‍💻 DESENVOLVIMENTO

### Tecnologias
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript ES6+ (Vanilla)
- LocalStorage API
- Chart.js (futuro)

### Princípios
- ✅ Mobile-first
- ✅ Código modular
- ✅ Sem dependências pesadas
- ✅ Performance otimizada
- ✅ Pronto para migração

---

## 📄 LICENÇA

Este projeto é open-source para uso pessoal e educacional.

---

## 🤝 CONTRIBUIÇÕES

Sugestões e melhorias são bem-vindas!

---

## 🎮 COMUNIDADE

Desenvolvido para a comunidade **Call of Duty: Black Ops 2 Plutonium**

**Have fun and rank up!** 🔥🏆

---

**Versão:** 1.0.0  
**Data:** Outubro 2025  
**Status:** ✅ Funcional e pronto para uso!
