#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Script para atualizar o HTML do perfil com os novos elementos

import re

# Ler o arquivo
with open('public/app.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Novo HTML para substituir
new_section = '''
            <!-- DETAILED STATS GRID (4 Cards) -->
            <div class="profile-detailed-stats">
                <div class="detailed-stat-card">
                    <div class="dstat-header">
                        <span class="dstat-icon">🎮</span>
                        <span class="dstat-label">PARTIDAS</span>
                    </div>
                    <div class="dstat-value" id="profileMatchesDetailed">0</div>
                    <div class="dstat-subtext">Total jogado</div>
                </div>

                <div class="detailed-stat-card win">
                    <div class="dstat-header">
                        <span class="dstat-icon">🏆</span>
                        <span class="dstat-label">VITÓRIAS</span>
                    </div>
                    <div class="dstat-value" id="profileWinsDetailed">0</div>
                    <div class="dstat-subtext">Sequência: <strong id="profileWinStreak">0</strong></div>
                </div>

                <div class="detailed-stat-card loss">
                    <div class="dstat-header">
                        <span class="dstat-icon">💀</span>
                        <span class="dstat-label">DERROTAS</span>
                    </div>
                    <div class="dstat-value" id="profileLossesDetailed">0</div>
                    <div class="dstat-subtext">Sequência: <strong id="profileLoseStreak">0</strong></div>
                </div>

                <div class="detailed-stat-card">
                    <div class="dstat-header">
                        <span class="dstat-icon">📈</span>
                        <span class="dstat-label">WINRATE</span>
                    </div>
                    <div class="dstat-value" id="profileWinrateDetailed">0%</div>
                    <div class="dstat-progress">
                        <div class="dstat-bar" id="winrateProgressBar" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <!-- K/D RATIO CARD -->
            <div class="profile-detailed-stats" style="grid-template-columns: 1fr; padding: 0 32px 24px;">
                <div class="detailed-stat-card">
                    <div class="dstat-header">
                        <span class="dstat-icon">💥</span>
                        <span class="dstat-label">K/D RATIO</span>
                    </div>
                    <div class="dstat-value" id="profileKDDetailed">0.00</div>
                    <div class="dstat-progress">
                        <div class="dstat-bar kd-bar" id="kdProgressBar" style="width: 0%"></div>
                    </div>
                    <div class="dstat-subtext">Máximo ideal: 3.00+</div>
                </div>
            </div>

            <!-- RANK PROGRESSION -->
            <div class="profile-rank-progression">
                <div class="rank-prog-header">
                    <span class="rank-prog-title">PROGRESSÃO DE RANK</span>
                    <span class="rank-prog-percentage" id="rankProgressPercent">0%</span>
                </div>
                <div class="rank-prog-bar-container">
                    <div class="rank-prog-bar" id="rankProgressBar" style="width: 0%">
                        <div class="rank-prog-glow"></div>
                    </div>
                </div>
                <div class="rank-prog-info" id="rankProgressInfo">
                    Faltam <strong>0 MMR</strong> para o próximo rank
                </div>
            </div>

            <!-- MATCH HISTORY SECTION -->
            <div class="profile-matches-section">
                <div class="matches-section-header">
                    <h3 class="matches-title">
                        <span class="matches-icon">📜</span>
                        HISTÓRICO DE PARTIDAS
                    </h3>
                    <div class="matches-subtitle">Últimas 10 partidas registradas</div>
                </div>
                <div class="matches-timeline-ultimate" id="profileMatchHistory">
                    <div class="empty-matches-ultimate">
                        <div class="empty-icon-mega">🎮</div>
                        <p>Nenhuma partida registrada ainda</p>
                        <div class="empty-subtext">As partidas aparecerão aqui após o primeiro jogo</div>
                    </div>
                </div>
            </div>
'''

# Padrão para encontrar e substituir (usando regex mais flexível)
pattern = r'<!-- Stats Overview -->.*?<!-- Match History -->.*?</div>\s*</div>\s*</div>'

# Substituir
new_content = re.sub(pattern, new_section, content, flags=re.DOTALL)

# Salvar
with open('public/app.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ HTML atualizado com sucesso!")
print("Seções substituídas: Stats Overview, Performance Metrics e Match History")
