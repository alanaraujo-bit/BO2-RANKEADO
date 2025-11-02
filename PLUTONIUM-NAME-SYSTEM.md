# 🎮 Sistema de Vinculação de Nome do Plutonium - Guia Completo

## 📋 O que foi implementado

Um sistema completo que permite usuários vincularem seu nome do Plutonium ao perfil do site, permitindo que o script Python identifique e registre automaticamente as estatísticas.

---

## 🎯 Como Funciona

### 1️⃣ **Para o Usuário**

#### Após fazer login pela primeira vez:
- ✅ Modal automático aparece pedindo nome do Plutonium
- ⚠️ Aviso destacado: "Digite EXATAMENTE como aparece no jogo"
- 💡 Instruções de onde encontrar o nome
- ✅ Campo obrigatório para continuar

#### Na página de perfil:
- 🎮 Seção destacada mostrando nome atual do Plutonium
- ✏️ Botão para editar o nome a qualquer momento
- ✅ Status visual indicando se está conectado
- ⚠️ Aviso se nome não estiver configurado

### 2️⃣ **Para o Sistema (Backend)**

#### API `/api/update_stats`:
- Busca players pelo campo `plutoniumName` em vez de ID
- Valida se player está cadastrado antes de salvar
- Ignora ações de players não cadastrados
- Logs informativos sobre players não encontrados

#### Eventos processados:
- `match_end`: Atualiza apenas players cadastrados
- `kill`: Salva se killer OU victim cadastrado
- `player_join`: Ignora se não cadastrado
- `player_quit`: Ignora se não cadastrado

### 3️⃣ **Para o Script Python**

O script continua funcionando igual! Ele envia o nome do player do log:
```python
player_name = "SoldierBR_123"  # Capturado do log do Plutonium
```

O backend agora busca no Firestore:
```javascript
players.where('plutoniumName', '==', 'SoldierBR_123')
```

Se encontrar = salva stats ✅  
Se não encontrar = ignora ⚠️

---

## 🗂️ Estrutura de Dados

### Collection: `players`

```javascript
{
  userId: "abc123",
  username: "PlayerWebsite",  // Nome no site
  plutoniumName: "SoldierBR_123",  // Nome no Plutonium BO2
  plutoniumNameUpdatedAt: 1699012345678,
  email: "player@email.com",
  mmr: 1500,
  wins: 10,
  losses: 5,
  // ... outras stats
}
```

---

## 🔧 Arquivos Modificados

### Frontend:
1. **`public/app.html`**
   - ✅ Modal de configuração inicial do nome
   - ✅ Seção na página de perfil para editar nome

2. **`public/js/plutonium-name.js`** (NOVO)
   - ✅ Função para mostrar modal após login
   - ✅ Função para salvar nome inicial
   - ✅ Função para editar nome no perfil
   - ✅ Função para atualizar interface

3. **`public/js/data-firebase.js`**
   - ✅ Chama verificação após login
   - ✅ Mostra modal se nome não configurado

4. **`public/js/profile.js`**
   - ✅ Atualiza seção do nome do Plutonium

### Backend:
1. **`pages/api/update_stats.js`**
   - ✅ Busca por `plutoniumName` em vez de ID
   - ✅ Validação em `match_end`
   - ✅ Validação em `kill`
   - ✅ Validação em `player_join`
   - ✅ Validação em `player_quit`

### Documentação:
1. **`FIRESTORE-INDEXES.md`** (NOVO)
   - ✅ Guia para criar índices necessários
   - ✅ Performance esperada
   - ✅ Instruções passo a passo

---

## 🚀 Como Testar

### 1. **Criar Índice no Firestore** (OBRIGATÓRIO!)

Acesse: https://console.firebase.google.com/project/rankops-8d2ea/firestore/indexes

**Criar Single Field Index:**
- Collection: `players`
- Field: `plutoniumName`
- Order: Ascending
- Query scope: Collection

⏱️ **Aguarde 2-5 minutos** para o índice ser construído.

### 2. **Testar no Site**

