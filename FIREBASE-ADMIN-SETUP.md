# 🔥 CONFIGURAR FIREBASE ADMIN NO VERCEL

## 📋 PASSO 1: Gerar Service Account Key

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Selecione seu projeto: **rankops-8d2ea**

2. **Vá para Configurações do Projeto:**
   - Clique no ícone de engrenagem ⚙️ no canto superior esquerdo
   - Clique em **"Configurações do projeto"** ou **"Project settings"**

3. **Acesse a aba Service Accounts:**
   - Clique na aba **"Service accounts"** (Contas de serviço)

4. **Gerar nova chave privada:**
   - Role para baixo até ver **"Firebase Admin SDK"**
   - Clique no botão **"Generate new private key"** (Gerar nova chave privada)
   - Confirme clicando em **"Generate key"** (Gerar chave)
   - Um arquivo **JSON** será baixado automaticamente

---

## 📋 PASSO 2: Extrair as 3 Variáveis de Ambiente

Abra o arquivo JSON baixado. Ele terá este formato:

```json
{
  "type": "service_account",
  "project_id": "rankops-8d2ea",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@rankops-8d2ea.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

**Copie estes 3 valores:**

1. **`project_id`** - Exemplo: `rankops-8d2ea`
2. **`client_email`** - Exemplo: `firebase-adminsdk-xxxxx@rankops-8d2ea.iam.gserviceaccount.com`
3. **`private_key`** - A chave completa incluindo `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`

---

## 📋 PASSO 3: Adicionar no Vercel

1. **Acesse o Dashboard do Vercel:**
   - URL: https://vercel.com/
   - Vá para o projeto **rankops**

2. **Abra as configurações:**
   - Clique em **"Settings"** (Configurações)
   - No menu lateral, clique em **"Environment Variables"** (Variáveis de ambiente)

3. **Adicione as 3 variáveis:**

   **Variável 1:**
   - Name: `FIREBASE_PROJECT_ID`
   - Value: `rankops-8d2ea` (pegue do JSON)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Clique em **Save**

   **Variável 2:**
   - Name: `FIREBASE_CLIENT_EMAIL`
   - Value: `firebase-adminsdk-xxxxx@rankops-8d2ea.iam.gserviceaccount.com` (pegue do JSON)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Clique em **Save**

   **Variável 3:**
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: Cole a chave privada completa do JSON (incluindo `-----BEGIN` e `-----END`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Clique em **Save**

---

## 📋 PASSO 4: Redeploy do Vercel

Depois de adicionar as variáveis, você precisa fazer um novo deploy:

1. **Opção A - Pelo Dashboard:**
   - Vá para a aba **"Deployments"**
   - Clique nos 3 pontinhos ⋯ do último deployment
   - Clique em **"Redeploy"**

2. **Opção B - Fazer novo commit:**
   - Faça qualquer alteração pequena no código
   - Commit e push para o GitHub
   - Vercel vai fazer deploy automaticamente

---

## ✅ PASSO 5: Testar

Depois do redeploy, quando o monitor Python enviar dados, você deve ver:

**Antes:**
```
[HH:MM:SS] ❌ ⚠️  Firebase não está salvando: Firebase não configurado
```

**Depois:**
```
(Sem mensagem de erro - dados sendo salvos silenciosamente ✅)
```

---

## 🔍 Verificar se está funcionando:

1. **Console do Vercel:**
   - Vá para **"Deployments"**
   - Clique no último deployment
   - Clique em **"Functions"** (Funções)
   - Veja os logs da função `update_stats`
   - Deve aparecer: `✅ Salvo no Firestore!`

2. **Firebase Console:**
   - Acesse: https://console.firebase.google.com/
   - Projeto: **rankops-8d2ea**
   - Menu lateral: **Firestore Database**
   - Você deve ver a collection **"events"** com documentos salvos

---

## ⚠️ IMPORTANTE:

- **NÃO** commite o arquivo JSON da service account no Git!
- As variáveis ficam **APENAS** no Vercel (seguro)
- O `private_key` pode ter `\n` - copie exatamente como está no JSON

---

## 🆘 Problemas?

Se após configurar ainda aparecer erro:

1. Verifique se as 3 variáveis estão corretas no Vercel
2. Verifique se fez o redeploy após adicionar as variáveis
3. Verifique os logs no Vercel para ver o erro específico

---

**Depois de configurar, teste matando alguém no jogo e veja se o aviso de Firebase desaparece!** 🎮🔥
