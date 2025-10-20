# 🎨 FRIENDS PAGE - GUIA DE CUSTOMIZAÇÃO

## 🎯 Como Customizar a Página de Amigos

Este guia mostra como fazer alterações comuns na Friends Page de forma simples e rápida.

---

## 🎨 Customizar Cores

### Mudar Cor Principal (Laranja → Outra Cor)

**Local:** `css/styles.css`

```css
:root {
    /* Mude esta linha */
    --primary-500: #FF7A00;  /* Laranja padrão */
    
    /* Para azul: */
    --primary-500: #0077FF;
    
    /* Para roxo: */
    --primary-500: #8B00FF;
    
    /* Para vermelho: */
    --primary-500: #FF0055;
}
```

### Mudar Cor de Online (Verde → Outra Cor)

```css
:root {
    /* Mude esta linha */
    --success: #00FF88;  /* Verde padrão */
    
    /* Para azul claro: */
    --success: #00D9FF;
    
    /* Para amarelo: */
    --success: #FFD700;
}
```

### Mudar Cor de Fundo dos Cards

```css
.friend-card {
    /* Mude esta linha */
    background: linear-gradient(135deg, var(--neutral-850) 0%, var(--neutral-900) 100%);
    
    /* Para mais escuro: */
    background: linear-gradient(135deg, #0A0A0A 0%, #000000 100%);
    
    /* Para sólido: */
    background: #1A1A1A;
}
```

---

## 📐 Customizar Tamanhos

### Mudar Tamanho do Avatar

**Local:** `css/styles.css` (linha ~2900)

```css
.friend-avatar-container {
    width: 100px;   /* Mude para 120px, 80px, etc */
    height: 100px;  /* Mesmo valor */
}
```

**Também ajuste no mobile:**

```css
@media (max-width: 768px) {
    .friend-avatar-container {
        width: 80px;   /* Ajuste proporcionalmente */
        height: 80px;
    }
}
```

### Mudar Tamanho do Card

```css
.friends-grid {
    /* Mude o minmax para controlar tamanho mínimo */
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    
    /* Para cards maiores: */
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    
    /* Para cards menores: */
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

### Mudar Espaçamento Entre Cards

```css
.friends-grid {
    gap: var(--space-6);  /* 24px padrão */
    
    /* Para mais espaço: */
    gap: 32px;
    
    /* Para menos espaço: */
    gap: 16px;
}
```

---

## 🔤 Customizar Textos

### Mudar Placeholder da Busca

**Local:** `index.html` (linha ~860)

```html
<input 
    type="text" 
    id="playerSearchInput" 
    class="form-input" 
    placeholder="Buscar amigo..."  <!-- Mude aqui -->
>

<!-- Exemplos: -->
placeholder="🔍 Procurar jogador..."
placeholder="Encontrar amigos..."
placeholder="Digite o nome..."
```

### Mudar Textos dos Filtros

**Local:** `index.html` (linha ~875)

```html
<button class="filter-btn-small active" onclick="friendsSystem.filterFriends('all')">
    TODOS  <!-- Mude aqui -->
</button>

<!-- Exemplos: -->
TODOS → EXIBIR TODOS
🟢 ONLINE → DISPONÍVEIS
🎮 JOGANDO → EM PARTIDA
⚫ OFFLINE → DESCONECTADOS
```

### Mudar Textos dos Empty States

**Local:** `index.html` (linha ~885)

```html
<div class="empty-state" id="friendsEmptyState" style="display: none;">
    <div class="empty-state-icon">👥</div>
    <div class="empty-state-text">Você ainda não tem amigos</div>  <!-- Mude aqui -->
    <div class="empty-state-hint">Use a busca acima para encontrar jogadores</div>  <!-- E aqui -->
</div>
```

---

## 🎬 Customizar Animações

### Desativar Animações de Pulse

**Local:** `css/styles.css`

```css
/* Comente ou remova estas linhas */

