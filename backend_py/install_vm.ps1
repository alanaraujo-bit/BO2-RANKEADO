# ====================================
# BO2 RANKED - INSTALADOR AUTOMÁTICO
# ====================================
# Execute este script como ADMINISTRADOR na VM

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "BO2 RANKED - INSTALADOR AUTOMÁTICO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERRO: Execute como ADMINISTRADOR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botão direito no PowerShell e selecione:" -ForegroundColor Yellow
    Write-Host "'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host "✅ Rodando como Administrador" -ForegroundColor Green
Write-Host ""

# ==========================
# PASSO 1: Verificar Python
# ==========================
Write-Host "📦 Verificando Python..." -ForegroundColor Yellow

$pythonVersion = $null
try {
    $pythonVersion = py --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalando Python automaticamente..." -ForegroundColor Yellow
    
    # Tentar instalar via winget
    try {
        winget install Python.Python.3.12 --silent
        Write-Host "✅ Python instalado!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Não foi possível instalar automaticamente." -ForegroundColor Red
        Write-Host "Por favor, instale manualmente:" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://www.python.org/downloads/" -ForegroundColor Cyan
        Write-Host "2. Baixe e instale Python 3.12" -ForegroundColor Cyan
        Write-Host "3. MARQUE a opção 'Add Python to PATH'" -ForegroundColor Cyan
        Write-Host "4. Execute este script novamente" -ForegroundColor Cyan
        pause
        exit
    }
}

Write-Host ""

# ===============================
# PASSO 2: Instalar biblioteca
# ===============================
Write-Host "📚 Instalando biblioteca 'requests'..." -ForegroundColor Yellow

try {
    py -m pip install requests --quiet
    Write-Host "✅ Biblioteca 'requests' instalada!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao instalar. Tentando novamente..." -ForegroundColor Yellow
    py -m pip install --upgrade pip
    py -m pip install requests
}

Write-Host ""

# ================================
# PASSO 3: Configurar BO2_SECRET
# ================================
Write-Host "🔐 Configurando BO2_SECRET..." -ForegroundColor Yellow

$BO2_SECRET = "9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5"

try {
    [System.Environment]::SetEnvironmentVariable("BO2_SECRET", $BO2_SECRET, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ BO2_SECRET configurada no sistema!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar BO2_SECRET" -ForegroundColor Red
    Write-Host "Execute manualmente:" -ForegroundColor Yellow
    Write-Host "setx BO2_SECRET `"$BO2_SECRET`" /M" -ForegroundColor Cyan
}

Write-Host ""

# =================================
# PASSO 4: Detectar caminho do BO2
# =================================
Write-Host "🔍 Detectando instalação do BO2..." -ForegroundColor Yellow

$possiblePaths = @(
    "C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II",
    "C:\Program Files\Steam\steamapps\common\Call of Duty Black Ops II",
    "D:\Steam\steamapps\common\Call of Duty Black Ops II",
    "E:\Steam\steamapps\common\Call of Duty Black Ops II"
)

$bo2Path = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $bo2Path = $path
        Write-Host "✅ BO2 encontrado em: $path" -ForegroundColor Green
        break
    }
}

if (-not $bo2Path) {
    Write-Host "⚠️ BO2 não encontrado automaticamente" -ForegroundColor Yellow
    Write-Host "Você precisará configurar o caminho manualmente no arquivo bo2_log_uploader.py" -ForegroundColor Yellow
}

Write-Host ""

# =============================
# PASSO 5: Criar atalho
# =============================
Write-Host "🔗 Criando atalho na área de trabalho..." -ForegroundColor Yellow

$currentDir = Get-Location
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\BO2 Monitor.lnk"

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/k cd /d `"$currentDir`" && run_monitor.cmd"
    $Shortcut.WorkingDirectory = $currentDir
    $Shortcut.Description = "BO2 Ranked - Monitor de Logs"
    $Shortcut.Save()
    Write-Host "✅ Atalho criado na área de trabalho!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível criar atalho" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. FECHE este PowerShell" -ForegroundColor Yellow
Write-Host "2. Abra um NOVO PowerShell (para carregar a BO2_SECRET)" -ForegroundColor Yellow
Write-Host "3. Execute:" -ForegroundColor Yellow
Write-Host "   cd $currentDir" -ForegroundColor White
Write-Host "   .\run_monitor.cmd" -ForegroundColor White
Write-Host ""
Write-Host "OU use o atalho 'BO2 Monitor' criado na área de trabalho!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar sem jogar, execute:" -ForegroundColor Yellow
Write-Host "   .\test.cmd" -ForegroundColor White
Write-Host ""
pause
