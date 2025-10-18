# 🚀 GUIA DE DEPLOY - BO2 RANKED

## ✅ Repositório Git criado com sucesso!

---

## 📦 OPÇÃO 1: GitHub Pages (GRÁTIS e RECOMENDADO)

### Passo a Passo:

1. **Crie uma conta no GitHub** (se não tiver):
   - Acesse: https://github.com/signup
   - Use um email válido

2. **Crie um novo repositório**:
   - Acesse: https://github.com/new
   - Nome: `bo2-ranked` (ou qualquer nome)
   - ✅ Deixe como **Public**
   - ❌ NÃO marque "Add a README file"
   - Clique em **Create repository**

3. **Conecte seu projeto ao GitHub**:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/bo2-ranked.git
   git branch -M main
   git push -u origin main
   ```
   
   ⚠️ **Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!**

4. **Ative o GitHub Pages**:
   - No repositório, vá em **Settings** (Configurações)
   - No menu lateral, clique em **Pages**
   - Em **Source**, selecione: `main` branch
   - Clique em **Save**
   - Aguarde 1-2 minutos

5. **Seu site estará online em**:
   ```
   https://SEU_USUARIO.github.io/bo2-ranked/
   ```

### ✅ Vantagens do GitHub Pages:
- ✅ 100% GRÁTIS
- ✅ HTTPS automático (seguro)
- ✅ Domínio bonito (.github.io)
- ✅ Fácil de atualizar (só fazer git push)
- ✅ Sem limite de visitas

---

## 📦 OPÇÃO 2: Netlify (GRÁTIS, mais fácil ainda)

### Passo a Passo:

1. **Acesse Netlify**:
   - https://app.netlify.com/signup

2. **Faça login com GitHub** (use a conta que criou acima)

3. **Adicione novo site**:
   - Clique em "Add new site" → "Import an existing project"
   - Conecte seu repositório GitHub
   - Selecione `bo2-ranked`
   - Clique em "Deploy"

4. **Pronto!** Seu site estará em:
   ```
   https://NOME-ALEATORIO.netlify.app
   ```
   
   💡 Você pode personalizar o nome nas configurações!

### ✅ Vantagens do Netlify:
- ✅ 100% GRÁTIS
- ✅ Deploy automático a cada commit
- ✅ Preview das mudanças
- ✅ Domínio customizado grátis

---

## 📦 OPÇÃO 3: Vercel (GRÁTIS, para devs)

### Passo a Passo:

1. **Acesse Vercel**:
   - https://vercel.com/signup

2. **Importe o projeto**:
   - Clique em "New Project"
   - Conecte seu GitHub
   - Selecione `bo2-ranked`
   - Clique em "Deploy"

3. **Pronto!** URL:
   ```
   https://bo2-ranked.vercel.app
   ```

---

## 🏠 OPÇÃO 4: Hospedar localmente (Para testes com amigos próximos)

### Se seus amigos estiverem na mesma rede Wi-Fi:

1. **Descubra seu IP local**:
   ```bash
   ipconfig
   ```
   Procure por "IPv4 Address" (algo como `192.168.1.X`)

2. **Abra um servidor HTTP**:
   ```bash
   # Com Python (se tiver instalado)
   python -m http.server 8000
   
   # OU com Node.js (se tiver instalado)
   npx http-server -p 8000
   ```

3. **Compartilhe o link com seus amigos**:
   ```
   http://SEU_IP:8000
   ```
   Exemplo: `http://192.168.1.5:8000`

⚠️ **Limitações**:
- ❌ Só funciona na mesma rede Wi-Fi
- ❌ Precisa deixar o PC ligado
- ❌ Dados ficam só no navegador de cada pessoa

---

## 🌐 OPÇÃO 5: Domínio Próprio (PAGO)

Se quiser algo tipo `www.bo2ranked.com`:

1. Compre um domínio em:
   - **Registro.br** (R$ 40/ano) - .com.br
   - **Namecheap** ($10/ano) - .com
   - **GoDaddy** - variável

2. Configure o DNS para apontar para:
   - GitHub Pages
   - Netlify
   - Vercel

---

## 📱 RECOMENDAÇÃO FINAL

Para o seu caso (compartilhar com amigos do Plutonium):

### 🥇 **MELHOR OPÇÃO: GitHub Pages**
1. Grátis para sempre
2. Funciona de qualquer lugar do mundo
3. Link fácil de compartilhar
4. Dados salvos no navegador de cada jogador
5. Fácil de atualizar

### 🥈 **ALTERNATIVA: Netlify**
- Mais fácil ainda de configurar
- Interface visual bonita
- Deploy automático

---

## 🔄 Como atualizar o site depois:

Sempre que fizer mudanças:

```bash
git add .
git commit -m "Descricao da mudanca"
git push
```

O site atualiza automaticamente em 1-2 minutos!

---

## 🎮 PRÓXIMOS PASSOS

Depois que o site estiver online, você pode:

1. ✅ **Adicionar domínio customizado** (ex: bo2ranked.com.br)
2. ✅ **Migrar para Firebase** (para dados sincronizados entre todos)
3. ✅ **Criar Discord Bot** para notificações
4. ✅ **Adicionar sistema de clãs/times**
5. ✅ **Implementar API para estatísticas**

---

## ❓ DÚVIDAS COMUNS

**P: Os dados ficam salvos online?**
R: Não, com LocalStorage cada jogador tem seus próprios dados. Para dados compartilhados, precisa migrar para Firebase.

**P: Quanto custa hospedar?**
R: ZERO! GitHub Pages, Netlify e Vercel são 100% grátis.

**P: Posso ter um domínio tipo .com.br?**
R: Sim! Compre em Registro.br (R$ 40/ano) e configure o DNS.

**P: Como meus amigos vão jogar?**
R: Cada um acessa o site, faz login, e reporta suas partidas. O adversário confirma.

---

## 📞 SUPORTE

Se precisar de ajuda, me chame! 🚀

**Criado por: Alan Araújo**
**Data: Outubro 2025**