/* Avatar online - desativar */
.avatar-glow.glow-online {
    opacity: 1;
    /* animation: pulse-glow 2s ease-in-out infinite; */ /* Comentar */
}

/* Badge "Em Partida" - desativar */
.status-badge.status-playing {
    /* animation: pulse-status 2s ease-in-out infinite; */ /* Comentar */
}

/* Botão Convidar - desativar */
.btn-invite-match {
    /* animation: glow-pulse 2s ease-in-out infinite; */ /* Comentar */
}
```

### Mudar Velocidade das Animações

```css
/* Mais rápido (1s ao invés de 2s) */
@keyframes pulse-glow {
    /* ... */
}
animation: pulse-glow 1s ease-in-out infinite;

/* Mais lento (3s) */
animation: pulse-glow 3s ease-in-out infinite;
```

### Desativar Hover Effects

```css
.friend-card:hover {
    /* Comente as linhas abaixo */
    /* border-color: var(--primary-500); */
    /* transform: translateY(-4px); */
    /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); */
}
```

---

## 🔲 Customizar Layout

### Mudar de Grid para Lista Vertical

**Local:** `css/styles.css`

```css
.friends-grid {
    /* Remova estas linhas: */
    /* display: grid; */
    /* grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); */
    /* gap: var(--space-6); */
    
    /* Adicione estas: */
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Também ajuste o card */
.friend-card {
    flex-direction: row;  /* Elementos lado a lado */
    align-items: center;
}
```

### Mudar Número de Colunas (Fixo)

```css
.friends-grid {
    /* Para sempre 3 colunas: */
    grid-template-columns: repeat(3, 1fr);
    
    /* Para sempre 2 colunas: */
    grid-template-columns: repeat(2, 1fr);
    
    /* Para sempre 4 colunas: */
    grid-template-columns: repeat(4, 1fr);
}
```

### Centralizar Cards Quando Poucos

```css
.friends-grid {
    justify-content: center;
    justify-items: center;
}
```

---

## 🎯 Adicionar Novos Filtros

### 1. Adicionar Botão no HTML

**Local:** `index.html` (após linha ~877)

```html
<button class="filter-btn-small" onclick="friendsSystem.filterFriends('favoritos')">
    ⭐ FAVORITOS
</button>
```

### 2. Implementar Lógica no JavaScript

**Local:** `js/friends.js` (função `filterFriends`)

```javascript
async filterFriends(filter) {
    // ... código existente ...
    
    if (filter !== 'all') {
        filteredFriends = [];
        for (const username of this.friends) {
            const userData = await getUserData(username);
            if (!userData) continue;
            
            // Adicione sua lógica aqui
            if (filter === 'favoritos' && userData.favorito) {
                filteredFriends.push(username);
            }
            // ... resto do código ...
        }
    }
    
    // ... resto da função ...
}
```

---

## 🎨 Adicionar Novos Status

### 1. Adicionar Badge no JavaScript

**Local:** `js/friends.js` (função `getStatusBadge`)

```javascript
getStatusBadge(status, lastOnline) {
    const statusConfig = {
        'online': { icon: '🟢', text: 'ONLINE', class: 'status-online' },
        'in-match': { icon: '🎮', text: 'EM PARTIDA', class: 'status-playing' },
        'offline': { icon: '⚫', text: this.getOfflineText(lastOnline), class: 'status-offline' },
        // Adicione o novo status aqui:
        'ausente': { icon: '🟡', text: 'AUSENTE', class: 'status-ausente' }
    };
    
    // ... resto do código ...
}
```

### 2. Estilizar no CSS

**Local:** `css/styles.css`

```css
.status-badge.status-ausente {
    background: rgba(255, 193, 7, 0.15);
    color: #FFC107;
    border: 1px solid rgba(255, 193, 7, 0.3);
}
```

---

## 🔧 Customizações Avançadas

### Mudar Border Radius de Todos os Elementos

```css
/* Mais quadrado (8px ao invés de 12-16px) */
.friend-card { border-radius: 8px; }
.friends-search .form-input { border-radius: 8px; }
.search-results { border-radius: 8px; }
.filter-btn-small { border-radius: 6px; }

/* Mais arredondado (20px) */
.friend-card { border-radius: 20px; }
.friends-search .form-input { border-radius: 20px; }
```

### Adicionar Sombras Mais Fortes

```css
.friend-card {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);  /* Mais forte */
}

