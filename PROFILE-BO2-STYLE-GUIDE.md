# 🎖️ Profile Page - BO2 Style Guide

## 🎯 Quick Reference

### Core Design Principles
1. **Dark Military Aesthetic** - Black backgrounds (#0A0A0A)
2. **Neon Accents** - Orange (#FF6600) and Gold (#FFD700)
3. **Centered Layouts** - Stats and icons centered vertically
4. **Glow Effects** - Drop-shadows and text-shadows everywhere
5. **Scanline Animations** - Horizontal moving gradients

---

## 🎨 Color Palette

### Backgrounds
```css
Ultra Dark:  #0A0A0A
Dark:        #1A1A1A
Medium:      #2A2A2A
Light:       #3A3A3A
```

### Accents
```css
Orange:      #FF6600
Red-Orange:  #FF4500
Gold:        #FFD700
White:       #FFFFFF
```

### Text
```css
Primary:     #FFFFFF
Secondary:   #999999
Tertiary:    #888888
```

### Glows
```css
Orange:      rgba(255, 102, 0, 0.6)
Gold:        rgba(255, 215, 0, 0.6)
Red:         rgba(255, 0, 0, 0.4)
Green:       rgba(0, 255, 0, 0.4)
```

---

## 📐 Layout Patterns

### Stats Card Template
```html
<div class="stat-card stat-highlight">
    <div class="stat-icon">🔫</div>
    <div class="stat-content">
        <div class="stat-value">1337</div>
        <div class="stat-label">TOTAL KILLS</div>
    </div>
</div>
```

### CSS Structure
```css
.stat-card {
    /* Vertical centered layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    /* Dark background */
    background: rgba(10, 10, 10, 0.8);
    border: 2px solid #2A2A2A;
    
    /* Spacing */
    padding: var(--space-6);
}
```

---

## ✨ Animation Recipes

### 1. Scanline (Horizontal Moving Gradient)
```css
.element::before {
    content: '';
    position: absolute;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, 
        transparent,
        #FF6600,
        #FFD700,
        #FF6600,
        transparent
    );
    animation: scanline 3s linear infinite;
}

@keyframes scanline {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
```

### 2. Shine (Diagonal Glow)
```css
.element::before {
    background: linear-gradient(45deg, 
        transparent 30%,
        rgba(255, 215, 0, 0.1) 50%,
        transparent 70%
    );
    animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
    0% { transform: translate(-100%, -100%); }
    100% { transform: translate(100%, 100%); }
}
```

### 3. Pulse (Scale Effect)
```css
.element {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
```

---

## 💎 Glow Effects

### Text Glow
```css
.glowing-text {
    color: #FFFFFF;
    text-shadow: 0 0 20px rgba(255, 102, 0, 0.8);
}
```

### Icon Glow
```css
.glowing-icon {
    filter: drop-shadow(0 0 20px rgba(255, 102, 0, 0.8));
}
```

### Box Glow (Neon Border)
```css
.neon-box {
    border: 3px solid #FF6600;
    box-shadow: 
        0 0 30px rgba(255, 102, 0, 0.4),
        inset 0 0 20px rgba(255, 102, 0, 0.1);
}

.neon-box::before {
    content: '';
    position: absolute;
    inset: -3px;
    background: linear-gradient(45deg, #FF6600, #FFD700, #FF6600);
    filter: blur(10px);
    opacity: 0.5;
    z-index: -1;
}
```

---

## 🎭 Hover Effects

### Card Lift + Glow
```css
.card {
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    border-color: #3A3A3A;
    box-shadow: 0 10px 30px rgba(255, 102, 0, 0.2);
    background: rgba(20, 20, 20, 0.9);
}
```

### Icon Scale + Bright Glow
```css
.card:hover .icon {
    transform: scale(1.1);
    filter: drop-shadow(0 0 25px rgba(255, 102, 0, 1));
}
```

### Top Border Reveal
```css
.card::before {
    content: '';
    position: absolute;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FF6600, transparent);
    opacity: 0;
    transition: opacity 0.3s;
}

.card:hover::before {
    opacity: 1;
}
```

---

## 📊 Progress Bar Recipe

```css
/* Container */
.progress-bar-bg {
    height: 35px;
    background: rgba(10, 10, 10, 0.6);
    border: 2px solid #2A2A2A;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    overflow: hidden;
}

/* Fill */
.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF4500, #FF6600, #FFD700);
    box-shadow: 0 0 20px rgba(255, 102, 0, 0.6);
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

/* Shine effect */
.progress-bar-fill::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, 
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
    );
    animation: progressShine 2s linear infinite;
}

/* Diagonal stripes */
.progress-bar-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.05) 10px,
        rgba(255, 255, 255, 0.05) 20px
    );
}

@keyframes progressShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
```

---

## 🏷️ Typography Scale

### Display Text (Rank Names, Titles)
```css
font-family: 'Orbitron', sans-serif;
font-size: 3rem;
font-weight: 900;
color: #FFD700;
text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
text-transform: uppercase;
letter-spacing: 0.05em;
```

### Stat Values (Large Numbers)
```css
font-family: 'Orbitron', sans-serif;
font-size: 2.25rem;
font-weight: 900;
color: #FFFFFF;
text-shadow: 0 0 10px rgba(255, 102, 0, 0.5);
```

### Labels (Small Text)
```css
font-family: 'Orbitron', sans-serif;
font-size: 0.75rem;
font-weight: 700;
color: #999999;
text-transform: uppercase;
letter-spacing: 0.1em;
```

---

## 📱 Responsive Breakpoints

### Desktop (>768px)
```css
.stats-grid {
    grid-template-columns: repeat(3, 1fr);
}

.stat-icon {
    font-size: 3rem;
}

.stat-value {
    font-size: 2.25rem;
}
```

### Mobile (≤768px)
```css
.stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.stat-card {
    padding: 1rem;
}

.stat-icon {
    font-size: 2.25rem;
}

.stat-value {
    font-size: 1.875rem;
}
```

---

## 🎯 Stat Card Variants

### Wins (Green)
```css
.stat-card.stat-win {
    border-color: rgba(0, 255, 0, 0.2);
}

.stat-card.stat-win::before {
    background: linear-gradient(90deg, transparent, #00FF00, transparent);
}
```

### Losses (Red)
```css
.stat-card.stat-loss {
    border-color: rgba(255, 0, 0, 0.2);
}

.stat-card.stat-loss::before {
    background: linear-gradient(90deg, transparent, #FF0000, transparent);
}
```

### Highlights (Gold)
```css
.stat-card.stat-highlight {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 215, 0, 0.05);
}

.stat-card.stat-highlight::before {
    background: linear-gradient(90deg, transparent, #FFD700, transparent);
}
```

### Special (Cyan)
```css
.stat-card.stat-special {
    border-color: rgba(0, 200, 255, 0.2);
}

.stat-card.stat-special::before {
    background: linear-gradient(90deg, transparent, #00C8FF, transparent);
}
```

---

## ✅ Design Checklist

Ao criar um novo componente BO2-style:

- [ ] Background ultra-dark (#0A0A0A ou rgba(10, 10, 10, 0.8))
- [ ] Borda sutil (#2A2A2A, 2px)
- [ ] Texto em Orbitron, uppercase, espaçado
- [ ] Valores grandes (2xl+) com text-shadow
- [ ] Ícones com drop-shadow
- [ ] Hover com lift (translateY -5px)
- [ ] Animação sutil (pulse, shine, ou scanline)
- [ ] Cores temáticas (Orange #FF6600, Gold #FFD700)
- [ ] Responsive (3col → 2col em mobile)
- [ ] Transição suave (0.3s ease)

---

## 🚀 Common Patterns

### Pattern 1: Neon Card
```css
.neon-card {
    background: rgba(10, 10, 10, 0.8);
    border: 3px solid #FF6600;
    box-shadow: 0 0 30px rgba(255, 102, 0, 0.4);
    padding: 2rem;
    border-radius: 12px;
}
```

### Pattern 2: Glow Text
```css
.glow-text {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}
```

### Pattern 3: Animated Border
```css
.animated-border::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #FF6600, #FFD700);
    border-radius: inherit;
    z-index: -1;
    animation: pulse 2s ease-in-out infinite;
}
```

---

## 📖 Resources

- **Font:** Orbitron (Google Fonts)
- **Icons:** Emojis (future: SVG icons)
- **Animations:** CSS keyframes
- **Colors:** BO2 official palette

---

**Quick Start:** Copy any pattern above and adapt colors/sizes as needed!
