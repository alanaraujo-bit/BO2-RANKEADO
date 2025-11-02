# 🚀 GUIA DE INSTALAÇÃO RÁPIDA

## Passo 1: Instalar Python
1. Baixe Python 3.12: https://www.python.org/downloads/
2. Durante instalação: **✅ MARQUE "Add Python to PATH"**
3. Clique em "Install Now"

## Passo 2: Instalar Requests
Abra PowerShell como **Administrador**:

```powershell
py -m pip install requests
```

## Passo 3: Configurar Chave Secreta
No PowerShell como **Administrador**:

```powershell
setx BO2_SECRET "sua_chave_aqui" /M
```

⚠️ **IMPORTANTE:** Troque "sua_chave_aqui" pela mesma chave do servidor!

## Passo 4: Testar
Feche e abra novamente o PowerShell, depois:

```powershell
cd "caminho\para\backend_py"
.\run_uploader.cmd
```

Ou:

```powershell
py bo2_log_uploader.py
```

## ✅ Pronto!
O monitor está rodando. Adicione linhas ao arquivo de log para testar:

```
KILL: PlayerA -> PlayerB [M4A1] (headshot)
```

---

**Problemas?** Veja o README_NEW.md completo.
