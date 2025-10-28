# 👥 FRIENDS PAGE - README

## 🎯 Visão Geral

A **Friends Page** do BO2 Ranked System é uma interface moderna e funcional para gerenciar amizades, visualizar status de jogadores, e interagir com a comunidade.

---

## ✨ Características Principais

### 🔍 Busca Inteligente
- Busca em tempo real com debounce (300ms)
- Dropdown estilizado com resultados
- Mostra avatar, rank e MMR do jogador
- Botões de ação diretos (Adicionar/Remover)

### 🎛️ Filtros Rápidos
- **TODOS**: Exibe todos os amigos
- **🟢 ONLINE**: Apenas jogadores online
- **🎮 JOGANDO**: Jogadores em partida ativa
- **⚫ OFFLINE**: Jogadores desconectados

### 👥 Cards de Amigos
- Avatar circular (100px) com border temática
- Badge de rank sobreposto
- Status em tempo real (online/jogando/offline)
- Estatísticas inline (partidas, winrate, MMR)
- Botões de ação contextual

### 📬 Solicitações Pendentes
- Seção separada para requests
- Botões Aceitar/Rejeitar
- Timestamp relativo
- Notificação no navbar

### 🏆 Ranking Entre Amigos
- Lista ordenada por MMR
- Top 3 destacado (ouro, prata, bronze)
- Hover effects interativos

### 📰 Feed de Atividades
- Últimas atividades dos amigos
- Timestamps relativos
- Ícones contextuais

### 💡 Sugestões de Amizade
- Baseado em MMR similar
- Algoritmo de proximidade
- Limite de 6 sugestões

---

## 🎨 Design

### Paleta de Cores
- **Fundo:** #0A0A0A / #141414
- **Cards:** Gradient #1A1A1A → #141414
- **Primário:** #FF7A00 (Laranja)
- **Secundário:** #00D9FF (Azul Neon)
- **Sucesso:** #00FF88 (Verde)
- **Texto:** #F5F5F5 / #9B9B9B

### Tipografia
- **Títulos:** Orbitron (700-900)
- **Corpo:** Inter (400-700)
- **Monospace:** Courier New

### Animações
- **pulse-glow**: Avatar online (2s loop)
- **pulse-status**: Badge "em partida" (2s loop)
- **glow-pulse**: Botão convidar (2s loop)
- **Transitions**: 0.2-0.3s ease

---

## 📂 Estrutura de Arquivos

```
BO2-RANKED/
├── index.html                     # HTML da Friends Page (linha 852-905)
├── css/
│   └── styles.css                 # Estilos da Friends Page (~750 linhas)
├── js/
│   └── friends.js                 # Lógica e funcionalidades
└── docs/
    ├── FRIENDS-PAGE-IMPROVEMENTS.md      # Documentação detalhada
    ├── FRIENDS-PAGE-VISUAL-GUIDE.md      # Guia visual
    ├── FRIENDS-PAGE-SUMMARY.md           # Resumo executivo
    └── FRIENDS-PAGE-CUSTOMIZATION.md     # Guia de customização
```

---

## 🚀 Como Usar

### Para Usuários

#### Adicionar Amigo
1. Digite o nome na barra de busca
2. Clique em **➕ ADICIONAR** no resultado
3. Aguarde a pessoa aceitar

#### Aceitar Solicitação
1. Veja a notificação no sino (🔔)
2. Vá para a página **👥 AMIGOS**
3. Clique em **✅ ACEITAR** na solicitação

#### Filtrar Amigos
1. Use os botões de filtro no topo da lista
2. Clique em **🟢 ONLINE** para ver apenas online
3. Clique em **TODOS** para ver todos novamente

#### Ver Perfil
1. Clique no card do amigo
2. Ou clique no botão **👁️ VER PERFIL**

#### Convidar para Jogar
1. Amigo deve estar **🟢 ONLINE**
2. Clique em **🎮 CONVIDAR**

---

### Para Desenvolvedores

#### Instalar
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bo2-ranked.git

# Abra o index.html no navegador
# ou use um servidor local
python -m http.server 8000
```

#### Estrutura HTML
```html
<div id="friends" class="page">
    <div class="section">
        <!-- Barra de busca -->
        <div class="friends-search">...</div>
        
        <!-- Solicitações pendentes -->
        <div class="friends-section" id="friendRequestsSection">...</div>
        
        <!-- Lista de amigos -->
        <div class="friends-section">
            <div class="subsection-header">...</div>
            <div id="friendsList" class="friends-grid">...</div>
        </div>
        
        <!-- Ranking -->
        <div class="friends-section">...</div>
        
        <!-- Atividades -->
        <div class="friends-section">...</div>
        
        <!-- Sugestões -->
        <div class="friends-section">...</div>
    </div>
</div>
```

#### Inicialização JavaScript
```javascript
// No main.js ou similar
if (currentUser) {
    friendsSystem.init();
}
```

#### API Principal (friends.js)
```javascript
// Inicializar sistema
await friendsSystem.init();

