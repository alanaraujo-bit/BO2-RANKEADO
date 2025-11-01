// BO2 RANKED - RANK SYSTEM

const RankSystem = {
    ranks: [
        // Bronze (início padrão em 999)
        { name: 'Bronze I',   icon: '🥉', min: 999,  max: 1099, color: '#CD7F32' },
        { name: 'Bronze II',  icon: '🥉', min: 1100, max: 1199, color: '#CD7F32' },
        { name: 'Bronze III', icon: '🥉', min: 1200, max: 1299, color: '#CD7F32' },

        // Prata
        { name: 'Prata I',    icon: '🥈', min: 1300, max: 1399, color: '#C0C0C0' },
        { name: 'Prata II',   icon: '🥈', min: 1400, max: 1499, color: '#C0C0C0' },
        { name: 'Prata III',  icon: '🥈', min: 1500, max: 1599, color: '#C0C0C0' },

        // Ouro
        { name: 'Ouro I',     icon: '🥇', min: 1600, max: 1699, color: '#FFD700' },
        { name: 'Ouro II',    icon: '🥇', min: 1700, max: 1799, color: '#FFD700' },
        { name: 'Ouro III',   icon: '🥇', min: 1800, max: 1899, color: '#FFD700' },

        // Platina
        { name: 'Platina I',  icon: '💎', min: 1900, max: 1999, color: '#E5E4E2' },
        { name: 'Platina II', icon: '💎', min: 2000, max: 2099, color: '#E5E4E2' },
        { name: 'Platina III',icon: '💎', min: 2100, max: 2199, color: '#E5E4E2' },

        // Diamante
        { name: 'Diamante I', icon: '💠', min: 2200, max: 2299, color: '#B9F2FF' },
        { name: 'Diamante II',icon: '💠', min: 2300, max: 2399, color: '#B9F2FF' },
        { name: 'Diamante III',icon:'💠', min: 2400, max: 2499, color: '#B9F2FF' },

        // Tiers finais
        { name: 'Mestre', icon: '👑', min: 2500, max: 2999, color: '#9370DB' },
        { name: 'Lenda',  icon: '⚡', min: 3000, max: Infinity, color: '#FF1493' }
    ],
    
    // Get rank based on MMR
    getRank(mmr) {
        // Validar MMR
    mmr = mmr || 999;
    if (isNaN(mmr)) mmr = 999;
        
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            const rank = this.ranks[i];
            if (mmr >= rank.min && mmr <= rank.max) {
                return rank;
            }
        }
        return this.ranks[0]; // Default to Bronze III
    },
    
    // Get rank info by name
    getRankByName(rankName) {
        return this.ranks.find(r => r.name === rankName);
    },
    
    // Get progress to next rank
    getRankProgress(mmr) {
        // Validar MMR
    mmr = mmr || 999;
    if (isNaN(mmr)) mmr = 999;
        
        const currentRank = this.getRank(mmr);
        const currentIndex = this.ranks.findIndex(r => r.name === currentRank.name);
        
        if (currentIndex === this.ranks.length - 1) {
            // Already at max rank
            return {
                current: currentRank,
                next: null,
                progress: 100,
                mmrNeeded: 0
            };
        }
        
        const nextRank = this.ranks[currentIndex + 1];
        const rangeSize = currentRank.max - currentRank.min;
        const currentProgress = mmr - currentRank.min;
        const progress = Math.floor((currentProgress / rangeSize) * 100);
        const mmrNeeded = nextRank.min - mmr;
        
        return {
            current: currentRank,
            next: nextRank,
            progress: Math.max(0, Math.min(100, progress)),
            mmrNeeded: Math.max(0, mmrNeeded)
        };
    },
    
    // Check for rank up/down
    checkRankChange(oldMMR, newMMR) {
        const oldRank = this.getRank(oldMMR);
        const newRank = this.getRank(newMMR);
        
        if (oldRank.name !== newRank.name) {
            const rankUp = newMMR > oldMMR;
            return {
                changed: true,
                rankUp: rankUp,
                oldRank: oldRank,
                newRank: newRank
            };
        }
        
        return { changed: false };
    },
    
    // Get all ranks for display
    getAllRanks() {
        return this.ranks;
    },
    
    // Get rank tier (Bronze, Silver, etc)
    getRankTier(rankName) {
        if (rankName.includes('Bronze')) return 'bronze';
        if (rankName.includes('Prata')) return 'silver';
        if (rankName.includes('Ouro')) return 'gold';
        if (rankName.includes('Platina')) return 'platinum';
        if (rankName.includes('Diamante')) return 'diamond';
        if (rankName.includes('Mestre')) return 'master';
        if (rankName.includes('Lenda')) return 'legend';
        return 'bronze';
    }
};
