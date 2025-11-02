# Script para RECALCULAR wins/losses/MMR a partir das partidas existentes

$SECRET = $env:BO2_SECRET
if (-not $SECRET) {
    Write-Host "❌ ERRO: BO2_SECRET não definida!" -ForegroundColor Red
    Write-Host "Configure com: setx BO2_SECRET `"sua_chave`" /M" -ForegroundColor Yellow
    exit 1
}

$API_URL = "https://rankops.vercel.app/api/recalculate_matches"

Write-Host "`n══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🏆 RECÁLCULO DE PARTIDAS - WINS/LOSSES/MMR" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "⚠️  Este script vai:" -ForegroundColor Yellow
Write-Host "   1. Buscar TODAS as partidas salvas" -ForegroundColor Yellow
Write-Host "   2. Calcular vitórias e derrotas" -ForegroundColor Yellow
Write-Host "   3. Atualizar MMR de todos os players`n" -ForegroundColor Yellow

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
    
    $body = "{}"
    
    $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -Body $body -TimeoutSec 300
    
    Write-Host "`n✅ SUCESSO!" -ForegroundColor Green
    Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
    Write-Host "   Partidas encontradas:   $($response.stats.matchesFound)" -ForegroundColor White
    Write-Host "   Partidas processadas:   $($response.stats.matchesProcessed)" -ForegroundColor White
    Write-Host "   Erros:                  $($response.stats.errors)" -ForegroundColor White
    
    Write-Host "`n✨ Partidas recalculadas com sucesso!" -ForegroundColor Green
    Write-Host "   Acesse: https://rankops.vercel.app/app.html#leaderboard" -ForegroundColor Cyan
    
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

Write-Host "`n══════════════════════════════════════════════════`n" -ForegroundColor Cyan
