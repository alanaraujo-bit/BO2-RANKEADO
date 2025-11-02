# Firestore Indexes - BO2 Ranked System

## 📋 Índices Necessários

Para otimizar as consultas do sistema, crie os seguintes índices no Firebase Console:

### 1. Players - Busca por Nome do Plutonium

**Collection:** `players`  
**Fields indexed:**
- `plutoniumName` (Ascending)

**Tipo:** Single field index

**Como criar:**
1. Acesse: https://console.firebase.google.com/project/rankops-8d2ea/firestore/indexes
2. Clique em **"Create Index"**
3. Collection: `players`
4. Field: `plutoniumName`
5. Order: Ascending
6. Query scope: Collection
7. Clique em **"Create"**

### 2. Players - Leaderboard (MMR + Nome)

**Collection:** `players`  
**Fields indexed:**
- `mmr` (Descending)
- `username` (Ascending)

**Tipo:** Composite index

**Como criar:**
1. Acesse: https://console.firebase.google.com/project/rankops-8d2ea/firestore/indexes
2. Clique em **"Create Index"**
3. Collection: `players`
4. Adicione os campos:
   - Field: `mmr`, Order: Descending
   - Field: `username`, Order: Ascending
5. Query scope: Collection
6. Clique em **"Create"**

## 🔍 Por que esses índices?

### plutoniumName Index
- **Usado em:** `update_stats.js` - todas as verificações de player
- **Consultas otimizadas:**
  - `players.where('plutoniumName', '==', playerName)`
  - Busca rápida de players pelo nome do jogo
  - Validação de registro em tempo real

### MMR + Username Index
- **Usado em:** Leaderboard e rankings
- **Consultas otimizadas:**
  - `players.orderBy('mmr', 'desc').orderBy('username')`
  - Ordenação de rankings
  - Top players display

## ⚙️ Verificar Índices Existentes

Para ver todos os índices atuais:
```
https://console.firebase.google.com/project/rankops-8d2ea/firestore/indexes
```

## 📊 Performance Esperada

**Sem índice:**
- ❌ Consultas podem falhar
- ❌ Timeout em grandes datasets
- ❌ Error: "The query requires an index"

**Com índice:**
- ✅ Consultas em < 100ms
- ✅ Escalável para milhares de players
- ✅ Sem erros de missing index

## 🚀 Próximos Passos

1. **Criar os índices acima** no Firebase Console
2. **Aguardar build** (pode levar 2-5 minutos)
3. **Testar** com o monitor Python rodando
4. **Verificar logs** no Vercel para confirmar que não há erros de índice

## 📌 Nota Importante

O Firebase Admin SDK **bypass** as regras de segurança, mas **NÃO bypass** os requisitos de índices. 
Se uma consulta requer índice, você **deve criar** mesmo usando Admin SDK.

## ✅ Checklist de Implementação

- [ ] Índice `plutoniumName` criado
- [ ] Índice `mmr + username` criado
- [ ] Aguardado build completo
- [ ] Testado com player cadastrado
- [ ] Testado com player não cadastrado
- [ ] Verificado logs do Vercel
- [ ] Confirmado performance < 100ms
