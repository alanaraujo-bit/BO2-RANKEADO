# 🚀 DEPLOY: GITHUB + VERCEL

## ✅ Guia Completo de Deploy

---

## 📦 PARTE 1: SUBIR PARA O GITHUB

### 1. Crie o repositório no GitHub:

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name**: `bo2-ranked` (ou o nome que quiser)
   - **Description**: "BO2 Plutonium Ranked System - Sistema competitivo para Black Ops 2"
   - ✅ Marque como **Public** (obrigatório para Vercel grátis)
   - ❌ NÃO marque "Add a README file"
3. Clique em **"Create repository"**

---

### 2. Conecte seu projeto local ao GitHub:

**Execute estes comandos no terminal do VS Code:**

```bash
# Adicione o repositório remoto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/bo2-ranked.git

# Renomeie a branch para main
git branch -M main

# Envie o código para o GitHub
git push -u origin main
```

**⚠️ IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!

**Exemplo**:
```bash
git remote add origin https://github.com/alanzera/bo2-ranked.git
```

---

## 🚀 PARTE 2: DEPLOY NO VERCEL

### 1. Acesse o Vercel:

- **URL**: https://vercel.com/signup
- Clique em **"Continue with GitHub"**
- Autorize o Vercel a acessar sua conta GitHub

---

### 2. Importe o projeto:

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `bo2-ranked` na lista
3. Clique em **"Import"**

---

### 3. Configure o deploy:

Na tela de configuração:

- **Framework Preset**: `Other` (deixe assim)
- **Root Directory**: `./` (deixe assim)
- **Build Command**: deixe vazio
- **Output Directory**: deixe vazio
- **Install Command**: deixe vazio

Clique em **"Deploy"**

---

### 4. Aguarde o deploy:

- ⏱️ Leva cerca de 30-60 segundos
- ✅ Quando terminar, verá uma tela de celebração! 🎉

---

### 5. Acesse seu site:

Seu site estará disponível em:
```
https://bo2-ranked.vercel.app
```

Ou um domínio aleatório tipo:
```
https://bo2-ranked-abc123.vercel.app
```

---

## 🎨 PERSONALIZE O DOMÍNIO (Opcional)

### No Vercel:

1. Vá em **Settings** do projeto
2. Clique em **Domains**
3. Adicione um domínio customizado:
   - `bo2ranked.vercel.app` (mude o nome)
   - Ou conecte seu próprio domínio

---

## 🔄 COMO ATUALIZAR O SITE:

Sempre que fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

**O Vercel faz deploy automático em ~30 segundos!** 🚀

---

## ✅ VANTAGENS GITHUB + VERCEL:

- ✅ **100% GRÁTIS** para sempre
- ✅ **Deploy automático** a cada push
- ✅ **HTTPS** incluído
- ✅ **CDN global** (site rápido no mundo todo)
- ✅ **Preview das mudanças** antes de publicar
- ✅ **Analytics grátis**
- ✅ **Sem limites** de banda ou visitas

---

## 📊 RECURSOS EXTRAS DO VERCEL:

### 1. **Analytics** (Estatísticas de visitas):
- Acesse: **Analytics** no menu do projeto
- Veja quantas pessoas acessam o site

### 2. **Preview Deployments**:
- Cada commit gera uma URL de preview
- Teste antes de publicar na versão principal

### 3. **Environment Variables** (Para futuro):
- Se migrar para Firebase, adicione as chaves aqui
- Settings → Environment Variables

---

## 🌐 DOMÍNIO PRÓPRIO (Opcional):

Se quiser algo tipo `www.bo2ranked.com.br`:

### Onde comprar:
- **Registro.br**: R$ 40/ano (.com.br)
- **Namecheap**: $10/ano (.com)
- **GoDaddy**: variável

### Como conectar:
1. Compre o domínio
2. No Vercel: Settings → Domains → Add Domain
3. Configure os DNS conforme instruções do Vercel
4. Aguarde 24-48h para propagar

---

## 🎮 COMPARTILHAR COM OS AMIGOS:

Depois do deploy, compartilhe o link:

```
https://bo2ranked.vercel.app
```

**Cada jogador deve**:
1. Acessar o site
2. Fazer login (criar conta)
3. Reportar suas partidas
4. Aguardar confirmação do oponente

---

## 📱 O QUE OS JOGADORES PRECISAM SABER:

### ⚠️ **Dados são locais por enquanto:**
- Cada jogador tem seus próprios dados no navegador
- Para ranking global compartilhado, precisaria migrar para Firebase

### ✅ **Como funciona:**
1. Você e um amigo jogam uma partida
2. Um de vocês reporta o resultado no site
3. O outro confirma
4. O MMR de ambos é atualizado
5. O ranking é atualizado

---

## 🔮 PRÓXIMOS PASSOS (OPCIONAL):

Depois que estiver funcionando, você pode adicionar:

1. ✅ **Firebase** - Dados sincronizados entre todos
2. ✅ **Discord Bot** - Notificações automáticas
3. ✅ **Sistema de Clãs** - Times competindo
4. ✅ **Torneios** - Campeonatos oficiais
5. ✅ **Gráficos de Performance** - Chart.js

---

## ❓ DÚVIDAS COMUNS:

**P: O site vai cair se muita gente acessar?**
R: Não! Vercel aguenta milhões de acessos.

**P: Preciso pagar?**
R: NÃO! É 100% grátis para sempre.

**P: Como os dados são salvos?**
R: No navegador de cada jogador (LocalStorage). Para dados compartilhados, precisa migrar para Firebase.

**P: Posso mudar o design depois?**
R: Sim! É só editar os arquivos, fazer commit e push.

---

## 🆘 PROBLEMAS COMUNS:

### "Permission denied" no git push:
```bash
# Configure suas credenciais do GitHub
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### "Repository not found":
- Verifique se o nome do repositório está correto
- Verifique se está logado no GitHub

### Site não atualiza no Vercel:
- Verifique se o push foi feito: `git log`
- Veja os logs no dashboard do Vercel

---

## 📞 PRECISA DE AJUDA?

Me chame se tiver qualquer erro! 🚀

**Bom jogo e boas partidas ranked!** 🎮
