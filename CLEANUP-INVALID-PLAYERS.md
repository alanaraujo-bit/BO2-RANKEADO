# 🧹 Como Limpar Players Inválidos

## ⚠️ Problema

Players aparecem no Firestore sem ter se cadastrado no site. Isso acontece quando:
- Documentos foram criados manualmente para testes
- Dados antigos de sistemas anteriores

## ✅ Solução Automática

Use o endpoint de limpeza que criamos:

### 1. **Via Terminal (PowerShell)**

```powershell
$headers = @{
    "Authorization" = "Bearer 9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://rankops.vercel.app/api/cleanup_invalid_players" -Method POST -Headers $headers
```

### 2. **Via Python**

```python
import requests

url = "https://rankops.vercel.app/api/cleanup_invalid_players"
headers = {
    "Authorization": "Bearer 9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)
print(response.json())
```

### 3. **Resposta Esperada**

```json
{
  "success": true,
  "deleted": 1,
  "kept": 5,
  "deletedPlayers": [
    {
      "id": "zeckinhas",
      "name": "zeckinhas"
    }
  ]
}
```

## 🔍 Identificação de Players Inválidos

Um player é considerado **INVÁLIDO** se:
- ❌ Não tem campo `userId`
- ❌ Campo `userId` está vazio (`""`)
- ❌ Campo `userId` é `null` ou `undefined`

Um player é considerado **VÁLIDO** se:
- ✅ Tem `userId` preenchido (ex: `"abc123xyz..."`)
- ✅ Foi criado via login com Google
- ✅ Foi criado via cadastro com email/senha

## 📊 Manual (Firestore Console)

Se preferir deletar manualmente:

1. Acesse: https://console.firebase.google.com/project/rankops-8d2ea/firestore/data/~2Fplayers
2. Clique no documento suspeito (ex: "zeckinhas")
3. Verifique se tem campo `userId`
4. Se NÃO tiver ou estiver vazio → Clique nos 3 pontos → "Delete document"

## 🛡️ Proteção Atual do Sistema

O sistema **JÁ ESTÁ PROTEGIDO** e não cria mais players automaticamente:

### ✅ O que NÃO cria players:
- ❌ Script Python enviando eventos
- ❌ API `/api/update_stats` recebendo dados
- ❌ Players entrando no servidor do Plutonium
- ❌ Eventos de kill, join, quit

### ✅ O que CRIA players (legítimo):
- ✅ Usuário fazendo login com Google
- ✅ Usuário criando conta com email/senha
- ✅ Apenas no frontend, nunca no backend

## 🔐 Como Funciona a Proteção

### Backend (`update_stats.js`):

```javascript
// Busca player pelo plutoniumName
const playerQuery = await db.collection('players')
  .where('plutoniumName', '==', 'NomeDoPlayer')
  .limit(1)
  .get();

if (playerQuery.empty) {
  // Player não cadastrado - IGNORA
  console.log('⚠️  Player não cadastrado');
  return; // NÃO CRIA O PLAYER
}

// Player cadastrado - atualiza stats
const playerDoc = playerQuery.docs[0];
// ... salva stats
```

### Frontend (`data-firebase.js`):

```javascript
// APENAS quando usuário faz login:
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Verifica se player já existe
    const doc = await db.collection('players').doc(user.uid).get();
    
    if (!doc.exists) {
      // Primeira vez - CRIA player
      await db.collection('players').doc(user.uid).set({
        userId: user.uid,  // ← SEMPRE tem userId
        username: user.displayName,
        email: user.email,
        // ... outros campos
      });
    }
  }
});
```

## ⚡ Resumo

1. **Problema:** "zeckinhas" apareceu sem `userId` → foi criado manualmente
2. **Solução:** Use endpoint `/api/cleanup_invalid_players`
3. **Proteção:** Sistema já não cria players automaticamente
4. **Garantia:** Apenas usuários logados podem ter documento

## 🚀 Executar Limpeza Agora

Abra o PowerShell e execute:

```powershell
$headers = @{ "Authorization" = "Bearer 9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5"; "Content-Type" = "application/json" }
Invoke-WebRequest -Uri "https://rankops.vercel.app/api/cleanup_invalid_players" -Method POST -Headers $headers | Select-Object -ExpandProperty Content
```

✅ Isso vai deletar "zeckinhas" e qualquer outro player sem `userId`!