1. **Faça logout** (se estiver logado)
2. **Faça login** com Google
3. ✅ Modal deve aparecer pedindo nome do Plutonium
4. **Digite seu nome exato** do Plutonium (ex: `SoldierBR_123`)
5. **Clique em "Confirmar"**
6. ✅ Modal fecha
7. **Vá para página de Perfil**
8. ✅ Seção "Nome do Plutonium" mostra seu nome
9. **Clique em "Editar"**
10. ✅ Pode alterar o nome

### 3. **Testar com o Script Python**

1. **Inicie o monitor:** `py backend_py\bo2_log_uploader.py`
2. **Entre no servidor** do Plutonium com o nome configurado
3. ✅ Script envia eventos para API
4. ✅ Backend encontra seu player pelo `plutoniumName`
5. ✅ Stats são salvas no Firestore

**Verificar logs do Vercel:**
```
[update_stats] ✅ Player join: SoldierBR_123
[update_stats] ✅ Kill salva: SoldierBR_123 → OutroPlayer
```

### 4. **Testar Player Não Cadastrado**

1. **Entre no servidor** com nome diferente
2. ✅ Script envia eventos
3. ⚠️ Backend não encontra player
4. ⚠️ Stats NÃO são salvas

**Logs esperados:**
```
[update_stats] ⚠️  Player não cadastrado: PlayerNaoCadastrado
[update_stats] ⚠️  Player não cadastrado (join ignorado): PlayerNaoCadastrado
```

---

## ⚠️ Pontos Importantes

### 1. **Nome Exato é CRUCIAL**

O usuário DEVE digitar o nome EXATAMENTE como aparece no Plutonium:
- ✅ Maiúsculas e minúsculas importam
- ✅ Espaços importam
- ✅ Caracteres especiais importam

**Exemplo:**
- Plutonium: `SoldierBR_123`
- Site: `SoldierBR_123` ✅ CORRETO
- Site: `soldierbr_123` ❌ ERRADO (minúsculas)
- Site: `SoldierBR 123` ❌ ERRADO (espaço em vez de _)

### 2. **Índice é Obrigatório**

Sem o índice `plutoniumName`, as consultas vão FALHAR com erro:
```
Error: The query requires an index
```

### 3. **Players Não Cadastrados são Ignorados**

Se alguém jogar no servidor mas NÃO tiver conta no site:
- ❌ Stats não são salvas
- ❌ Não aparece no ranking
- ✅ Logs mostram warning

**Isso é intencional!** Evita poluir o banco com dados de visitantes aleatórios.

---

## 📊 Fluxo Completo

```
┌─────────────────┐
│ User faz login  │
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│ Sistema verifica   │
│ plutoniumName      │
└────────┬───────────┘
         │
    ┌────┴────┐
    │ Tem?    │
    └─┬────┬──┘
     Não  Sim
      │    │
      ▼    └─────────► Continua normal
┌──────────────┐
│ Mostra modal │
│ para config  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ User digita nome │
│ do Plutonium     │
└──────┬───────────┘
       │
       ▼
┌────────────────────┐
│ Salva no Firestore │
│ campo plutoniumName│
└────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ User joga no server │
└────────┬────────────┘
         │
         ▼
┌───────────────────────┐
│ Script Python captura │
│ nome do log           │
└────────┬──────────────┘
         │
         ▼
┌──────────────────────────┐
│ Envia para /update_stats │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend busca no Firestore:  │
│ WHERE plutoniumName == nome  │
└────────┬─────────────────────┘
         │
    ┌────┴─────┐
    │ Achou?   │
    └─┬────┬───┘
     Não  Sim
      │    │
      │    ▼
      │  ┌──────────────┐
      │  │ Salva stats  │
      │  └──────────────┘
      │
      ▼
┌──────────────┐
│ Ignora event │
│ Log warning  │
└──────────────┘
```

---

## 🎨 Interface do Usuário

