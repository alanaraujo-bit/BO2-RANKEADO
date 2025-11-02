@echo off
echo ================================================
echo CONFIGURACAO DA CHAVE BO2_SECRET
echo ================================================
echo.
echo Este script vai configurar a chave BO2_SECRET
echo no sistema (variavel de ambiente global).
echo.
echo IMPORTANTE: Execute este arquivo como Administrador!
echo (Clique com botao direito > Executar como administrador)
echo.
pause

setx BO2_SECRET "9456165d6e357fd4866fe5d398850c5c36ffc0cb6e1cc483554be939629cdcc5" /M

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo [SUCESSO] BO2_SECRET configurado com sucesso!
    echo ================================================
    echo.
    echo Proximos passos:
    echo 1. FECHE todos os terminais PowerShell/CMD abertos
    echo 2. Abra um NOVO PowerShell
    echo 3. Teste com: echo $env:BO2_SECRET
    echo 4. Execute: cd backend_py
    echo 5. Execute: py bo2_log_uploader.py
    echo.
) else (
    echo.
    echo ================================================
    echo [ERRO] Falha ao configurar BO2_SECRET
    echo ================================================
    echo.
    echo Possivel causa: Nao esta executando como Administrador
    echo.
    echo Solucao:
    echo 1. Clique com botao direito neste arquivo
    echo 2. Selecione "Executar como administrador"
    echo.
)

pause
