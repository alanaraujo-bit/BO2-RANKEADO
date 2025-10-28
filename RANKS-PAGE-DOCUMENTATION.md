# 🎖️ Ranks Page - Complete Documentation

## 🎯 Overview
Página dedicada ao sistema de progressão de ranks do BO2 Ranked, apresentando todas as patentes, requisitos de MMR, progresso do jogador e estratégias para evoluir.

---

## 📋 Estrutura da Página

### 1️⃣ **Hero Banner**
Seção de abertura que estabelece o tom e explica o sistema.

**Elementos:**
- Badge "⚡ SISTEMA DE PROGRESSÃO"
- Título duplo:
  - Highlight: "SUBA DE PATENTE" (dourado, 4xl)
  - Main: "E DOMINE O CAMPO DE BATALHA" (branco, 5xl)
- Descrição: "Cada partida conta! Ganhe MMR, evolua nas patentes..."

**Design:**
- Background: Gradiente escuro (#0A0A0A → #1A1A1A)
- Scanline animation no topo (dourado)
- Borda #2A2A2A
- Texto centralizado

---

### 2️⃣ **Progresso do Jogador** (Condicional - Apenas se logado)

Mostra o rank atual do jogador e progresso para o próximo.

#### **A. Current Rank Display**

**Estrutura:**
```
[Current Rank Card] ➜ [Next Rank Card]
```

**Current Rank Card:**
- Ícone gigante (6rem) pulsante
- Label: "PATENTE ATUAL"
- Nome do rank (5xl, dourado, text-shadow)
- MMR atual (4xl, branco, glow laranja)
- Background: Radial gradient laranja
- Borda: 3px laranja neon (#FF6600)
- Box-shadow: 40px blur laranja

**Next Rank Card:**
- Ícone médio (4rem)
- Label: "PRÓXIMA PATENTE"
- Nome do próximo rank (3xl, cinza claro)
- MMR restante destacado em laranja
- Background: Escuro sutil
- Borda: 2px #3A3A3A

**Arrow:**
- Emoji: ➜
- Tamanho: 6xl
- Cor: #FF6600
- Pulsando
- Rotaciona 90° em mobile

#### **B. Progress Bar**

**Labels:**
```
[0 MMR]        [50%]        [300 MMR]
 laranja      dourado       cinza
```

**Barra:**
- Altura: 40px
- Background: rgba(10, 10, 10, 0.8)
- Borda: 2px #2A2A2A
- Inset shadow

**Fill:**
- Gradiente triplo:
  * 0%: #FF4500 (vermelho-laranja)
  * 50%: #FF6600 (laranja)
  * 100%: #FFD700 (dourado)
- Box-shadow: 25px blur laranja
- Animação smooth (1s cubic-bezier)

**Efeitos:**
1. Shine: Brilho branco deslizante (2s loop)
2. Stripes: Padrão diagonal com transparência

---

### 3️⃣ **Tabela de Ranks** (10 Ranks Total)

Grid responsivo com todos os ranks do sistema.

#### **Ranks Disponíveis:**

| Rank | Icon | MMR Range | Tier |
|------|------|-----------|------|
| **BRONZE I** | 🥉 | 0-299 | Tier 1 |
| **BRONZE II** | 🥉 | 300-499 | Tier 1 |
| **PRATA I** | 🥈 | 500-799 | Tier 2 |
| **PRATA II** | 🥈 | 800-1099 | Tier 2 |
| **OURO I** | 🥇 | 1100-1499 | Tier 3 |
| **OURO II** | 🥇 | 1500-1799 | Tier 3 |
| **PLATINA** | 💠 | 1800-2099 | Tier 4 |
| **DIAMANTE** | 💎 | 2100-2399 | Tier 5 |
| **MESTRE** | 👑 | 2400-2499 | Tier 6 |
| **LENDA** | ⚡ | 2500+ | Tier 7 - ELITE |

#### **Rank Card Structure:**

```html
┌─────────────────────────────┐
│ 🥉  [Ícone]      [BRONZE]   │ ← Header (background escuro)
├─────────────────────────────┤
│                             │
│  BRONZE I                   │ ← Nome (2xl, branco)
│  0 - 299 MMR               │ ← Range (lg, laranja, glow)
│                             │
│  Iniciante no campo de     │ ← Descrição (sm, cinza)
│  batalha. Complete suas... │
│                             │
├─────────────────────────────┤
│      Tier 1                 │ ← Footer (background preto)
└─────────────────────────────┘
```

**Visual:**
- Background: rgba(10, 10, 10, 0.8)
- Borda: 2px #2A2A2A
- Border-radius: xl
- Top border colorido (3px):
  * Bronze: #CD7F32
  * Silver: #C0C0C0
  * Gold: #FFD700
  * Platinum: #E5E4E2
  * Diamond: #B9F2FF
  * Master: #FFD700
  * Legend: #FF6600

**Hover:**
- Lift: translateY(-5px)
- Border: #3A3A3A (mais clara)
- Shadow: 30px blur preto
- Top border: opacity 1 (mais visível)

---

### 4️⃣ **Dicas e Estratégias** (6 Cards)

Grid de dicas táticas para ajudar jogadores a evoluir.

#### **Tips Disponíveis:**

**1. 🎯 Foque em Objetivos**
- Capture pontos estrategicamente
- Domination e Hardpoint > kills

**2. 🔫 Domine Seu Loadout**
- Armas meta: AN-94, MSMC, DSR-50
- Perks: Hardline, Toughness

**3. 🗺️ Conheça os Mapas**
- Spawn points
- Rotas de flank
- Power positions

**4. 👥 Jogue em Equipe**
- Comunicação
- Coordene streaks
- Trabalho em equipe

**5. 📊 Analise Seus Erros**
- Revise partidas perdidas
- Identifique padrões
- Ajuste posicionamento

**6. ⏱️ Consistência > Grind**
- Qualidade sobre quantidade
- 3 partidas focado > 10 cansado

#### **Tip Card Design:**

```css
Background: rgba(10, 10, 10, 0.6)
Border: 2px #2A2A2A
Padding: 24px
Border-radius: lg

Hover:
- Lift: -3px
- Border: rgba(255, 102, 0, 0.3)
- Shadow: 25px blur laranja
```

**Estrutura:**
- Ícone: 4xl, drop-shadow laranja
- Título: xl, Orbitron, bold, uppercase, branco
- Descrição: sm, cinza, line-height 1.6

---

### 5️⃣ **Call to Action Final**

CTA grande e chamativo para ação do usuário.

**Elementos:**
- Ícone: ⚔️ (6rem, pulsando, glow laranja)
- Título: "PRONTO PARA A BATALHA?" (5xl, dourado)
- Descrição: Texto motivacional (xl, cinza claro)
- 2 Botões:
  1. **REGISTRAR BATALHA** (primário, laranja, `showPage('play')`)
  2. **VER MEU PERFIL** (secundário, outline, `showPage('profile')`)

**Design:**
- Background: Gradiente escuro
- Borda: 2px laranja (#FF6600)
- Box-shadow: 40px blur laranja
- Radial glow background (animado)
- Padding: 64px

**Botões:**

Primary:
```css
background: linear-gradient(135deg, #FF6600, #FF4500)
padding: 20px 32px
font-size: 1.25rem
box-shadow: 30px blur laranja

Hover:
- Lift: -3px
- Scale: 1.05
- Shadow: 40px blur (mais intenso)
```

Secondary:
```css
background: transparent
border: 2px solid #FF6600
color: #FF6600

Hover:
- Background: rgba(255, 102, 0, 0.1)
- Lift: -3px
- Shadow: 30px blur laranja
```

---

## 🎨 Paleta de Cores por Rank

### Background Global
```css
Ultra Dark:    #0A0A0A
Dark:          #1A1A1A
Border Dark:   #2A2A2A
Border Medium: #3A3A3A
```

### Rank Colors
```css
Bronze:   #CD7F32
Silver:   #C0C0C0
Gold:     #FFD700
Platinum: #E5E4E2
Diamond:  #B9F2FF
Master:   #FFD700
Legend:   #FF6600
```

### Accent Colors
```css
Orange:      #FF6600
Red-Orange:  #FF4500
Gold:        #FFD700
White:       #FFFFFF
Gray Light:  #CCCCCC
Gray Medium: #999999
Gray Dark:   #666666
```

---

## ⚡ Animações

### 1. Scanline (Hero Banner)
```css
@keyframes scanline {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
Duration: 3s linear infinite
```

### 2. Pulse (Icons, Arrows)
```css
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
Duration: 2s ease-in-out infinite
```

### 3. Progress Shine
```css
@keyframes progressShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
Duration: 2s linear infinite
```

### 4. CTA Glow
```css
@keyframes ctaGlow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
}
Duration: 4s ease-in-out infinite
```

---

## 📱 Responsive Design

### Desktop (>768px)
- Ranks grid: Auto-fit, min 320px
- Tips grid: Auto-fit, min 300px
- Current rank display: Horizontal (flex-row)
- Buttons: Side by side

### Mobile (≤768px)
```css
Hero title:
- Highlight: 2xl (reduzido)
- Main: 3xl (reduzido)

Current rank display:
- Flex-direction: column
- Arrow rotates 90°
- Full width cards

Rank icon: 6rem → 4rem
Rank name: 5xl → 4xl

Grids: 1 column

Buttons: 
- Flex-direction: column
- Width: 100%
- Justify: center
```

---

## 🔧 Integração JavaScript

### Funções Necessárias:

```javascript
// Atualizar progresso do jogador (se logado)
function updatePlayerRankProgress() {
    const player = getCurrentPlayer();
    if (!player) {
        document.getElementById('playerRankProgress').style.display = 'none';
        return;
    }
    
    document.getElementById('playerRankProgress').style.display = 'block';
    
    // Rank atual
    const currentRank = getRankByMMR(player.mmr);
    document.getElementById('currentRankIcon').textContent = currentRank.icon;
    document.getElementById('currentRankName').textContent = currentRank.name;
    document.getElementById('currentMMRValue').textContent = player.mmr;
    
    // Próximo rank
    const nextRank = getNextRank(player.mmr);
    if (nextRank) {
        document.getElementById('nextRankIcon').textContent = nextRank.icon;
        document.getElementById('nextRankName').textContent = nextRank.name;
        
        // Progresso
        const mmrNeeded = nextRank.minMMR - player.mmr;
        document.getElementById('mmrNeededValue').textContent = mmrNeeded;
        
        const percentage = ((player.mmr - currentRank.minMMR) / (nextRank.minMMR - currentRank.minMMR)) * 100;
        document.getElementById('progressBarFillLarge').style.width = percentage + '%';
        document.getElementById('progressPercentageDisplay').textContent = Math.round(percentage) + '%';
        
        document.getElementById('progressCurrentMMR').textContent = currentRank.minMMR + ' MMR';
        document.getElementById('progressTargetMMR').textContent = nextRank.minMMR + ' MMR';
    }
}

// Chamar ao carregar página
window.addEventListener('load', updatePlayerRankProgress);
```

---

## 📊 Estrutura de Ranks (JavaScript)

```javascript
const RANKS = [
    { name: 'BRONZE I', icon: '🥉', minMMR: 0, maxMMR: 299, tier: 1, color: '#CD7F32' },
    { name: 'BRONZE II', icon: '🥉', minMMR: 300, maxMMR: 499, tier: 1, color: '#CD7F32' },
    { name: 'PRATA I', icon: '🥈', minMMR: 500, maxMMR: 799, tier: 2, color: '#C0C0C0' },
    { name: 'PRATA II', icon: '🥈', minMMR: 800, maxMMR: 1099, tier: 2, color: '#C0C0C0' },
    { name: 'OURO I', icon: '🥇', minMMR: 1100, maxMMR: 1499, tier: 3, color: '#FFD700' },
    { name: 'OURO II', icon: '🥇', minMMR: 1500, maxMMR: 1799, tier: 3, color: '#FFD700' },
    { name: 'PLATINA', icon: '💠', minMMR: 1800, maxMMR: 2099, tier: 4, color: '#E5E4E2' },
    { name: 'DIAMANTE', icon: '💎', minMMR: 2100, maxMMR: 2399, tier: 5, color: '#B9F2FF' },
    { name: 'MESTRE', icon: '👑', minMMR: 2400, maxMMR: 2499, tier: 6, color: '#FFD700' },
    { name: 'LENDA', icon: '⚡', minMMR: 2500, maxMMR: Infinity, tier: 7, color: '#FF6600' }
];
```

---

## 🚀 Como Testar

1. **Navegue** para a página de Ranks (navbar: 🎖️ RANKS)
2. **Observe** o hero banner com scanline animado
3. **Se logado**:
   - Veja seu rank atual com ícone pulsante
   - Confira o próximo rank
   - Observe a barra de progresso animada
4. **Scroll** pela tabela de 10 ranks
5. **Passe o mouse** sobre os rank cards → elevação e brilho
6. **Leia** as 6 dicas estratégicas
7. **Hover** nos tip cards → border laranja
8. **Click** no CTA "REGISTRAR BATALHA" → vai para página de jogo
9. **Teste mobile**:
   - Arrow rotaciona 90°
   - Cards empilham verticalmente
   - Botões em coluna

---

## 📝 Arquivos Modificados

### `index.html`
- Adicionado link no navbar: "🎖️ RANKS"
- Nova página completa: `<div id="ranks" class="page">`
- 5 seções principais
- ~500 linhas de HTML

### `css/styles.css`
- Seção completa: "RANKS PAGE - BO2 THEMED"
- ~700 linhas de CSS
- 13 componentes estilizados
- Responsivo completo

---

## ✅ Checklist de Qualidade

- [x] Design BO2 autêntico (cores, fontes, efeitos)
- [x] Hierarquia visual clara
- [x] Todas as 10 patentes documentadas
- [x] Descrições temáticas e motivacionais
- [x] Progresso do jogador interativo
- [x] 6 dicas estratégicas relevantes
- [x] CTA destacado e funcional
- [x] Animações suaves (scanline, pulse, shine)
- [x] Responsive design (desktop + mobile)
- [x] Hover effects em todos os cards
- [x] Navegação integrada (navbar)
- [x] Sem erros de compilação

---

## 🎯 Objetivos Alcançados

✅ **Banner chamativo** com título duplo e scanline  
✅ **Tabela completa** com 10 ranks coloridos  
✅ **Progresso visual** com barra animada tripla  
✅ **Dicas temáticas** com recomendações BO2  
✅ **Call to Action** poderoso com 2 botões  
✅ **Design consistente** com paleta BO2  
✅ **Responsive** para todos os dispositivos  
✅ **Integração** com navegação existente  

**Página completa e pronta para uso!** 🎖️⚡
