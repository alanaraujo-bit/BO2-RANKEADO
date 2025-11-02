# 🖥️ GUIA DE INSTALAÇÃO NA VM DO BO2

## 📦 PASSO 1: COPIAR ARQUIVOS PARA A VM

Copie TODA a pasta `backend_py` para a VM. Você pode usar:
- **Área de Transferência Remota** (se estiver usando RDP)
- **Upload via FTP/SFTP**
- **Google Drive/Dropbox** e baixar na VM
- **GitHub** (fazer push e pull na VM)

Sugestão de caminho na VM:
```
C:\BO2-Monitor\
```

---

## 🐍 PASSO 2: INSTALAR PYTHON NA VM

### Opção A - Download Manual:
1. Acesse: https://www.python.org/downloads/
2. Baixe Python 3.12 ou 3.11
3. **IMPORTANTE:** Marque "Add Python to PATH" na instalação!

### Opção B - Usando winget (se disponível):
```powershell
winget install Python.Python.3.12
```

### Verificar instalação:
```powershell
py --version
```

---

## 📚 PASSO 3: INSTALAR BIBLIOTECA REQUESTS

```powershell
py -m pip install requests
```

---

## 🔐 PASSO 4: CONFIGURAR BO2_SECRET

### Método 1 - Automático (Recomendado):

```powershell
# Abrir PowerShell como ADMINISTRADOR
cd C:\BO2-Monitor

# Rodar o script de configuração
.\setup_secret_windows.cmd
```

### Método 2 - Manual:

```powershell
# Abrir PowerShell como ADMINISTRADOR
setx BO2_SECRET "9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5" /M
```

**IMPORTANTE:** Após configurar, **FECHE E ABRA UM NOVO PowerShell** para a variável ser carregada!

---

## 📝 PASSO 5: VERIFICAR CAMINHO DO LOG DO BO2

Abra o arquivo `bo2_log_uploader.py` e verifique se o caminho está correto:

```python
LOG_FILE = r"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt"
```

Se o seu BO2 estiver em outro lugar (Plutonium, por exemplo), altere para o caminho correto.

### Caminhos comuns:

**Steam:**
```
C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt
```

**Plutonium:**
```
C:\Users\Administrator\AppData\Local\Plutonium\storage\t6\games_mp.log
```

**Plutonium (alternativo):**
```
%LOCALAPPDATA%\Plutonium\storage\t6\games_mp.log
```

---

## 🚀 PASSO 6: INICIAR O MONITOR

```powershell
cd C:\BO2-Monitor

# Usar o script iniciador
.\run_monitor.cmd
```

Você deve ver:
```
====================================
BO2 RANKED - Monitor Starter
====================================

Iniciando monitor com BO2_SECRET configurada...

[2025-11-01 22:30:35] INFO: ============================================================
[2025-11-01 22:30:35] INFO: BO2 RANKED - LOG MONITOR STARTED
[2025-11-01 22:30:35] INFO: ============================================================
[2025-11-01 22:30:35] INFO: API URL: https://seu-site.vercel.app/api/update_stats
[2025-11-01 22:30:35] INFO: Log File: C:\Program Files (x86)\...
[2025-11-01 22:30:35] INFO: Secret: 9456...dcc5 (masked)
[2025-11-01 22:30:35] INFO: Check Interval: 2s
[2025-11-01 22:30:35] INFO: Waiting for log file...
```

---

## ✅ PASSO 7: TESTAR (OPCIONAL)

Em outro PowerShell (sem fechar o monitor):

```powershell
cd C:\BO2-Monitor
.\test.cmd
```

Isso simula eventos de jogo. Você deve ver no monitor:
```
[INFO] Kill detected: Player1 killed Player2 with M4A1
[INFO] Data sent successfully!
```

---

## 🔄 MANTER RODANDO SEMPRE

### Opção 1 - Deixar Terminal Aberto:
- Mantenha o PowerShell com `run_monitor.cmd` aberto
- **Desvantagem:** Se fechar o terminal, para de funcionar

### Opção 2 - Criar Serviço do Windows (Recomendado):
Crie um script que inicia automaticamente quando a VM liga. (Posso criar isso se quiser!)

### Opção 3 - Task Scheduler:
Configure o Windows para iniciar o monitor automaticamente.

---

## 🐛 PROBLEMAS COMUNS

### "BO2_SECRET not set!"
**Solução:**
1. Rode `setup_secret_windows.cmd` como Administrador
2. FECHE e ABRA um novo PowerShell
3. Ou use `run_monitor.cmd` que já define a variável

### "can't open file..."
**Solução:**
- Verifique se você está no diretório correto: `cd C:\BO2-Monitor`
- Use caminho completo: `py C:\BO2-Monitor\bo2_log_uploader.py`

### "Log file not found"
**Solução:**
1. Verifique o caminho do log no arquivo `bo2_log_uploader.py`
2. Rode o servidor BO2 primeiro para gerar o arquivo de log
3. Se usar Plutonium, use o caminho do Plutonium

### "Connection refused" ou "Failed to send data"
**Solução:**
- Verifique se a URL da API está correta em `bo2_log_uploader.py`
- Teste se consegue acessar: https://seu-site.vercel.app/api/health
- Verifique firewall da VM

---

## 📊 VERIFICAR SE ESTÁ FUNCIONANDO

1. **Monitor mostra:** `Waiting for log file...` ou `Monitoring log file...`
2. **Jogue uma partida** no servidor BO2
3. **Monitor detecta kills:** `Kill detected: ...`
4. **Site atualiza:** Acesse seu site e veja o ranking atualizar

---

## 🆘 PRECISA DE AJUDA?

Verifique os logs do monitor para ver erros detalhados. Todos os eventos são registrados com timestamp!
