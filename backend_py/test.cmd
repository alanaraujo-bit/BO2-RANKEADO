@echo off
echo ========================================
echo BO2 RANKED - TESTE DO LOG UPLOADER
echo ========================================
echo.

REM Testa se Python está instalado
py --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Instale Python 3.12 de: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python instalado
echo.

REM Testa se requests está instalado
py -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Biblioteca 'requests' nao encontrada!
    echo Execute: py -m pip install requests
    pause
    exit /b 1
)

echo [OK] Biblioteca 'requests' instalada
echo.

REM Verifica BO2_SECRET
if not defined BO2_SECRET (
    echo [AVISO] BO2_SECRET nao definido!
    echo Configure com: setx BO2_SECRET "sua_chave" /M
    echo.
) else (
    echo [OK] BO2_SECRET configurado
    echo.
)

echo ========================================
echo Iniciando teste...
echo ========================================
echo.
echo O teste vai adicionar eventos ao arquivo de log.
echo Tenha o monitor (bo2_log_uploader.py) rodando em outro terminal.
echo.
pause

py test_uploader.py

echo.
echo ========================================
echo Teste concluido!
echo ========================================
pause
