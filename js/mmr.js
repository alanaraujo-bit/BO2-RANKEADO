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
        
        if (!winnerData || !loserData) return { winnerChange: 0, loserChange: 0 };
        
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
    updatePlayerMMR(username, mmrChange, won) {
        const player = RankedData.getPlayer(username);
        if (!player) return;
        
        const oldMMR = player.mmr;
        const newMMR = Math.max(0, player.mmr + mmrChange);
        
        // Update win streak
        if (won) {
            player.winStreak++;
            player.bestStreak = Math.max(player.bestStreak, player.winStreak);
        } else {
            player.winStreak = 0;
        }
        
        // Check for rank change
        const rankChange = RankSystem.checkRankChange(oldMMR, newMMR);
        
        // Update player data
        player.mmr = newMMR;
        player.rank = RankSystem.getRank(newMMR).name;
        player.lastPlayed = Date.now();
        
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
            player.wins++;
            seasonStats.wins++;
        } else {
            player.losses++;
            seasonStats.losses++;
        }
        
        player.gamesPlayed++;
        
        RankedData.updatePlayer(username, player);
        
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
    processMatch(matchData) {
        const { playerA, playerB, winner, kills, deaths, map, mode } = matchData;
        
        const loser = winner === playerA ? playerB : playerA;
        
        // Calculate MMR changes
        const mmrChanges = this.calculateMMRChange(winner, loser, { kills, deaths });
        
        // Update both players
        const winnerResult = this.updatePlayerMMR(winner, mmrChanges.winnerChange, true);
        const loserResult = this.updatePlayerMMR(loser, mmrChanges.loserChange, false);
        
        // Update kill/death stats
        const winnerPlayer = RankedData.getPlayer(winner);
        const loserPlayer = RankedData.getPlayer(loser);
        
        winnerPlayer.totalKills += kills;
        winnerPlayer.totalDeaths += deaths;
        loserPlayer.totalKills += deaths; // Loser's kills = winner's deaths
        loserPlayer.totalDeaths += kills;
        
        RankedData.updatePlayer(winner, winnerPlayer);
        RankedData.updatePlayer(loser, loserPlayer);
        
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
