# 🎨 GUIA DE ESTILO - BO2 RANKED SYSTEM

## Para Desenvolvedores e Designers

Este guia ajuda a manter a consistência visual do projeto ao adicionar novos componentes.

---

## 🎯 FILOSOFIA DO DESIGN

**Inspiração:** Call of Duty: Black Ops 2
**Estilo:** Futurista militar, dark theme, high contrast
**Público:** Jogadores competitivos de BO2 no Plutonium

---

## 🎨 CORES - USO CORRETO

### Quando usar cada cor:

#### 🟠 Laranja Principal (`#FF7A00`)
✅ Usar para:
- Elementos principais de ação (botões primários)
- Títulos importantes
- Highlights e destaques
- Borders de elementos ativos
- Glow effects principais

❌ Evitar:
- Texto longo (cansa a vista)
- Backgrounds grandes
- Mais de 30% da tela

#### 🔵 Azul Neon (`#00D9FF`)
✅ Usar para:
- Informações secundárias
- Links e navegação
- Accents complementares
- Alternativa ao laranja

❌ Evitar:
- Competir com laranja no mesmo elemento
- Uso em alerts de erro

#### ⚫ Backgrounds Escuros
✅ Usar para:
- Background principal: `#0A0A0A`
- Cards e modais: `rgba(20, 20, 20, 0.85)`
- Overlays: `rgba(10, 10, 10, 0.95)`

### Status Colors:

```css
/* Sucesso - Verde neon */
--success: #00FF41;  /* Vitória, confirmações */

/* Erro - Vermelho neon */
--error: #FF0033;    /* Erros, derrotas */

/* Warning - Amarelo */
--warning: #FFAA00;  /* Avisos, pendências */

/* Info - Azul */
--info: #00D9FF;     /* Informações gerais */
```

---

## 📝 TIPOGRAFIA - REGRAS

### Fonte Orbitron (Display)
```css
font-family: 'Orbitron', sans-serif;
```

**Usar em:**
- Títulos (H1-H4)
- Números importantes (MMR, K/D)
- Labels de formulários
- Botões
- Navigation links
- Badges e tags

**Pesos disponíveis:** 400, 500, 600, 700, 800, 900

**Configurações recomendadas:**
```css
text-transform: uppercase;
letter-spacing: 0.1em;
font-weight: 700; /* ou maior */
```

### Fonte Rajdhana (Body)
```css
font-family: 'Rajdhana', sans-serif;
```

**Usar em:**
- Parágrafos
- Descrições
- Textos longos
- Inputs de formulário
- Mensagens

**Pesos disponíveis:** 300, 400, 500, 600, 700

**Configurações recomendadas:**
```css
font-weight: 400; /* ou 500 para destaque */
line-height: 1.6;
```

### Tamanhos de Fonte

```css
/* Mobile first */
:root { font-size: 12px; }

/* Tablet */
@media (min-width: 768px) {
    :root { font-size: 14px; }
}

/* Desktop */
@media (min-width: 1200px) {
    :root { font-size: 16px; }
}
```

**Escala:**
- H1: `clamp(2rem, 5vw, 3.5rem)`
- H2: `clamp(1.5rem, 4vw, 2.5rem)`
- H3: `clamp(1.25rem, 3vw, 1.75rem)`
- Body: `1.125rem`

---

## 🃏 COMPONENTES - PADRÕES

### Cards

**Estrutura básica:**
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Título</h3>
    </div>
    <div class="card-body">
        <!-- Conteúdo -->
    </div>
</div>
```

**Variações:**
- `.card` - Padrão com transparência
- `.card:hover` - Automático com glow

**CSS obrigatório:**
```css
background: var(--card-bg);
backdrop-filter: blur(10px);
border: var(--border-metallic);
border-radius: 12px;
padding: var(--spacing-lg);
```

### Botões

**Classes disponíveis:**
```html
<button class="btn">Padrão</button>
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-outline">Outline</button>
<button class="btn btn-small">Pequeno</button>
<button class="btn btn-large">Grande</button>
<button class="btn" disabled>Disabled</button>
```

**Regras:**
- Sempre use Orbitron
- Sempre uppercase
- Letter-spacing 0.1em
- Mínimo 2px de border

### Progress Bars

**Estrutura:**
```html
<div class="progress-bar">
    <div class="progress-fill" style="width: 65%;"></div>
