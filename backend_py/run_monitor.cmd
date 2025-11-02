@echo off
:: BO2 Ranked - Monitor Runner
:: Este script define a BO2_SECRET e API_URL e inicia o monitor

set BO2_SECRET=9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5
set BO2_API_URL=https://rankops.vercel.app/api/update_stats

echo ====================================
echo BO2 RANKED - Monitor Starter
echo ====================================
echo.
echo Iniciando monitor com BO2_SECRET e API_URL configuradas...
echo.

py bo2_log_uploader.py

pause
