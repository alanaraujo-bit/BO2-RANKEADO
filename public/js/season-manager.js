/* ===================================================================
   BO2 RANKED - SEASON MANAGER
   Gerenciamento completo de temporadas, reset e soft MMR
   ================================================================ */

const SeasonManager = {
    
    /**
     * Aplica soft reset no MMR do jogador baseado na patente final
     * @param {number} finalMMR - MMR final da temporada anterior
     * @param {string} finalRank - Patente final (ex: "Lenda", "Diamante I")
     * @returns {number} Novo MMR após soft reset
     */
    applySoftReset(finalMMR, finalRank) {
        // Extrai a patente base (remove divisões como I, II, III)
        const rankBase = finalRank.split(' ')[0].toLowerCase();
        
        // Mapeamento de patentes para multiplicadores
        const multipliers = {
            'lenda': 0.85,
            'mestre': 0.80,
            'diamante': 0.75,
            'platina': 0.70,
            'ouro': 0.65,
            'prata': 0.60,
            'bronze': 0.50
        };
        
        // MMR mínimo garantido por patente
        const minimumMMR = {
            'lenda': 1800,
            'mestre': 1500,
            'diamante': 1200,
            'platina': 1000,
            'ouro': 850,
            'prata': 700,
            'bronze': 500
        };
        
        // Pega o multiplicador (padrão: 0.60 se não encontrar)
        const multiplier = multipliers[rankBase] || 0.60;
        const minMMR = minimumMMR[rankBase] || 500;
        
        // Calcula novo MMR
        let newMMR = Math.floor(finalMMR * multiplier);
        
        // Garante o MMR mínimo
        newMMR = Math.max(newMMR, minMMR);
        
        // Log do reset
        console.log(`🔄 Soft Reset: ${finalMMR} → ${newMMR} (${finalRank})`);
        console.log(`   Multiplicador: ${multiplier} | Mínimo: ${minMMR}`);
        console.log(`   Perda: ${finalMMR - newMMR} pontos (${Math.round((1 - multiplier) * 100)}%)`);
        
        return newMMR;
    },
    
    /**
     * Finaliza temporada: calcula Top 3, distribui recompensas
     * @param {Object} season - Objeto da temporada
     * @param {Array} allPlayers - Array com todos os jogadores
     * @returns {Object} Resultado da finalização
     */
    finalizeSeason(season, allPlayers) {
        console.log(`\n🏁 Finalizando temporada: ${season.displayName}\n`);
        
        // 1. Filtra jogadores qualificados (mínimo de partidas)
        const qualifiedPlayers = allPlayers.filter(player => {
            const progress = player.seasonProgress?.[season._id];
            return progress && progress.gamesPlayed >= season.settings.minGamesForRewards;
        });
        
        console.log(`   Jogadores qualificados: ${qualifiedPlayers.length}`);
        
        // 2. Ordena por MMR (maior primeiro)
        qualifiedPlayers.sort((a, b) => {
            const mmrA = a.seasonProgress[season._id].mmr;
            const mmrB = b.seasonProgress[season._id].mmr;
            return mmrB - mmrA;
        });
        
        // 3. Identifica Top 3
        const top3 = qualifiedPlayers.slice(0, 3);
        
        // 4. Distribui recompensas
        const rewards = {
            top1: null,
            top2: null,
            top3: null,
            veterans: []
        };
        
        if (top3[0]) {
            rewards.top1 = {
                playerId: top3[0].id,
                playerName: top3[0].name,
                mmr: top3[0].seasonProgress[season._id].mmr,
                badge: season.rewards.top1.badge,
                rank: top3[0].seasonProgress[season._id].rank
            };
            console.log(`   🥇 Top 1: ${rewards.top1.playerName} (${rewards.top1.mmr} MMR)`);
        }
        
        if (top3[1]) {
            rewards.top2 = {
                playerId: top3[1].id,
                playerName: top3[1].name,
                mmr: top3[1].seasonProgress[season._id].mmr,
                badge: season.rewards.top2.badge,
                rank: top3[1].seasonProgress[season._id].rank
            };
            console.log(`   🥈 Top 2: ${rewards.top2.playerName} (${rewards.top2.mmr} MMR)`);
        }
        
        if (top3[2]) {
            rewards.top3 = {
                playerId: top3[2].id,
                playerName: top3[2].name,
                mmr: top3[2].seasonProgress[season._id].mmr,
                badge: season.rewards.top3.badge,
                rank: top3[2].seasonProgress[season._id].rank
            };
            console.log(`   🥉 Top 3: ${rewards.top3.playerName} (${rewards.top3.mmr} MMR)`);
        }
        
        // 5. Distribui badge de veterano para todos qualificados
        qualifiedPlayers.forEach(player => {
            rewards.veterans.push({
                playerId: player.id,
                playerName: player.name,
                badge: season.rewards.participation.badge
            });
        });
        
        console.log(`   🎖️  Veterans: ${rewards.veterans.length} badges distribuídas\n`);
        
        // 6. Atualiza season com resultados finais
        season.active = false;
        season.leaderboard = qualifiedPlayers.slice(0, 100).map((player, index) => ({
            position: index + 1,
            playerId: player.id,
            playerName: player.name,
            mmr: player.seasonProgress[season._id].mmr,
            rank: player.seasonProgress[season._id].rank,
            wins: player.seasonProgress[season._id].wins,
            losses: player.seasonProgress[season._id].losses,
            gamesPlayed: player.seasonProgress[season._id].gamesPlayed,
            winRate: player.seasonProgress[season._id].winRate,
            kd: player.seasonProgress[season._id].kd
        }));
        
        season.statistics = {
            totalPlayers: qualifiedPlayers.length,
            totalMatches: allPlayers.reduce((sum, p) => {
                const progress = p.seasonProgress?.[season._id];
                return sum + (progress?.gamesPlayed || 0);
            }, 0) / 2, // Divide por 2 pois cada partida conta para 2 players
            avgMMR: Math.round(qualifiedPlayers.reduce((sum, p) => 
                sum + p.seasonProgress[season._id].mmr, 0) / qualifiedPlayers.length),
            topMMR: qualifiedPlayers[0]?.seasonProgress[season._id].mmr || 0
        };
        
        season.updatedAt = new Date().toISOString();
        
        console.log('✅ Temporada finalizada com sucesso!\n');
        
        return {
            season,
            rewards,
            leaderboard: season.leaderboard
        };
    },
    
    /**
     * Aplica soft reset em todos os jogadores
     * @param {Array} allPlayers - Array com todos os jogadores
     * @param {string} seasonId - ID da temporada que está resetando
     * @returns {Array} Players com MMR resetado
     */
    applyResetToAllPlayers(allPlayers, seasonId) {
        console.log('\n🔄 Aplicando soft reset em todos os jogadores...\n');
        
        let resetCount = 0;
        
        allPlayers.forEach(player => {
            const seasonProgress = player.seasonProgress?.[seasonId];
            
            if (seasonProgress && seasonProgress.gamesPlayed > 0) {
                const finalMMR = seasonProgress.mmr;
                const finalRank = seasonProgress.rank;
                
                // Calcula novo MMR
                const newMMR = this.applySoftReset(finalMMR, finalRank);
                
                // Atualiza player
                player.mmr = newMMR;
                player.rank = this.getRankFromMMR(newMMR);
                
                // Salva histórico da temporada anterior
                if (!player.seasonHistory) {
                    player.seasonHistory = [];
                }
                
                player.seasonHistory.push({
                    seasonId: seasonId,
                    seasonNumber: seasonProgress.seasonNumber,
                    seasonName: seasonProgress.seasonName,
                    finalRank: finalRank,
                    finalMMR: finalMMR,
                    newMMR: newMMR,
                    position: seasonProgress.leaderboardPosition,
                    gamesPlayed: seasonProgress.gamesPlayed,
                    wins: seasonProgress.wins,
                    losses: seasonProgress.losses,
                    winRate: seasonProgress.winRate,
                    kd: seasonProgress.kd,
                    badges: seasonProgress.badges || [],
                    resetDate: new Date().toISOString()
                });
                
                resetCount++;
            }
        });
        
        console.log(`✅ ${resetCount} jogadores resetados!\n`);
        
        return allPlayers;
    },
    
    /**
     * Retorna patente baseada no MMR
     * @param {number} mmr - Pontos MMR
     * @returns {string} Nome da patente
     */
    getRankFromMMR(mmr) {
        if (mmr >= 2400) return 'Lenda';
        if (mmr >= 2200) return 'Mestre III';
        if (mmr >= 2000) return 'Mestre II';
        if (mmr >= 1850) return 'Mestre I';
        if (mmr >= 1700) return 'Diamante III';
        if (mmr >= 1550) return 'Diamante II';
        if (mmr >= 1400) return 'Diamante I';
        if (mmr >= 1300) return 'Platina III';
        if (mmr >= 1200) return 'Platina II';
        if (mmr >= 1100) return 'Platina I';
        if (mmr >= 1050) return 'Ouro III';
        if (mmr >= 1000) return 'Ouro II';
        if (mmr >= 950) return 'Ouro I';
        if (mmr >= 900) return 'Prata III';
        if (mmr >= 850) return 'Prata II';
        if (mmr >= 800) return 'Prata I';
        if (mmr >= 700) return 'Bronze III';
        if (mmr >= 600) return 'Bronze II';
        return 'Bronze I';
    },
    
    /**
     * Verifica se hoje é último dia do mês
     * @returns {boolean} True se for último dia do mês
     */
    isLastDayOfMonth() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return today.getMonth() !== tomorrow.getMonth();
    },
    
    /**
     * Cria próxima temporada automaticamente
     * @param {number} nextSeasonNumber - Número da próxima temporada
     * @param {Object} seasonData - Dados da próxima temporada
     * @returns {Object} Nova temporada
     */
    createNextSeason(nextSeasonNumber, seasonData) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Mês atual (1-12)
        
        // Primeiro dia do próximo mês
        const startDate = new Date(year, month, 1, 0, 0, 0);
        
        // Último dia do próximo mês
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = new Date(year, month, lastDay, 23, 59, 59);
        
        const seasonId = `s${nextSeasonNumber}-${seasonData.name.toLowerCase()}`;
        
        return {
            _id: seasonId,
            seasonNumber: nextSeasonNumber,
            name: seasonData.name,
            displayName: `Season ${nextSeasonNumber}: ${seasonData.name}`,
            description: seasonData.description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            active: true,
            rewards: {
                top1: {
                    badge: `👑 ${seasonData.name} SUPREME CHAMPION`,
                    icon: '👑',
                    color: '#FFD700',
                    rarity: 'legendary'
                },
                top2: {
                    badge: `💎 ${seasonData.name} ELITE MASTER`,
                    icon: '💎',
                    color: '#C0C0C0',
                    rarity: 'epic'
                },
                top3: {
                    badge: `⭐ ${seasonData.name} TACTICAL EXPERT`,
                    icon: '⭐',
                    color: '#CD7F32',
                    rarity: 'rare'
                },
                participation: {
                    badge: `🎖️ ${seasonData.name} VETERAN`,
                    icon: '🎖️',
                    minGames: 15,
                    rarity: 'common'
                }
            },
            settings: {
                minGamesForRewards: 15,
                softResetMultipliers: {
                    legend: 0.85,
                    master: 0.80,
                    diamond: 0.75,
                    platinum: 0.70,
                    gold: 0.65,
                    silver: 0.60,
                    bronze: 0.50
                },
                minimumMMRAfterReset: {
                    legend: 1800,
                    master: 1500,
                    diamond: 1200,
                    platinum: 1000,
                    gold: 850,
                    silver: 700,
                    bronze: 500
                }
            },
            leaderboard: [],
            statistics: {
                totalPlayers: 0,
                totalMatches: 0,
                avgMMR: 0,
                topMMR: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
};

// ====================================================================
// EXPORTS
// ====================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeasonManager;
}

if (typeof window !== 'undefined') {
    window.SeasonManager = SeasonManager;
}