</div>
```

**OU com HUD bar:**
```html
<div class="hud-bar" style="--progress: 65%;"></div>
```

### Badges

```html
<span class="badge">Default</span>
<span class="badge badge-success">Sucesso</span>
<span class="badge badge-error">Erro</span>
<span class="badge badge-warning">Aviso</span>
<span class="badge badge-info">Info</span>
```

### Ranks

```html
<div class="rank-badge rank-gold">
    🥇 OURO II
</div>
```

**Classes disponíveis:**
- `.rank-bronze`
- `.rank-silver`
- `.rank-gold`
- `.rank-platinum`
- `.rank-diamond`
- `.rank-master`
- `.rank-legend`

---

## ✨ ANIMAÇÕES - BOAS PRÁTICAS

### Performance

**✅ Use GPU acceleration:**
```css
transform: translateY(-5px);  /* BOM */
opacity: 0;                   /* BOM */
```

**❌ Evite:**
```css
top: -5px;        /* MAU - reflow */
width: 100%;      /* MAU - repaint */
margin-top: -5px; /* MAU - reflow */
```

### Timing

**Transições:**
```css
/* Rápido - hovers simples */
transition: all 0.2s ease;

/* Normal - mudanças de estado */
transition: all 0.3s ease;

/* Lento - animações complexas */
transition: all 0.5s ease;
```

**Animações:**
```css
/* Subtil */
animation: pulse 2s ease-in-out infinite;

/* Moderada */
animation: shine 3s linear infinite;

/* Lenta */
animation: particles 20s ease-in-out infinite;
```

### Easing Functions

```css
/* Padrão */
ease

/* Entrada suave */
ease-in

/* Saída suave */
ease-out

/* Mais natural */
ease-in-out

/* Custom (avançado) */
cubic-bezier(0.4, 0.0, 0.2, 1)
```

---

## 📐 SPACING - SISTEMA

Use as variáveis de spacing:

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
```

**Utilities classes:**
```css
.mt-sm  /* margin-top: 1rem */
.mb-md  /* margin-bottom: 1.5rem */
.pt-lg  /* padding-top: 2rem */
.gap-sm /* gap: 1rem (flex/grid) */
```

---

## 🎭 EFEITOS - QUANDO USAR

### Glow Effect
✅ Usar em:
- Elementos importantes
- Hovers de botões
- Ranks ativos
- Logo principal

❌ Evitar:
- Texto corrido
- Mais de 3 glows na mesma tela

### Backdrop Filter Blur
✅ Usar em:
- Cards
- Modais
- Navigation bar
- Dropdowns

❌ Evitar:
- Em Safari antigo (fallback necessário)
- Elementos muito pequenos

### Scan Lines
✅ Usar em:
- Cards grandes
- Hero sections
- Elementos decorativos

❌ Evitar:
- Botões pequenos
- Elementos de texto

---

## 📱 RESPONSIVIDADE

### Breakpoints

```css
/* Mobile first */
@media (max-width: 768px) {
    /* Mobile styles */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1200px) {
    /* Tablet styles */
}

/* Desktop */
@media (min-width: 1200px) {
    /* Desktop styles */
}
```

### Mobile Considerations

**Sempre:**
- Touch targets mínimo 44x44px
- Font-size legível (min 12px)
- Scroll suave
- Botões full-width se necessário

**Evitar:**
- Hover effects complexos
- Animações pesadas
- Modais muito grandes

---

## ♿ ACESSIBILIDADE

### Checklist

- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande)
- [ ] Focus visible em todos elementos interativos
- [ ] Labels em todos inputs
- [ ] Alt text em imagens
- [ ] Navegação por teclado funcional
- [ ] Screen reader friendly (aria-labels)

### Focus State

```css
:focus-visible {
    outline: 2px solid var(--primary-orange);
    outline-offset: 2px;
}
```

**Nunca remova outline sem substituir:**
```css
/* ❌ MAU */
:focus { outline: none; }

/* ✅ BOM */
:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-orange);
}
```

---

## 🧪 TESTING

### Checklist de Novo Componente

- [ ] Funciona em Chrome
- [ ] Funciona em Firefox
- [ ] Funciona em Safari
- [ ] Funciona em mobile
- [ ] Hover states funcionam
- [ ] Focus states funcionam
- [ ] Animações são suaves
- [ ] Não causa layout shift
- [ ] Cores têm contraste adequado
- [ ] Funciona com zoom 200%
- [ ] Funciona com teclado
- [ ] Funciona com screen reader

---

## 📦 ESTRUTURA DE ARQUIVO CSS

Organize seu CSS nesta ordem:

1. **Imports** (fonts, etc)
2. **Variables** (:root)
3. **Reset & Base** (*, html, body)
4. **Animations** (@keyframes)
5. **Layout** (containers, grids)
6. **Components** (cards, buttons, etc)
7. **Utilities** (spacing, text, etc)
8. **Responsive** (@media queries)
9. **Print** (@media print)

---

## 🚀 PERFORMANCE TIPS

### CSS Optimization

```css
/* ✅ BOM - Específico */
.card-title { }

/* ❌ MAU - Muito genérico */
div { }
* { }

/* ✅ BOM - Transform + Opacity */
transform: scale(1.05);
opacity: 0;

/* ❌ MAU - Layout thrashing */
width: 100%;
height: auto;
```

### Animation Best Practices

```css
/* ✅ Use will-change para animações complexas */
.complex-animation {
    will-change: transform, opacity;
}

/* Mas remova após a animação */
.complex-animation.finished {
    will-change: auto;
}
```

---

## 🎨 EXEMPLOS DE COMPONENTES NOVOS

### Criando um Novo Card Type

```css
.my-new-card {
    /* Base do card system */
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border: var(--border-metallic);
    border-radius: 12px;
    padding: var(--spacing-lg);
    
    /* Customizações específicas */
    border-color: var(--neon-blue); /* Diferente */
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
    
    /* Transição */
    transition: all var(--transition-normal);
}

.my-new-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 30px rgba(0, 217, 255, 0.6);
}
```

### Criando um Novo Botão Style

```css
.btn-custom {
    /* Herda do btn base */
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: 6px;
    
    /* Estilo único */
    background: linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%);
    border: 2px solid #8A2BE2;
    color: var(--text-primary);
    box-shadow: 0 0 20px rgba(138, 43, 226, 0.6);
    
    transition: all var(--transition-fast);
}

.btn-custom:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 0 30px rgba(138, 43, 226, 0.8);
}
```

---

## 📚 RECURSOS

### Ferramentas Úteis

- **Colors:** [Coolors.co](https://coolors.co)
- **Gradients:** [CSS Gradient](https://cssgradient.io)
- **Animations:** [Animista](https://animista.net)
- **Shadows:** [Box-shadows.dev](https://box-shadows.dev)
- **Contrast:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Documentação

- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Can I Use](https://caniuse.com)
- [CSS Tricks](https://css-tricks.com)

---

## ✅ COMMIT GUIDELINES

Ao fazer commit de mudanças CSS:

```bash
# Para novos componentes
git commit -m "feat(ui): add new card component"

# Para melhorias visuais
git commit -m "style: improve button hover effects"

# Para correções
git commit -m "fix(ui): correct modal backdrop filter on Safari"

# Para performance
git commit -m "perf(css): optimize animation GPU usage"
```

---

**Mantenha a consistência! Quando em dúvida, siga os padrões existentes.** 🎯