.friend-card:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8),
                0 0 60px rgba(255, 122, 0, 0.3);  /* Muito mais forte */
}
```

### Usar Imagem de Fundo nos Cards

```css
.friend-card {
    background-image: url('caminho/para/imagem.png');
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
}
```

### Adicionar Efeito Blur no Hover

```css
.friend-card:hover {
    backdrop-filter: blur(10px);
}
```

---

## 📱 Customizar Breakpoints

### Mudar Ponto de Quebra para Mobile

**Local:** `css/styles.css` (final do arquivo)

```css
/* Padrão: 768px */
@media (max-width: 768px) { ... }

/* Para tablets maiores: */
@media (max-width: 1024px) { ... }

/* Para mobile menor: */
@media (max-width: 640px) { ... }
```

---

## 🎨 Temas Pré-configurados

### Tema Dark Mode Extremo

```css
:root {
    --neutral-950: #000000;
    --neutral-900: #050505;
    --neutral-850: #0A0A0A;
    --primary-500: #FF0055;  /* Rosa neon */
    --accent-500: #00FFFF;   /* Ciano */
}
```

### Tema Military/Green

```css
:root {
    --primary-500: #00FF00;  /* Verde neon */
    --accent-500: #FFFF00;   /* Amarelo */
    --success: #00CC00;      /* Verde escuro */
}
```

### Tema Cyberpunk

```css
:root {
    --primary-500: #FF00FF;  /* Magenta */
    --accent-500: #00FFFF;   /* Ciano */
    --success: #FFFF00;      /* Amarelo */
}
```

---

## 🛠️ Dicas Finais

### 1. Sempre Teste em Mobile
Após qualquer alteração, teste no modo responsivo do navegador (F12 → Toggle Device Toolbar).

### 2. Use Variáveis CSS
Sempre que possível, use as variáveis do `:root` ao invés de valores fixos:
```css
/* ❌ Evite */
color: #FF7A00;

/* ✅ Prefira */
color: var(--primary-500);
```

### 3. Comente Suas Alterações
```css
/* CUSTOM: Avatar maior para melhor visualização */
.friend-avatar-container {
    width: 120px;  /* Alterado de 100px */
    height: 120px;
}
```

### 4. Mantenha Backup
Antes de grandes alterações, copie o arquivo:
```
css/styles.css → css/styles-backup.css
```

### 5. Use Developer Tools
F12 no navegador → aba Elements → edite CSS ao vivo para testar antes de salvar.

---

## 📚 Recursos Úteis

- **Cores:** https://coolors.co/
- **Fontes:** https://fonts.google.com/
- **Ícones:** https://emojipedia.org/
- **Gradientes:** https://cssgradient.io/
- **Sombras:** https://shadows.brumm.af/

---

## 🆘 Problemas Comuns

### Cards não aparecem
✅ Verifique se `friendsSystem.init()` está sendo chamado  
✅ Verifique console do navegador (F12) por erros  
✅ Confirme que `friends.js` está carregado  

### Filtros não funcionam
✅ Verifique se o atributo `onclick` está correto  
✅ Confirme nome da função: `friendsSystem.filterFriends()`  
✅ Veja se há erro no console  

### Estilos não aplicam
✅ Limpe cache do navegador (Ctrl+Shift+R)  
✅ Verifique se `styles.css` está linkado no HTML  
✅ Confirme que não há erros de sintaxe no CSS  

### Animações não funcionam
✅ Verifique se `@keyframes` está definido  
✅ Confirme que `animation` está na classe correta  
✅ Teste em navegador atualizado (animações CSS3)  

---

**🎮 Boa customização!**
