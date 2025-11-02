# Script para RECALCULAR TODAS as estatísticas do zero
# Executa a API /api/recalculate_stats que:
# 1. Zera todas as estatísticas dos players
# 2. Re-processa todos os eventos de kills salvos
# 3. Recalcula tudo corretamente

$SECRET = $env:BO2_SECRET
if (-not $SECRET) {
    Write-Host "❌ ERRO: BO2_SECRET não definida!" -ForegroundColor Red
    Write-Host "Configure com: setx BO2_SECRET `"sua_chave`" /M" -ForegroundColor Yellow
    exit 1
}

$API_URL = "https://rankops.vercel.app/api/recalculate_stats"

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     🔄 RECÁLCULO DE ESTATÍSTICAS - BO2 RANKED" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "⚠️  ATENÇÃO: Este script vai:" -ForegroundColor Yellow
Write-Host "   1. ZERAR todas as estatísticas atuais" -ForegroundColor Yellow
Write-Host "   2. Re-processar TODOS os eventos de kills" -ForegroundColor Yellow
Write-Host "   3. Recalcular estatísticas do ZERO`n" -ForegroundColor Yellow

$confirmation = Read-Host "Deseja continuar? (S/N)"
if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host "`n❌ Operação cancelada." -ForegroundColor Red
    exit 0
}

Write-Host "`n🚀 Enviando requisição para $API_URL..." -ForegroundColor Green

try {
    $headers = @{
        "Authorization" = "Bearer $SECRET"
        "Content-Type" = "application/json"
    }
    
    $body = "{}" | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -Body $body -TimeoutSec 300
    
    Write-Host "`n✅ SUCESSO!" -ForegroundColor Green
    Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
    Write-Host "   Players resetados:    $($response.stats.playersReset)" -ForegroundColor White
    Write-Host "   Kills encontradas:    $($response.stats.killsFound)" -ForegroundColor White
    Write-Host "   Kills processadas:    $($response.stats.killsProcessed)" -ForegroundColor White
    Write-Host "   Erros:                $($response.stats.errors)" -ForegroundColor White
    
    Write-Host "`n✨ Estatísticas recalculadas com sucesso!" -ForegroundColor Green
    Write-Host "   Acesse: https://rankops.vercel.app/app.html#profile" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ ERRO ao executar recálculo:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status HTTP: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 403) {
            Write-Host "   Verifique se BO2_SECRET está correto!" -ForegroundColor Yellow
        }
    }
    
    exit 1
}

Write-Host "`n═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
