@echo off
setlocal

REM === Checagem de variáveis ===
if not defined BO2_SECRET (
	echo [ERRO] BO2_SECRET nao definido. Defina com: setx BO2_SECRET "432423425252552542" /M
	echo Pressione uma tecla para sair...
	pause >nul
	exit /b 1
)

REM === Diretorio do script ===
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Defaults (apenas para esta sessao)
if not defined BO2_API_URL set "BO2_API_URL=https://rankops.vercel.app/api/update_stats"
if not defined BO2_LOG_FILE set "BO2_LOG_FILE=C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt"

echo Iniciando uploader...
echo   API: %BO2_API_URL%
echo   LOG: %BO2_LOG_FILE%

REM Garante que o arquivo de log existe
if not exist "%BO2_LOG_FILE%" type nul > "%BO2_LOG_FILE%"

REM === Descobre Python ===
set "PYEXE="
if exist "C:\Program Files\Python312\python.exe" set "PYEXE=C:\Program Files\Python312\python.exe"
if not defined PYEXE where py >nul 2>&1 && set "PYEXE=py"
if not defined PYEXE where python >nul 2>&1 && set "PYEXE=python"
if not defined PYEXE (
	echo [ERRO] Python nao encontrado no PATH nem em "C:\Program Files\Python312\python.exe".
	echo Instale o Python 3.12 ou adicione "python"/"py" ao PATH.
	echo Pressione uma tecla para sair...
	pause >nul
	exit /b 1
)

echo Usando Python: %PYEXE%
"%PYEXE%" -u "%SCRIPT_DIR%bo2_log_uploader.py" >> "%SCRIPT_DIR%uploader.out.log" 2>&1
set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
	echo [ERRO] Execucao retornou codigo %ERR%. Veja "%SCRIPT_DIR%uploader.out.log".
	echo Pressione uma tecla para sair...
	pause >nul
) else (
	echo Uploader finalizado. Veja "%SCRIPT_DIR%uploader.out.log".
)

endlocal
