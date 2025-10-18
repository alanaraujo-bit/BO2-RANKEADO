// BO2 RANKED - MATCH SYSTEM

const MatchSystem = {
    // Submit a new match result
    async submitMatch(matchData) {
        const { opponent, map, mode, kills, deaths, result } = matchData;
        const reporter = RankedData.currentUser;
        
        if (!reporter) {
            UI.showNotification('Voce precisa estar logado!', 'error');
            return false;
        }
        
        if (reporter === opponent) {
            UI.showNotification('Voce nao pode jogar contra si mesmo!', 'error');
            return false;
        }
        
        // Validate opponent exists
        const opponentPlayer = await RankedData.getPlayer(opponent);
        if (!opponentPlayer) {
            UI.showNotification('Jogador "' + opponent + '" nao encontrado!', 'error');
            return false;
        }
        
        // Determine winner and loser
        const winner = result === 'win' ? reporter : opponent;
        const loser = result === 'win' ? opponent : reporter;
        
        // Create match object
        const match = {
            playerA: reporter,
            playerB: opponent,
            winner: winner,
            loser: loser,
            kills: parseInt(kills),
            deaths: parseInt(deaths),
            map: map,
            mode: mode,
            reporter: reporter,
            confirmed: false
        };
        
        try {
            // Add match to data (await for Firebase)
            const savedMatch = await RankedData.addMatch(match);
            
            // Add to pending confirmations (await for Firebase)
            await RankedData.addPendingConfirmation(savedMatch);
            
            UI.showNotification(
                'Partida registrada! Aguardando confirmacao de ' + opponent + '...',
                'success'
            );
            
            // Update notifications for opponent (if they refresh)
            if (typeof updateNotifications === 'function') {
                updateNotifications();
            }
            
            return true;
        } catch (error) {
            console.error('Error submitting match:', error);
            UI.showNotification('Erro ao registrar partida: ' + error.message, 'error');
            return false;
        }
    },
    
    // Confirm a pending match
    async confirmMatch(matchId, confirm = true) {
        const pending = RankedData.pendingConfirmations.find(p => p.matchId === matchId);
        
        if (!pending) {
            UI.showNotification('Partida nao encontrada!', 'error');
            return false;
        }
        
        if (!confirm) {
            // Reject the match using Firebase or localStorage
            if (typeof RankedData.rejectMatch === 'function') {
                await RankedData.rejectMatch(matchId);
            } else {
                // Fallback for localStorage
                RankedData.pendingConfirmations = RankedData.pendingConfirmations.filter(
                    p => p.matchId !== matchId
                );
                RankedData.matches = RankedData.matches.filter(m => m.id !== matchId);
                if (RankedData.save) RankedData.save();
            }
            
            UI.showNotification('Partida rejeitada!', 'warning');
            UI.updatePendingMatches();
            
            // Update notifications
            if (typeof updateNotifications === 'function') {
                updateNotifications();
            }
            
            return true; // Changed from false to true
        }
        
        // Confirm and process the match
        let match = RankedData.matches.find(m => m.id === matchId);
        
        if (!match) {
            // Try to load match from Firebase if available
            if (window.firebaseDB) {
                try {
                    const matchDoc = await window.firebaseDB.collection('matches').doc(matchId).get();
                    if (matchDoc.exists) {
                        match = { id: matchDoc.id, ...matchDoc.data() };
                        RankedData.matches.push(match); // Add to local cache
                    } else {
                        UI.showNotification('Partida nao encontrada!', 'error');
                        return false;
                    }
                } catch (error) {
                    console.error('Error loading match:', error);
                    UI.showNotification('Erro ao carregar partida!', 'error');
                    return false;
                }
            } else {
                UI.showNotification('Partida nao encontrada!', 'error');
                return false;
            }
        }
        
        if (match) {
            match.confirmed = true;
            
            // Process MMR changes
            const results = MMRSystem.processMatch(match);
            
            // Remove from pending
            RankedData.confirmMatch(matchId);
            
            // Show results
            UI.showNotification(
                'Partida confirmada! ' + match.winner + ' (+' + results.winner.change + ' MMR) | ' + match.loser + ' (' + results.loser.change + ' MMR)',
                'success'
            );
            
            // Check for achievements
            this.checkAchievements(match);
            
            // Update UI
            UI.updateAllViews();
            
            // Update notifications
            if (typeof updateNotifications === 'function') {
                updateNotifications();
            }
        }
        
        return true;
    },
    
    // Check for achievements after match
    checkAchievements(match) {
        const winner = RankedData.getPlayer(match.winner);
        
        if (!winner) return;
        
        // First win achievement
        if (winner.wins === 1 && !winner.achievements.includes('first_win')) {
            winner.achievements.push('first_win');
            UI.showNotification(winner.username + ' desbloqueou: "Primeira Vitoria"!', 'success');
        }
        
        // Win streak achievements
        if (winner.winStreak === 3 && !winner.achievements.includes('streak_3')) {
            winner.achievements.push('streak_3');
            UI.showNotification(winner.username + ' desbloqueou: "Hat Trick" (3 vitorias seguidas)!', 'success');
        }
        
        if (winner.winStreak === 5 && !winner.achievements.includes('streak_5')) {
            winner.achievements.push('streak_5');
            UI.showNotification(winner.username + ' desbloqueou: "Dominating" (5 vitorias seguidas)!', 'success');
        }
        
        if (winner.winStreak === 10 && !winner.achievements.includes('streak_10')) {
            winner.achievements.push('streak_10');
            UI.showNotification(winner.username + ' desbloqueou: "Unstoppable" (10 vitorias seguidas)!', 'success');
        }
        
        // Games played milestones
        if (winner.gamesPlayed === 10 && !winner.achievements.includes('games_10')) {
            winner.achievements.push('games_10');
            UI.showNotification(winner.username + ' desbloqueou: "Veterano" (10 partidas)!', 'success');
        }
        
        if (winner.gamesPlayed === 50 && !winner.achievements.includes('games_50')) {
            winner.achievements.push('games_50');
            UI.showNotification(winner.username + ' desbloqueou: "Dedicado" (50 partidas)!', 'success');
        }
        
        if (winner.gamesPlayed === 100 && !winner.achievements.includes('games_100')) {
            winner.achievements.push('games_100');
            UI.showNotification(winner.username + ' desbloqueou: "Lendario" (100 partidas)!', 'success');
        }
        
        RankedData.updatePlayer(winner.username, winner);
    },
    
    // Get match history for display
    async getMatchHistory(username, limit = 20) {
        return await RankedData.getPlayerMatches(username, limit);
    },
    
    // Get pending matches for current user
    async getPendingMatches() {
        if (!RankedData.currentUser) return [];
        
        return RankedData.pendingConfirmations.filter(
            p => p.opponent === RankedData.currentUser
        );
    },
    
    // Get match statistics
    getMatchStats(match) {
        const kd = (match.kills / Math.max(1, match.deaths)).toFixed(2);
        const performance = kd >= 2.0 ? 'Excelente' : kd >= 1.0 ? 'Bom' : 'Regular';
        
        return {
            kd,
            performance
        };
    }
};
