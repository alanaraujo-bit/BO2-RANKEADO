# 🎯 FRIENDS PAGE - GUIA VISUAL RÁPIDO

## 🎨 PALETA DE CORES

```
┌────────────────────────────────────────┐
│ FUNDO PRINCIPAL                        │
│ #0A0A0A (#141414)                      │
├────────────────────────────────────────┤
│ CARDS                                  │
│ Gradient: #1A1A1A → #141414           │
├────────────────────────────────────────┤
│ ACENTO PRIMÁRIO (Laranja)              │
│ #FF7A00 (hover: #E66D00)               │
├────────────────────────────────────────┤
│ ACENTO SECUNDÁRIO (Azul Neon)          │
│ #00D9FF                                │
├────────────────────────────────────────┤
│ SUCESSO (Verde Online)                 │
│ #00FF88                                │
├────────────────────────────────────────┤
│ TEXTO PRINCIPAL                        │
│ #F5F5F5 (off-white)                    │
├────────────────────────────────────────┤
│ TEXTO SECUNDÁRIO                       │
│ #9B9B9B / #6B6B6B                      │
└────────────────────────────────────────┘
```

---

## 📐 ANATOMIA DO CARD DE AMIGO

```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ <- Barra 4px (verde se online)
├─────────────────────────────────────────┤
│                                         │
│             ╔═══════════╗               │
│             ║           ║               │
│             ║  AVATAR   ║               │ <- 100px circular
│             ║  100x100  ║               │    Border 3px
│             ╚═══════════╝               │    Glow se online
│                   🥉                    │ <- Badge rank (40px)
│                                         │
│          JOGADOR_PRO                    │ <- Username (1.1rem, bold)
│            BO2#1234                     │ <- User ID (0.85rem, mono)
│                                         │
│       ┌─────────────────┐               │
│       │ 🟢 ONLINE       │               │ <- Status Badge
│       └─────────────────┘               │
│                                         │
│            BRONZE                       │ <- Rank Name (0.9rem)
│                                         │
│ ─────────────────────────────────────── │
│  🎮 10    📊 60%    🏆 1000            │ <- Stats (0.85rem)
│ ─────────────────────────────────────── │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    👁️ VER PERFIL                │  │ <- Botão principal
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    🎮 CONVIDAR                   │  │ <- Botão secundário
│  └───────────────────────────────────┘  │    (só se online)
│                                         │
└─────────────────────────────────────────┘

DIMENSÕES:
- Largura: minmax(320px, 1fr)
- Padding: 24px
- Border-radius: 16px
- Gap entre elementos: 16px
```

---

## 🎯 ESTADOS DO CARD

### 1️⃣ ESTADO PADRÃO (OFFLINE)
```
Border: 2px solid #242424
Background: Gradient #1A1A1A → #141414
Barra superior: Oculta (opacity: 0)
Avatar border: #2E2E2E
```

### 2️⃣ HOVER
```
Border: 2px solid #FF7A00 (laranja)
Transform: translateY(-4px)
Box-shadow: 0 8px 24px rgba(0,0,0,0.4) + glow laranja
Barra superior: Visível (opacity: 1)
Avatar border: #FF7A00
Badge rank: scale(1.1)
```

### 3️⃣ ONLINE
```
Border: 2px solid #00FF88 (verde)
Barra superior: Verde (opacity: 1)
Avatar border: #00FF88
Avatar glow: Animação pulse 2s
Status badge: Background verde transparente
```

### 4️⃣ EM PARTIDA
```
Border: 2px solid #FF7A00
Status badge: Background laranja com pulse
Botão convidar: Glow pulsante
```

---

## 🔍 BARRA DE BUSCA

```
┌─────────────────────────────────────────────────┐
│ 🔍  Buscar amigo...                            │
└─────────────────────────────────────────────────┘
     │
     └──> Dropdown (max-height: 400px)
          ┌────────────────────────────────────┐
          │ ○ JOGADOR1  Bronze - 1000 MMR  [➕]│
          │ ○ JOGADOR2  Prata - 1500 MMR   [➕]│
          │ ○ JOGADOR3  Ouro - 2000 MMR    [➕]│
          └────────────────────────────────────┘

SPECS:
- Height: auto (padding 16px)
- Border-radius: 12px
- Focus: Border laranja + glow
- Ícone: Posição absolute left 20px
- Dropdown: Top calc(100% + 8px)
```

---

## 🎛️ FILTROS

```
┌──────┬──────────┬──────────┬──────────┐
│TODOS │🟢 ONLINE │🎮 JOGANDO│⚫ OFFLINE│
└──────┴──────────┴──────────┴──────────┘

ESTADO INATIVO:
- Background: #242424
- Border: 2px solid #2E2E2E
- Color: #CCCCCC

HOVER:
- Background: #2E2E2E
- Transform: translateY(-2px)

ATIVO:
- Background: #FF7A00
- Border: 2px solid #FF7A00
- Color: white
- Box-shadow: 0 0 20px rgba(255,122,0,0.3)
```

---

## 📊 RANKING ENTRE AMIGOS

```
┌──────────────────────────────────────────┐
│  🥇  ○  JOGADOR1  Bronze  1000 MMR      │ <- Gradient dourado
├──────────────────────────────────────────┤
│  🥈  ○  JOGADOR2  Bronze   950 MMR      │ <- Gradient prata
├──────────────────────────────────────────┤
│  🥉  ○  JOGADOR3  Bronze   900 MMR      │ <- Gradient bronze
├──────────────────────────────────────────┤
│  4   ○  JOGADOR4  Bronze   850 MMR      │ <- Laranja
└──────────────────────────────────────────┘

CADA ITEM:
- Padding: 16px
- Background: #141414
- Border: 1px solid #242424
- Border-radius: 10px
- Gap: 16px

HOVER:
- Background: #1A1A1A
- Border: 1px solid #FF7A00
- Transform: translateX(8px)
```

