# 🔒 CONFIGURAR REGRAS DE SEGURANÇA DO FIRESTORE

## ⚠️ IMPORTANTE - PASSO OBRIGATÓRIO!

O erro **"Failed to get document because the client is offline"** acontece porque as regras do Firestore estão bloqueando o acesso!

---

## 📋 COMO CONFIGURAR:

### 1. Acesse o Firebase Console - Firestore Rules:

👉 **https://console.firebase.google.com/project/bo2-ranked/firestore/rules**

### 2. Você verá as regras atuais (provavelmente bloqueadas):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ BLOQUEANDO TUDO!
    }
  }
}
```

### 3. Copie as regras do arquivo `firestore.rules` deste projeto

Ou copie e cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Players collection
    match /players/{userId} {
      // Anyone can read player profiles (for leaderboard)
      allow read: if true;
      
      // Only authenticated users can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Only the owner can update their profile
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // No one can delete profiles
      allow delete: if false;
    }
    
    // Matches collection
    match /matches/{matchId} {
      // Anyone can read matches (for history and stats)
      allow read: if true;
      
      // Only authenticated users can create matches
      allow create: if request.auth != null;
      
      // Only authenticated users can update matches (for confirmations)
      allow update: if request.auth != null;
      
      // No one can delete matches
      allow delete: if false;
    }
    
    // Pending confirmations collection
    match /pendingConfirmations/{confirmId} {
      // Anyone can read pending confirmations
      allow read: if true;
      
      // Only authenticated users can create confirmations
      allow create: if request.auth != null;
      
      // Only authenticated users can update confirmations
      allow update: if request.auth != null;
      
      // Only authenticated users can delete confirmations
      allow delete: if request.auth != null;
    }
  }
}
```

### 4. Clique em **"Publicar"** ou **"Publish"**

### 5. Aguarde 10 segundos para as regras serem aplicadas

### 6. Recarregue o site e tente fazer login novamente!

---

## ✅ O QUE ESSAS REGRAS FAZEM:

- ✅ **Leitura pública**: Qualquer pessoa pode ver jogadores, matches e rankings (necessário para o leaderboard)
- ✅ **Escrita autenticada**: Apenas usuários logados podem criar/atualizar dados
- ✅ **Segurança**: Jogadores só podem editar seu próprio perfil
- ✅ **Anti-delete**: Ninguém pode deletar dados (preserva histórico)

---

## 🆘 SE QUISER TESTAR RÁPIDO (NÃO RECOMENDADO PARA PRODUÇÃO):

Use estas regras **temporárias** para teste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO**: Isso deixa o banco **totalmente aberto**! Use apenas para testar e depois volte para as regras de segurança corretas.

---

## 📞 DEPOIS DE CONFIGURAR:

Recarregue a página e tente fazer login. O erro deve sumir! 🚀
