// BO2 RANKED - MMR CALCULATION SYSTEM

const MMRSystem = {
    // Base MMR gain/loss
    baseGain: 25,
    baseLoss: 20,
    
    // K-factor for ELO calculation
    kFactor: 32,
    
    // Calculate MMR change based on match result
    calculateMMRChange(winner, loser, matchData) {
        const winnerData = RankedData.getPlayer(winner);
        const loserData = RankedData.getPlayer(loser);
        
        if (!winnerData || !loserData) {
            console.error('Player data not found:', { winner, loser, winnerData, loserData });
            return { winnerChange: 0, loserChange: 0 };
        }
        
        console.log('Calculating MMR change:', { 
            winner, 
            loser, 
            winnerMMR: winnerData.mmr, 
            loserMMR: loserData.mmr 
        });
        
        // Basic ELO calculation
        const expectedWin = this.getExpectedScore(winnerData.mmr, loserData.mmr);
        const expectedLoss = this.getExpectedScore(loserData.mmr, winnerData.mmr);
        
        // Calculate base changes
        let winnerGain = Math.round(this.kFactor * (1 - expectedWin));
        let loserLoss = Math.round(this.kFactor * expectedLoss);
        
        // Performance multiplier based on K/D
        const performanceMultiplier = this.getPerformanceMultiplier(matchData);
        winnerGain = Math.round(winnerGain * performanceMultiplier);
        
        // Win streak bonus
        const streakBonus = this.getStreakBonus(winnerData.winStreak);
        winnerGain += streakBonus;
        
        // Ensure minimum gains/losses
        winnerGain = Math.max(15, Math.min(50, winnerGain));
        loserLoss = Math.max(10, Math.min(40, loserLoss));
        
        return {
            winnerChange: winnerGain,
            loserChange: -loserLoss
        };
    },
    
    // Calculate expected score (ELO formula)
    getExpectedScore(playerMMR, opponentMMR) {
        return 1 / (1 + Math.pow(10, (opponentMMR - playerMMR) / 400));
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
    async updatePlayerMMR(username, mmrChange, won) {
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
        
        // Ensure player documents exist in Firebase
        await RankedData.ensurePlayerExists(winner);
        await RankedData.ensurePlayerExists(loser);
        
        // Get player data (await if using Firebase)
        const winnerPlayer = await RankedData.getPlayer(winner);
        const loserPlayer = await RankedData.getPlayer(loser);
        
        if (!winnerPlayer || !loserPlayer) {
            console.error('Could not load player data!', { winner, loser, winnerPlayer, loserPlayer });
            throw new Error('Dados dos jogadores não encontrados');
        }
        
        console.log('Player data loaded:', { winnerPlayer, loserPlayer });
        
        // Calculate MMR changes
        const mmrChanges = this.calculateMMRChange(winner, loser, { kills, deaths });
        
        console.log('MMR changes calculated:', mmrChanges);
        
        // Update both players (await for async operations)
        const winnerResult = await this.updatePlayerMMR(winner, mmrChanges.winnerChange, true);
        const loserResult = await this.updatePlayerMMR(loser, mmrChanges.loserChange, false);
        
        console.log('Players updated:', { winnerResult, loserResult });
        
        // Get fresh player data after update
        const updatedWinner = await RankedData.getPlayer(winner);
        const updatedLoser = await RankedData.getPlayer(loser);
        
        // Update kill/death stats
        updatedWinner.totalKills = (updatedWinner.totalKills || 0) + kills;
        updatedWinner.totalDeaths = (updatedWinner.totalDeaths || 0) + deaths;
        updatedLoser.totalKills = (updatedLoser.totalKills || 0) + deaths; // Loser's kills = winner's deaths
        updatedLoser.totalDeaths = (updatedLoser.totalDeaths || 0) + kills;
        
        await RankedData.updatePlayer(winner, updatedWinner);
        await RankedData.updatePlayer(loser, updatedLoser);
        
        return {
            winner: winnerResult,
            loser: loserResult
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