### Modal Inicial (após login)
```
┌────────────────────────────────────────┐
│  🎮                                    │
│  CONFIGURAÇÃO OBRIGATÓRIA              │
│  Vincule seu nome do Plutonium         │
│                                        │
│  ⚠️ ATENÇÃO: Nome Exato do Plutonium  │
│  Digite EXATAMENTE o nome que você     │
│  usa no Plutonium BO2...               │
│                                        │
│  🎯 Seu Nome no Plutonium              │
│  [___________________________]         │
│  💡 Este nome será usado para...       │
│                                        │
│  📝 Como encontrar seu nome:           │
│  1. Abra o Plutonium BO2              │
│  2. Entre em qualquer servidor         │
│  3. Veja seu nome no scoreboard        │
│  4. Copie EXATAMENTE                   │
│                                        │
│  [✅ Confirmar e Começar a Jogar]      │
│                                        │
│  Você poderá alterar depois            │
└────────────────────────────────────────┘
```

### Seção no Perfil (nome configurado)
```
┌────────────────────────────────────────┐
│  🎮 Nome do Plutonium                  │
│  Vincule seu nome in-game para...      │
│                                        │
│  NOME ATUAL NO PLUTONIUM:              │
│  SoldierBR_123             [✏️ Editar] │
│                                        │
│  ✅ Conectado! Suas estatísticas serão │
│     atualizadas automaticamente        │
└────────────────────────────────────────┘
```

### Seção no Perfil (nome NÃO configurado)
```
┌────────────────────────────────────────┐
│  🎮 Nome do Plutonium                  │
│  Vincule seu nome in-game para...      │
│                                        │
│  ⚠️ Nome não configurado!              │
│  Configure seu nome do Plutonium para  │
│  que suas estatísticas sejam           │
│  registradas automaticamente           │
│                                        │
│  [➕ Configurar Agora]                 │
└────────────────────────────────────────┘
```

---

## 📝 Próximos Passos

### ✅ CONCLUÍDO:
- [x] Modal após login
- [x] Campo no perfil
- [x] Backend com validação
- [x] Busca por plutoniumName
- [x] Documentação de índices
- [x] Commit e push

### 🔲 PENDENTE (você precisa fazer):
- [ ] **CRIAR ÍNDICE no Firestore** (OBRIGATÓRIO!)
- [ ] Testar login e configuração de nome
- [ ] Testar edição no perfil
- [ ] Testar com script Python rodando
- [ ] Verificar logs do Vercel
- [ ] Publicar regras do Firestore (se ainda não fez)

---

## 🆘 Troubleshooting

### Problema: "The query requires an index"
**Solução:** Crie o índice `plutoniumName` no Firebase Console

### Problema: Stats não salvam mesmo com nome configurado
**Verificar:**
1. Nome no site é EXATO igual ao Plutonium?
2. Índice foi criado e está pronto (status: Enabled)?
3. Logs do Vercel mostram "Player não cadastrado"?

### Problema: Modal não aparece após login
**Verificar:**
1. JavaScript `plutonium-name.js` está carregando?
2. Console do navegador mostra erros?
3. Player já tem `plutoniumName` salvo?

### Problema: Não consigo editar nome no perfil
**Verificar:**
1. Está logado?
2. JavaScript está carregando sem erros?
3. Firestore permite leitura/escrita para usuário?

---

## 🎉 Resultado Final

### Para o Usuário:
✅ Experiência simples e intuitiva  
✅ Configuração em 30 segundos  
✅ Stats automáticas quando jogar  
✅ Pode editar nome a qualquer momento  

### Para o Sistema:
✅ Validação automática de registro  
✅ Banco limpo (só players cadastrados)  
✅ Performance otimizada com índices  
✅ Logs claros e informativos  

### Para Você (Admin):
✅ Sistema totalmente automatizado  
✅ Fácil de debugar (logs detalhados)  
✅ Escalável para milhares de players  
✅ Manutenção mínima  

---

## 📌 Links Importantes

- **Firestore Indexes:** https://console.firebase.google.com/project/rankops-8d2ea/firestore/indexes
- **Firestore Data:** https://console.firebase.google.com/project/rankops-8d2ea/firestore/data
- **Vercel Deployment:** https://vercel.com/alanaraujo-bit/bo2-rankeado
- **Vercel Logs:** https://vercel.com/alanaraujo-bit/bo2-rankeado/logs
- **Site:** https://rankops.vercel.app

---

**✅ Sistema implementado com sucesso!**  
**📚 Documentação completa criada!**  
**🚀 Pronto para uso após criar o índice!**
