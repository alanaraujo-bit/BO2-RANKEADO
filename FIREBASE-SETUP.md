# 🔥 CONFIGURAÇÃO DO FIREBASE

## ✅ PASSO A PASSO COMPLETO

---

## 📋 PARTE 1: CRIAR PROJETO NO FIREBASE

### 1. Acesse o Firebase Console:
- **URL**: https://console.firebase.google.com/
- Faça login com sua conta Google

### 2. Criar novo projeto:
1. Clique em **"Adicionar projeto"** ou **"Add project"**
2. **Nome do projeto**: `bo2-ranked`
3. **Google Analytics**: Desabilite (não precisa)
4. Clique em **"Criar projeto"**
5. Aguarde a criação (~30 segundos)

---

## 📋 PARTE 2: CONFIGURAR FIREBASE WEB APP

### 1. Adicionar app Web:
1. No painel do projeto, clique no ícone **</>** (Web)
2. **Apelido do app**: `BO2 Ranked Web`
3. ✅ Marque **"Configurar o Firebase Hosting"**
4. Clique em **"Registrar app"**

### 2. Copiar as configurações:
Você verá um código assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bo2-ranked.firebaseapp.com",
  projectId: "bo2-ranked",
  storageBucket: "bo2-ranked.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**📋 COPIE ESSES DADOS!** Vamos usar no próximo passo.

---

## 📋 PARTE 3: ATIVAR SERVIÇOS DO FIREBASE

### 1. Authentication (Login):
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Get started"** ou **"Começar"**
3. Na aba **"Sign-in method"**, ative:
   - ✅ **Email/Password** (clique, ative, salve)
   - ✅ **Anonymous** (opcional, para guests)

### 2. Firestore Database (Banco de dados):
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"** ou **"Criar banco de dados"**
3. Escolha o modo: **"Start in test mode"** (por enquanto)
4. Localização: **us-central1** (ou mais próximo)
5. Clique em **"Enable"**

### 3. Storage (Opcional - para screenshots):
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Get started"**
3. Modo: **"Start in test mode"**
4. Clique em **"Next"** → **"Done"**

---

## 📋 PARTE 4: CONFIGURAR REGRAS DE SEGURANÇA

### Firestore Security Rules:

No Firestore Database, vá em **"Rules"** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Players collection
    match /players/{playerId} {
      allow read: if true; // Todos podem ler
      allow write: if request.auth != null && request.auth.uid == playerId;
    }
    
    // Matches collection
    match /matches/{matchId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Pending confirmations
    match /pendingConfirmations/{confirmId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Leaderboard (read-only for clients)
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
  }
}
```

Clique em **"Publish"**

---

## 📋 PARTE 5: ADICIONAR CONFIGURAÇÕES AO PROJETO

### 1. Abra o arquivo: `js/firebase-config.js`

### 2. Substitua os valores:

Cole as configurações que você copiou no **PARTE 2**:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI", // Cole aqui
    authDomain: "bo2-ranked.firebaseapp.com", // Cole aqui
    projectId: "bo2-ranked", // Cole aqui
    storageBucket: "bo2-ranked.appspot.com", // Cole aqui
    messagingSenderId: "123456789", // Cole aqui
    appId: "1:123:web:abc" // Cole aqui
};
```

### 3. Salve o arquivo!

---

## 📋 PARTE 6: TESTAR LOCALMENTE

```bash
# Abra o index.html no navegador
# Abra o Console (F12)
# Deve ver: "Firebase initialized successfully"
```

---

## 📋 PARTE 7: DEPLOY NO RAILWAY

```bash
# Commitar as mudanças
git add .
git commit -m "Add Firebase integration"
git push

# Railway fará deploy automático!
```

---

## ✅ PRONTO!

Agora seu site terá:
- ✅ **Login real** com email/senha
- ✅ **Banco de dados na nuvem**
- ✅ **Ranking global compartilhado**
- ✅ **Dados sincronizados** em tempo real
- ✅ **Não perde dados** ao limpar navegador

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO:

1. Acesse seu site
2. Crie uma conta
3. No Firebase Console → Firestore Database
4. Você verá a collection **"players"** aparecer!

---

## 💰 CUSTOS:

### Firebase Spark Plan (GRÁTIS):
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 20.000 exclusões/dia
- ✅ 1 GB armazenamento
- ✅ 10 GB transferência/mês

**Suficiente para centenas de jogadores!**

---

## 🆘 PROBLEMAS COMUNS:

### "Firebase is not defined":
- Verifique se os scripts estão na ordem correta no HTML

### "Permission denied":
- Verifique as Security Rules no Firestore

### Dados não aparecem:
- Verifique o Console (F12) para erros
- Verifique se a configuração está correta

---

## 📞 PRÓXIMOS PASSOS:

Me avise quando terminar o **PARTE 2** (copiar as configurações) que eu continuo a migração! 🚀