// Buscar jogadores
await friendsSystem.searchPlayers(query);

// Enviar solicitação
await friendsSystem.sendFriendRequest(username);

// Aceitar solicitação
await friendsSystem.acceptFriendRequest(username);

// Rejeitar solicitação
await friendsSystem.rejectFriendRequest(username);

// Remover amigo
await friendsSystem.removeFriend(username);

// Filtrar amigos
await friendsSystem.filterFriends('online');

// Abrir perfil
await friendsSystem.openPlayerProfile(username);
```

---

## 📱 Responsividade

### Desktop (>768px)
- Grid: auto-fill minmax(320px, 1fr)
- Avatar: 100px
- Max-width: 1400px
- Gap: 24px

### Mobile (≤768px)
- Grid: 1 coluna
- Avatar: 80px
- Padding: 20px
- Filtros: full-width

### Small Mobile (≤480px)
- Fontes reduzidas
- Botões compactos
- Espaçamento otimizado

---

## 🎨 Customização

### Mudar Cor Principal
```css
/* css/styles.css */
:root {
    --primary-500: #FF7A00;  /* Mude para sua cor */
}
```

### Mudar Tamanho do Avatar
```css
.friend-avatar-container {
    width: 100px;   /* Ajuste aqui */
    height: 100px;
}
```

### Desativar Animações
```css
/* Comente as linhas de animation */
.avatar-glow.glow-online {
    /* animation: pulse-glow 2s ease-in-out infinite; */
}
```

**📖 Veja mais em:** `FRIENDS-PAGE-CUSTOMIZATION.md`

---

## 🐛 Solução de Problemas

### Cards não aparecem
1. Abra o console (F12)
2. Verifique se há erros JavaScript
3. Confirme que `friends.js` está carregado
4. Verifique se `friendsSystem.init()` foi chamado

### Filtros não funcionam
1. Verifique o `onclick` dos botões
2. Confirme que a função existe: `friendsSystem.filterFriends()`
3. Veja o console por erros

### Estilos não aplicam
1. Limpe o cache (Ctrl+Shift+R)
2. Verifique se `styles.css` está linkado
3. Confirme que não há erros de sintaxe CSS

### Performance lenta
1. Reduza número de amigos exibidos
2. Aumente o debounce da busca (300ms → 500ms)
3. Desative animações pesadas

---

## 📊 Estatísticas

- **Linhas de CSS:** ~750
- **Linhas de JavaScript:** ~900
- **Componentes:** 8 principais
- **Animações:** 3 keyframes
- **Breakpoints:** 3 (desktop, tablet, mobile)
- **Estados:** 7 empty states

---

## 🔄 Atualizações Futuras

### Planejado
- [ ] Chat em tempo real
- [ ] Notificações push
- [ ] Sistema de favoritos
- [ ] Grupos/Clãs
- [ ] Histórico de partidas juntos

### Em Consideração
- [ ] Dark/Light mode toggle
- [ ] Avatares customizados
- [ ] Badges especiais
- [ ] Skeleton loading
- [ ] Virtual scrolling

---

## 📚 Documentação Completa

1. **FRIENDS-PAGE-IMPROVEMENTS.md** - Detalhes técnicos completos
2. **FRIENDS-PAGE-VISUAL-GUIDE.md** - Referência visual (cores, tamanhos, etc)
3. **FRIENDS-PAGE-SUMMARY.md** - Resumo executivo das mudanças
4. **FRIENDS-PAGE-CUSTOMIZATION.md** - Guia passo a passo de customização

---

## 🤝 Contribuindo

### Reportar Bug
1. Abra uma issue no GitHub
2. Descreva o problema
3. Inclua prints e console logs
4. Informe navegador e versão

### Sugerir Feature
1. Abra uma issue com tag `enhancement`
2. Descreva a funcionalidade desejada
3. Explique o caso de uso

### Pull Request
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📜 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 👨‍💻 Autor

Desenvolvido para a comunidade **BO2 Plutonium** com ❤️

---

## 🔗 Links Úteis

- [Plutonium Forum](https://forum.plutonium.pw/)
- [BO2 Wiki](https://callofduty.fandom.com/wiki/Call_of_Duty:_Black_Ops_II)
- [Design System](DESIGN-SYSTEM.md)
- [Quick Start](QUICK-START.md)

---

## ⭐ Agradecimentos

- Comunidade Plutonium
- Jogadores que testaram
- Designers que deram feedback
- Desenvolvedores que contribuíram

---

**🎮 Boas partidas e boas amizades!**

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- **GitHub Issues:** [Criar issue](https://github.com/seu-usuario/bo2-ranked/issues)
- **Discord:** [Servidor da comunidade](#)
- **Email:** seu-email@exemplo.com

---

**Última atualização:** Outubro 2025
**Versão:** 3.0
**Status:** ✅ Estável e pronto para produção
