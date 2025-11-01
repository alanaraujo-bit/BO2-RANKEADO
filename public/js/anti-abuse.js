// BO2 RANKED - ANTI-ABUSE & ANTI-CHEAT SYSTEM
// Professional detection system for boosting, farming, and suspicious activity

const AntiAbuseSystem = {
    // Configuration
    config: {
        sameIPThreshold: 5, // matches from same IP before flag
        partyFreqThreshold: 0.7, // 70% of games with same player = suspicious
        winrateZScoreThreshold: 3.0, // z-score for abnormal winrate
        rapidClimbMMR: 500, // MMR gain in short time
        rapidClimbGames: 10, // games to check for rapid climb
        minGamesForAnalysis: 20 // minimum games before analysis
    },
    
    /**
     * Check if two players have same IP (requires IP tracking)
     * @param {string} playerA - Username A
     * @param {string} playerB - Username B
     * @returns {Promise<boolean>} True if same IP detected
     */
    async checkSameIP(playerA, playerB) {
        try {
            const playerAData = await RankedData.getPlayer(playerA);
            const playerBData = await RankedData.getPlayer(playerB);
            
            if (!playerAData?.lastIP || !playerBData?.lastIP) {
                return false;
            }
            
            return playerAData.lastIP === playerBData.lastIP;
        } catch (error) {
            console.error('Error checking same IP:', error);
            return false;
        }
    },
    
    /**
     * Analyze party frequency (always playing with same person)
     * @param {string} username - Player to analyze
     * @returns {Promise<Object>} Analysis results
     */
    async analyzePartyFrequency(username) {
        try {
            const matches = await RankedData.getPlayerMatches(username, 50);
            
            if (matches.length < this.config.minGamesForAnalysis) {
                return { suspicious: false, reason: 'Not enough games' };
            }
            
            // Count opponents
            const opponentFreq = {};
            matches.forEach(match => {
                const opponent = match.playerA === username ? match.playerB : match.playerA;
                opponentFreq[opponent] = (opponentFreq[opponent] || 0) + 1;
            });
            
            // Find most frequent opponent
            const maxFreq = Math.max(...Object.values(opponentFreq));
            const maxOpponent = Object.keys(opponentFreq).find(k => opponentFreq[k] === maxFreq);
            const frequency = maxFreq / matches.length;
            
            if (frequency >= this.config.partyFreqThreshold) {
                return {
                    suspicious: true,
                    reason: 'Frequent party play detected',
                    opponent: maxOpponent,
                    frequency: (frequency * 100).toFixed(1) + '%',
                    gamesPlayed: maxFreq,
                    totalGames: matches.length
                };
            }
            
            return { suspicious: false };
        } catch (error) {
            console.error('Error analyzing party frequency:', error);
            return { suspicious: false, error: error.message };
        }
    },
    
    /**
     * Calculate winrate z-score (statistical anomaly detection)
     * @param {string} username - Player to analyze
     * @param {number} window - Number of recent games to analyze
     * @returns {Promise<Object>} Z-score analysis
     */
    async analyzeWinrateZScore(username, window = 30) {
        try {
            const player = await RankedData.getPlayer(username);
            const matches = await RankedData.getPlayerMatches(username, window);
            
            if (matches.length < 10) {
                return { suspicious: false, reason: 'Not enough recent games' };
            }
            
            // Calculate recent winrate
            const recentWins = matches.filter(m => m.winner === username).length;
            const recentWinrate = recentWins / matches.length;
            
            // Calculate overall winrate
            const overallWinrate = player.gamesPlayed > 0 ? player.wins / player.gamesPlayed : 0.5;
            
            // Calculate z-score
            // Assuming binomial distribution: σ = sqrt(p*(1-p)/n)
            const n = matches.length;
            const p = overallWinrate;
            const stdDev = Math.sqrt(p * (1 - p) / n);
            const zScore = (recentWinrate - p) / stdDev;
            
            if (Math.abs(zScore) >= this.config.winrateZScoreThreshold) {
                return {
                    suspicious: true,
                    reason: 'Abnormal winrate detected',
                    recentWinrate: (recentWinrate * 100).toFixed(1) + '%',
                    overallWinrate: (overallWinrate * 100).toFixed(1) + '%',
                    zScore: zScore.toFixed(2),
                    window: window
                };
            }
            
            return { suspicious: false, zScore: zScore.toFixed(2) };
        } catch (error) {
            console.error('Error analyzing winrate z-score:', error);
            return { suspicious: false, error: error.message };
        }
    },
    
    /**
     * Detect rapid MMR climb (potential boosting)
     * @param {string} username - Player to analyze
     * @returns {Promise<Object>} Rapid climb analysis
     */
    async detectRapidClimb(username) {
        try {
            const matches = await RankedData.getPlayerMatches(username, this.config.rapidClimbGames);
            
            if (matches.length < this.config.rapidClimbGames) {
                return { suspicious: false, reason: 'Not enough recent games' };
            }
            
            // Get MMR history (would need to be tracked)
            const player = await RankedData.getPlayer(username);
            
            // Simplified: check if player gained too much MMR recently
            // (Proper implementation would track MMR per game)
            const avgMMRGain = player.mmr / player.gamesPlayed;
            
            if (avgMMRGain > 50) { // Abnormally high average gain
                return {
                    suspicious: true,
                    reason: 'Rapid MMR climb detected',
                    avgGain: avgMMRGain.toFixed(1),
                    currentMMR: player.mmr,
                    gamesPlayed: player.gamesPlayed
                };
            }
            
            return { suspicious: false };
        } catch (error) {
            console.error('Error detecting rapid climb:', error);
            return { suspicious: false, error: error.message };
        }
    },
    
    /**
     * Comprehensive abuse check (run all detectors)
     * @param {string} username - Player to analyze
     * @returns {Promise<Object>} Complete analysis
     */
    async comprehensiveCheck(username) {
        console.log(`🔍 Running comprehensive abuse check for: ${username}`);
        
        const results = {
            username,
            timestamp: Date.now(),
            flags: [],
            details: {}
        };
        
        // Run all checks in parallel
        const [partyFreq, winrateZ, rapidClimb] = await Promise.all([
            this.analyzePartyFrequency(username),
            this.analyzeWinrateZScore(username),
            this.detectRapidClimb(username)
        ]);
        
        // Collect flags
        if (partyFreq.suspicious) {
            results.flags.push('PARTY_ABUSE');
            results.details.partyAbuse = partyFreq;
        }
        
        if (winrateZ.suspicious) {
            results.flags.push('ABNORMAL_WINRATE');
            results.details.abnormalWinrate = winrateZ;
        }
        
        if (rapidClimb.suspicious) {
            results.flags.push('RAPID_CLIMB');
            results.details.rapidClimb = rapidClimb;
        }
        
        results.suspicious = results.flags.length > 0;
        results.riskLevel = results.flags.length >= 2 ? 'HIGH' : 
                           results.flags.length === 1 ? 'MEDIUM' : 'LOW';
        
        if (results.suspicious) {
            console.warn(`⚠️ Suspicious activity detected:`, results);
        } else {
            console.log(`✅ No suspicious activity detected`);
        }
        
        return results;
    },
    
    /**
     * Store abuse report in Firebase for admin review
     * @param {Object} report - Abuse report
     * @returns {Promise<boolean>} Success
     */
    async submitAbuseReport(report) {
        try {
            if (typeof db === 'undefined') {
                console.warn('Firebase not available');
                return false;
            }
            
            await db.collection('abuseReports').add({
                ...report,
                status: 'pending',
                reviewedBy: null,
                reviewedAt: null,
                action: null,
                createdAt: Date.now()
            });
            
            console.log('✅ Abuse report submitted for review');
            return true;
        } catch (error) {
            console.error('❌ Error submitting abuse report:', error);
            return false;
        }
    }
};
