// BO2 RANKED - ADVANCED MMR CALCULATION SYSTEM
// Professional Elo-based system with dynamic K-factor, provisional mode, and anti-abuse

const MMRSystem = {
    // Configuration
    config: {
        baseK: 32,
        provisionalGames: 10,
        provisionalMultiplier: 2.0,
        activityPenaltyStart: 5, // games per day before penalty
        activityPenaltyRate: 0.05,
        maxDeltaCap: 100,
        minK: 8,
        decayDays: 30,
        decayPerWeek: 10,
        minMMR: 0,
    startingMMR: 999
    },
    
    /**
     * Calculate expected score using Elo formula
     * @param {number} mmrA - Player A's MMR
     * @param {number} mmrB - Player B's MMR (or average for team)
     * @returns {number} Expected score (0-1)
     */
    expectedScore(mmrA, mmrB) {
        return 1 / (1 + Math.pow(10, (mmrB - mmrA) / 400));
    },
    
    /**
     * Calculate dynamic K-factor based on player activity and status
     * @param {Object} params - Configuration parameters
     * @returns {number} Adjusted K-factor
     */
    dynamicK({
        baseK = this.config.baseK,
        gamesPlayed = 0,
        isProvisional = false,
        importance = 1.0,
        recentActivityCount = 1,
        partySize = 1
    }) {
        // Provisional factor (2x for first 10 games)
        const provisionalFactor = isProvisional ? this.config.provisionalMultiplier : 1.0;
        
        // Activity factor (reduce K if farming)
        const activityOverflow = Math.max(0, recentActivityCount - this.config.activityPenaltyStart);
        const activityFactor = Math.max(0.5, 1 - activityOverflow * this.config.activityPenaltyRate);
        
        // Party penalty (reduce gains when in large parties)
        const partyPenalty = partySize > 1 ? Math.max(0.7, 1 - (partySize - 1) * 0.1) : 1.0;
        
        // Calculate final K
        let k = Math.round(baseK * provisionalFactor * importance * activityFactor * partyPenalty);
        
        // Floor K
        return Math.max(this.config.minK, k);
    },
    
    /**
     * Calculate MMR change for a 1v1 match
     * @param {number} mmrA - Player A's MMR
     * @param {number} mmrB - Player B's MMR
     * @param {string} result - 'win', 'loss', or 'draw'
     * @param {Object} playerAStats - Player A's stats
     * @returns {Object} Delta and new MMRs
     */
    calculate1v1({
        mmrA,
        mmrB,
        result,
        playerAStats = {},
        importance = 1.0
    }) {
        // Score based on result
        const scoreA = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
        
        // Calculate expected score
        const expectedA = this.expectedScore(mmrA, mmrB);
        
        // Get dynamic K for player A
        const k = this.dynamicK({
            gamesPlayed: playerAStats.gamesPlayed || 0,
            isProvisional: (playerAStats.gamesPlayed || 0) < this.config.provisionalGames,
            importance: importance,
            recentActivityCount: playerAStats.recentGames || 1,
            partySize: playerAStats.partySize || 1
        });
        
        // Calculate delta
        let deltaA = Math.round(k * (scoreA - expectedA));
        
        // Apply cap to prevent wild swings
        const cap = Math.min(this.config.maxDeltaCap, Math.round(k * 3));
        deltaA = Math.max(-cap, Math.min(cap, deltaA));
        
        // Calculate new MMRs
        const newA = Math.max(this.config.minMMR, mmrA + deltaA);
        const newB = Math.max(this.config.minMMR, mmrB - deltaA);
        
        return {
            deltaA,
            deltaB: -deltaA,
            newA,
            newB,
            expectedA,
            expectedB: 1 - expectedA,
            k,
            wasProvisional: (playerAStats.gamesPlayed || 0) < this.config.provisionalGames
        };
    },
    
    /**
     * Calculate team-based expected score
     * @param {number} playerMMR - Individual player MMR
     * @param {Array<number>} opponentMMRs - Array of opponent MMRs
     * @returns {number} Expected score
     */
    expectedScoreTeam(playerMMR, opponentMMRs) {
        const avgOpponent = opponentMMRs.reduce((sum, mmr) => sum + mmr, 0) / opponentMMRs.length;
        return this.expectedScore(playerMMR, avgOpponent);
    },
    
    /**
     * Apply MMR decay for inactive players
     * @param {number} mmr - Current MMR
     * @param {number} daysInactive - Days since last game
     * @returns {number} Decayed MMR
     */
    applyDecay(mmr, daysInactive) {
        if (daysInactive <= this.config.decayDays) return mmr;
        
        const weeksInactive = Math.floor((daysInactive - this.config.decayDays) / 7);
        const decayAmount = weeksInactive * this.config.decayPerWeek;
        
        return Math.max(this.config.startingMMR - 200, mmr - decayAmount);
    },
    
    /**
     * Get recent activity count (games in last 24h)
     * @param {Array} matchHistory - Player's recent matches
     * @returns {number} Games in last 24h
     */
    getRecentActivity(matchHistory) {
        if (!matchHistory || matchHistory.length === 0) return 0;
        
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return matchHistory.filter(match => match.timestamp > oneDayAgo).length;
    },
    
    /**
     * Calculate MMR change (PROFESSIONAL VERSION)
     * Uses new dynamic K-factor system
     */
    async calculateMMRChange(winner, loser, matchData) {
        const winnerData = await RankedData.getPlayer(winner);
        const loserData = await RankedData.getPlayer(loser);
        
        if (!winnerData || !loserData) {
            console.error('❌ Player data not found:', { winner, loser });
            return { winnerChange: 0, loserChange: 0 };
        }
        
        console.log('📊 Calculating MMR (Professional System):', { 
            winner, 
            loser, 
            winnerMMR: winnerData.mmr, 
            loserMMR: loserData.mmr,
            winnerGames: winnerData.gamesPlayed,
            loserGames: loserData.gamesPlayed
        });
        
        // Get recent activity (anti-farm)
        const winnerRecentGames = this.getRecentActivity(winnerData.matchHistory || []);
        const loserRecentGames = this.getRecentActivity(loserData.matchHistory || []);
        
        // Calculate using professional system
        const result = this.calculate1v1({
            mmrA: winnerData.mmr,
            mmrB: loserData.mmr,
            result: 'win',
            playerAStats: {
                gamesPlayed: winnerData.gamesPlayed || 0,
                recentGames: winnerRecentGames,
                partySize: 1 // TODO: implement party detection
            },
            importance: 1.0
        });
        
        // Performance multiplier (bonus for good K/D)
        const performanceMultiplier = this.getPerformanceMultiplier(matchData);
        let winnerChange = Math.round(result.deltaA * performanceMultiplier);
        let loserChange = -Math.round(result.deltaA * performanceMultiplier);
        
        // Win streak bonus
        const streakBonus = this.getStreakBonus(winnerData.winStreak || 0);
        winnerChange += streakBonus;
        
        console.log('✅ MMR Calculated:', {
            winnerChange,
            loserChange,
            k: result.k,
            provisional: result.wasProvisional,
            performance: performanceMultiplier,
            streakBonus
        });
        
        return {
            winnerChange,
            loserChange
        };
    },
    
    // Performance multiplier based on K/D ratio
    getPerformanceMultiplier(matchData) {
        const kd = matchData.kills / Math.max(1, matchData.deaths);
        
        if (kd >= 3.0) return 1.3; // Dominating performance
        if (kd >= 2.0) return 1.2; // Excellent performance
        if (kd >= 1.5) return 1.1; // Good performance
        if (kd >= 1.0) return 1.0; // Average performance
        if (kd >= 0.5) return 0.9; // Below average
        return 0.8; // Poor performance
    },
    
    // Win streak bonus
    getStreakBonus(streak) {
        if (streak >= 10) return 10;
        if (streak >= 7) return 7;
        if (streak >= 5) return 5;
        if (streak >= 3) return 3;
        return 0;
    },
    
    // Update player MMR after match
    async updatePlayerMMR(username, mmrChange, won, kills = 0, deaths = 0) {
        const player = await RankedData.getPlayer(username);
        if (!player) {
            console.error('Player not found:', username);
            return null;
        }
        
        const oldMMR = player.mmr;
        const newMMR = Math.max(0, player.mmr + mmrChange);
        
        // Update win streak
        if (won) {
            player.winStreak = (player.winStreak || 0) + 1;
            player.bestStreak = Math.max(player.bestStreak || 0, player.winStreak);
        } else {
            player.winStreak = 0;
        }
        
        // Check for rank change
        const rankChange = RankSystem.checkRankChange(oldMMR, newMMR);
        
        // Update player data
        player.mmr = newMMR;
        player.rank = RankSystem.getRank(newMMR).name;
        player.lastPlayed = Date.now();
        
        // Track MMR history (for analytics and anti-abuse)
        if (!player.mmrHistory) {
            player.mmrHistory = [];
        }
        player.mmrHistory.push({
            timestamp: Date.now(),
            oldMMR: oldMMR,
            newMMR: newMMR,
            change: mmrChange,
            result: won ? 'win' : 'loss',
            kills: kills,
            deaths: deaths,
            provisional: (player.gamesPlayed || 0) < MMRSystem.config.provisionalGames
        });
        
        // Keep only last 100 entries (prevent bloat)
        if (player.mmrHistory.length > 100) {
            player.mmrHistory = player.mmrHistory.slice(-100);
        }
        
        // Update kill/death stats
        player.totalKills = (player.totalKills || 0) + kills;
        player.totalDeaths = (player.totalDeaths || 0) + deaths;
        
        // Ensure seasonStats exists
        if (!player.seasonStats) {
            player.seasonStats = {};
        }
        
        // Update season stats
        if (!player.seasonStats[RankedData.currentSeason]) {
            player.seasonStats[RankedData.currentSeason] = {
                wins: 0,
                losses: 0,
                mmr: newMMR
            };
        }
        
        const seasonStats = player.seasonStats[RankedData.currentSeason];
        seasonStats.mmr = newMMR;
        
        if (won) {
            player.wins = (player.wins || 0) + 1;
            seasonStats.wins++;
        } else {
            player.losses = (player.losses || 0) + 1;
            seasonStats.losses++;
        }
        
        player.gamesPlayed = (player.gamesPlayed || 0) + 1;
        
        await RankedData.updatePlayer(username, player);
        
        // Show rank change notification if applicable
        if (rankChange.changed) {
            this.showRankChangeNotification(username, rankChange);
        }
        
        return {
            oldMMR,
            newMMR,
            change: mmrChange,
            rankChange
        };
    },
    
    // Process match and update MMRs
    async processMatch(matchData) {
        console.log('Processing match:', matchData);
        
        const { playerA, playerB, winner, kills, deaths, map, mode } = matchData;
        
        const loser = winner === playerA ? playerB : playerA;
        
        console.log('Winner:', winner, 'Loser:', loser);
        
        // Get player data (await if using Firebase)
        const winnerPlayer = await RankedData.getPlayer(winner);
        const loserPlayer = await RankedData.getPlayer(loser);
        
        if (!winnerPlayer || !loserPlayer) {
            console.error('Could not load player data!', { winner, loser, winnerPlayer, loserPlayer });
            throw new Error('Dados dos jogadores não encontrados');
        }
        
        console.log('Player data loaded:', { winnerPlayer, loserPlayer });
        
        // Calculate MMR changes
        const mmrChanges = await this.calculateMMRChange(winner, loser, { kills, deaths });
        
        console.log('MMR changes calculated:', mmrChanges);
        
        // Update both players with kills/deaths in one operation
        const winnerResult = await this.updatePlayerMMR(winner, mmrChanges.winnerChange, true, kills, deaths);
        const loserResult = await this.updatePlayerMMR(loser, mmrChanges.loserChange, false, deaths, kills);

        // Persist match history to both profiles (winner and loser)
        try {
            const baseEntry = {
                matchId: matchData.id,
                map,
                gameMode: mode,
                season: matchData.season,
                timestamp: matchData.timestamp || Date.now(),
                confirmed: true
            };

            // Winner perspective
            RankedData.addMatchToHistory(winner, {
                ...baseEntry,
                result: 'win',
                opponent: loser,
                kills: kills,
                deaths: deaths,
                mmrChange: winnerResult?.change ?? mmrChanges.winnerChange
            });

            // Loser perspective (invert K/D)
            RankedData.addMatchToHistory(loser, {
                ...baseEntry,
                result: 'loss',
                opponent: winner,
                kills: deaths,
                deaths: kills,
                mmrChange: loserResult?.change ?? mmrChanges.loserChange
            });
        } catch (e) {
            console.error('Failed to append match history to players:', e);
        }
        
        console.log('Players updated:', { winnerResult, loserResult });
        
        return {
            winner: {
                ...winnerResult,
                rankUp: winnerResult.rankChange?.rankUp || false
            },
            loser: {
                ...loserResult,
                rankUp: false // Loser nunca sobe de rank
            }
        };
    },
    
    // Show rank change notification
    showRankChangeNotification(username, rankChange) {
        const { rankUp, newRank } = rankChange;
        
        if (rankUp) {
            UI.showNotification(
                `🎉 RANK UP! ${username} subiu para ${newRank.icon} ${newRank.name}!`,
                'success'
            );
        } else {
            UI.showNotification(
                `📉 ${username} caiu para ${newRank.icon} ${newRank.name}`,
                'warning'
            );
        }
    },
    
    // Get MMR for display
    getMMRDisplay(mmr) {
        return Math.round(mmr);
    }
};
