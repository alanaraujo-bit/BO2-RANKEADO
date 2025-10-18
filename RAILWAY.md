# 🚂 DEPLOY NO RAILWAY - BO2 RANKED

## ✅ Arquivos criados para Railway!

---

## 📦 PASSO A PASSO:

### 1. **Suba o código para o GitHub primeiro**

```bash
# Se ainda não criou o repositório no GitHub, crie em: https://github.com/new
# Depois execute:

git remote add origin https://github.com/SEU_USUARIO/bo2-ranked.git
git branch -M main
git push -u origin main
```

---

### 2. **Deploy no Railway**

1. **Acesse**: https://railway.app
2. **Faça login** (use GitHub para facilitar)
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório: `bo2-ranked`
6. Railway vai detectar automaticamente o `package.json`
7. Clique em **"Deploy"**

---

### 3. **Configure o domínio**

1. Depois do deploy, vá em **Settings** do projeto
2. Clique em **"Generate Domain"**
3. Seu site estará disponível em:
   ```
   https://bo2-ranked-production.up.railway.app
   ```

---

## 🎯 OPÇÃO ALTERNATIVA: Deploy Direto pelo CLI

```bash
# Instale o Railway CLI
npm i -g @railway/cli

# Faça login
railway login

# Crie o projeto
railway init

# Deploy
railway up
```

---

## ✅ VANTAGENS DO RAILWAY:

- ✅ Deploy automático a cada push no GitHub
- ✅ $5 de crédito grátis por mês
- ✅ HTTPS automático
- ✅ Domínio customizado fácil
- ✅ Logs em tempo real

---

## ⚠️ IMPORTANTE:

### **Railway COBRA depois de $5/mês**

O plano grátis do Railway dá **$5 de crédito por mês**. 

Para um site estático como este:
- **Custo estimado**: ~$0.50 - $2/mês (depende do tráfego)
- Se ultrapassar $5, Railway cobra

### **Alternativas 100% GRÁTIS:**
- ✅ **GitHub Pages** (recomendado)
- ✅ **Netlify**
- ✅ **Vercel**

Todas fazem exatamente a mesma coisa, mas são **grátis para sempre**!

---

## 🔧 COMO FUNCIONA:

1. Railway instala as dependências: `npm install`
2. Railway roda: `npm start`
3. O servidor Express serve seus arquivos estáticos
4. Site fica disponível 24/7

---

## 🔄 ATUALIZAR O SITE:

Sempre que fizer mudanças:

```bash
git add .
git commit -m "Sua mensagem"
git push
```

Railway faz deploy automático em ~2 minutos!

---

## 🌐 DOMÍNIO CUSTOMIZADO:

No Railway, você pode adicionar seu próprio domínio:

1. Vá em **Settings** → **Domains**
2. Clique em **"Custom Domain"**
3. Adicione: `bo2ranked.com` (ou o que você comprar)
4. Configure o DNS conforme instruções

---

## 💡 DICA PROFISSIONAL:

Se você já usa Railway para outros projetos (backend, APIs), faz sentido usar para tudo junto.

Mas se é só para este site estático, **GitHub Pages é melhor**:
- 100% grátis
- Mais rápido
- Mais simples

---

## ❓ PRECISA DE AJUDA?

Me chame se tiver algum erro! 🚀