---

## 📰 FEED DE ATIVIDADES

```
┌──────────────────────────────────────────┐
│ │  🎖️  JOGADOR1 subiu para Prata!       │
│ │      há 2 horas                        │
├──────────────────────────────────────────┤
│ │  🎮  JOGADOR2 ganhou uma partida       │
│ │      há 5 horas                        │
├──────────────────────────────────────────┤
│ │  👥  JOGADOR3 adicionou novo amigo     │
│ │      há 1 dia                          │
└──────────────────────────────────────────┘
 ▲
 └─ Border-left: 3px solid #FF7A00

CADA ITEM:
- Padding: 16px
- Background: #141414
- Border-left: 3px solid #FF7A00
- Border-radius: 8px
- Gap ícone-texto: 16px

HOVER:
- Background: #1A1A1A
- Transform: translateX(4px)
```

---

## 🎨 BADGES DE STATUS

### ONLINE
```
┌─────────────────┐
│ 🟢 ONLINE       │
└─────────────────┘
Background: rgba(0,255,136,0.15)
Color: #00FF88
Border: 1px solid rgba(0,255,136,0.3)
```

### EM PARTIDA
```
┌─────────────────┐
│ 🎮 EM PARTIDA   │ <- Pulse animation
└─────────────────┘
Background: rgba(255,122,0,0.15)
Color: #FF7A00
Border: 1px solid rgba(255,122,0,0.3)
Animation: pulse-status 2s infinite
```

### OFFLINE
```
┌─────────────────┐
│ ⚫ 2h atrás      │
└─────────────────┘
Background: rgba(107,107,107,0.15)
Color: #6B6B6B
Border: 1px solid rgba(107,107,107,0.3)
```

---

## 📱 BREAKPOINTS

### DESKTOP (> 768px)
```
Grid: repeat(auto-fill, minmax(320px, 1fr))
Gap: 24px
Avatar: 100px
Card padding: 24px
Max-width: 1400px
```

### TABLET (≤ 768px)
```
Grid: 1fr
Gap: 16px
Avatar: 80px
Card padding: 20px
Filter buttons: flex: 1
```

### MOBILE (≤ 480px)
```
Títulos: 1rem (reduzido)
Botões: 0.85rem (reduzido)
Rankings: avatar 45px
Activities: ícone 35px
```

---

## ⚡ ANIMAÇÕES

### PULSE GLOW (Avatar Online)
```css
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px #00FF88; }
    50%      { box-shadow: 0 0 40px #00FF88; }
}
Duration: 2s
Timing: ease-in-out
Loop: infinite
```

### PULSE STATUS (Badge Em Partida)
```css
@keyframes pulse-status {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.7; }
}
Duration: 2s
Timing: ease-in-out
Loop: infinite
```

### GLOW PULSE (Botão Convidar)
```css
@keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 10px rgba(255,122,0,0.3); }
    50%      { box-shadow: 0 0 20px rgba(255,122,0,0.5); }
}
Duration: 2s
Timing: ease-in-out
Loop: infinite
```

---

## 🎯 EMPTY STATES

```
         👥
         
  Você ainda não tem amigos
  
Use a busca acima para encontrar jogadores
```

**SPECS:**
- Ícone: 4rem, opacity 0.5
- Texto principal: 1.1rem, #9B9B9B, bold
- Hint: 0.9rem, #4A4A4A
- Padding: 40px vertical, 24px horizontal
- Text-align: center

---

## 🎬 TRANSIÇÕES

### Padrão (elementos interativos)
```css
transition: all 0.2s ease;
```

### Hover cards
```css
transition: all 0.3s ease;
```

### Input focus
```css
transition: all 0.3s ease;
```

### Properties otimizadas
- transform ✅
- opacity ✅
- background-color ✅
- border-color ✅
- box-shadow ✅
- color ✅

**EVITAR:** width, height, left, top (causam reflow)

---

## 📦 GRID SYSTEM

```
Container
├── max-width: 1400px
├── margin: 0 auto
└── padding: 32px 24px

Grid
├── display: grid
├── grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))
├── gap: 24px
└── align-items: start

Mobile
├── grid-template-columns: 1fr
└── gap: 16px
```

---

## 🎨 TIPOGRAFIA

```
FAMÍLIA:
- Títulos/Username: 'Orbitron'
- Corpo/Botões: 'Inter'
- User ID: 'Courier New'

PESOS:
- Username: 700 (bold)
- Botões: 600 (semi-bold)
- Stats: 400-600 (regular/semi-bold)

TAMANHOS:
- Section title: 1.4rem
- Username: 1.1rem
- Rank/Status: 0.9rem
- Stats: 0.85rem
- Hints: 0.8rem

ESPAÇAMENTO:
- Titles: letter-spacing 1px
- Buttons: letter-spacing 0.5px
- Username: letter-spacing 0.5px
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Barra de busca estilizada com ícone
- [x] Dropdown de resultados funcional
- [x] Filtros (Todos, Online, Jogando, Offline)
- [x] Cards com avatar + rank badge
- [x] Status badges (online, em partida, offline)
- [x] Hover effects em todos os cards
- [x] Animações (pulse glow, pulse status)
- [x] Solicitações pendentes
- [x] Ranking entre amigos (top 3 destacado)
- [x] Feed de atividades
- [x] Sugestões de amizade
- [x] Empty states em todas as seções
- [x] Responsividade mobile
- [x] Touch-friendly buttons
- [x] Cores temáticas BO2
- [x] Tipografia consistente

---

**🎮 Design pronto para produção!**
