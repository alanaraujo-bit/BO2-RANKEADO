# 🔐 CONFIGURAÇÃO DE SEGURANÇA - GUIA RÁPIDO

## ⚠️ IMPORTANTE: Duas Chaves Diferentes!

### 1️⃣ Server Key do Plutonium
**O que é:** Chave para autenticar seu servidor BO2 no Plutonium  
**Sua chave:** `p2kvIQvVmKOIazp8FlZQHYfrotWnyOxV`  
**Onde usar:** Configuração do servidor dedicado BO2 (server.cfg ou linha de comando)  
**NÃO USE essa chave para o BO2_SECRET!**

---

### 2️⃣ BO2_SECRET (Nova - você precisa criar)
**O que é:** Chave secreta para proteger a comunicação entre o monitor de logs e o servidor web  
**Precisa:** Criar uma nova chave forte e única  
**Onde usar:** Variável de ambiente no Windows + Vercel

---

## 🚀 COMO CRIAR E CONFIGURAR O BO2_SECRET

### Passo 1: Gerar Chave Forte

Abra PowerShell e execute:

```powershell
# Gera uma chave aleatória segura
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
Write-Host "==================================="
Write-Host "SUA CHAVE SECRETA:"
Write-Host $key
Write-Host "==================================="
Write-Host "COPIE ESSA CHAVE E GUARDE COM SEGURANCA!"
```

**Exemplo de saída:**
```
===================================
SUA CHAVE SECRETA:
a8B9c0D1e2F3g4H5i6J7k8L9m0N1o2P3q4R5s6T7u8V9w0X=
===================================
```

### Passo 2: Configurar no Windows

Abra PowerShell **como Administrador** e execute:

```powershell
# Substitua CHAVE_GERADA_ACIMA pela chave que você copiou
setx BO2_SECRET "CHAVE_GERADA_ACIMA" /M
```

**Exemplo:**
```powershell
setx BO2_SECRET "a8B9c0D1e2F3g4H5i6J7k8L9m0N1o2P3q4R5s6T7u8V9w0X=" /M
```

**✅ Deve aparecer:** `SUCCESS: Specified value was saved.`

### Passo 3: Reiniciar PowerShell

⚠️ **IMPORTANTE:** Feche TODOS os terminais PowerShell abertos e abra um novo.

### Passo 4: Verificar Configuração

No novo PowerShell, execute:

```powershell
echo $env:BO2_SECRET
```

Deve mostrar sua chave. Se mostrar vazio, repita o Passo 2.

### Passo 5: Configurar no Vercel (para produção)

1. Acesse: https://vercel.com/seu-usuario/bo2-rankeado/settings/environment-variables
2. Clique em "Add New"
3. Preencha:
   - **Name:** `BO2_SECRET`
   - **Value:** (cole a mesma chave do Passo 2)
   - **Environment:** Selecione "Production" (e "Preview" se quiser)
4. Clique em "Save"

### Passo 6: Testar

```powershell
cd backend_py
py bo2_log_uploader.py
```

Deve aparecer:
```
[INFO] Secret Key: *************** (length: XX)
```

Se mostrar `WARNING: BO2_SECRET vazio`, repita os passos.

---

## 🧪 Teste Completo

### Terminal 1 - Monitor de Logs:
```powershell
cd "C:\Users\Alan Araújo\Documents\BO2-RANKEADO\backend_py"
py bo2_log_uploader.py
```

### Terminal 2 - Servidor Web:
```powershell
cd "C:\Users\Alan Araújo\Documents\BO2-RANKEADO"
npm run dev
```

### Terminal 3 - Teste:
```powershell
cd "C:\Users\Alan Araújo\Documents\BO2-RANKEADO\backend_py"
.\test.cmd
```

---

## ❓ Troubleshooting

### "BO2_SECRET vazio"
- Você definiu com `/M`? (System variable)
- Reiniciou o PowerShell depois de definir?
- Execute novamente: `setx BO2_SECRET "sua_chave" /M`

### "Não autorizado" (403)
- Chave do Windows diferente da chave do Vercel
- Verifique com: `echo $env:BO2_SECRET`
- Atualize no Vercel com a mesma chave

### Python não encontrado
- Instale: https://www.python.org/downloads/
- Marque "Add to PATH" na instalação

---

## 📋 Checklist Final

- [ ] Gerei uma chave forte no PowerShell
- [ ] Configurei `BO2_SECRET` no Windows com `/M`
- [ ] Reiniciei todos os terminais PowerShell
- [ ] Verifiquei com `echo $env:BO2_SECRET`
- [ ] Configurei a mesma chave no Vercel
- [ ] Testei com `py bo2_log_uploader.py`
- [ ] O monitor mostra a chave mascarada
- [ ] Teste passou com sucesso

---

**🔒 SEGURANÇA:**
- ✅ Use chaves diferentes (Plutonium ≠ BO2_SECRET)
- ✅ Nunca compartilhe suas chaves
- ✅ Não commite chaves no Git
- ✅ Use chaves fortes (32+ caracteres aleatórios)
