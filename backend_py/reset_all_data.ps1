# Script para RESETAR TODOS OS DADOS do sistema
# ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!
# 
# Deleta:
# - Todas as kills salvas
# - Todas as matches salvas
# - Todos os events
# - Reseta estatísticas de TODOS os players para ZERO

$SECRET = $env:BO2_SECRET
if (-not $SECRET) {
    Write-Host "❌ ERRO: BO2_SECRET não definida!" -ForegroundColor Red
    Write-Host "Configure com: setx BO2_SECRET `"sua_chave`" /M" -ForegroundColor Yellow
    exit 1
}

$API_URL = "https://rankops.vercel.app/api/reset_all_data"

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "     🔥 RESET COMPLETO - BO2 RANKED" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Red

Write-Host "⚠️  ⚠️  ⚠️  ATENÇÃO MÁXIMA! ⚠️  ⚠️  ⚠️`n" -ForegroundColor Yellow
Write-Host "Este script vai DELETAR PERMANENTEMENTE:" -ForegroundColor Red
Write-Host "   ❌ TODAS as kills registradas" -ForegroundColor Red
Write-Host "   ❌ TODAS as partidas salvas" -ForegroundColor Red
Write-Host "   ❌ TODOS os eventos" -ForegroundColor Red
Write-Host "   ❌ TODAS as estatísticas dos players" -ForegroundColor Red
Write-Host "`n   ✅ Os players continuarão cadastrados" -ForegroundColor Green
Write-Host "   ✅ Apenas as ESTATÍSTICAS serão zeradas`n" -ForegroundColor Green

Write-Host "🚨 ESTA OPERAÇÃO É IRREVERSÍVEL! 🚨`n" -ForegroundColor Red

$confirmation = Read-Host "Digite 'RESETAR TUDO' para confirmar (qualquer outra coisa cancela)"
if ($confirmation -ne 'RESETAR TUDO') {
    Write-Host "`n✅ Operação cancelada. Nenhum dado foi alterado." -ForegroundColor Green
    exit 0
}

Write-Host "`n⚠️  Última chance! Digite 'SIM' para continuar" -ForegroundColor Yellow
$finalConfirmation = Read-Host
if ($finalConfirmation -ne 'SIM') {
    Write-Host "`n✅ Operação cancelada. Nenhum dado foi alterado." -ForegroundColor Green
    exit 0
}

Write-Host "`n🔥 Iniciando RESET COMPLETO..." -ForegroundColor Red
Write-Host "🚀 Enviando requisição para $API_URL...`n" -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $SECRET"
        "Content-Type" = "application/json"
    }
    
    $body = "{}" | ConvertTo-Json
    
    Write-Host "⏳ Aguarde... Isso pode levar alguns minutos...`n" -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -Body $body -TimeoutSec 300
    
    Write-Host "✅ RESET COMPLETO EXECUTADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
    Write-Host "   Kills deletadas:      $($response.stats.deletedKills)" -ForegroundColor White
    Write-Host "   Matches deletadas:    $($response.stats.deletedMatches)" -ForegroundColor White
    Write-Host "   Events deletados:     $($response.stats.deletedEvents)" -ForegroundColor White
    Write-Host "   Players resetados:    $($response.stats.resetPlayers)" -ForegroundColor White
    Write-Host "   ───────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "   TOTAL DELETADO:       $($response.stats.totalDeleted) registros" -ForegroundColor Yellow
    
    Write-Host "`n🎮 Sistema resetado! Todos começam do ZERO novamente!" -ForegroundColor Green
    Write-Host "   Acesse: https://rankops.vercel.app" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ ERRO ao executar reset:" -ForegroundColor Red
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

Write-Host "`n═══════════════════════════════════════════════════`n" -ForegroundColor Red
