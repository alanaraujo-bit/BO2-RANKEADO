# =====================================================
# CONFIGURAÇÃO DO SISTEMA DE LOGS - BO2 RANKED
# =====================================================

# PASSO 1: GERAR SUA CHAVE SECRETA
# ----------------------------------
# Execute este comando no PowerShell para gerar uma chave aleatória:

# Opção 1: Chave simples
# "MinhaSenhaSecreta_BO2_2025_$(Get-Random -Maximum 99999)"

# Opção 2: Chave forte (recomendado)
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
Write-Host "Sua chave secreta: $key"


# PASSO 2: DEFINIR NO WINDOWS
# ---------------------------
# PowerShell como ADMINISTRADOR:
# setx BO2_SECRET "SUA_CHAVE_AQUI" /M


# PASSO 3: DEFINIR NO VERCEL
# --------------------------
# 1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
# 2. Adicione:
#    Nome: BO2_SECRET
#    Valor: (mesma chave do passo 2)
#    Environment: Production


# EXEMPLO COMPLETO:
# -----------------
# Suponha que sua chave gerada seja: "Xyz123SecretKey456"
#
# No Windows (PowerShell como Admin):
# setx BO2_SECRET "Xyz123SecretKey456" /M
#
# No Vercel:
# BO2_SECRET = Xyz123SecretKey456
#
# Depois REINICIE o PowerShell antes de rodar o monitor!


# TESTE DE CONEXÃO:
# -----------------
# 1. Reinicie o PowerShell
# 2. cd backend_py
# 3. py bo2_log_uploader.py
# 4. Em outro terminal: .\test.cmd


# =====================================================
# NOTA SOBRE A SERVER KEY DO PLUTONIUM
# =====================================================
# A chave "p2kvIQvVmKOIazp8FlZQHYfrotWnyOxV" é para o servidor
# de jogo do Plutonium, NÃO use ela para o BO2_SECRET!
# 
# Mantenha essa chave separada na configuração do servidor
# dedicado do BO2.
# =====================================================
