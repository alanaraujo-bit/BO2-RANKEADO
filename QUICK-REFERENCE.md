# ⚡ QUICK REFERENCE - BO2 DESIGN SYSTEM

Referência rápida para desenvolvimento. Para detalhes, veja [STYLE-GUIDE.md](STYLE-GUIDE.md)

---

## 🎨 CORES PRINCIPAIS

```css
--primary-orange: #FF7A00        /* Principal */
--neon-blue: #00D9FF             /* Acento */
--dark-bg: #0A0A0A               /* Background */
--card-bg: rgba(20,20,20,0.85)  /* Cards */
--text-primary: #FFFFFF          /* Texto */
```

---

## 📝 FONTES

```css
font-family: 'Orbitron', sans-serif;   /* Títulos */
font-family: 'Rajdhana', sans-serif;   /* Corpo */
```

---

## 🔧 UTILITIES

### Spacing
```html
.mt-sm .mt-md .mt-lg    <!-- margin-top -->
.mb-sm .mb-md .mb-lg    <!-- margin-bottom -->
.pt-sm .pt-md .pt-lg    <!-- padding-top -->
.pb-sm .pb-md .pb-lg    <!-- padding-bottom -->
```

### Text
```html
.text-center            <!-- Centralizar -->
.text-uppercase         <!-- Maiúsculas -->
.text-orange            <!-- Cor laranja -->
.text-muted             <!-- Cor cinza -->
```

### Layout
```html
.flex                   <!-- Display flex -->
.flex-center            <!-- Centralizar -->
.flex-between           <!-- Space between -->
.grid                   <!-- Display grid -->
.grid-2 .grid-3 .grid-4 <!-- Grid columns -->
```

---

## 🃏 COMPONENTES

### Card
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Título</h3>
    </div>
    <div class="card-body">
        Conteúdo
    </div>
</div>
```

### Botão
```html
<button class="btn">Padrão</button>
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-outline">Outline</button>
```

### Badge
```html
<span class="badge">Badge</span>
<span class="badge badge-success">Sucesso</span>
<span class="badge badge-error">Erro</span>
```

### Progress Bar
```html
<div class="progress-bar">
    <div class="progress-fill" style="width: 65%;"></div>
</div>
```

### Rank Badge
```html
<div class="rank-badge rank-gold">🥇 OURO II</div>
```

---

## ✨ ANIMAÇÕES

```css
/* Transições */
transition: all 0.2s ease;      /* Rápido */
transition: all 0.3s ease;      /* Normal */
transition: all 0.5s ease;      /* Lento */

/* Keyframes disponíveis */
animation: glow-pulse 2s ease-in-out infinite;
animation: shine 3s linear infinite;
animation: pulse 2s infinite;
animation: spin 1s linear infinite;
```

---

## 📱 BREAKPOINTS

```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1200px) { }

/* Desktop */
@media (min-width: 1200px) { }
```

---

## 🎯 CLASSES DE RANK

```html
.rank-bronze
.rank-silver
.rank-gold
.rank-platinum
.rank-diamond
.rank-master
.rank-legend
```

---

## 📦 VARIÁVEIS CSS COMPLETAS

```css
/* Cores */
--primary-orange: #FF7A00;
--primary-orange-dark: #CC6200;
--primary-orange-light: #FF9933;
--neon-blue: #00D9FF;
--dark-bg: #0A0A0A;
--success: #00FF41;
--error: #FF0033;
--warning: #FFAA00;

/* Spacing */
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;
--spacing-xl: 3rem;

/* Transitions */
--transition-fast: 0.2s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;

/* Effects */
--glow-orange: 0 0 20px rgba(255, 122, 0, 0.6);
--shadow-card: 0 8px 24px rgba(0, 0, 0, 0.6);
--border-metallic: 1px solid rgba(255, 122, 0, 0.3);
```

---

## 🚀 PERFORMANCE

**✅ USE:**
```css
transform: translateY(-5px);    /* GPU */
opacity: 0.5;                   /* GPU */
```

**❌ EVITE:**
```css
top: -5px;                      /* CPU - Reflow */
width: 100%;                    /* CPU - Repaint */
```

---

## ♿ ACESSIBILIDADE

```css
/* Focus obrigatório */
:focus-visible {
    outline: 2px solid var(--primary-orange);
    outline-offset: 2px;
}

/* Screen reader only */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
}
```

---

## 📋 CHECKLIST NOVO COMPONENTE

- [ ] Usa variáveis CSS
- [ ] Tem hover state
- [ ] Tem focus state
- [ ] É responsivo
- [ ] Funciona com teclado
- [ ] Tem contraste adequado
- [ ] Animação smooth
- [ ] Sem layout shift

---

## 🔗 LINKS ÚTEIS

- **[Design System Completo](DESIGN-SYSTEM.md)**
- **[Guia de Estilo](STYLE-GUIDE.md)**
- **[Changelog](CHANGELOG.md)**
- **[README](README.md)**

---

**Desenvolvido com 💜 para a comunidade BO2 Plutonium**
