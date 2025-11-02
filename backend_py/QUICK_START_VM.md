# 🚀 GUIA RÁPIDO - COPIAR E COLAR NA VM

## ✅ PASSO A PASSO COMPLETO

### 1️⃣ COPIAR ARQUIVOS
Copie a pasta `backend_py` para a VM.
Sugestão: coloque em `C:\BO2-Monitor`

---

### 2️⃣ ABRIR POWERSHELL COMO ADMINISTRADOR
1. Pressione `Win + X`
2. Clique em "Windows PowerShell (Admin)" ou "Terminal (Admin)"

---

### 3️⃣ NAVEGAR PARA A PASTA
```powershell
cd C:\BO2-Monitor
```
*(Troque pelo caminho onde você copiou os arquivos)*

---

### 4️⃣ RODAR INSTALADOR AUTOMÁTICO
```powershell
.\install_vm.ps1
```

**Se der erro de execução bloqueada:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\install_vm.ps1
```

---

### 5️⃣ FECHAR E ABRIR NOVO POWERSHELL
Feche o PowerShell atual e abra um NOVO (não precisa ser admin).

---

### 6️⃣ NAVEGAR NOVAMENTE
```powershell
cd C:\BO2-Monitor
```

---

### 7️⃣ INICIAR O MONITOR
```powershell
.\run_monitor.cmd
```

**Pronto! O monitor está rodando!** 🎉

---

## 🧪 TESTAR (OPCIONAL)

Em outro PowerShell, sem fechar o monitor:

```powershell
cd C:\BO2-Monitor
.\test.cmd
```

---

## 🛑 PARAR O MONITOR

Pressione `Ctrl + C` no terminal do monitor.

---

## ❌ SE DER ERRO

### Erro: "BO2_SECRET not set"
```powershell
# Abrir PowerShell como ADMIN
setx BO2_SECRET "9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5" /M
```
Depois feche e abra novo PowerShell.

---

### Erro: "Log file not found"
Edite o arquivo `bo2_log_uploader.py` e altere a linha:
```python
LOG_FILE = r"C:\CAMINHO\CORRETO\DO\SEU\BO2\player_stats.txt"
```

**Caminhos comuns:**
- Steam: `C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt`
- Plutonium: `C:\Users\Administrator\AppData\Local\Plutonium\storage\t6\games_mp.log`

---

## ⚡ INSTALAÇÃO MANUAL (SE O AUTOMÁTICO FALHAR)

### Instalar Python:
```powershell
winget install Python.Python.3.12
```
Ou baixe em: https://www.python.org/downloads/

### Instalar requests:
```powershell
py -m pip install requests
```

### Configurar chave:
```powershell
# Como ADMIN
setx BO2_SECRET "9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5" /M
```

---

## 🎮 USAR COM JOGO

1. Inicie o monitor: `.\run_monitor.cmd`
2. Deixe o terminal aberto
3. Inicie o servidor BO2
4. Jogue normalmente
5. O monitor detecta automaticamente e envia para o site!

---

## 💡 DICA: ATALHO NA ÁREA DE TRABALHO

Se rodou o `install_vm.ps1`, já foi criado um atalho chamado **"BO2 Monitor"** na área de trabalho.
Basta clicar duas vezes nele para iniciar!
