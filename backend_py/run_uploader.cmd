@echo off
REM ====== CONFIGURE AQUI ======
set "BO2_SECRET=432423425625625542"
set "BO2_API_URL=https://bo2-ranked.vercel.app/api/update_stats"
set "BO2_LOG_FILE=C:\caminho\para\player_stats.txt"
REM =============================

cd /d %~dp0
echo Iniciando uploader com:
echo   BO2_API_URL=%BO2_API_URL%
echo   BO2_LOG_FILE=%BO2_LOG_FILE%
py -u bo2_log_uploader.py >> uploader.out.log 2>&1
echo Uploader finalizado. Veja uploader.out.log para detalhes.
